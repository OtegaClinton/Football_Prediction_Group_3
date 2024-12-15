const express = require('express');
const { fetchAndSaveData } = require('./fetchData'); // Import the fetch and save function
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Base route to confirm server is running
app.get('/', (req, res) => {
  res.send('Football Prediction API Server is running.');
});

// Endpoint to manually trigger data fetching and saving
app.get('/fetch-predictions', async (req, res) => {
  try {
    await fetchAndSaveData(); // Call the function to fetch and save data
    res.status(200).send('Data fetched and saved successfully.');
  } catch (error) {
    console.error('Error fetching and saving data:', error);
    res.status(500).send('An error occurred while fetching and saving data.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
