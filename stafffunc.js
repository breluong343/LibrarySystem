const { get } = require('node:http');
const db = require('./db');
const { getNextID } = require('./system');

//View books/movies functions
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

//Delete books/movies functions
function delBooks(bookID, callback) {
    const sql = 'DELETE FROM Books WHERE Book_ID = ?';
    db.query(sql, [bookID], (err, result) => {
        callback(err, result);
    });
}

function delMovies(movieID, callback) {
    const sql = `DELETE FROM Movies WHERE Movie_ID = ?`;
    db.query(sql, [movieID], (err, result) => {
        callback(err, result);
    });
}

//Add book/movie functions
function addBooks(Book_ID, Title, ISBN, Author, Copies, Genre, Type, callback) {
    getNextID('books', 'Book_ID', (err, nextBookID) => {
        if (err) return callback(err);
        Book_ID = nextBookID;
        const sql = 'INSERT INTO books (Book_ID, Title, ISBN, Author, Copies, Genre, Type) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [Book_ID, Title, ISBN, Author, Copies, Genre, Type], (err) => {
            if (err) return callback(err);
            callback(null, { success: true });
        });
    });
}

function addMovies(Movie_ID, Title, Year, Rating, Genre, callback) {
    getNextID('movies', 'Movie_ID', (err, nextMovieID) => {
        if (err) return callback(err);
        Movie_ID = nextMovieID;
        const sql = 'INSERT INTO movies (Movie_ID, Title, Year, Rating, Genre) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [Movie_ID, Title, Year, Rating, Genre], (err) => {
            if (err) return callback(err);
            callback(null, { success: true });
        });
    });
}

// Edit book/movie
function editBook(Book_ID, Title, ISBN, Author, Copies, Genre, Type, callback) {
    const sql = 'UPDATE Books SET Title = ?, Author = ?, Genre = ?, Type=?, Copies=? WHERE Book_ID=?';
    db.query(sql, [Title, ISBN, Author, Copies, Genre, Type, Book_ID], (err, result) => {
        callback(err, result);
    });
}

function editMovie(Movie_ID, Title, Year, Rating, Genre, callback) {
    const sql = 'UPDATE Movies SET Title = ?, Year = ?, Rating = ?, Genre=? WHERE Movie_ID=?';
    db.query(sql, [Title, Year, Rating, Genre, Movie_ID], (err, result) => {
        callback(err, result);
    });
}

// Members functions
function viewAllMembers(callback) {
    db.query('SELECT * FROM Members', (err, rows) => {
        callback(err, rows);
    }); 
}

function addUserMembers(memberID, address, username, password, creationDate, location, callback) {
    const sql ='INSERT INTO Users (Username, Password, CreationDate, Location) VALUES (?,?,?,?)';
    db.query(sql, [username, password, creationDate, location], (err) => {
        if (err) return callback(err);
    });
    getNextID('Members', 'Member_ID', (err1, nextMemberID) => {
        if (err1) return callback(err1);
        memberID = nextMemberID;
        const member_sql = 'INSERT INTO Members (Member_ID, Username, Address) VALUES (?,?,?)';
        db.query(member_sql, [memberID, username, address], (err1) => {
            callback(err1, { success: true });
        });
    });    
}

function delMember(memberID, callback){
    const bookhold_sql = `DELETE FROM Bookshold WHERE Member_ID = ?`;
    const moviehold_sql = `DELETE FROM Movieshold WHERE Member_ID = ?`;
    const get_username = 'SELECT Username FROM Members WHERE Member_ID = ?';
    const member_sql = 'DELETE FROM Members WHERE Member_ID = ?';                                                        
    const user_sql = `DELETE FROM Users WHERE Username = ?`;
 
    db.query(get_username, [memberID], (e, rows) => {
        if (e) return callback(e);
        if (!rows || rows.length == 0) return callback(new Error('Member not found'));

        const username = rows[0].Username;

        db.query(bookhold_sql, [memberID], (err) => {
            if (err) return callback(err);
            db.query(moviehold_sql, [memberID], (err1) => {
                if (err1) return callback(err1);
                db.query(member_sql, [memberID], (e1) => {
                    if (e1) return callback(e1);
                    db.query(user_sql, [username], (e2) => {
                        callback(e2);
                    });
                }); 
            });  
        });
    });
}

// Staffs functions 
function viewAllStaffs(callback) {
    db.query('SELECT * FROM Staffs', (err, rows) => {
        callback(err, rows);
    });
}

function addUserStaffs(staffID, role, hoursWorked, name, address, username, password, creationDate, location, callback) {
    const sql ='INSERT INTO Users (Username, Password, CreationDate, Location) VALUES (?,?,?,?)';
    db.query(sql, [username, password, creationDate, location], (err) => {
        if (err) return callback(err);
        getNextID('Staff', 'Staff_ID', (err1, nextStaffID) => {
            if (err1) return callback(err1);
            staffID = nextStaffID;
            const staff_sql = 'INSERT INTO Staff (Staff_ID, Role, HoursWorked, Name, Address, Username) VALUES (?,?,?,?,?,?)';
            db.query(staff_sql, [staffID, role, hoursWorked, name, address, username], (err2) => {
                callback(err2, { success: true, staffID});
            });
        });
    })
}

function delStaffs(staffID, callback) {
    const get_username = 'SELECT Username FROM Staff WHERE Staff_ID = ?';
    const staff_sql    = 'DELETE FROM Staff WHERE Staff_ID = ?';
    const user_sql     = 'DELETE FROM Users WHERE Username = ?';

    db.query(get_username, [staffID], (err, rows) => {
        if (err) return callback(err);
        if (!rows || rows.length === 0) return callback(new Error('Staff not found'));  // ← add this

        const username = rows[0].Username;
        db.query(staff_sql, [staffID], (err1) => {
            if (err1) return callback(err1);
            db.query(user_sql, [username], (err2, result) => {
                callback(err2, result);
            });
        });
    });
}

// Borrows functions
function viewAllBorrows(callback){
    const sql = `
        SELECT bh.Member_ID, bh.Book_ID, NULL AS Movie_ID,
               bh.BorrowDate, m.Username AS MemberName,
               b.Title AS ItemTitle, 'Book' AS ItemType
        FROM Bookshold bh
        JOIN Members m ON bh.Member_ID = m.Member_ID
        JOIN Books   b ON bh.Book_ID   = b.Book_ID
        WHERE bh.Type = 'borrow'
        UNION ALL
        SELECT mh.Member_ID, NULL AS Book_ID, mh.Movie_ID,
               mh.BorrowDate, m.Username AS MemberName,
               mv.Title AS ItemTitle, 'Movie' AS ItemType
        FROM Movieshold mh
        JOIN Members m  ON mh.Member_ID = m.Member_ID
        JOIN Movies  mv ON mh.Movie_ID  = mv.Movie_ID
        ORDER BY BorrowDate DESC`;
    db.query(sql, (err, rows) => { callback(err, rows); });
}

// Hold function 
function viewAllHolds(callback){
    const sql = `
        SELECT bh.Member_ID, bh.Book_ID,
               bh.BorrowDate, m.Username AS MemberName,
               b.Title AS ItemTitle, 'Book' AS ItemType
        FROM Bookshold bh
        JOIN Members m ON bh.Member_ID = m.Member_ID
        JOIN Books   b ON bh.Book_ID   = b.Book_ID
        WHERE bh.Type = 'hold'
        ORDER BY BorrowDate DESC`;
    db.query(sql, (err, rows) => { callback(err, rows); });
}

// Check out functions
function checkoutBook(memberID, bookID, borrowDate, callback) {
    const sql = 'SELECT Copies FROM Books WHERE Book_ID = ?';
    db.query(sql, [bookID], (err, rows) => {
        if (err) return callback(err);
        if (!rows.length || rows[0].Copies < 1) 
            return callback(new Error('No copies available'));
        db.query(
            'INSERT INTO Bookshold (Member_ID, Book_ID, BorrowDate) VALUES (?, ? , ?)', 
            [memberID, bookID, borrowDate], (err1) => {
                if (err1) return callback(err1);
                db.query('UPDATE Books SET Copies = Copies - 1 WHERE Book_ID = ?', 
                    [bookID], (err2) => { callback(err2, { success: true }); }
                );
            }
        );
    });
}

function checkoutMovie(memberID, movieID, borrowDate, callback) {
    const sql = 'INSERT INTO Movieshold (Member_ID, Movie_ID, BorrowDate) VALUES (?, ? , ?)';
    db.query(sql, [memberID, movieID, borrowDate], (err,result) => 
        { callback(err, result); });
}

// Return functions
function returnBook(memberID, bookID, borrowDate, callback) {
    const sql = 'DELETE FROM Bookshold WHERE Member_ID = ? AND Book_ID = ? AND BorrowDate = ? AND Type = "borrow"';
    db.query(sql, [memberID, bookID, borrowDate], (err) => {
        if (err) return callback(err);
        db.query(
            'UPDATE Books SET Copies = Copies + 1 WHERE Book_ID = ?',
            [bookID], (err1) => {
                callback(err1, { success: true });
            }
        );
    });
}
function returnBookHold(memberID, bookID, borrowDate, callback) {
    const sql = 'DELETE FROM Bookshold WHERE Member_ID = ? AND Book_ID = ? AND BorrowDate = ? AND Type = "hold"';
    db.query(sql, [memberID, bookID, borrowDate], (err, result) => {
        callback(err, result);
    });
}

function returnMovie(memberID, movieID, borrowDate, callback){
    const sql = 'DELETE FROM Movieshold WHERE Member_ID = ? AND Movie_ID = ? AND BorrowDate = ?';
    db.query(sql, [memberID, movieID, borrowDate], (err) => {
        if (err) return callback(err);
    });
}

module.exports = { viewAllBooks, viewAllMovies, viewAllMembers, viewAllBorrows, viewAllHolds, viewAllStaffs, 
                    addBooks, addMovies, 
                    delBooks, delMovies,
                    checkoutBook, returnBook, returnBookHold, 
                    checkoutMovie, returnMovie, 
                    editBook, editMovie,
                    addUserMembers, delMember,
                    addUserStaffs, delStaffs
 };