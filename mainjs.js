const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'exuser',
  password: 'password',
  database: 'library_db',
  waitForConnections: true,
  connectionLimit: 10
});

const db = pool.promise();