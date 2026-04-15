import type { PricePipelineRecord, PriceQuery, PriceSeries } from "./types";

export function buildPricePipelineRecords(
  query: PriceQuery,
  series: PriceSeries,
): PricePipelineRecord[] {
  return series.points.map((point) => ({
    dataset: "electricity_prices",
    storageTarget: "datasist",
    providerId: series.providerId,
    providerName: series.providerName,
    marketType: series.marketType,
    regionId: series.regionId,
    regionType: series.regionType,
    currency: point.currency ?? series.currency,
    unit: point.unit ?? series.unit,
    latitude: query.lat,
    longitude: query.lng,
    observedAt: point.datetime,
    price: point.price,
    source: point.source,
    tags: [
      "energy",
      "electricity",
      "prices",
      series.marketType,
      series.status,
      series.providerId,
    ],
  }));
}
