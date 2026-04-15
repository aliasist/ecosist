import type { DataProvider, GeohazardSnapshot } from "../types";
import { fetchJson } from "../utils";

type UsgsEarthquakeResponse = {
  features?: Array<{
    properties?: {
      mag?: number;
      place?: string;
      time?: number;
      tsunami?: number;
    };
    geometry?: {
      coordinates?: number[];
    };
  }>;
};

export function createGeohazardsProvider(): DataProvider {
  return {
    descriptor: {
      id: "usgs-earthquakes",
      name: "USGS Earthquakes",
      category: "earth",
      health: "available",
      live: true,
      citationUrl: "https://earthquake.usgs.gov/fdsnws/event/1/",
      notes: [
        "Public USGS earthquake catalog feed.",
        "Used for recent seismic activity near the selected coordinates.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        format: "geojson",
        latitude: String(lat),
        longitude: String(lng),
        maxradiuskm: "250",
        starttime: start.toISOString(),
        endtime: end.toISOString(),
        orderby: "time",
        limit: "50",
      });

      const data = await fetchJson<UsgsEarthquakeResponse>(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`,
      );

      const latest = data.features?.[0];
      const latestCoords = latest?.geometry?.coordinates;

      const snapshot: GeohazardSnapshot = {
        source: "USGS Earthquake Catalog",
        countPast30Days: data.features?.length ?? 0,
        latestEventTime:
          typeof latest?.properties?.time === "number"
            ? new Date(latest.properties.time).toISOString()
            : undefined,
        latestMagnitude: latest?.properties?.mag,
        latestPlace: latest?.properties?.place,
        latestDepthKm:
          Array.isArray(latestCoords) && latestCoords.length >= 3
            ? latestCoords[2]
            : undefined,
        latestTsunamiAlert: latest?.properties?.tsunami,
      };

      return snapshot;
    },
  };
}
