const https = require('https');
const fs = require('fs'); // File system module
const path = require('path'); // Path module for file handling
const pool = require('./db'); // Import the pool from db.js
const { Parser } = require('json2csv'); // Install with: npm install json2csv

// Fetch data from the API
const fetchData = () => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'football-prediction-api.p.rapidapi.com',
      port: null,
      path: '/api/v2/predictions?market=classic&iso_date=2018-12-01&federation=UEFA',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'your_rapidapi_key_here',
        'x-rapidapi-host': 'football-prediction-api.p.rapidapi.com',
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));

      res.on('end', async () => {
        try {
          const body = Buffer.concat(chunks).toString();
          const data = JSON.parse(body);

          if (data && data.data) {
            console.log('API data fetched successfully.');
            resolve(data.data); // Return only the relevant data
          } else {
            console.error('Unexpected API response:', body);
            reject(new Error('Invalid API response format.'));
          }
        } catch (err) {
          console.error('Error parsing API response:', err);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });

    req.end();
  });
};

// Save data to the database
const saveDataToDB = async (predictions) => {
  try {
    for (const prediction of predictions) {
      console.log('Prediction:', prediction);

      const {
        id: fixture_id,
        home_team,
        away_team,
        competition_name,
        competition_cluster,
        prediction: predictionValue,
        status,
        federation,
        is_expired,
        season,
        result,
        odds: { '1': odds_1, '2': odds_2, '12': odds_12, X: odds_x, '1X': odds_1x, X2: odds_x2 },
        start_date,
        last_update_at,
      } = prediction;

      // Insert the data into the database
      try {
        await pool.query(
          `INSERT INTO predictions (
            fixture_id, home_team, away_team, competition_name, competition_cluster, prediction, status,
            federation, is_expired, season, result, odds_1, odds_2, odds_12, odds_x, odds_1x, odds_x2,
            start_date, last_update_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (fixture_id) DO NOTHING`,
          [
            fixture_id,
            home_team,
            away_team,
            competition_name,
            competition_cluster,
            predictionValue,
            status,
            federation,
            is_expired,
            season,
            result,
            odds_1,
            odds_2,
            odds_12,
            odds_x,
            odds_1x,
            odds_x2,
            start_date,
            last_update_at,
          ]
        );
        console.log(`Data for fixture_id ${fixture_id} successfully saved.`);
      } catch (err) {
        console.error(`Error saving data for fixture_id ${fixture_id}:`, err);
      }
    }
    console.log('All data successfully saved to the database.');
  } catch (err) {
    console.error('Error during data processing:', err);
  }
};

// Save data to CSV file
const saveDataToCSV = (predictions) => {
  try {
    const fields = [
      'id', 'fixture_id', 'home_team', 'away_team', 'competition_name',
      'competition_cluster', 'prediction', 'status', 'federation', 'is_expired',
      'season', 'result', 'odds_1', 'odds_2', 'odds_12', 'odds_x', 'odds_1x',
      'odds_x2', 'start_date', 'last_update_at',
    ]; // List of column names
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(predictions);

    const filePath = path.join(__dirname, 'predictions.csv'); // Save file in current directory
    fs.writeFileSync(filePath, csv);
    console.log(`CSV file saved successfully at: ${filePath}`);
  } catch (err) {
    console.error('Error saving data to CSV:', err);
  }
};

// Fetch and save data
const fetchAndSaveData = async () => {
  try {
    const predictions = await fetchData();
    await saveDataToDB(predictions); // Save to database
    saveDataToCSV(predictions); // Save to CSV file
  } catch (err) {
    console.error('Error fetching and saving data:', err);
  }
};

module.exports = { fetchAndSaveData };
