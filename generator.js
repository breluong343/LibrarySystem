// generator.js - Takes button inputs and outputs SQL scripts

function generateBooks() {
    const booksSQL = `-- Books Table SQL Script
CREATE TABLE Books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) UNIQUE,
    published_year INT,
    genre VARCHAR(100),
    available_copies INT DEFAULT 1
);

-- Sample Insert Statements
INSERT INTO Books (title, author, isbn, published_year, genre, available_copies)
VALUES 
    ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1925, 'Fiction', 5),
    ('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 1960, 'Fiction', 3),
    ('1984', 'George Orwell', '9780451524935', 1949, 'Science Fiction', 4);`;

    console.log(booksSQL);
    alert('Books SQL generated! Check console for output.');
    displaySQL(booksSQL);
}

function generateMembers() {
    const membersSQL = `-- Members Table SQL Script
CREATE TABLE Members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    membership_date DATE,
    membership_type VARCHAR(50)
);

-- Sample Insert Statements
INSERT INTO Members (first_name, last_name, email, phone, membership_date, membership_type)
VALUES 
    ('John', 'Smith', 'john.smith@email.com', '555-0101', '2024-01-15', 'Premium'),
    ('Jane', 'Doe', 'jane.doe@email.com', '555-0102', '2024-02-20', 'Standard'),
    ('Bob', 'Johnson', 'bob.johnson@email.com', '555-0103', '2024-03-10', 'Premium');`;

    console.log(membersSQL);
    alert('Members SQL generated! Check console for output.');
    displaySQL(membersSQL);
}

function displaySQL(sql) {
    // Open a new window to display the SQL
    const win = window.open('', '_blank', 'width=600,height=500');
    if (!win) return;

    win.document.write(`
        <!doctype html>
        <html>
            <head>
                <title>Generated SQL</title>
                <style>
                    body {
                        font-family: Consolas, monospace;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    pre {
                        background: #fff;
                        padding: 15px;
                        border: 1px solid #ddd;
                        white-space: pre-wrap;
                        font-size: 14px;
                    }
                    h2 { color: #333; }
                    .copy-btn {
                        margin-top: 10px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <h2>Generated SQL Script</h2>
                <pre>${sql}</pre>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('pre').textContent); this.textContent='Copied!'">
                    Copy to Clipboard
                </button>
            </body>
        </html>
    `);
    win.document.close();
}