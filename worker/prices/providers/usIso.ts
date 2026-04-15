import type { PriceProvider, PriceQuery, PriceSeries } from "../types";

function isLikelyUnitedStates(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 72 && lng >= -179 && lng <= -66;
}

function unsupportedSeries(query: PriceQuery): PriceSeries {
  return {
    providerId: "us-iso-router",
    providerName: "U.S. ISO/RTO Router",
    marketType: query.marketType,
    status: "unsupported",
    regionType: "market",
    points: [],
    notes: [
      "U.S. price coverage needs ISO/RTO-specific integrations such as PJM, ERCOT, MISO, CAISO, NYISO, ISO-NE, or SPP.",
      "Electricity Maps does not currently provide complete recent day-ahead U.S. coverage for these coordinates.",
    ],
    sourceUrls: [
      "https://www.eia.gov/",
    ],
    warning:
      "U.S. electricity pricing is routed separately because the market structure depends on ISO/RTO-specific locational pricing.",
  };
}

export function createUsIsoPriceProvider(): PriceProvider {
  return {
    id: "us-iso-router",
    name: "U.S. ISO/RTO Router",
    supports: (query) => isLikelyUnitedStates(query.lat, query.lng),
    getLatest: async (query) => unsupportedSeries(query),
    getHistory: async (query) => unsupportedSeries(query),
  };
}
