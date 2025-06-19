import { WeatherData, DemographicData } from '../types'
import dotenv from 'dotenv'

dotenv.config()

export class ApiService {
  private static weatherAPIKey: string = process.env.WEATHER_API_KEY || ''
  private static geocodeAPIKey: string = process.env.GEOCODE_API_KEY || ''

  static async get_location_data(location: string) {
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${this.geocodeAPIKey}`)

    if (!resp.ok) throw new Error(`Failed with status ${resp.status}`)

    const data = await resp.json()
    return data
  }

  static async get_weather_data(lat: number, lng: number) {
    const resp = await fetch(``)

    if (!resp.ok) throw new Error(`Failed with status ${resp.status}`)

    const data = await resp.json()
    return data
  }
}