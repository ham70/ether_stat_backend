import { LocationData, WeatherData, AirQualityData, DemographicData } from '../types'
import dotenv from 'dotenv'

dotenv.config()

export class ApiService {
  private static weatherAPIKey: string = process.env.WEATHER_API_KEY || ''
  private static geocodeAPIKey: string = process.env.GEOCODE_API_KEY || ''
  private static aqiAPIKey: string = process.env.AQI_API_KEY || ''

  static async get_location_data(location: string): Promise<LocationData>{
    const geo_resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${this.geocodeAPIKey}`)

    if (!geo_resp.ok) throw new Error(`geocode api callfailed with status ${geo_resp.status}`)

    const geo_data = await geo_resp.json()

    const loc_resp = await fetch(`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${geo_data.results[0].geometry.location.lat}&y=${geo_data.results[0].geometry.location.lng}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`)
    const loc_data = await loc_resp.json()

    const current_date: Date = new Date()
    const string_date: string = current_date.toString()
    
    const clean_data: LocationData = {
      id: geo_data.results[0].place_id,
      name: geo_data.results[0].address_components[0].long_name,
      lat: geo_data.results[0].geometry.location.lat,
      lng: geo_data.results[0].geometry.location.lng,
      county_name: loc_data.result.geographies.Counties[0].NAME,
      fips_codes: {
        county: loc_data.result.geographies.Counties[0].COUNTY,
        state: loc_data.result.geographies.Counties[0].STATE
      },
      created_at: string_date,
      updated_at: string_date
    }
    return clean_data
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