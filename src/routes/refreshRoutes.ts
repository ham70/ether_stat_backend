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
  const weather_data = await ApiService.get_weather_data(data.id, data.lat, data.lng)
  const aqi_data = await ApiService.get_aqi_data(data.id, data.lat, data.lng)

  return res.json({
    id: data.id,
    weather_data: weather_data,
    aqi_data: aqi_data
  })
})


export default router