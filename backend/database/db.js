const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "parkgridpro.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log("Database Connection Error:", err.message);
  } else {
    console.log("SQLite Database Connected");
  }
});

module.exports = db;
