const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const cron = require("node-cron");

require("dotenv").config();

const db = require("./database/db");
const initializeDatabase = require("./database/initDatabase");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

initializeDatabase();

const PORT = process.env.PORT || 5000;

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send("ParkGrid Pro Backend Running");
});

// =====================================================
// LOGIN API
// =====================================================

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const query = `
      SELECT * FROM users WHERE email = ?
    `;

    db.get(query, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );

      res.status(200).json({
        success: true,
        message: "Login successful",

        token,

        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// SIGNUP API
// =====================================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { full_name, email, phone, password, role, adminCode } = req.body;

    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // ADMIN SECRET VALIDATION
    if (role === "Admin" && adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin code",
      });
    }

    const checkEmailQuery = `
      SELECT * FROM users WHERE email = ?
    `;

    db.get(checkEmailQuery, [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users
        (
          full_name,
          email,
          phone,
          password,
          role
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(
        insertQuery,
        [full_name, email, phone, hashedPassword, role],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          db.run(
            `
            INSERT INTO parking_logs
            (
              user_id,
              action_type,
              action_message
            )
            VALUES (?, ?, ?)
            `,
            [this.lastID, "USER_SIGNUP", `${role} account created`],
          );

          res.status(201).json({
            success: true,
            message: `${role} registered successfully`,
          });
        },
      );
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET USERS
// =====================================================

app.get("/api/users", authMiddleware, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const query = `
    SELECT
      id,
      full_name,
      email,
      phone,
      role,
      status,
      created_at
    FROM users
    ORDER BY id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      users: rows,
    });
  });
});

// =====================================================
// DELETE USER
// =====================================================

app.delete("/api/users/:userId", authMiddleware, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.params.userId;

  // CHECK USER EXISTS

  db.get(
    `
    SELECT * FROM users
    WHERE id = ?
    `,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // DELETE USER

      db.run(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [userId],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });
        },
      );
    },
  );
});

// =====================================================
// ADD VEHICLE
// =====================================================

app.post("/api/vehicles", authMiddleware, (req, res) => {
  if (req.user.role !== "Customer") {
    return res.status(403).json({
      success: false,
      message: "Only customers can add vehicles",
    });
  }

  const {
    user_id,
    vehicle_number,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    vehicle_color,
  } = req.body;

  const query = `
    INSERT INTO vehicles
    (
      user_id,
      vehicle_number,
      vehicle_type,
      vehicle_brand,
      vehicle_model,
      vehicle_color
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      user_id,
      vehicle_number,
      vehicle_type,
      vehicle_brand,
      vehicle_model,
      vehicle_color,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        vehicle_id: this.lastID,
      });
    },
  );
});

// =====================================================
// GET USER VEHICLES
// =====================================================

app.get("/api/vehicles/user/:userId", authMiddleware, (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== "Admin" && req.user.id != userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const query = `
    SELECT * FROM vehicles
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      vehicles: rows,
    });
  });
});

// =====================================================
// GET PARKING SLOTS
// =====================================================

app.get("/api/parking/slots", authMiddleware, (req, res) => {
  const query = `
    SELECT * FROM parking_slots
    ORDER BY floor_number ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      total_slots: rows.length,
      slots: rows,
    });
  });
});

// =====================================================
// CREATE RESERVATION
// =====================================================

app.post("/api/reservations", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can reserve parking",
      });
    }

    const {
      user_id,
      vehicle_id,
      slot_id,
      reservation_date,
      start_time,
      expected_end_time,
    } = req.body;

    const slotQuery = `
      SELECT * FROM parking_slots
      WHERE id = ?
      AND status = 'Available'
    `;

    db.get(slotQuery, [slot_id], (err, slot) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!slot) {
        return res.status(400).json({
          success: false,
          message: "Parking slot unavailable",
        });
      }

      const vehicleQuery = `
        SELECT * FROM vehicles
        WHERE id = ?
        AND user_id = ?
        `;

      db.get(vehicleQuery, [vehicle_id, user_id], async (err, vehicle) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (slot.vehicle_type !== vehicle.vehicle_type) {
          return res.status(400).json({
            success: false,
            message: `Only ${slot.vehicle_type} allowed for this slot`,
          });
        }

        const lastFourDigits = vehicle.vehicle_number.slice(-4);

        const currentDate = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");

        const randomNumber = Math.floor(1000 + Math.random() * 9000);

        const reservationCode = `RSV-${currentDate}-U${user_id}-${lastFourDigits}-${randomNumber}`;

        const qrCodeImage = await QRCode.toDataURL(reservationCode);

        const insertQuery = `
          INSERT INTO reservations
          (
            reservation_code,
            user_id,
            vehicle_id,
            slot_id,
            reservation_date,
            start_time,
            expected_end_time,
            qr_code
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
          insertQuery,
          [
            reservationCode,
            user_id,
            vehicle_id,
            slot_id,
            reservation_date,
            start_time,
            expected_end_time,
            qrCodeImage,
          ],
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            db.run(
              `
              UPDATE parking_slots
              SET status = 'Reserved'
              WHERE id = ?
              `,
              [slot_id],
            );

            res.status(201).json({
              success: true,
              message: "Reservation successful",
              reservation_code: reservationCode,
              qr_code: qrCodeImage,
            });
          },
        );
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET RESERVATION HISTORY
// =====================================================

app.get("/api/reservations/history/:userId", authMiddleware, (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== "Admin" && req.user.id != userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const query = `
      SELECT

        reservations.id,
        reservations.reservation_code,
        reservations.reservation_date,
        reservations.start_time,
        reservations.expected_end_time,
        reservations.status,
        reservations.qr_code,
        reservations.created_at,

        parking_slots.slot_number,
        parking_slots.floor_number,

        vehicles.vehicle_number,
        vehicles.vehicle_type

      FROM reservations

      JOIN parking_slots
      ON reservations.slot_id = parking_slots.id

      JOIN vehicles
      ON reservations.vehicle_id = vehicles.id

      WHERE reservations.user_id = ?

      ORDER BY reservations.id DESC
    `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      total_reservations: rows.length,
      reservations: rows,
    });
  });
});

// =====================================================
// CHECK-IN
// =====================================================

app.post("/api/parking/checkin", authMiddleware, (req, res) => {
  if (req.user.role !== "Staff" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const { reservation_code } = req.body;

  const query = `
    SELECT * FROM reservations
    WHERE reservation_code = ?
    AND status = 'Reserved'
  `;

  db.get(query, [reservation_code], (err, reservation) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    const parkingId = `PK-${currentDate}-${reservation.id}`;

    const insertQuery = `
    INSERT INTO parking_sessions
    (
        parking_id,
        reservation_id,
        user_id,
        vehicle_id,
        slot_id,
        actual_checkin_time,
        session_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [
        parkingId,
        reservation.id,
        reservation.user_id,
        reservation.vehicle_id,
        reservation.slot_id,
        new Date().toISOString(),
        "Active",
      ],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        db.run(
          `
          UPDATE parking_slots
          SET status = 'Occupied'
          WHERE id = ?
          `,
          [reservation.slot_id],
        );

        db.run(
          `
            UPDATE reservations
            SET status = 'Checked-In'
            WHERE id = ?
            `,
          [reservation.id],
        );

        res.status(200).json({
          success: true,
          message: "Vehicle checked-in",
          parking_id: parkingId,
        });
      },
    );
  });
});

// =====================================================
// CHECKOUT
// =====================================================

app.post("/api/parking/checkout", authMiddleware, (req, res) => {
  if (req.user.role !== "Staff" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const { parking_id } = req.body;

  const query = `
  SELECT

    parking_sessions.*,

        parking_slots.hourly_rate,

        reservations.expected_end_time

    FROM parking_sessions

    JOIN parking_slots
    ON parking_sessions.slot_id = parking_slots.id

    JOIN reservations
    ON parking_sessions.reservation_id = reservations.id

    WHERE parking_sessions.parking_id = ?
AND parking_sessions.session_status = 'Active'
    `;

  db.get(query, [parking_id], (err, session) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found",
      });
    }

    const checkinTime = new Date(session.actual_checkin_time);

    const checkoutTime = new Date();
    const expectedEndTime = new Date(
      `${new Date().toISOString().split("T")[0]} ${session.expected_end_time || "23:59"}`,
    );

    const totalMilliseconds = checkoutTime - checkinTime;

    const totalHours = Math.ceil(totalMilliseconds / (1000 * 60 * 60));

    const totalAmount = totalHours * session.hourly_rate;

    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    const paymentCode = `PAY-${currentDate}-${session.id}`;

    db.run(
      `
      UPDATE parking_sessions
      SET
        actual_checkout_time = ?,
        total_hours = ?,
        total_amount = ?,
        session_status = 'Completed'
      WHERE id = ?
      `,
      [checkoutTime.toISOString(), totalHours, totalAmount, session.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        db.run(
          `
          INSERT INTO payments
          (
            payment_code,
            parking_session_id,
            user_id,
            amount
          )
          VALUES (?, ?, ?, ?)
          `,
          [paymentCode, session.id, session.user_id, totalAmount],
        );

        db.run(
          `
          UPDATE parking_slots
          SET status = 'Available'
          WHERE id = ?
          `,
          [session.slot_id],
        );

        db.run(
          `
            UPDATE reservations
            SET status = 'Checked-Out'
            WHERE id = ?
            `,
          [session.reservation_id],
        );

        // OVERSTAY CHECK

        if (checkoutTime > expectedEndTime) {
          db.run(
            `
            INSERT INTO notifications
            (
            user_id,
            title,
            message,
            type
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              session.user_id,
              "Parking Overstay",
              `Vehicle overstayed parking duration for parking ID ${parking_id}`,
              "OVERSTAY",
            ],
          );
        }

        res.status(200).json({
          success: true,
          message: "Checkout successful",
          payment_code: paymentCode,
          total_hours: totalHours,
          total_amount: totalAmount,
        });
      },
    );
  });
});

// =====================================================
// GET PAYMENT DETAILS
// =====================================================

app.get("/api/payments/:paymentCode", authMiddleware, (req, res) => {
  const paymentCode = req.params.paymentCode;

  const query = `
    SELECT * FROM payments
    WHERE payment_code = ?
  `;

  db.get(query, [paymentCode], (err, payment) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  });
});

// =====================================================
// PAY NOW
// =====================================================

app.post("/api/payments/pay", authMiddleware, (req, res) => {
  const { payment_code, payment_method } = req.body;

  const transactionId = `TXN-${Date.now()}`;

  db.get(
    `
    SELECT * FROM payments
    WHERE payment_code = ?
    `,
    [payment_code],
    (err, payment) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // PREVENT DOUBLE PAYMENT
      if (payment.payment_status === "Paid") {
        return res.status(400).json({
          success: false,
          message: "Payment already completed",
        });
      }

      db.run(
        `
        UPDATE payments
        SET
          payment_method = ?,
          payment_status = 'Paid',
          transaction_id = ?,
          paid_at = ?
        WHERE payment_code = ?
        `,
        [payment_method, transactionId, new Date().toISOString(), payment_code],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          // UPDATE RESERVATION STATUS
          db.get(
            `
            SELECT * FROM parking_sessions
            WHERE id = ?
            `,
            [payment.parking_session_id],
            (err, session) => {
              if (session) {
                db.run(
                  `
                  UPDATE reservations
                  SET status = 'Completed'
                  WHERE id = ?
                  `,
                  [session.reservation_id],
                );
              }
            },
          );

          res.status(200).json({
            success: true,
            message: "Payment successful",
            transaction_id: transactionId,
          });
        },
      );
    },
  );
});

// =====================================================
// PAYMENT HISTORY
// =====================================================

app.get("/api/payments/history/:userId", authMiddleware, (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== "Admin" && req.user.id != userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const query = `
      SELECT * FROM payments
      WHERE user_id = ?
      ORDER BY id DESC
    `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      payments: rows,
    });
  });
});

// =====================================================
// PARKING HISTORY
// =====================================================

app.get("/api/parking/history/:userId", authMiddleware, (req, res) => {
  const userId = req.params.userId;
  if (req.user.role !== "Admin" && req.user.id != userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const query = `
      SELECT

        parking_sessions.id,
        parking_sessions.parking_id,
        parking_sessions.actual_checkin_time,
        parking_sessions.actual_checkout_time,
        parking_sessions.total_hours,
        parking_sessions.total_amount,
        parking_sessions.session_status,

        reservations.reservation_code,

        vehicles.vehicle_number,
        vehicles.vehicle_type,

        parking_slots.slot_number,
        parking_slots.floor_number

      FROM parking_sessions

      JOIN reservations
      ON parking_sessions.reservation_id = reservations.id

      JOIN vehicles
      ON parking_sessions.vehicle_id = vehicles.id

      JOIN parking_slots
      ON parking_sessions.slot_id = parking_slots.id

      WHERE parking_sessions.user_id = ?

      ORDER BY parking_sessions.id DESC
    `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      total_sessions: rows.length,
      parking_history: rows,
    });
  });
});

// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

app.get("/api/notifications/:userId", authMiddleware, (req, res) => {
  const userId = req.params.userId;
  if (req.user.role !== "Admin" && req.user.id != userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const query = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
    `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      total_notifications: rows.length,
      notifications: rows,
    });
  });
});

// =====================================================
// ACTIVE PARKING SESSIONS
// =====================================================

app.get("/api/parking/active", authMiddleware, (req, res) => {
  const query = `
      SELECT

        parking_sessions.*,

        vehicles.vehicle_number,
        vehicles.vehicle_type,

        parking_slots.slot_number,
        parking_slots.floor_number

      FROM parking_sessions

      JOIN vehicles
      ON parking_sessions.vehicle_id = vehicles.id

      JOIN parking_slots
      ON parking_sessions.slot_id = parking_slots.id

      WHERE parking_sessions.session_status = 'Active'

      ORDER BY parking_sessions.id DESC
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      active_sessions: rows,
    });
  });
});

// =====================================================
// DASHBOARD ANALYTICS
// =====================================================

app.get("/api/dashboard/parking", authMiddleware, (req, res) => {
  // ONLY ADMIN ACCESS
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  const analytics = {};

  db.get(
    `
    SELECT COUNT(*) AS total_slots
    FROM parking_slots
    `,
    [],
    (err, totalSlots) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      analytics.total_slots = totalSlots.total_slots;

      db.get(
        `
        SELECT COUNT(*) AS available_slots
        FROM parking_slots
        WHERE status = 'Available'
        `,
        [],
        (err, availableSlots) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          analytics.available_slots = availableSlots.available_slots;

          db.get(
            `
            SELECT COUNT(*) AS occupied_slots
            FROM parking_slots
            WHERE status = 'Occupied'
            `,
            [],
            (err, occupiedSlots) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: err.message,
                });
              }

              analytics.occupied_slots = occupiedSlots.occupied_slots;

              db.get(
                `
                SELECT COUNT(*) AS reserved_slots
                FROM parking_slots
                WHERE status = 'Reserved'
                `,
                [],
                (err, reservedSlots) => {
                  analytics.reserved_slots = reservedSlots.reserved_slots;

                  db.get(
                    `
                    SELECT SUM(amount) AS total_revenue
                    FROM payments
                    WHERE payment_status = 'Paid'
                    `,
                    [],
                    (err, revenue) => {
                      analytics.total_revenue = revenue.total_revenue || 0;

                      res.status(200).json({
                        success: true,
                        analytics,
                      });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
});

// =====================================================
// CANCEL RESERVATION
// =====================================================

app.put(
  "/api/reservations/cancel/:reservationId",
  authMiddleware,
  (req, res) => {
    const reservationId = req.params.reservationId;

    db.get(
      `
      SELECT * FROM reservations
      WHERE id = ?
      `,
      [reservationId],
      (err, reservation) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (!reservation) {
          return res.status(404).json({
            success: false,
            message: "Reservation not found",
          });
        }

        if (reservation.status !== "Reserved") {
          return res.status(400).json({
            success: false,
            message: "Only reserved bookings can be cancelled",
          });
        }

        db.run(
          `
          UPDATE reservations
          SET status = 'Cancelled'
          WHERE id = ?
          `,
          [reservationId],
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            db.run(
              `
              UPDATE parking_slots
              SET status = 'Available'
              WHERE id = ?
              `,
              [reservation.slot_id],
            );

            res.status(200).json({
              success: true,
              message: "Reservation cancelled successfully",
            });
          },
        );
      },
    );
  },
);

// =====================================================
// AUTO EXPIRE RESERVATIONS
// =====================================================

cron.schedule("* * * * *", () => {
  const query = `
    SELECT * FROM reservations
    WHERE status = 'Reserved'
  `;

  db.all(query, [], (err, reservations) => {
    if (err) {
      console.log(err.message);
      return;
    }

    reservations.forEach((reservation) => {
      const reservationDateTime = new Date(
        `${reservation.reservation_date} ${reservation.start_time}`,
      );

      // 30 MINUTES GRACE TIME
      reservationDateTime.setMinutes(reservationDateTime.getMinutes() + 30);

      const currentTime = new Date();

      // EXPIRE RESERVATION
      if (currentTime > reservationDateTime) {
        // UPDATE RESERVATION
        db.run(
          `
          UPDATE reservations
          SET status = 'Expired'
          WHERE id = ?
          `,
          [reservation.id],
        );

        // FREE SLOT
        db.run(
          `
          UPDATE parking_slots
          SET status = 'Available'
          WHERE id = ?
          `,
          [reservation.slot_id],
        );

        // CREATE NOTIFICATION
        db.run(
          `
          INSERT INTO notifications
          (
            user_id,
            title,
            message,
            type
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            reservation.user_id,
            "Reservation Expired",
            `Reservation ${reservation.reservation_code} expired due to no check-in`,
            "EXPIRED",
          ],
        );
      }
    });
  });
});

// =====================================================
// SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
