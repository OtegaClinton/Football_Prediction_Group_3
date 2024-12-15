const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});


// Function to create the "predictions" table if it doesn't exist
const createTable = async () => {
  const createTableQuery = `
   CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    fixture_id INT UNIQUE NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    competition_name VARCHAR(100) NOT NULL,
    competition_cluster VARCHAR(100) NOT NULL,
    prediction VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    federation VARCHAR(50) NOT NULL,
    is_expired BOOLEAN NOT NULL,
    season VARCHAR(20) NOT NULL,
    result VARCHAR(10),
    odds_1 FLOAT,
    odds_2 FLOAT,
    odds_12 FLOAT,
    odds_X FLOAT,
    odds_1X FLOAT,
    odds_X2 FLOAT,
    start_date TIMESTAMP NOT NULL,
    last_update_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Table "predictions" is ready.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// Call createTable when the module is loaded
createTable();

module.exports = pool;


// const { Pool } = require('pg');
// const fs = require('fs');
// require('dotenv').config();

// // Read the certificate file
// const ca = fs.readFileSync('./aiven-ca.crt').toString(); // Adjust path if necessary

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false, // Allow self-signed certificates
//     ca: ca, // Add the certificate authority file
//   },
// });

// pool.on('connect', () => {
//   console.log('Connected to the Aiven database!');
// });

// // Function to create the "predictions" table if it doesn't exist
// const createTable = async () => {
//   const createTableQuery = `
//    CREATE TABLE IF NOT EXISTS predictions (
//     id SERIAL PRIMARY KEY,
//     fixture_id INT UNIQUE NOT NULL,
//     home_team VARCHAR(100) NOT NULL,
//     away_team VARCHAR(100) NOT NULL,
//     competition_name VARCHAR(100) NOT NULL,
//     competition_cluster VARCHAR(100) NOT NULL,
//     prediction VARCHAR(10) NOT NULL,
//     status VARCHAR(20) NOT NULL,
//     federation VARCHAR(50) NOT NULL,
//     is_expired BOOLEAN NOT NULL,
//     season VARCHAR(20) NOT NULL,
//     result VARCHAR(10),
//     odds_1 FLOAT,
//     odds_2 FLOAT,
//     odds_12 FLOAT,
//     odds_X FLOAT,
//     odds_1X FLOAT,
//     odds_X2 FLOAT,
//     start_date TIMESTAMP NOT NULL,
//     last_update_at TIMESTAMP NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
//   `;

//   try {
//     await pool.query(createTableQuery);
//     console.log('Table "predictions" is ready.');
//   } catch (error) {
//     console.error('Error creating table:', error);
//   }
// };

// // Call createTable when the module is loaded
// createTable();

// module.exports = pool;
