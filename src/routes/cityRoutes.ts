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
  const loc_data = await ApiService.get_location_data(query)
  const weather_data: WeatherData = await ApiService.get_weather_data(loc_data.id, loc_data.lat, loc_data.lng)
  const aqi_data = await ApiService.get_aqi_data(loc_data.id, loc_data.lat, loc_data.lng)
  const demo_data = await ApiService.get_demo_data(loc_data.id, loc_data.fips_codes.county, loc_data.fips_codes.state)

  return res.json({
    id: loc_data.id,
    name: loc_data.name,
    location: loc_data,
    weather: weather_data,
    aqi_data: aqi_data,
    demographics: demo_data
  })
})


export default router