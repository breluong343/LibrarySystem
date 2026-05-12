const db = require('./db');

function createBookHold(bookID, memberID, callback) {
    const sql = 'INSERT INTO Bookshold (Member_ID, Book_ID, BorrowDate, Type) VALUES (?, ?, NOW(), "hold")';
    db.query(sql, [memberID, bookID], (err, result) => {
        callback(err, result);
    });
}

function viewInd(table, filters = {}, callback) {
    let sql = `SELECT * FROM ${table} WHERE 1=1`;
    let params = [];

    Object.keys(filters).forEach(field => {
        sql += ` AND ${field} = ?`;
        params.push(filters[field]);
    });

    db.query(sql, params, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
    });
}


module.exports = { createBookHold, viewInd };


