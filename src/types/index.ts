export interface LocationData {
    id: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    elevation: number;
    fips_code: string;
    created_at: string;
    updated_at: string;
}

export interface WeatherData {
  location_id: string;
  conditions: string;
  temperature: {
    main: number;
    feels_like: number;
    min: number;
    max: number;
  };
  humidity: number;
  wind: {
    direction: {
        degrees: number;
        cardinal: string;
    }
    speed: number;
    gust: number;
    chill: number;
  }
  thunder_storm: number;
  visibility: number;
  uv_index: number;
  created_at: string;
}
export interface AirQualityData {
    location_id: string;
    aqi: number;
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    nh3: number;
    pm2_5: number;
    pm10: number;
}

export interface DemographicData {
  location_id: string;
  population: number;
  unemployment_rate: number;
  crime_rate: number;
  homelessness_count: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CityDataResponse {
    location: LocationData;
    //weather: WeatherData;
    //demographics: DemographicData;
}

export interface RefreshDataRequest {
    id: string;
    lat: number;
    lng: number;
}
export interface RefreshDataResponse {
    id: string;
    weather_data: WeatherData;
}