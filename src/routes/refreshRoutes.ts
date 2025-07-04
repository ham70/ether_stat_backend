import express from 'express'
import bodyParser from 'body-parser'
import { CityDataResponse, WeatherData, RefreshDataResponse, RefreshDataRequest } from "../types"
import { ApiService } from '../services/apiService'
import db from '../database/dbInstance'

const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

//post routes
router.post('/', async (req, res) => {
  const data: RefreshDataRequest = req.body

  if (!data) {
    return res.status(400).json({ error: 'Missing data in post body' })
  }

  const weather = await db.getWeatherData(data.id)
  const air = await db.getAirQualityData(data.id)

  //checking weather data age
  const date = new Date(weather.created_at)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if(diffHours < 1){
    return res.json({
      id: data.id,
      weather_data: weather,
      aqi_data: air
    })
  } else {
    //time to grab new data
    const weather_data = await ApiService.get_weather_data(data.id, data.lat, data.lng)
    const aqi_data = await ApiService.get_aqi_data(data.id, data.lat, data.lng)

    return res.json({
      id: data.id,
      weather_data: weather_data,
      aqi_data: aqi_data
    })
  }
})


export default router