const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'exuser',
  password: 'password',
  database: 'library_db'
});

module.exports = pool;