export type PriceMarketType = "day-ahead";

export type PriceTemporalGranularity = "latest" | "hourly" | "daily";

export type PriceSeriesStatus =
  | "available"
  | "unsupported"
  | "unconfigured"
  | "error";

export type PriceQuery = {
  lat: number;
  lng: number;
  marketType: PriceMarketType;
  start?: string;
  end?: string;
  temporalGranularity: PriceTemporalGranularity;
};

export type PricePoint = {
  datetime: string;
  price?: number;
  currency?: string;
  unit?: string;
  source?: string;
};

export type PriceSeries = {
  providerId: string;
  providerName: string;
  marketType: PriceMarketType;
  status: PriceSeriesStatus;
  regionId?: string;
  regionType?: "country" | "zone" | "iso" | "node" | "state" | "market";
  currency?: string;
  unit?: string;
  points: PricePoint[];
  notes: string[];
  sourceUrls: string[];
  warning?: string;
};

export type PricePipelineRecord = {
  dataset: "electricity_prices";
  storageTarget: "datasist";
  providerId: string;
  providerName: string;
  marketType: PriceMarketType;
  regionId?: string;
  regionType?: string;
  currency?: string;
  unit?: string;
  latitude: number;
  longitude: number;
  observedAt: string;
  price?: number;
  source?: string;
  tags: string[];
};

export type PriceProvider = {
  id: string;
  name: string;
  supports: (query: PriceQuery) => boolean;
  getLatest: (query: PriceQuery) => Promise<PriceSeries>;
  getHistory: (query: PriceQuery) => Promise<PriceSeries>;
};
