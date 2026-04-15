import type { BiodiversitySnapshot, DataProvider } from "../types";
import { fetchJson } from "../utils";

type GbifOccurrenceRecord = {
  speciesKey?: number;
  species?: string;
  scientificName?: string;
  basisOfRecord?: string;
};

type GbifOccurrenceSearchResponse = {
  results?: GbifOccurrenceRecord[];
};

function buildBoundingPolygon(lat: number, lng: number, delta: number): string {
  const minLat = Math.max(-90, lat - delta);
  const maxLat = Math.min(90, lat + delta);
  const minLng = Math.max(-180, lng - delta);
  const maxLng = Math.min(180, lng + delta);

  return `POLYGON((${minLng} ${minLat},${minLng} ${maxLat},${maxLng} ${maxLat},${maxLng} ${minLat},${minLng} ${minLat}))`;
}

export function createBiodiversityProvider(): DataProvider {
  return {
    descriptor: {
      id: "gbif-biodiversity",
      name: "GBIF Biodiversity",
      category: "biology",
      health: "available",
      live: true,
      citationUrl: "https://techdocs.gbif.org/en/openapi/",
      notes: [
        "Public GBIF occurrence search for biodiversity activity near the selected coordinates.",
        "This is a local occurrence signal, not a complete species inventory.",
      ],
    },
    getData: async ({ lat, lng }) => {
      const end = new Date();
      const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        geometry: buildBoundingPolygon(lat, lng, 0.35),
        hasCoordinate: "true",
        hasGeospatialIssue: "false",
        limit: "100",
        year: `${start.getUTCFullYear()},${end.getUTCFullYear()}`,
      });

      const data = await fetchJson<GbifOccurrenceSearchResponse>(
        `https://api.gbif.org/v1/occurrence/search?${params.toString()}`,
      );

      const results = data.results ?? [];
      const uniqueSpecies = new Set<string>();
      const basisCounts = new Map<string, number>();

      for (const record of results) {
        const speciesLabel =
          record.species ?? record.scientificName ?? (record.speciesKey ? String(record.speciesKey) : undefined);
        if (speciesLabel) uniqueSpecies.add(speciesLabel);

        const basis = record.basisOfRecord ?? "UNKNOWN";
        basisCounts.set(basis, (basisCounts.get(basis) ?? 0) + 1);
      }

      const snapshot: BiodiversitySnapshot = {
        source: "GBIF Occurrence Search API",
        searchWindowStart: start.toISOString(),
        occurrenceCount: results.length,
        distinctSpeciesCount: uniqueSpecies.size,
        basisOfRecordBreakdown: Array.from(basisCounts.entries())
          .map(([basisOfRecord, count]) => ({ basisOfRecord, count }))
          .sort((left, right) => right.count - left.count),
        featuredSpecies: Array.from(uniqueSpecies).slice(0, 5),
      };

      return snapshot;
    },
  };
}
