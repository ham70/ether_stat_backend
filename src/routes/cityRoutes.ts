import express from 'express'
import bodyParser from 'body-parser'
import { CityDataResponse, LocationData, WeatherData } from "../types"
import { ApiService } from '../services/apiService'
import db from '../database/dbInstance'

const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

//main routes
router.get('/', async (req, res) => {
  const query = req.query.q as string
  const id = req.query.id as string
  if (!query && (id.trim() === '' || id === 'undefined')) {
    return res.status(400).json({ error: 'Missing query parameter `q` or `id`' })
  }
  if(id && !(id.trim() === '' || id === 'undefined')){
    const city_data = await db.getCityData(id)
    return res.json(city_data)
  }
  //handle data
  const loc_data = await ApiService.get_location_data(query)
  const weather_data: WeatherData = await ApiService.get_weather_data(loc_data.id, loc_data.lat, loc_data.lng)
  const aqi_data = await ApiService.get_aqi_data(loc_data.id, loc_data.lat, loc_data.lng)
  const demo_data = await ApiService.get_demo_data(loc_data.id, loc_data.fips_codes.county, loc_data.fips_codes.state)

  const city: CityDataResponse= {
    id: loc_data.id,
    name: loc_data.name,
    location: loc_data,
    weather_data: weather_data,
    aqi_data: aqi_data,
    demographics: demo_data
  }
  await db.insertCityData(city)
  return res.json(city)
})
router.get('/suggest', async(req, res) => {
  const query = req.query.q as string
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter `q`' })
  }

  const suggestions = await db.getSearchSuggestions(query)
  return res.json(suggestions)
})
router.post('/uloc', async (req, res) => {
  const coords = req.body.user_coords
  const loc_data: LocationData = await ApiService.get_location_data_with_coords(coords.latitude, coords.longitude)
  const weather_data: WeatherData = await ApiService.get_weather_data(loc_data.id, loc_data.lat, loc_data.lng)
  const aqi_data = await ApiService.get_aqi_data(loc_data.id, loc_data.lat, loc_data.lng)
  const demo_data = await ApiService.get_demo_data(loc_data.id, loc_data.fips_codes.county, loc_data.fips_codes.state)
  
  const city: CityDataResponse= {
    id: loc_data.id,
    name: loc_data.name,
    location: loc_data,
    weather_data: weather_data,
    aqi_data: aqi_data,
    demographics: demo_data
  }
  return res.json(city)
})

//test routes
router.get('/check/', async (req, res) => {
  const id = req.query.id as string
  const data = await db.getCityData(id)
  return res.json(data)
})
router.get('/air', async (req, res) => {
  const data = await db.getAllAirData()
  return res.json(data)
})
router.get('/loc', async (request, response) => {
  const data = await db.getAllLocData()
  return response.json(data)
})

export default router