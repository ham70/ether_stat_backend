import { WeatherData, DemographicData } from '../types'
import dotenv from 'dotenv'

dotenv.config()

export class ApiService {
    private static weatherAPIKey: string = process.env.WEATHER_API_KEY || ''
    private static geocodeAPIKey: string = process.env.GEOCODE_API_KEY || ''

    static async get_location_data(location: string){
        console.log('hello we are about to fetch some data from the google api')
        const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${this.geocodeAPIKey}`)

        if (!resp.ok){
            throw new Error(`Failed with status ${resp.status}`);
        }

        const data = await resp.json()
        return data
    }
}