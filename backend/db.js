const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway provides TCP proxy port via environment variable
// Use RAILWAY_TCP_PROXY_PORT if available, otherwise use DB_PORT
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
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Railway MySQL uses a TCP proxy port (NOT 3306)');
        console.error('2. Go to Railway dashboard → Your MySQL service → Connect tab');
        console.error('3. Look for connection string like: mysql://user:pass@host:PORT/db');
        console.error('4. The PORT number is what you need (e.g., 26206, 57528, etc.)');
        console.error('5. Update DB_PORT in your .env file with the correct port number');
        console.error('6. Or Railway may provide RAILWAY_TCP_PROXY_PORT automatically');
    });

module.exports = db;
