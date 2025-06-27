export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  county_name: string;
  fips_codes: {
    county: string;
    state: string;
  }
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
  category: string;
  dom: string;
  created_at: string;
}
export interface DemographicData {
  location_id: string;
  population: number;
  median_hh_income: number;
  employment_rate: number;
  total_housing: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CityDataResponse {
  id:string;
  name: string;
  location: LocationData;
  weather_data: WeatherData;
  aqi_data: AirQualityData;
  demographics: DemographicData;
}

export interface RefreshDataRequest {
  id: string;
  lat: number;
  lng: number;
}
export interface RefreshDataResponse {
  id: string;
  weather_data: WeatherData;
  aqi_data: AirQualityData;
}
