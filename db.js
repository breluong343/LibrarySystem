const mysql = require('mysql2');

// Database connection configuration
// Database credentials are stored in environment variables to keep sensitive data from source code
const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'OnlineLibrarySystem',
    port:     process.env.DB_PORT     || 3306
});

module.exports = pool;