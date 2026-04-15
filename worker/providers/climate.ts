import type { ClimateSnapshot, DataProvider } from "../types";
import { fetchJson } from "../utils";

type NasaPowerResponse = {
  properties?: {
    parameter?: Record<string, Record<string, number>>;
  };
};

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function latestDefinedValue(
  series?: Record<string, number>,
): { date?: string; value?: number } {
  if (!series) return {};

  const entries = Object.entries(series).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const [date, value] = entries[index];
    if (typeof value === "number" && Number.isFinite(value) && value > -900) {
      return { date, value };
    }
  }

  return {};
}

export function createClimateProvider(): DataProvider {
  return {
    descriptor: {
      id: "nasa-power-climate",
      name: "NASA POWER Climate",
      category: "earth",
      health: "available",
      live: true,
      citationUrl: "https://power.larc.nasa.gov/docs/services/api/temporal/daily/",
      notes: [
        "Public NASA POWER daily climate and solar signals.",
        "Used for daily temperature, precipitation, and solar radiation context.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const end = new Date();
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        parameters: "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
        community: "RE",
        longitude: String(lng),
        latitude: String(lat),
        start: formatDateKey(start),
        end: formatDateKey(end),
        format: "JSON",
        "time-standard": "UTC",
      });

      const data = await fetchJson<NasaPowerResponse>(
        `https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`,
      );

      const temperature = latestDefinedValue(data.properties?.parameter?.T2M);
      const precipitation = latestDefinedValue(
        data.properties?.parameter?.PRECTOTCORR,
      );
      const solar = latestDefinedValue(
        data.properties?.parameter?.ALLSKY_SFC_SW_DWN,
      );

      const snapshot: ClimateSnapshot = {
        source: "NASA POWER Daily API",
        date: temperature.date ?? precipitation.date ?? solar.date,
        temperatureC: temperature.value,
        precipitationMm: precipitation.value,
        solarRadiationKwhPerM2: solar.value,
      };

      return snapshot;
    },
  };
}
