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

  return res.json({
    city: {
        id: geo_result.place_id,
        name: query,
        lat: geo_result.geometry.location.lat,
        lng: geo_result.geometry.location.lng,
        weather_data: {
            location_id: geo_result.place_id,
            temperature: weather_data.main.temp,
            conditions: weather_data.weather[0].description,
            humidity: weather_data.main.humidity,
            wind_speed: weather_data.wind.speed,
            uv_index: 4,
            created_at: 'today'
        }
    }
  })
})


export default router