const db = require('./db');

function viewUser(username, callback) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
    });
}

function addUser(username, password, memberID, address, callback) {
    const sql1 = 'INSERT INTO users (username, password, createDate, address) VALUES (?, ?, NOW(), ?)';
    
    db.query(sql1, [username, password, address], (err) => {
        if (err) return callback(err);
        getNextID('members', 'memberID', (err2, nextMemberID) => {
            if (err2) return callback(err2);
            memberID = nextMemberID;
            const sql2 = 'INSERT INTO members (memberID, username, address) VALUES (?, ?, ?)';
            db.query(sql2, [memberID, username, address], (err2) => {
                if (err2) return callback(err2);
                callback(null, { success: true });
            });
        });
    });
}

function getNextID(table, idColumn, callback) {
    const sql = `SELECT MAX(${idColumn}) AS maxID FROM ${table}`;
    db.query(sql, (err, rows) => {
        if (err) return callback(err);
        const nextID = (rows[0].maxID || 0) + 1;
        callback(null, nextID);
    });
}

module.exports = { viewUser, addUser, getNextID };