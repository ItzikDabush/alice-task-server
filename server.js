const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

const apiKey = "866559263bd4a6368cc34806cba6f97d";

app.use(cors());
app.use(bodyParser.json());

function getCityID(city) {
  let cityId = null;
  if (city.toLowerCase() === "amsterdam") {
    return (cityId = 2759794);
  } else if (city.toLowerCase() === "berlin") {
    return (cityId = 2950158);
  } else if (city.toLowerCase() === "london") {
    return (cityId = 2643743);
  }
  return cityId;
}

function getRelevantData(response) {
  const kmPerHour = Math.round(response.data.wind.speed * 3.6);
  const roundedTemp = Math.round(response.data.main.temp);

  // according to OpenWeatherMap they don't provide probability of precipitation at the moment just the precipitation im mm units for the past 1h or 3h.

  //Since OpenWeatherMap respone with rain perciptation only if there is actually rain precipitation and sometimes the OpenWeatherMap returns empty object if there is no rain precipitation, I used this function to prevent undefined or emtpy objects values in case of no rain.
  function getRain(rain) {
    console.log("from api", rain);
    let newRain = {};
    if (rain === undefined || Object.keys(rain).length === 0) {
      newRain["1h"] = 0;
      return newRain;
    }
    return rain;
  }

  let precipitation = getRain(response.data.rain);

  return {
    wind: kmPerHour,
    humadity: response.data.main.humidity,
    temperature: roundedTemp,
    icon: {
      ...response.data.weather[0]
    },
    precipitation: precipitation
  };
}

app.get("/:city", (req, res) => {
  const { city } = req.params;
  let cityId = getCityID(city);
  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=metric`;

  axios
    .get(url)
    .then(response => {
      let cityRelevantData = getRelevantData(response);
      return res.status(200).json(cityRelevantData);
    })
    .catch(error => {
           return res.status(404).json(error.message);
    });
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
