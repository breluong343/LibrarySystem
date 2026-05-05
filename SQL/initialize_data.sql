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
INSERT INTO Books (Book_ID, Title, ISBN, Author, Copies, Genre, Type) VALUES
(1001, 'Annie Bot', '9780008584566', 'Sierra Greer', 1, 'science fiction', 'Audiobook'),
(1002, 'My Sister, the Serial Killer', '9780525564201', 'Oyinkan Braithwaite', 4, 'thriller', 'Hardcover'),
(1003, 'The Secret History', '9781400031702', 'Donna Tartt', 2, 'academia novel', 'Paperback'),
(1004, 'They Never Learn', '9781982132033', 'Layne Fargo', 2, 'thriller', 'ebook'),
(1005, 'Rise', '9780349001456', 'Freya Finch', 5, 'thriller', 'Paperback'),
(1006, 'The Frozen River', '9780385546874', 'Ariel Lawhon', 3, 'historical fiction', 'ebook'),
(1007, 'Monsters', '9781319474508', 'Claire Dederer', 2, 'literacy fiction', 'ebook'),
(1008, 'The Last Mrs. Parrish', '9780062667588', 'Liv Constantine', 1, 'thriller', 'Audiobook'),
(1009, 'Here One Moment', '9780593798607', 'Liane Moriarty', 2, 'mystery', 'Hardcover'),
(1010, 'The Heaven & Earth Grocery Store', '9780593422946', 'James McBride', 3, 'historical fiction', 'Audiobook'),
(1011, 'The It Girl', '9781668009246', 'Ruth Ware', 3, 'thriller', 'ebook'),
(1012, 'Wandering Stars', '9780593318256', 'Tommy Orange', 3, 'historical fiction', 'Hardcover'),
(1013, 'Fire Exit', '9781959030553', 'Morgan Talty', 1, 'literacy fiction', 'Audiobook'),
(1014, 'Anxious People', '9781501160844', 'Fredrik Backman', 2, 'contemporary fiction', 'Audiobook'),
(1015, 'Lessons in Chemistry', '9780385547345', 'Bonnie Garmus', 4, 'historical fiction', 'Hardcover'),
(1016, 'How Can I Help You', '9780593543702', 'Laura Sims', 3, 'thriller', 'Paperback'),
(1017, 'I Swear: Politics Is Messier Than My Minivan', '9780593443989', 'Katherine Porter', 2, 'non-fiction', 'ebook');
CREATE TABLE Movies (
    Movie_ID INT PRIMARY KEY,
    Title VARCHAR(50),
    Year INT,
    Rating DOUBLE,
    Genre ENUM('comedy','action','adventure','drama')
);
INSERT INTO Movies (Movie_ID, Title, Year, Rating, Genre) VALUES
(100, 'The Amazing Spider-Man 2', 2014, 6.6, 'action'),
(101, 'The Shawshank Redemption', 1994, 9.3, 'drama'),
(102, 'Back to the Future', 1985, 8.5, 'comedy'),
(103, 'The Breakfast Club', 1985, 7.8, 'drama'),
(104, 'The Goonies', 1985, 7.7, 'comedy'),
(105, 'Jurassic Park', 1993, 8.2, 'action'),
(106, 'The Lion King', 1994, 8.5, 'adventure'),
(107, 'Toy Story', 1995, 8.3, 'adventure'),
(108, 'The Matrix', 1999, 8.7, 'action'),
(109, 'The Hangover', 2009, 7.7, 'comedy'),
(110, 'Star Trek', 2009, 7.9, 'action'),
(111, 'Up', 2009, 8.3, 'adventure'),
(112, 'The Help', 2011, 8.1, 'drama'),
(113, 'Battleship', 2012, 5.8, 'action'),
(114, 'The Bourne Legacy', 2012, 6.6, 'action'),
(115, 'Brave', 2012, 7.1, 'adventure'),
(116, 'The Cabin in the Woods', 2011, 7.0, 'comedy');
CREATE TABLE Members (
    Member_ID INT PRIMARY KEY,
    Username VARCHAR(50),
    Address VARCHAR(100)
);
INSERT INTO Members (Member_ID, Username, Address) VALUES
(1000000, 'invincibleathletics', '654 Oxford Court Levittown, NY 11756'),
(1000001, 'liberatedbond', '646 Summer Street Queensbury, NY 12804'),
(1000002, 'hurtsandpiper', '91 Lake Avenue Ambler, PA 19002'),
(1000003, 'antennaasset', '79 Maiden Lane Clarkston, MI 48348'),
(1000004, 'perceptionunselfish', '324 Hillcrest Avenue Asbury Park, NJ 07712'),
(1000005, 'yikestrite', '256 Fieldstone Drive Hattiesburg, MS 39401'),
(1000006, 'continentnocturnal', '76 Walnut Avenue Hammonton, NJ 08037'),
(1000007, 'coatisuper', '7848 Route 20 Chesterton, IN 46304'),
(1000008, 'uprightassist', '981 6th Street West Utica, NY 13501'),
(1000009, 'boredthankful', '75 Oak Street New Albany, IN 47150'),
(1000010, 'forevervisitor', '7528 Mulberry Lane Huntersville, NC 28078'),
(1000011, 'dialintend', '636 Bay Street Powhatan, VA 23139'),
(1000012, 'kindleislands', '424 Lafayette Avenue Summerfield, FL 34491'),
(1000013, 'competecope', '946 3rd Avenue Plainview, NY 11803'),
(1000014, 'shouldervouch', '7258 Elm Avenue Grand Forks, ND 58201'),
(1000015, 'decorationsbarbers', '954 8th Street West Manahawkin, NJ 08050'),
(1000016, 'bubbleshorts', '4 Surrey Lane Avon, IN 46123');

CREATE TABLE Staff (
    Staff_ID INT PRIMARY KEY,
    Role ENUM('Manager','Assistant','Intern','Volunteer'),
    HoursWorked INT,
    Name VARCHAR(25),
    Address VARCHAR(100)
);
INSERT INTO Staff (Staff_ID, Role, HoursWorked, Name, Address) VALUES
(10000, 'Manager', 35, 'Alice Rey', '1001 E Santa Clara St, San Jose, CA 95116'),
(10001, 'Volunteer', 12, 'Bob Trent', '300 S 1st St, San Jose, CA 95113'),
(10002, 'Manager', 37, 'Lily Sia', '1700 W San Carlos St, San Jose, CA 95128'),
(10003, 'Volunteer', 18, 'Brian Leen', '500 Santana Row, San Jose, CA 95128'),
(10004, 'Volunteer', 5, 'Egypt Kent', '2100 Flickinger Ave, San Jose, CA 95131'),
(10005, 'Assistant', 22, 'Teddy Kim', '4000 Monterey Rd, San Jose, CA 95111'),
(10006, 'Manager', 40, 'Sarah Fern', '600 Emory St, San Jose, CA 95110'),
(10007, 'Assistant', 30, 'Skyler Garner', '1500 Gish Rd, San Jose, CA 95112'),
(10008, 'Assistant', 23,'Kimber Jenkins', '1500 El Camino Real, Santa Clara, CA 95050'),
(10009, 'Volunteer', 2, 'Willie Noble', '3200 Homestead Rd, Santa Clara, CA 95051'),
(10010, 'Assistant', 17, 'Declan Rosas', '2500 Mission College Blvd, Santa Clara, CA 95054'),
(10011, 'Volunteer', 10, 'Hunter Duke', '1000 Lafayette St, Santa Clara, CA 95050'),
(10012, 'Volunteer', 10, 'Calvin Ellis', '4000 Great America Pkwy, Santa Clara, CA 95054'),
(10013, 'Intern', 8, 'Joy Sosa', '2100 Monroe St, Santa Clara, CA 95050'),
(10014, 'Volunteer', 8, 'Kamari Alvarez', '1200 San Tomas Aquino Rd, Santa Clara, CA 95051'),
(10015, 'Intern', 13, 'Cruz Navarro', '3500 De La Cruz Blvd, Santa Clara, CA 95054'),
(10016, 'Volunteer', 6, 'Nolan Cano', '500 Benton St, Santa Clara, CA 95050'); 
CREATE TABLE Bookshold (
    Member_ID INT,
    Book_ID INT,
    BorrowDate DATE,
    PRIMARY KEY (Member_ID, Book_ID, BorrowDate),
    FOREIGN KEY (Member_ID) REFERENCES Members(Member_ID),
    FOREIGN KEY (Book_ID) REFERENCES Books(Book_ID)
);
INSERT INTO Bookshold (Member_ID, Book_ID, BorrowDate) VALUES
(1000000, 1001, '2026-05-03'),
(1000001, 1002, '2026-05-04'),
(1000002, 1003, '2026-05-05'),
(1000003, 1004, '2026-04-09'),
(1000004, 1005, '2026-04-22'),
(1000005, 1006, '2026-04-23'),
(1000006, 1007, '2026-04-23'),
(1000007, 1008, '2026-04-24'),
(1000008, 1009, '2026-04-25'),
(1000009, 1010, '2026-04-27'),
(1000010, 1011, '2026-04-28'),
(1000011, 1012, '2026-04-28'),
(1000012, 1013, '2026-04-29'),
(1000013, 1014, '2026-04-29'),
(1000014, 1015, '2026-04-29'),
(1000015, 1016, '2026-04-30'),
(1000016, 1017, '2026-04-30');

CREATE TABLE Movieshold (
    Member_ID INT,
    Movie_ID INT,
    BorrowDate DATE,
    PRIMARY KEY (Member_ID, Movie_ID, BorrowDate),
    FOREIGN KEY (Member_ID) REFERENCES Members(Member_ID),
    FOREIGN KEY (Movie_ID) REFERENCES Movies(Movie_ID)
);
INSERT INTO Movieshold (Member_ID, Movie_ID, BorrowDate) VALUES
(1000000, 100, '2026-03-05'),
(1000001, 101, '2026-03-12'),
(1000002, 102, '2026-03-10'),
(1000003, 103, '2026-03-11'),
(1000004, 104, '2026-03-19'),
(1000005, 105, '2026-03-19'),
(1000006, 106, '2026-03-19'),
(1000007, 107, '2026-03-26'),
(1000008, 108, '2026-03-30'),
(1000009, 109, '2026-04-02'),
(1000010, 110, '2026-04-10'),
(1000011, 111, '2026-04-14'),
(1000012, 112, '2026-04-16'),
(1000013, 113, '2026-04-23'),
(1000014, 114, '2026-04-29'),
(1000015, 115, '2026-05-01'),
(1000016, 116, '2026-05-02');

CREATE TABLE Users (
    Username VARCHAR(100) UNIQUE,
    Password VARCHAR(100),
    CreationDate DATETIME,
    Location VARCHAR(100)
);
INSERT INTO Users (Username, Password, CreationDate, Location) VALUES
('invincibleathletics', 'kG#8pT!m@L9rW$z2', '1899-12-30 12:02:02', 'San Diego'),
('liberatedbond', 'vN9&aC5uJ#sQ2pYk', '2026-05-04 08:04:11', 'Fresno'),
('hurtsandpiper', '4rT*bX@9Nm@S1vZb', '2026-01-07 09:45:00', 'San Francisco'),
('antennaasset', 'pW$q7E9%jR#tV2mL', '2026-01-15 01:12:05', 'San Jose'),
('perceptionunselfish', 'bT#r9L&kX6zM@2pA', '2026-01-21 01:45:06', 'Santa Clara'),
('yikestrite', 'jY5@vC3uP!nS9sRw', '2026-01-28 01:55:00', 'San Francisco'),
('continentnocturnal', 'Zq%4N9@pT8vL#r2k', '2026-02-04 02:03:00', 'Santa Clara'),
('coatisuper', 'mA$w8K#mC7vT9u2J', '2026-02-06 02:13:01', 'Santa Clara'),
('uprightassist', 'YN15mOmW3RU$I*Mt', '2026-02-11 02:39:00', 'Santa Clara'),
('boredthankful', 'KKN7XKIp^f2zHgss', '2026-02-17 03:10:08', 'San Francisco'),
('forevervisitor', 'x7fd*iSfkagU8h7&', '2026-03-04 04:17:00', 'San Jose'),
('dialintend', 'D%iP4aeQezu0r&^O', '2026-03-20 04:20:00', 'San Jose'),
('kindleislands', 'aVocBOQNkAKM8xax', '2026-03-23 05:10:00', 'Fresno'),
('competecope', 'Wa0TrjN2kBwrG^Zw', '2026-03-24 05:07:00', 'San Diego'),
('shouldervouch', 'RIap0h8I7zRDAd7l', '2026-03-26 07:08:00', 'San Jose'),
('decorationsbarbers', '&EfIslB9FVGXb$ze', '2026-03-27 08:43:03', 'Fresno'),
('bubbleshorts', 'cfMwQASK0d8wxKQz', '2026-04-07 09:06:06', 'San Jose');

SELECT * FROM Staff; 
SELECT * FROM Books; 
SELECT * FROM Movies; 
SELECT * FROM Members; 
SELECT * FROM Bookshold; 
SELECT * FROM Movieshold; 
SELECT * FROM Users; 


