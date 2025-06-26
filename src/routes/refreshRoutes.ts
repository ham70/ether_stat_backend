import express from 'express'
import bodyParser from 'body-parser'
import { CityDataResponse, WeatherData, RefreshDataResponse, RefreshDataRequest } from "../types"
import { ApiService } from '../services/apiService'

const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

//post routes
router.post('/', async (req, res) => {
  const data: RefreshDataRequest = req.body

  if (!data) {
    return res.status(400).json({ error: 'Missing data in post body' })
  }

  //handle data
  const weather_data = await ApiService.get_weather_data(data.lat, data.lng)
  const aqi_data = await ApiService.get_aqi_data(data.lat, data.lng)

  return res.json({
    id: data.id,
    weather_data: {
      location_id: data.id,
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
        location_id: data.id,
        aqi: aqi_data.indexes[0].aqi,
        category: aqi_data.indexes[0].category,
        dom: aqi_data.indexes[0].dominantPollutant
    }
  })
})


export default router