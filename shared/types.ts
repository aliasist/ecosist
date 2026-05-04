// Shared between apps/ecosist/worker and apps/ecosist/src

export type ProviderHealth = "available" | "configured" | "unconfigured" | "planned";

export type SourceDescriptor = {
  id: string;
  name: string;
  category: "energy" | "earth" | "biology";
  health: ProviderHealth;
  live: boolean;
  citationUrl: string;
  notes: string[];
};

export type ElectricitySnapshot = {
  zone: string;
  datetime: string;
  updatedAt: string;
  carbonIntensityGCO2eqPerKWh?: number;
  renewablePercentage?: number;
  carbonFreePercentage?: number;
  emissionFactorType?: string;
  isEstimated?: boolean;
  estimationMethod?: string;
};

export type DayAheadPriceSnapshot = {
  zone: string;
  datetime: string;
  updatedAt?: string;
  price?: number;
  currency?: string;
  unit?: string;
  source?: string;
};

export type EarthSystemsSnapshot = {
  source: string;
  latitude: number;
  longitude: number;
  hourlyTime?: string;
  usAqi?: number;
  pm10?: number;
  pm2_5?: number;
  carbonMonoxide?: number;
  nitrogenDioxide?: number;
  ozone?: number;
  aerosolOpticalDepth?: number;
};

export type WeatherSnapshot = {
  source: string;
  latitude: number;
  longitude: number;
  time?: string;
  temperatureC?: number;
  apparentTemperatureC?: number;
  precipitationMm?: number;
  windSpeedKph?: number;
  windDirectionDeg?: number;
};

export type ClimateSnapshot = {
  source: string;
  date?: string;
  temperatureC?: number;
  precipitationMm?: number;
  solarRadiationKwhPerM2?: number;
};

export type GeohazardSnapshot = {
  source: string;
  countPast30Days: number;
  latestEventTime?: string;
  latestMagnitude?: number;
  latestPlace?: string;
  latestDepthKm?: number;
  latestTsunamiAlert?: number;
};

export type BiodiversitySnapshot = {
  source: string;
  searchWindowStart?: string;
  occurrenceCount: number;
  distinctSpeciesCount: number;
  basisOfRecordBreakdown: Array<{
    basisOfRecord: string;
    count: number;
  }>;
  featuredSpecies: string[];
};

export type WildfireSnapshot = {
  source: string;
  activeEventCount: number;
  latestEventTitle?: string;
  latestEventDate?: string;
  latestSource?: string;
};

export type EnvironmentSnapshot = {
  requested: {
    lat: number;
    lng: number;
  };
  electricityMaps?: ElectricitySnapshot;
  priceDayAhead?: DayAheadPriceSnapshot;
  weather?: WeatherSnapshot;
  earthSystems: {
    status: ProviderHealth;
    plannedFeeds: string[];
    snapshot?: EarthSystemsSnapshot;
  };
  climate: {
    status: ProviderHealth;
    plannedFeeds: string[];
    snapshot?: ClimateSnapshot;
  };
  geohazards: {
    status: ProviderHealth;
    plannedFeeds: string[];
    snapshot?: GeohazardSnapshot;
  };
  wildfire: {
    status: ProviderHealth;
    plannedFeeds: string[];
    snapshot?: WildfireSnapshot;
  };
  biology: {
    status: ProviderHealth;
    plannedFeeds: string[];
    snapshot?: BiodiversitySnapshot;
  };
  sources: SourceDescriptor[];
  warning?: string;
};
