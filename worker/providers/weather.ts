import type { DataProvider, WeatherSnapshot } from "../types";
import { fetchJson } from "../utils";

type OpenMeteoWeatherResponse = {
  latitude: number;
  longitude: number;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
};

export function createWeatherProvider(): DataProvider {
  return {
    descriptor: {
      id: "weather-now",
      name: "Open-Meteo Weather",
      category: "earth",
      health: "available",
      live: true,
      citationUrl: "https://open-meteo.com/en/docs",
      notes: [
        "Live weather context from Open-Meteo with no API key required.",
        "Used for current temperature, precipitation, and wind.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        current:
          "temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m",
        timezone: "auto",
      });

      const data = await fetchJson<OpenMeteoWeatherResponse>(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      );

      const snapshot: WeatherSnapshot = {
        source: "Open-Meteo Forecast API",
        latitude: data.latitude,
        longitude: data.longitude,
        time: data.current?.time,
        temperatureC: data.current?.temperature_2m,
        apparentTemperatureC: data.current?.apparent_temperature,
        precipitationMm: data.current?.precipitation,
        windSpeedKph: data.current?.wind_speed_10m,
        windDirectionDeg: data.current?.wind_direction_10m,
      };

      return snapshot;
    },
  };
}
