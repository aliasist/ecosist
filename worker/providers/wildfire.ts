import type { DataProvider, WildfireSnapshot } from "../types";
import { fetchJson } from "../utils";

type EonetGeoJsonResponse = {
  features?: Array<{
    properties?: {
      title?: string;
      date?: string;
      sources?: Array<{
        id?: string;
      }>;
    };
  }>;
};

function boundingBox(lat: number, lng: number, delta: number): string {
  const minLon = Math.max(-180, lng - delta);
  const maxLat = Math.min(90, lat + delta);
  const maxLon = Math.min(180, lng + delta);
  const minLat = Math.max(-90, lat - delta);
  return `${minLon},${maxLat},${maxLon},${minLat}`;
}

export function createWildfireProvider(): DataProvider {
  return {
    descriptor: {
      id: "nasa-eonet-wildfire",
      name: "NASA EONET Wildfires",
      category: "earth",
      health: "available",
      live: true,
      citationUrl: "https://eonet.gsfc.nasa.gov/docs/v3",
      notes: [
        "Near real-time wildfire event metadata from NASA EONET.",
        "Used for nearby active wildfire awareness around the selected coordinates.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const params = new URLSearchParams({
        category: "wildfires",
        status: "open",
        days: "30",
        limit: "50",
        bbox: boundingBox(lat, lng, 4),
      });

      const data = await fetchJson<EonetGeoJsonResponse>(
        `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?${params.toString()}`,
      );

      const latest = data.features?.[0];
      const snapshot: WildfireSnapshot = {
        source: "NASA EONET API",
        activeEventCount: data.features?.length ?? 0,
        latestEventTitle: latest?.properties?.title,
        latestEventDate: latest?.properties?.date,
        latestSource: latest?.properties?.sources?.[0]?.id,
      };

      return snapshot;
    },
  };
}
