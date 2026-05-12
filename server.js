require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

const staff = require('./stafffunc');
const member = require('./memberfunc');
const system = require('./system');
const db = require('./db');

// Login 
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    system.checkLogin(username, password, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        db.query('SELECT * FROM Staff WHERE Username = ?', [username], (err2, staffRows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const role = staffRows.length > 0 ? 'staff' : 'member';

            db.query('SELECT Member_ID FROM Members WHERE Username = ?', [username], (err3, memberRows) => {
                if (err3) return res.status(500).json({ error: err3.message });
                const memberID = memberRows.length > 0
                    ? (memberRows[0].Member_ID ?? memberRows[0].member_id ?? null)
                    : null;

                console.log(`Login: user=${username}, role=${role}, memberID=${memberID}`);
                res.json({ message: 'Login successful!', role, username, memberID });
            });
        });
    });
});

// Books
app.get('/api/books', (req, res) => {
    const { search, genre, type } = req.query;
    staff.viewAllBooks((err, books) => {
        if (err) return res.status(500).json({ error: err.message });
        let result = books;
        if (search) result = result.filter(b =>
            b.Title?.toLowerCase().includes(search.toLowerCase()) ||
            b.Author?.toLowerCase().includes(search.toLowerCase()));
        if (genre) result = result.filter(b => b.Genre === genre);
        if (type)  result = result.filter(b => b.Type === type);
        res.json(result);
    });
});

//Add new Book
app.post('/api/books', (req, res) => {
    const { Title, ISBN, Author, Copies, Genre, Type } = req.body;
    if (!Title || !ISBN || !Author || !Copies || !Genre || !Type)
        return res.status(400).json({ error: 'All fields are required!' });
    staff.addBooks(null, Title, ISBN, Author, Copies, Genre, Type, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book added!' });
    });
});

//Edit Book
app.put('/api/books/:id', (req, res) => {
    const { Title, Author, Genre, Type, Copies } = req.body;
    staff.editBook(req.params.id, Title, Author, Copies, Genre, Type, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book updated!' });
    });
});

//Delete Book
app.delete('/api/books/:id', (req, res) => {
    staff.delBooks(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book deleted!' });
    });
});

// Movies
app.get('/api/movies', (req, res) => {
    const { search, genre } = req.query;
    staff.viewAllMovies((err, movies) => {
        if (err) return res.status(500).json({ error: err.message });
        let result = movies;
        if (search) result = result.filter(b =>
            b.Title?.toLowerCase().includes(search.toLowerCase()));
        if (genre) result = result.filter(b => b.Genre === genre);
        res.json(result);
    });
});

//Add new Movie
app.post('/api/movies', (req, res) => {
    const { Title, Year, Rating, Genre } = req.body;
    if (!Title || !Year || !Rating || !Genre)
        return res.status(400).json({ error: 'All fields are required!' });
    staff.addMovies(null, Title, Year, Rating, Genre, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie added!' });
    });
});

//Edit a Movie
app.put('/api/movies/:id', (req, res) => {
    const { Title, Year, Rating, Genre } = req.body;
    staff.editMovie(req.params.id, Title, Year, Rating, Genre, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie updated!' });
    });
});

//Delete a Movie
app.delete('/api/movies/:id', (req, res) => {
    staff.delMovies(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie deleted!' });
    });
});

// Staffs
app.get('/api/staff', (req, res) => {
    db.query('SELECT * FROM Staff', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Add new Staff
app.post('/api/staff', (req, res) => {
    const { Role, HoursWorked, Name, Address, Username, Password, CreationDate, Location } = req.body;
    const date = CreationDate || new Date().toISOString().split('T')[0];
    if (!Role || !HoursWorked || !Name || !Address || !Username || !Password || !date || !Location) 
        return res.status(400).json('All fields required! Please enter.');
    staff.addUserStaffs(null, Role, HoursWorked, Name, Address, Username, Password, date, Location, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'New Staff added!', staffID: result.staffID });
    });
});

app.delete('/api/staff/:id', (req, res) => {
    staff.delStaffs(req.params.id, (err) => { 
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Staff deleted!' });
    });
});

// Members
app.get('/api/members', (req, res) => {
    const { search } = req.query;
    staff.viewAllMembers((err, members) => {
        if (err) return res.status(500).json({ error: err.message });
        let result = members;
        if (search) result = result.filter(b =>
            b.Username?.toLowerCase().includes(search.toLowerCase()) ||
            b.Member_ID?.toString().includes(search));
        res.json(result);
    });
});

// Add new member
app.post('/api/members', (req, res) => {
    const { Address, Username, Password, CreationDate, Location } = req.body;
    const date = CreationDate || new Date().toISOString().split('T')[0];
    if (!Address || !Username || !Password || !date || !Location) 
        return res.status(400).json('All fields required! Please enter.');
    staff.addUserMembers(null, Address, Username, Password, date, Location, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'New Member added!', memberID: result.memberID });
    });
});

app.delete('/api/members/:id', (req, res) => {
    staff.delMember(req.params.id, (err) => { 
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Member deleted!' });
    });
});

// Borrows
app.get('/api/borrows', (req, res) => {
    staff.viewAllBorrows((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add Borrows
app.post('/api/borrows/books', (req, res) => {
    const { Member_ID, Book_ID, BorrowDate } = req.body;
    const date = BorrowDate || new Date().toISOString().split('T')[0];
    staff.checkoutBook(Member_ID, Book_ID, date, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book borrowed!' });
    });
});

app.post('/api/borrows/movies', (req, res) => {
    const { Member_ID, Movie_ID, BorrowDate } = req.body;
    const date = BorrowDate || new Date().toISOString().split('T')[0];
    staff.checkoutMovie(Member_ID, Movie_ID, date, (err) => { 
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie borrowed!' });
    });
});

// Delete Borrows
app.delete('/api/borrows/books', (req, res) => {
    const { Member_ID, Book_ID, BorrowDate } = req.body;
    const date = BorrowDate || new Date().toISOString().split('T')[0];
    staff.returnBook(Member_ID, Book_ID, date, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book returned!' });
    });
});

app.delete('/api/borrows/movies', (req, res) => {
    const { Member_ID, Movie_ID, BorrowDate } = req.body;
    const date = BorrowDate ? new Date(BorrowDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    staff.returnMovie(Member_ID, Movie_ID, date, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie returned!' });
    });
});

// Holds
app.get('/api/holds', (req, res) => {
    staff.viewAllHolds((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/holds/books', (req, res) => {
    const { Book_ID, Member_ID } = req.body;
    member.createBookHold(Book_ID, Member_ID, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book hold added!' });
    });
});

app.delete('/api/holds/books', (req, res) => {
    const { Member_ID, Book_ID, BorrowDate } = req.body;
    const date = BorrowDate || new Date().toISOString().split('T')[0];
    staff.returnBookHold(Member_ID, Book_ID, date, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Hold returned!' });
    });
});

// Console log for checking if server is running 
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});