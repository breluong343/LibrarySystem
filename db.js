const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Study0412@',
  database: 'OnlineLibrarySystem'
});

module.exports = pool;