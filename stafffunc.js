const { get } = require('node:http');
const db = require('./db');

function viewAllBooks(callback) {
    db.query('SELECT * FROM books', (err, rows) => {
        callback(err, rows);
    });
}

function viewAllMovies(callback) {
    db.query('SELECT * FROM movies', (err, rows) => {
        callback(err, rows);
    });
}

function delBooks(bookID, callback) {
    const sql = 'UPDATE books SET copies = 0 WHERE title = ?';
    db.query(sql, [title], (err, result) => {
        callback(err, result);
    });
}

function delMovies(movieId, callback) {
    const sql = 'UPDATE movies 
        SET Title = NULL, 
            Year = NULL, 
            Rating = NULL, 
            Genre = NULL
        WHERE movieID = ?';
    db.query(sql, [movieID], (err, result) => {
        callback(err, result);
    });
}


async function addBooks(BookID, Title, ISP, Author, Copies, Genre, Type, callback) {\
    getNextID('books', 'BookID', (err, nextBookID) => {
        if (err) return callback(err);
        BookID = nextBookID;
        const sql = 'INSERT INTO books (BookID, Title, ISP, Author, Copies, Genre, Type) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [BookID, Title, ISP, Author, Copies, Genre, Type], (err) => {
            if (err) return callback(err);
            callback(null, { success: true });
        });
    });
}
async function addMovies(MovieID, Title, Year, Rating, Genre, callback) {
    getNextID('movies', 'MovieID', (err, nextMovieID) => {
        if (err) return callback(err);
        MovieID = nextMovieID;
        const sql = 'INSERT INTO movies (MovieID, Title, Year, Rating, Genre) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [MovieID, Title, Year, Rating, Genre], (err) => {
            if (err) return callback(err);
            callback(null, { success: true });
        });
    });
}

module.exports = { viewAllBooks, viewAllMovies, delBooks, addBooks, delMovies, addMovies };
