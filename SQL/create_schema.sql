DROP DATABASE IF EXISTS OnlineLibrarySystem;
CREATE DATABASE OnlineLibrarySystem;
USE OnlineLibrarySystem;
CREATE TABLE Books (
    Book_ID INT PRIMARY KEY,
    Title VARCHAR(50),
    ISBN BIGINT,
    Author VARCHAR(50),
    Copies INT,
    Genre ENUM('science fiction','thriller','academia novel','historical fiction','literacy fiction','mystery','contemporary fiction','non-fiction'),
    Type ENUM('Hardcover','ebook','Paperback','Audiobook')
); 

CREATE TABLE Movies (
    Movie_ID INT PRIMARY KEY,
    Title VARCHAR(50),
    Year INT,
    Rating DOUBLE,
    Genre ENUM('comedy','action','adventure','drama')
);

CREATE TABLE Members (
    Member_ID INT PRIMARY KEY,
    Username VARCHAR(50),
    Address VARCHAR(100)
);

CREATE TABLE Staff (
    Staff_ID INT PRIMARY KEY,
    Role ENUM('Manager','Assistant','Intern','Volunteer'),
    HoursWorked INT,
    Name VARCHAR(25),
    Address VARCHAR(100)
);

CREATE TABLE Bookshold (
    Member_ID INT,
    Book_ID INT,
    BorrowDate DATE,
    PRIMARY KEY (Member_ID, Book_ID, BorrowDate),
    FOREIGN KEY (Member_ID) REFERENCES Members(Member_ID),
    FOREIGN KEY (Book_ID) REFERENCES Books(Book_ID)
);

CREATE TABLE Movieshold (
    Member_ID INT,
    Movie_ID INT,
    BorrowDate DATE,
    PRIMARY KEY (Member_ID, Movie_ID, BorrowDate),
    FOREIGN KEY (Member_ID) REFERENCES Members(Member_ID),
    FOREIGN KEY (Movie_ID) REFERENCES Movies(Movie_ID)
);

CREATE TABLE Users (
    Username VARCHAR(100) UNIQUE,
    Password VARCHAR(100),
    CreationDate DATETIME,
    Location VARCHAR(100)
);

SELECT * FROM Staff; 
SELECT * FROM Books; 
SELECT * FROM Movies; 
SELECT * FROM Members; 
SELECT * FROM Bookshold; 
SELECT * FROM Movieshold; 
SELECT * FROM Users; 


