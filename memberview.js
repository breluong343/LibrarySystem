const db = require('./db');

async function viewBooks(filters = {}) {
  let sql = 'SELECT * FROM books WHERE 1=1';
  let params = [];

  const fields = ['bookID', 'title', 'author', 'genre', 'type'];
  fields.forEach(field => {
    if (filters[field]) {
      sql += ` AND ${field} = ?`;
      params.push(filters[field]);
    }
  });

  const [rows] = await db.execute(sql, params);
  return rows;
}
async function viewMovies(filters = {}) {
  let sql = 'SELECT * FROM movies WHERE 1=1';
  let params = [];

  const fields = ['movieID', 'title', 'year', 'genre', 'rating'];
  fields.forEach(field => {
    if (filters[field]) {
      sql += ` AND ${field} = ?`;
      params.push(filters[field]);
    }
  });

  const [rows] = await db.execute(sql, params);
  return rows;
}


async function createbookhold(bookID, memberID) {
    const sql = 'INSERT INTO bookholds (bookID, memberID, holdDate) VALUES (?, ?, NOW())';

}
async function createmoviehold(movieID, memberID) {
    const sql = 'INSERT INTO movieholds (movieID, memberID, holdDate) VALUES (?, ?, NOW())';
}

module.exports = { viewBooks, viewMovies, createbookhold, createmoviehold };