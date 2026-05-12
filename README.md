# LibrarySystem
Simulated Library System

# Change to this branch
`git checkout nghi/connect-endpoints`

# Set up the project
1. Install dependencies: `npm install`
2. Install MySQL and run: `mysql -u root -p < SQL/initialize_data.sql`
3. Copy `.env.example` to `.env`
    - Mac/Linux: `cp .env.example .env`
    - Windows: `copy .env.example .env`
4. Open `.env` and fill in your MySQL credentials
5. Start the server: `node server.js`
6. Open `http://localhost:3000/` 