const express = require("express");
const fetch = require("node-fetch"); // make sure node-fetch v2
const bodyParser = require("body-parser");
const path = require("path");

const app = express(); // <-- app must be defined BEFORE using it

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // for JSON body parsing
app.use(express.static(__dirname)); // serve files from root directory

// Serve HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle form submission
app.post("/", async (req, res) => {
  const city = req.body.cityName?.trim();
  if (!city) return res.status(400).send("Please enter a city name!");

  try {
    const encodedCity = encodeURIComponent(city);
    const url = `https://open-weather13.p.rapidapi.com/city?city=${encodedCity}&lang=EN`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "5bf28d9e4cmsh1333e08d2dce8b7p1e71a7jsn03a695863f07",
        "x-rapidapi-host": "open-weather13.p.rapidapi.com",
      },
    };

    const response = await fetch(url, options);
    if (!response.ok)
      return res.status(response.status).send("City not found.");

    const data = await response.json();

    const temp = data.main.temp;
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    res.send(`
      <div class="weather-card">
        <div class="temp-icon">
          <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">
          <h2>${temp}°C</h2>
        </div>
        <p class="description">${desc}</p>
        <div class="weather-details">
          <p><strong>Humidity:</strong> ${humidity}%</p>
          <p><strong>Wind Speed:</strong> ${wind} m/s</p>
        </div>
      </div>
    `);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Error fetching weather data.");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
