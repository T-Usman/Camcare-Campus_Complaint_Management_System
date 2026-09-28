import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'camcare';

// Ensure database exists before creating the pool
const bootstrap = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD });
await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await bootstrap.end();

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

export { pool };

export async function query(text, params) {
  const [rows] = await pool.execute(text, params);
  return rows;
}

export async function initDb() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      role VARCHAR(50) NOT NULL,
      login_id VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      initials VARCHAR(10) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      department VARCHAR(255),
      residence VARCHAR(255)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      urgency VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      assigned_to VARCHAR(255) DEFAULT 'Unassigned',
      date VARCHAR(20) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      student_login_id VARCHAR(255) NOT NULL,
      photo LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS complaint_timeline (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id VARCHAR(255) NOT NULL,
      step VARCHAR(100) NOT NULL,
      time VARCHAR(50) NOT NULL,
      note TEXT,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS staff (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      initials VARCHAR(10) NOT NULL,
      department VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      active_count INT DEFAULT 0,
      resolved_count INT DEFAULT 0
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      date VARCHAR(20) NOT NULL,
      image VARCHAR(255) NOT NULL,
      snippet TEXT NOT NULL,
      body TEXT NOT NULL
    )
  `);
}