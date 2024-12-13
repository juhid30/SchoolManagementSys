require("dotenv").config({ path: "./.env" });
const mysql = require("mysql2/promise");

let db;
const connectToDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schools(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL
    )`;
    await db.execute(createTableQuery);

    console.log("Connected to DB!!!");
  } catch (err) {
    console.error("Error connecting to DB!", err.message);
    process.exit(1);
  }
};

const getConnection = () => {
  if (!db) {
    throw new Error("Database connection is not initialized");
  }
  return db;
};

module.exports = {
  connectToDB,
  getConnection, // Getter for connection instance
};
