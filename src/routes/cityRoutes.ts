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
  console.log(query)
  const geocode_data = await ApiService.get_location_data(query)
  const result = geocode_data.results[0]
  console.log(geocode_data)

  return res.json({
    city: {
        id: result.place_id,
        name: query,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lat,
        weather_data: {
            location_id: "init_id",
            temperature: 75,
            conditions: "sunny",
            humidity: 80,
            wind_speed: 6,
            uv_index: 4,
            created_at: 'today'
        }
    }
  })
})


export default router