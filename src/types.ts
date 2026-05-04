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

// Aliases used by existing client code
import type { SourceDescriptor, EnvironmentSnapshot } from "../shared/types";
export type ProviderDescriptor = SourceDescriptor;
export type EnvironmentSnapshotResponse = EnvironmentSnapshot;

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

export type HealthResponse = {
  status: string;
  app: string;
  providers: ProviderDescriptor[];
  electricityMapsConfigured: boolean;
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
