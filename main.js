const inventory = require('./inventory');
const system = require('./system');

// EXAMPLE: Adding a new book with a system-generated ID
console.log("System: Starting process to add a new book...");

system.getNextID('books', 'BookID', (err, nextBookID) => {
    if (err) {
        console.error("System Error: Could not generate ID", err);
        return;
    }

    const newBookData = {
        BookID: nextBookID,
        Title: 'The Great Gatsby',
        ISP: '978-0743273565',
        Author: 'F. Scott Fitzgerald',
        Copies: 3,
        Genre: 'Classic',
        Type: 'Hardcover'
    };

    inventory.addBooks(newBookData, (err, result) => {
        if (err) {
            console.error("Inventory Error: Failed to add book", err);
            return;
        }
        console.log(`Success! Book added with ID: ${nextBookID}`);
    });
});

// EXAMPLE: Viewing all books
inventory.viewAllBooks((err, books) => {
    if (err) return console.error(err);
    console.table(books); // console.table is great for database rows!
});
