export type Trend = "up" | "down" | "steady";

export type NavItem = {
  label: string;
  href: string;
};

export type HeroAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type HeroPanel = {
  title: string;
  bullets: string[];
};

export type CoordinatePreset = {
  label: string;
  lat: number;
  lng: number;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
  trend: Trend;
};

export type DomainCard = {
  title: string;
  summary: string;
  feeds: string[];
};

export type WorkflowStep = {
  title: string;
  detail: string;
};

export type CapabilityCard = {
  title: string;
  summary: string;
};

export type SourceNote = {
  label: string;
  detail: string;
};

export type ProviderDescriptor = {
  id: string;
  name: string;
  category: "energy" | "earth" | "biology";
  health: "available" | "configured" | "unconfigured" | "planned";
  live: boolean;
  citationUrl: string;
  notes: string[];
};

export type HealthResponse = {
  status: string;
  app: string;
  providers: ProviderDescriptor[];
  electricityMapsConfigured: boolean;
};

export type EnvironmentSnapshotResponse = {
  requested: {
    lat: number;
    lng: number;
  };
  electricityMaps?: {
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
  priceDayAhead?: {
    zone: string;
    datetime: string;
    updatedAt?: string;
    price?: number;
    currency?: string;
    unit?: string;
    source?: string;
  };
  weather?: {
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
  earthSystems: {
    status: "available" | "configured" | "unconfigured" | "planned";
    plannedFeeds: string[];
    snapshot?: {
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
  };
  climate: {
    status: "available" | "configured" | "unconfigured" | "planned";
    plannedFeeds: string[];
    snapshot?: {
      source: string;
      date?: string;
      temperatureC?: number;
      precipitationMm?: number;
      solarRadiationKwhPerM2?: number;
    };
  };
  geohazards: {
    status: "available" | "configured" | "unconfigured" | "planned";
    plannedFeeds: string[];
    snapshot?: {
      source: string;
      countPast30Days: number;
      latestEventTime?: string;
      latestMagnitude?: number;
      latestPlace?: string;
      latestDepthKm?: number;
      latestTsunamiAlert?: number;
    };
  };
  wildfire: {
    status: "available" | "configured" | "unconfigured" | "planned";
    plannedFeeds: string[];
    snapshot?: {
      source: string;
      activeEventCount: number;
      latestEventTitle?: string;
      latestEventDate?: string;
      latestSource?: string;
    };
  };
  biology: {
    status: "available" | "configured" | "unconfigured" | "planned";
    plannedFeeds: string[];
    snapshot?: {
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
  };
  sources: ProviderDescriptor[];
  warning?: string;
};

export type ThemeConfig = {
  pageBackground: string;
  cardBackground: string;
  cardBorder: string;
  accent: string;
  accentStrong: string;
  textPrimary: string;
  textSecondary: string;
};

export type PriceHistoryResponse = {
  requested: {
    lat: number;
    lng: number;
  };
  marketType: string;
  start: string;
  end: string;
  temporalGranularity: string;
  status: string;
  provider: {
    id: string;
    name: string;
  };
  series: {
    regionId?: string;
    unit?: string;
    points: Array<{
      datetime: string;
      price?: number;
      unit?: string;
      source?: string;
    }>;
  };
};

export type SiteSection = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
};

export type SiteConfig = {
  productName: string;
  tagline: string;
  description: string;
  heroPanel: HeroPanel;
  defaultCoordinates: CoordinatePreset;
  coordinatePresets: CoordinatePreset[];
  nav: NavItem[];
  heroActions: HeroAction[];
  operationsSection: SiteSection;
  metricsSection: SiteSection;
  domainsSection: SiteSection;
  workflowSection: SiteSection;
  capabilitiesSection: SiteSection;
  sourcesSection: SiteSection;
  metrics: Metric[];
  domains: DomainCard[];
  workflow: WorkflowStep[];
  capabilities: CapabilityCard[];
  sources: SourceNote[];
  theme: ThemeConfig;
};
