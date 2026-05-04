export type {
  ProviderHealth,
  SourceDescriptor,
  ElectricitySnapshot,
  DayAheadPriceSnapshot,
  EarthSystemsSnapshot,
  WeatherSnapshot,
  ClimateSnapshot,
  GeohazardSnapshot,
  BiodiversitySnapshot,
  WildfireSnapshot,
  EnvironmentSnapshot,
} from "../shared/types";

import type { SourceDescriptor } from "../shared/types";

export type AssetBinding = {
  fetch: (request: Request) => Promise<Response> | Response;
};

export type RuntimeEnv = {
  ASSETS?: AssetBinding;
  ELECTRICITY_MAPS_API_KEY?: string;
};

export type DayAheadPricePoint = {
  datetime: string;
  price?: number;
  currency?: string;
  unit?: string;
  source?: string;
};

export type DataProvider = {
  descriptor: SourceDescriptor;
  getData?: (args: {
    env: RuntimeEnv;
    lat: number;
    lng: number;
  }) => Promise<unknown>;
};
