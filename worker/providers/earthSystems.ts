import type { DataProvider, EarthSystemsSnapshot } from "../types";
import { fetchJson } from "../utils";

type OpenMeteoAirQualityResponse = {
  latitude: number;
  longitude: number;
  hourly_units?: Record<string, string>;
  hourly?: {
    time?: string[];
    us_aqi?: Array<number | null>;
    pm10?: Array<number | null>;
    pm2_5?: Array<number | null>;
    carbon_monoxide?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
    ozone?: Array<number | null>;
    aerosol_optical_depth?: Array<number | null>;
  };
};

function latestValue(values?: Array<number | null>): number | undefined {
  if (!values?.length) return undefined;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === "number") return value;
  }
  return undefined;
}

export function createEarthSystemsProvider(): DataProvider {
  return {
    descriptor: {
      id: "earth-systems",
      name: "Open-Meteo Air Quality",
      category: "earth",
      health: "available",
      live: true,
      citationUrl: "https://open-meteo.com/en/docs/air-quality-api",
      notes: [
        "Live air-quality and atmospheric composition context from Open-Meteo.",
        "No additional secret required for the first earth-systems integration.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        hourly:
          "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,aerosol_optical_depth",
        timezone: "auto",
      });

      const data = await fetchJson<OpenMeteoAirQualityResponse>(
        `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
      );

      const latestIndex = Math.max((data.hourly?.time?.length ?? 1) - 1, 0);

      const snapshot: EarthSystemsSnapshot = {
        source: "Open-Meteo Air Quality API",
        latitude: data.latitude,
        longitude: data.longitude,
        hourlyTime: data.hourly?.time?.[latestIndex],
        usAqi: latestValue(data.hourly?.us_aqi),
        pm10: latestValue(data.hourly?.pm10),
        pm2_5: latestValue(data.hourly?.pm2_5),
        carbonMonoxide: latestValue(data.hourly?.carbon_monoxide),
        nitrogenDioxide: latestValue(data.hourly?.nitrogen_dioxide),
        ozone: latestValue(data.hourly?.ozone),
        aerosolOpticalDepth: latestValue(data.hourly?.aerosol_optical_depth),
      };

      return snapshot;
    },
  };
}
