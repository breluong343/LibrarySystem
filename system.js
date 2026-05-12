const db = require('./db');

function getNextID(table, idColumn, callback) {
    const sql = `SELECT MAX(${idColumn}) AS maxID FROM ${table}`;
    db.query(sql, (err, rows) => {
        if (err) return callback(err);
        const nextID = (rows[0].maxID || 0) + 1;
        callback(null, nextID);
    });
}

function checkLogin(username, password, callback) {
    const sql = 'SELECT * FROM users WHERE Username = ? AND Password = ?';
    db.query(sql, [username, password], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0] || null);
    })
}

module.exports = { checkLogin, getNextID };
