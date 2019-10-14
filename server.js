const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

const apiKey = "866559263bd4a6368cc34806cba6f97d";

app.use(bodyParser.json());
app.use(cors());

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
  // according to OpenWeatherMap they don't provide probability of precipitation at the moment just the precipitation im mm unit for the past 1h or 3hr.
  //Since the api respone with rain perciptation only if there is a rain precipitation, I used a logical opertor to prevent undefined value in case of no rain.
  console.log(response.data.rain)
  const precipitation = response.data.rain || { "1h": "0" };

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
      console.log("inside axios catch", error);
      return res.status(404).json(error.message);
    });
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
