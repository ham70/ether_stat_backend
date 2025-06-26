import { WeatherData, DemographicData } from '../types'
import dotenv from 'dotenv'

dotenv.config()

export class ApiService {
  private static weatherAPIKey: string = process.env.WEATHER_API_KEY || ''
  private static geocodeAPIKey: string = process.env.GEOCODE_API_KEY || ''
  private static aqiAPIKey: string = process.env.AQI_API_KEY || ''

  static async get_location_data(location: string) {
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${this.geocodeAPIKey}`)

    if (!resp.ok) throw new Error(`geocode api callfailed with status ${resp.status}`)

    const data = await resp.json()
    return data
  }

  static async get_weather_data(lat: number, lng: number) {
    const resp = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${this.weatherAPIKey}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=IMPERIAL`)

    if (!resp.ok) throw new Error(`Weather api call failed with status ${resp.status}`)

    const data = await resp.json()
    return data
  }

  static async get_aqi_data(lat: number, lng: number) {
    const post_data = {
      universalAqi: false,
      location: {
        latitude: lat,
        longitude: lng
      },
      extraComputations: ["LOCAL_AQI"],
      languageCode: "en"
    }

    const resp = await fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${this.aqiAPIKey}`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post_data)
    })

    if (!resp.ok) throw new Error(`Air quality api call failed with status ${resp.status}`)

    const data = await resp.json()
    return data
  }
}