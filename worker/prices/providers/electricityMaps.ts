import {
  fetchElectricityMapsPriceHistory,
  fetchElectricityMapsPriceLatest,
} from "../../providers/electricityMaps";
import type { RuntimeEnv } from "../../types";
import type { PriceProvider, PriceQuery, PriceSeries } from "../types";

function isLikelyUnitedStates(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 72 && lng >= -179 && lng <= -66;
}

export function createElectricityMapsPriceProvider(
  env: RuntimeEnv,
): PriceProvider {
  return {
    id: "electricity-maps-prices",
    name: "Electricity Maps Day-Ahead",
    supports: (query) =>
      Boolean(env.ELECTRICITY_MAPS_API_KEY) && !isLikelyUnitedStates(query.lat, query.lng),
    getLatest: async (query) => {
      if (!env.ELECTRICITY_MAPS_API_KEY) {
        return {
          providerId: "electricity-maps-prices",
          providerName: "Electricity Maps Day-Ahead",
          marketType: query.marketType,
          status: "unconfigured",
          points: [],
          notes: [
            "Electricity Maps is not configured in this runtime.",
          ],
          sourceUrls: ["https://portal.electricitymaps.com/developer-hub/api"],
        };
      }

      const snapshot = await fetchElectricityMapsPriceLatest(
        env,
        query.lat,
        query.lng,
      );

      return {
        providerId: "electricity-maps-prices",
        providerName: "Electricity Maps Day-Ahead",
        marketType: query.marketType,
        status: snapshot.price !== undefined ? "available" : "available",
        regionId: snapshot.zone,
        regionType: "zone",
        unit: snapshot.unit,
        currency: snapshot.currency,
        points: [
          {
            datetime: snapshot.datetime,
            price: snapshot.price,
            currency: snapshot.currency,
            unit: snapshot.unit,
            source: snapshot.source,
          },
        ],
        notes: [
          "International day-ahead electricity price feed normalized from Electricity Maps.",
          "Useful for real-time market awareness outside U.S. ISO/RTO coverage.",
        ],
        sourceUrls: [
          "https://portal.electricitymaps.com/developer-hub/api",
          "https://portal.electricitymaps.com/developer-hub/api/reference",
        ],
      };
    },
    getHistory: async (query) => {
      if (!env.ELECTRICITY_MAPS_API_KEY) {
        return {
          providerId: "electricity-maps-prices",
          providerName: "Electricity Maps Day-Ahead",
          marketType: query.marketType,
          status: "unconfigured",
          points: [],
          notes: [
            "Electricity Maps is not configured in this runtime.",
          ],
          sourceUrls: ["https://portal.electricitymaps.com/developer-hub/api"],
        };
      }

      const history = await fetchElectricityMapsPriceHistory(
        env,
        query.lat,
        query.lng,
        query.start ?? new Date().toISOString(),
        query.end ?? new Date().toISOString(),
        query.temporalGranularity === "daily" ? "daily" : "hourly",
      );

      return {
        providerId: "electricity-maps-prices",
        providerName: "Electricity Maps Day-Ahead",
        marketType: query.marketType,
        status: "available",
        regionId: history.zone,
        regionType: "zone",
        unit: history.unit,
        currency: history.currency,
        points: history.points,
        notes: [
          "Historical day-ahead electricity price series from Electricity Maps.",
          "This series is normalized for storage and later correlation work.",
        ],
        sourceUrls: [
          "https://portal.electricitymaps.com/developer-hub/api",
          "https://portal.electricitymaps.com/developer-hub/api/reference",
        ],
      };
    },
  };
}
