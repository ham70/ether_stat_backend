import express from 'express'
import bodyParser from 'body-parser'
import { CityDataResponse, WeatherData } from "../types"
import { ApiService } from '../services/apiService'

const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

//get routers
router.get('/', async (req, res) => {
  const query = req.query.q as string

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter `q`' })
  }

  //handle data
  const geocode_data = await ApiService.get_location_data(query)
  const geo_result = geocode_data.results[0]

  const weather_data = await ApiService.get_weather_data(geo_result.geometry.location.lat, geo_result.geometry.location.lng)
  const aqi_data = await ApiService.get_aqi_data(geo_result.geometry.location.lat, geo_result.geometry.location.lng)
  
  return res.json({
    city: {
      id: geo_result.place_id,
      name: query,
      lat: geo_result.geometry.location.lat,
      lng: geo_result.geometry.location.lng,
      weather_data: {
        location_id: geo_result.place_id,
        conditions: weather_data.weatherCondition.description.text,
        temperature: {
          main: weather_data.temperature.degrees,
          feels_like: weather_data.feelsLikeTemperature.degrees,
          min: weather_data.currentConditionsHistory.maxTemperature.degrees,
          max: weather_data.currentConditionsHistory.minTemperature.degrees
        },
        humidity: weather_data.relativeHumidity,
        wind: {
          direction: weather_data.wind.direction,
          speed: weather_data.wind.speed.value,
          gust: weather_data.wind.gust.value,
          chill: weather_data.windChill.degrees,
        },
        thunder_storm: weather_data.thunderstormProbability,
        visibility: weather_data.visibility.distance,
        uv_index: weather_data.uvIndex,
        created_at: 'today'
      },
      aqi_data: {
        location_id: geo_result.place_id,
        aqi: aqi_data.indexes[0].aqi,
        category: aqi_data.indexes[0].category,
        dom: aqi_data.indexes[0].dominantPollutant
      }
    }
  })
})


export default router