const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'halluser',
  password: 'Sumaiya22shafa44@sql',
  database: 'hallhive'
});

// Test the database connection
db.query('SELECT 1')
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));

module.exports = db;