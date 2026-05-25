const db = require("./db");

const initializeDatabase = () => {
  db.serialize(() => {
    // =========================
    // USERS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('Admin', 'Customer', 'Staff')) NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // VEHICLES TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        vehicle_number TEXT UNIQUE NOT NULL,
        vehicle_type TEXT NOT NULL,
        vehicle_brand TEXT,
        vehicle_model TEXT,
        vehicle_color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // =========================
    // PARKING SLOTS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS parking_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_number TEXT UNIQUE NOT NULL,
        floor_number TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        status TEXT DEFAULT 'Available',
        hourly_rate REAL DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =========================
    // RESERVATIONS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_code TEXT UNIQUE,
        user_id INTEGER,
        vehicle_id INTEGER,
        slot_id INTEGER,
        reservation_date TEXT,
        start_time TEXT,
        expected_end_time TEXT,
        status TEXT DEFAULT 'Reserved',
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
      )
    `);

    // =========================
    // PARKING SESSIONS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parking_id TEXT UNIQUE NOT NULL,
        reservation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        actual_checkin_time TEXT,
        actual_checkout_time TEXT,
        total_hours REAL,
        total_amount REAL,
        session_status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(reservation_id) REFERENCES reservations(id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY(slot_id) REFERENCES parking_slots(id)
      )
    `);

    // =========================
    // PAYMENTS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_code TEXT UNIQUE NOT NULL,
        parking_session_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'Pending',
        transaction_id TEXT,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(parking_session_id) REFERENCES parking_sessions(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // =========================
    // PARKING LOGS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS parking_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_type TEXT,
        action_message TEXT,
        reference_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // =========================
    // NOTIFICATIONS TABLE
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        message TEXT,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // =========================
    // SEED PARKING SLOTS
    // =========================

    for (let i = 1; i <= 40; i++) {
      const slotNumber = `B${i}`;

      db.run(
        `
        INSERT OR IGNORE INTO parking_slots
        (
          slot_number,
          floor_number,
          vehicle_type,
          status,
          hourly_rate
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [slotNumber, "Floor 1", "Bike", "Available", 15],
      );
    }

    for (let i = 1; i <= 20; i++) {
      const slotNumber = `C${i}`;

      db.run(
        `
        INSERT OR IGNORE INTO parking_slots
        (
          slot_number,
          floor_number,
          vehicle_type,
          status,
          hourly_rate
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [slotNumber, "Floor 2", "Car", "Available", 30],
      );
    }

    for (let i = 21; i <= 40; i++) {
      const slotNumber = `C${i}`;

      db.run(
        `
        INSERT OR IGNORE INTO parking_slots
        (
          slot_number,
          floor_number,
          vehicle_type,
          status,
          hourly_rate
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [slotNumber, "Floor 3", "Car", "Available", 30],
      );
    }

    console.log("All Tables Initialized Successfully");
    console.log("80 Parking Slots Seeded Successfully");
  });
};

module.exports = initializeDatabase;
