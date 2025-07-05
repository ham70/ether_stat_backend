import sqlite3 from 'sqlite3'
import path from 'path'
import {
  LocationData,
  WeatherData,
  DemographicData,
  AirQualityData,
  CityDataResponse
} from '../types/index'

class Database {
  private db: sqlite3.Database

  constructor() {
    const dbPath = path.join(__dirname, '../../data/city_data.db')
    this.db = new sqlite3.Database(dbPath)
    this.initTables()
  }

  private initTables(): void {
    const tables = [
      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        full_address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        county_name TEXT,
        fips_county TEXT,
        fips_state TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS weather_data (
        location_id TEXT PRIMARY KEY,
        conditions TEXT,
        temperature_main REAL,
        temperature_feels_like REAL,
        temperature_min REAL,
        temperature_max REAL,
        humidity INTEGER,
        wind_direction_degrees REAL,
        wind_direction_cardinal TEXT,
        wind_speed REAL,
        wind_gust REAL,
        wind_chill REAL,
        thunder_storm REAL,
        visibility REAL,
        uv_index REAL,
        created_at TEXT,
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )`,

      `CREATE TABLE IF NOT EXISTS air_quality_data (
        location_id TEXT PRIMARY KEY,
        aqi INTEGER,
        category TEXT,
        dom TEXT,
        created_at TEXT,
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )`,

      `CREATE TABLE IF NOT EXISTS demographic_data (
        location_id TEXT PRIMARY KEY,
        population INTEGER,
        median_hh_income INTEGER,
        employment_rate REAL,
        total_housing INTEGER,
        year INTEGER,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )`
    ]

    tables.forEach((table) => {
      this.db.run(table, (err) => {
        if (err) console.error('Error creating table:', err)
      })
    })
  }

  async insertLocation(location: Omit<LocationData, 'created_at' | 'updated_at'>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO locations
        (id, name, full_address, lat, lng, county_name, fips_county, fips_state, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          location.id,
          location.name,
          location.full_address,
          location.lat,
          location.lng,
          location.county_name,
          location.fips_codes.county,
          location.fips_codes.state
        ],
        function (err) {
          if (err) reject(err)
          else resolve(location.id)
        }
      )
    })
  }

  async getLocationById(id: string): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM locations WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err)
          if (!row) return reject(new Error('Location not found'))

          const result = row as {
            id: string;
            name: string;
            full_address: string;
            lat: number;
            lng: number;
            county_name: string;
            fips_county: string;
            fips_state: string;
            created_at: string;
            updated_at: string;
          }

          const location: LocationData = {
            id: result.id,
            name: result.name,
            full_address: result.full_address,
            lat: result.lat,
            lng: result.lng,
            county_name: result.county_name,
            fips_codes: {
              county: result.fips_county,
              state: result.fips_state
            },
            created_at: result.created_at,
            updated_at: result.updated_at
          }

          resolve(location)
        }
      )
    })
  }

  async insertWeatherData(data: Omit<WeatherData, 'created_at'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO weather_data (
          location_id, conditions,
          temperature_main, temperature_feels_like, temperature_min, temperature_max,
          humidity,
          wind_direction_degrees, wind_direction_cardinal,
          wind_speed, wind_gust, wind_chill,
          thunder_storm, visibility, uv_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          data.location_id,
          data.conditions,
          data.temperature.main,
          data.temperature.feels_like,
          data.temperature.min,
          data.temperature.max,
          data.humidity,
          data.wind.direction.degrees,
          data.wind.direction.cardinal,
          data.wind.speed,
          data.wind.gust,
          data.wind.chill,
          data.thunder_storm,
          data.visibility,
          data.uv_index
        ],
        (err) => (err ? reject(err) : resolve())
      )
    })
  }

  async getWeatherData(locationId: string): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM weather_data WHERE location_id = ?`,
        [locationId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Weather data not found'));

          const result = row as any;

          const weather: WeatherData = {
            location_id: result.location_id,
            conditions: result.conditions,
            temperature: {
              main: result.temperature_main,
              feels_like: result.temperature_feels_like,
              min: result.temperature_min,
              max: result.temperature_max
            },
            humidity: result.humidity,
            wind: {
              direction: {
                degrees: result.wind_direction_degrees,
                cardinal: result.wind_direction_cardinal
              },
              speed: result.wind_speed,
              gust: result.wind_gust,
              chill: result.wind_chill
            },
            thunder_storm: result.thunder_storm,
            visibility: result.visibility,
            uv_index: result.uv_index,
            created_at: result.created_at
          }

          resolve(weather);
        }
      )
    })
  }

  async insertAirQualityData(data: Omit<AirQualityData, 'created_at'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO air_quality_data (
          location_id, aqi, category, dom, created_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [data.location_id, data.aqi, data.category, data.dom],
        (err) => (err ? reject(err) : resolve())
      )
    })
  }

  async getAirQualityData(locationId: string): Promise<AirQualityData> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM air_quality_data WHERE location_id = ?`,
        [locationId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('AQI data not found'))

          const result = row as AirQualityData
          resolve(result)
        }
      )
    })
  }

  async insertDemographicData(data: Omit<DemographicData, 'created_at' | 'updated_at'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO demographic_data (
          location_id, population, median_hh_income, employment_rate, total_housing, year,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          data.location_id,
          data.population,
          data.median_hh_income,
          data.employment_rate,
          data.total_housing,
          data.year
        ],
        (err) => (err ? reject(err) : resolve())
      )
    })
  }

  async getDemographics(locationId: string): Promise<DemographicData> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM demographic_data WHERE location_id = ?`,
        [locationId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Demographic data not found'));

          const result = row as DemographicData
          resolve(result)
        }
      )
    })
  }

  async getCityData(locationId: string): Promise<CityDataResponse> {
    const [location, weather_data, aqi_data, demographics] = await Promise.all([
      this.getLocationById(locationId),
      this.getWeatherData(locationId),
      this.getAirQualityData(locationId),
      this.getDemographics(locationId)
    ])

    return {
      id: location.id,
      name: location.name,
      location,
      weather_data,
      aqi_data,
      demographics
    }
  }
  async insertCityData(city: CityDataResponse): Promise<void> {
    this.insertLocation(city.location)
    this.insertWeatherData(city.weather_data)
    this.insertAirQualityData(city.aqi_data)
    this.insertDemographicData(city.demographics)
  }
async getSearchSuggestions(query: string) {
  return new Promise((resolve, reject) => {
    this.db.all(
      `SELECT full_address, id FROM locations
      WHERE full_address LIKE ?
      LIMIT 10`,
      [`%${query}%`],
      (err, rows) => {
        if (err) return reject(err)
        resolve(rows || [])
      }
    )
  })
}
async getAllAirData() {
  return new Promise((resolve, reject) => {
    this.db.all(
      `SELECT * FROM air_quality_data`,
      (err, rows) => {
        if (err) return reject(err)
        if (!rows || rows.length === 0) return reject(new Error('No AQI data found'));
        resolve(rows)
      }
    )
  })
}
async getAllLocData() {
  return new Promise((resolve, reject) => {
    this.db.all(
      `SELECT * FROM locations`,
      (err, rows) => {
        if (err) return reject(err)
        if (!rows || rows.length === 0) return reject(new Error('No loc data found'));
        resolve(rows)
      }
    )
  })
}

  close(): void {
    this.db.close()
  }
}

export default Database