const db = require('./db');

function viewBooks(filters, callback) {
    viewInd('books', filters, callback);
}

function viewMovies(filters, callback) {
    viewInd('movies', filters, callback);
}

function createBookHold(bookID, memberID, callback) {
    const sql = 'INSERT INTO bookholds (bookID, memberID, holdDate) VALUES (?, ?, NOW())';
    db.query(sql, [bookID, memberID], (err, result) => {
        callback(err, result);
    });
}

function createMovieHold(movieID, memberID, callback) {
    const sql = 'INSERT INTO movieholds (movieID, memberID, holdDate) VALUES (?, ?, NOW())';
    db.query(sql, [movieID, memberID], (err, result) => {
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


module.exports = { viewBooks, viewMovies, createBookHold, createMovieHold, viewInd };


