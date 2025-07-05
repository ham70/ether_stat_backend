import { LocationData, WeatherData, AirQualityData, DemographicData } from '../types'
import dotenv from 'dotenv'

dotenv.config()

export class ApiService {
  private static weatherAPIKey: string = process.env.WEATHER_API_KEY || ''
  private static geocodeAPIKey: string = process.env.GEOCODE_API_KEY || ''
  private static aqiAPIKey: string = process.env.AQI_API_KEY || ''
  private static censusAPIKey: string = process.env.CENSUS_API_KEY || ''

  static async get_location_data(location: string): Promise<LocationData>{
    const geo_resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${this.geocodeAPIKey}`)

    if (!geo_resp.ok) throw new Error(`geocode api callfailed with status ${geo_resp.status}`)

    const geo_data = await geo_resp.json()

    const loc_resp = await fetch(`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${geo_data.results[0].geometry.location.lng}&y=${geo_data.results[0].geometry.location.lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`)
    const loc_data = await loc_resp.json()

    const current_date: Date = new Date()
    const string_date: string = current_date.toString()
    
    const clean_data: LocationData = {
      id: geo_data.results[0].place_id,
      name: geo_data.results[0].address_components[0].long_name,
      full_address: geo_data.results[0].formatted_address,
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

  static async get_weather_data(id: string, lat: number, lng: number): Promise<WeatherData>{
    const resp = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${this.weatherAPIKey}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=IMPERIAL`)

    if (!resp.ok) throw new Error(`Weather api call failed with status ${resp.status}`)

    const data = await resp.json()

    const current_date: Date = new Date()
    const string_date: string = current_date.toString()

    const clean_data = {
      location_id: id,
      conditions: data.weatherCondition.description.text,
      temperature: {
        main: data.temperature.degrees,
        feels_like: data.feelsLikeTemperature.degrees,
        min: data.currentConditionsHistory.maxTemperature.degrees,
        max: data.currentConditionsHistory.minTemperature.degrees
      },
      humidity: data.relativeHumidity,
      wind: {
        direction: data.wind.direction,
        speed: data.wind.speed.value,
        gust: data.wind.gust.value,
        chill: data.windChill.degrees,
      },
      thunder_storm: data.thunderstormProbability,
      visibility: data.visibility.distance,
      uv_index: data.uvIndex,
      created_at: string_date
    }
    return clean_data
  }

  static async get_aqi_data(id: string, lat: number, lng: number): Promise<AirQualityData>{
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

    const current_date: Date = new Date()
    const string_date: string = current_date.toString()

    const clean_data = {
      location_id: id,
      aqi: data.indexes[0].aqi,
      category: data.indexes[0].category,
      dom: data.indexes[0].dominantPollutant,
      created_at: string_date
    }
    return clean_data
  }

  static async get_demo_data(id: string, cfips: string, sfips: string) : Promise<DemographicData> {
    const resp = await fetch(`https://api.census.gov/data/2022/acs/acs5?get=B01003_001E,B19013_001E,B25001_001E,B23025_004E,B23025_003E&for=county:${cfips}&in=state:${sfips}&key=${this.censusAPIKey}`)
    const data = await resp.json()

    const current_date: Date = new Date()
    const string_date: string = current_date.toString()

    const clean_data = {
      location_id: id,
      population: data[1][0],
      median_hh_income: data[1][1],
      employment_rate: parseFloat((100 * (data[1][2] / data[1][3])).toFixed(2)),
      total_housing: data[1][4],
      year: 2022,
      created_at: string_date,
      updated_at: string_date
    }
    return clean_data
  }
}
