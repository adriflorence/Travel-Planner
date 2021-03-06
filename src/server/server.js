// helper functions
const serverHelper = require('./serverHelper.js')

// allows to use environment variables
const dotenv = require('dotenv');
dotenv.config();

// Dependencies
const cors = require('cors')
const port = 8000;
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const express = require('express')
const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static('dist'));

app.get("/", (req, res) => res.sendFile("index.html"));

app.post("/api", async (req, res) => {

    // GeoNames API
    const city = req.body.city;
    const start_date = req.body.start_date;
    const geolocation = await fetch(`http://api.geonames.org/search?name=${city}&username=${process.env.username}&type=json`);
    const geo_json = await geolocation.json(); // returned as object
    const first_result = geo_json.geonames[0];
    const latitude = first_result.lat
    const longitude = first_result.lng

    // Weatherbit API
    const weather_url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHERBIT_KEY}&lat=${latitude}&lon=${longitude}`
    const weather = await fetch(weather_url);
    const weather_json = await weather.json();
    const forecast = serverHelper.getForecastForDay(start_date, weather_json.data)
    const description = serverHelper.getForecastDescription(forecast)

    // Pixabay API
    const image_url = `https://pixabay.com/api?key=${process.env.PIXABAY_KEY}&q=${city}`
    const image = await fetch(image_url);
    const image_json = await image.json();
    const image_web_url = image_json.hits[0].webformatURL;

    res.send({ temp: forecast ? forecast.temp : null, description, image_web_url });
});



app.listen(port, () => console.log(`Example app listening on port ${ port }!`));