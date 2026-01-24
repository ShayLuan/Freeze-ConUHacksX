const mysql = require('mysql2/promise');
require('dotenv').config();

const port = process.env.RAILWAY_TCP_PROXY_PORT || process.env.DB_PORT || 3306;

// Log connection details (without password) for debugging
console.log('Attempting to connect to database...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', port, process.env.RAILWAY_TCP_PROXY_PORT ? '(from Railway)' : '(from .env)');
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

if (!process.env.DB_PORT && !process.env.RAILWAY_TCP_PROXY_PORT) {
    console.warn('⚠️  WARNING: No port specified! Railway MySQL requires a TCP proxy port.');
    console.warn('   Check your Railway dashboard → MySQL service → Connect tab');
    console.warn('   Look for the port number in the connection string (e.g., :26206)');
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(port),
    connectionLimit: 10,
    connectTimeout: 60000, // 60 seconds
    ssl: process.env.DB_SSL !== 'false' ? {
        rejectUnauthorized: false
    } : false
});

// Test connection on startup
db.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
        console.error('Error code:', err.code);
    });

module.exports = db;
