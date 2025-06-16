import sqlite3 from 'sqlite3'
import path from 'path'
import { LocationData, WeatherData, DemographicData} from '../types/index'

class Database {
    private db: sqlite3.Database

    constructor() {
        const dbPath = path.join(__dirname, '../../data/city_data.db')
        this.db = new sqlite3.Database(dbPath)
        this.initTables()
    }

    private initTables(): void{
        const tables = [
            `CREATE TABLE IF NOT EXISTS locations (
                id TEXT PRIMARY KEY,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                elevation REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS weather_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_id TEXT NOT NULL,
                temperature REAL,
                conditions TEXT,
                humidity REAL,
                wind_speed REAL,
                uv_index REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (location_id) REFERENCES locations(id)
            )`,
            
            `CREATE TABLE IF NOT EXISTS demographic_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_id TEXT NOT NULL,
                population INTEGER,
                unemployment_rate REAL,
                crime_rate REAL,
                homelessness_count INTEGER,
                year INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (location_id) REFERENCES locations(id)
            )`
        ]

        tables.forEach(table => {
            this.db.run(table, (err) => {
                if(err) console.error('Error creatin table:', err)
            })
        })

        this.db.run('CREATE INDEX IF NOT EXISTS idex_location_city_state ON locations(city, state)')
        this.db.run('CREATE INDEX IF NOT EXISTS idx_weather_location_time ON weather_data(location_id, created_at)')
    }

    //location methods-----------------------------------------------------------------------------
    async getLocation(city: string, state: string): Promise<any> {
        return new Promise((resolve, reject) => {
        this.db.get(
            'SELECT * FROM locations WHERE city = ? AND state = ?',
            [city, state],
            (err, row) => {
            if (err) reject(err)
            else resolve(row)
            }
        )
        })
    }
    async insertLocation(location: Partial<LocationData>): Promise<string> {
        const id = `${location.city}_${location.state}`.toLowerCase().replace(/\s+/g, '_');
        
        return new Promise((resolve, reject) => {
        this.db.run(
            `INSERT OR REPLACE INTO locations 
            (id, city, state, latitude, longitude, elevation, fips_code, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [id, location.city, location.state, location.latitude, location.longitude, 
            location.elevation, location.fips_code],
            function(err) {
            if (err) reject(err)
            else resolve(id)
            }
        )
        })
    }

    //weather methods-----------------------------------------------------------------------------
    async getRecentWeather(locationId: string, hoursOld: number = 1): Promise<any> {
        return new Promise((resolve, reject) => {
        this.db.get(
            `SELECT * FROM weather_data 
            WHERE location_id = ? AND created_at > datetime('now', '-${hoursOld} hours')
            ORDER BY created_at DESC LIMIT 1`,
            [locationId],
            (err, row) => {
            if (err) reject(err)
            else resolve(row)
            }
        )
        })
    }
    async insertWeatherData(data: Omit<WeatherData, 'created_at'>): Promise<void> {
        return new Promise((resolve, reject) => {
        this.db.run(
            `INSERT INTO weather_data (location_id, temperature, conditions, humidity, wind_speed, uv_index, aqi)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data.location_id, data.temperature, data.conditions, data.humidity, data.wind_speed, data.uv_index, data.aqi],
            (err) => {
            if (err) reject(err)
            else resolve()
            }
        )
        })
    }

    //demographic methods-----------------------------------------------------------------------------
    async getDemographics(locationId: string): Promise<any> {
        return new Promise((resolve, reject) => {
        this.db.get(
            `SELECT * FROM demographic_data 
            WHERE location_id = ? 
            ORDER BY year DESC LIMIT 1`,
            [locationId],
            (err, row) => {
            if (err) reject(err);
            else resolve(row);
            }
        );
        });
    }
    async insertDemographicData(data: Omit<DemographicData, 'created_at' | 'updated_at'>): Promise<void> {
        return new Promise((resolve, reject) => {
        this.db.run(
            `INSERT OR REPLACE INTO demographic_data 
            (location_id, population, unemployment_rate, crime_rate, homelessness_count, year)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [data.location_id, data.population, data.unemployment_rate, 
            data.crime_rate, data.homelessness_count, data.year],
            (err) => {
            if (err) reject(err);
            else resolve();
            }
        );
        });
    }

    close(): void {
        this.db.close();
    }
}
export default Database