import express from 'express'
import bodyParser from 'body-parser'
import { RefreshDataRequest, RefreshDataReseponse, CityDataResponse, WeatherData } from "../types"
import { ApiService } from '../services/apiService'

const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

//post routers
router.post('/', async (req, res) => {
  const data: RefreshDataRequest = req.body 

  if (!data) {
    return res.status(400).json({ error: 'Missing query parameter `data`' })
  }

  //handle data
  const weather_data = await ApiService.get_weather_data(data.lat, data.lng)

  return res.json({
    id: data.id,
    weather_data: {
        location_id: data.id,
        temperature: weather_data.main.temp,
        conditions: weather_data.weather[0].description,
        humidity: weather_data.main.humidity,
        wind_speed: weather_data.wind.speed,
        uv_index: 4,
        created_at: 'today'
    }
  })
})


export default router