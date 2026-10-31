const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Configure SSL options when enabled (required for cloud MySQL like Aiven)
let ssl;
if (process.env.DB_SSL === 'true') {
  ssl = {
    rejectUnauthorized: true
  };

  if (process.env.DB_SSL_CA) {
    ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }
}

// Configurable connection limit with a smaller default for Vercel serverless
const defaultConnectionLimit = process.env.VERCEL ? 2 : 10;
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT) || defaultConnectionLimit;

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bugboard_db',
  port: Number(process.env.DB_PORT) || 3306,
  ssl,
  waitForConnections: true,
  connectionLimit,
  queueLimit: 0
});

// Helper function to test the database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Error connecting to MySQL database:', error.message);
  }
}

testConnection();

module.exports = pool;
