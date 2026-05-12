# LibrarySystem
Simulated Library System

## Project Overview
For a long time, Libraries have been a source of knowledge, and because of technological advancements, people coming to libraries in-person for long periods of time have decreased. Therefore, our Online Library System helps people adapt to that shift to be able to check out and place holds on books and movies online through our website. Then there is also our staff who have the ability to manage library duties and can view other library members, and they can add or delete books, movies, and other staff members. 

## Dependencies and Required Software
Make sure to install the following software before setting up the project: 
* Node.js: v18 or higher. Download link: https://nodejs.org/en/download 
* MySQL: v8.0 or higher. Download link: https://www.mysql.com/downloads/
* Git: any version

Node.js packages (included in package.json): automatically installed by running `npm install`

## Set up the project
1. Clone the repository: 
```bash 
git clone https://github.com/breluong343/LibrarySystem.git
cd LibrarySystem
```

2. Install Node.js dependencies: 
```bash 
npm install
```
3. Install MySQL and run: 
```bash
mysql -u root -p < SQL/initialize_data.sql
```
* Using a Non-Root MySQL User

    If you prefer not to use the root account, create a dedicated MySQL user and grant access:

    ```sql
    GRANT ALL PRIVILEGES ON OnlineLibrarySystem.* TO 'your_username'@'localhost';
    FLUSH PRIVILEGES;
    ```

    Then update your `.env` file with that username and password.
4. Configure database credentials: 
* Copy `.env.example` to `.env`
    - Mac/Linux: `cp .env.example .env`
    - Windows: `copy .env.example .env`
* Open `.env` and update the values with: 
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD= your_mysql_password
    DB_NAME=OnlineLibrarySystem
    DB_PORT: 3306
    ```
5. Start the server: 
```bash
node server.js
```
6. Open the application at: 
```bash
http://localhost:3000/
```