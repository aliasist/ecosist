import type { RuntimeEnv } from "../types";
import { createPriceProviders } from "./providers";
import type { PriceProvider, PriceQuery, PriceSeries } from "./types";

function fallbackSeries(query: PriceQuery): PriceSeries {
  return {
    providerId: "unresolved",
    providerName: "Unresolved Price Provider",
    marketType: query.marketType,
    status: "unsupported",
    points: [],
    notes: [
      "No configured price provider matched this query.",
    ],
    sourceUrls: [],
    warning:
      "No price provider is available for the requested coordinates and market type.",
  };
}

export function resolvePriceProvider(
  env: RuntimeEnv,
  query: PriceQuery,
): PriceProvider | undefined {
  return createPriceProviders(env).find((provider) => provider.supports(query));
}

export async function resolveLatestPriceSeries(
  env: RuntimeEnv,
  query: PriceQuery,
): Promise<PriceSeries> {
  const provider = resolvePriceProvider(env, query);
  if (!provider) return fallbackSeries(query);
  return provider.getLatest(query);
}

export async function resolveHistoricalPriceSeries(
  env: RuntimeEnv,
  query: PriceQuery,
): Promise<PriceSeries> {
  const provider = resolvePriceProvider(env, query);
  if (!provider) return fallbackSeries(query);
  return provider.getHistory(query);
}
