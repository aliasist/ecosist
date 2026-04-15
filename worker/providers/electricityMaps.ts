import type {
  DataProvider,
  DayAheadPricePoint,
  DayAheadPriceSnapshot,
  ElectricitySnapshot,
  RuntimeEnv,
  SourceDescriptor,
} from "../types";
import { fetchJson } from "../utils";

type ElectricityMapsCarbonResponse = {
  zone: string;
  datetime: string;
  updatedAt?: string;
  carbonIntensity?: number;
  emissionFactorType?: string;
  isEstimated?: boolean;
  estimationMethod?: string;
};

type ElectricityMapsPercentageResponse = {
  zone: string;
  datetime: string;
  updatedAt?: string;
  renewablePercentage?: number;
  carbonFreePercentage?: number;
  fossilFreePercentage?: number;
  isEstimated?: boolean;
  estimationMethod?: string;
};

type ElectricityMapsPriceRecord = Record<string, unknown>;

const ONE_HOUR_MS = 60 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: ElectricitySnapshot }>();

function descriptor(live: boolean): SourceDescriptor {
  return {
    id: "electricity-maps",
    name: "Electricity Maps",
    category: "energy",
    health: live ? "available" : "unconfigured",
    live,
    citationUrl: "https://www.electricitymaps.com/",
    notes: [
      "Live electricity carbon and grid mix context.",
      "Uses server-side auth via ELECTRICITY_MAPS_API_KEY.",
      "Academic access can be cited in downstream UI responses.",
    ],
  };
}

async function fetchElectricityMaps(
  env: RuntimeEnv,
  lat: number,
  lng: number,
): Promise<ElectricitySnapshot> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const token = env.ELECTRICITY_MAPS_API_KEY;
  if (!token) {
    throw new Error("Missing ELECTRICITY_MAPS_API_KEY");
  }

  const headers = { "auth-token": token };
  const params = `lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`;

  const [carbonResult, renewableResult, carbonFreeResult] = await Promise.allSettled([
    fetchJson<ElectricityMapsCarbonResponse>(
      `https://api.electricitymap.org/v4/carbon-intensity/latest?${params}`,
      { headers },
    ),
    fetchJson<ElectricityMapsPercentageResponse>(
      `https://api.electricitymap.org/v4/renewable-energy/latest?${params}`,
      { headers },
    ),
    fetchJson<ElectricityMapsPercentageResponse>(
      `https://api.electricitymap.org/v4/carbon-free-energy/latest?${params}`,
      { headers },
    ),
  ]);

  if (carbonResult.status !== "fulfilled") {
    throw carbonResult.reason;
  }

  const carbon = carbonResult.value;
  const renewable =
    renewableResult.status === "fulfilled" ? renewableResult.value : undefined;
  const carbonFree =
    carbonFreeResult.status === "fulfilled" ? carbonFreeResult.value : undefined;

  const snapshot: ElectricitySnapshot = {
    zone: carbon.zone,
    datetime: carbon.datetime,
    updatedAt:
      carbon.updatedAt ??
      renewable?.updatedAt ??
      carbonFree?.updatedAt ??
      new Date().toISOString(),
    carbonIntensityGCO2eqPerKWh: carbon.carbonIntensity,
    renewablePercentage: renewable?.renewablePercentage,
    carbonFreePercentage:
      carbonFree?.carbonFreePercentage ?? carbonFree?.fossilFreePercentage,
    emissionFactorType: carbon.emissionFactorType,
    isEstimated:
      carbon.isEstimated ?? renewable?.isEstimated ?? carbonFree?.isEstimated,
    estimationMethod:
      carbon.estimationMethod ??
      renewable?.estimationMethod ??
      carbonFree?.estimationMethod,
  };

  cache.set(cacheKey, { expiresAt: Date.now() + ONE_HOUR_MS, value: snapshot });
  return snapshot;
}

function requireElectricityMapsToken(env: RuntimeEnv): string {
  const token = env.ELECTRICITY_MAPS_API_KEY;
  if (!token) {
    throw new Error("Missing ELECTRICITY_MAPS_API_KEY");
  }
  return token;
}

function readStringField(
  data: ElectricityMapsPriceRecord,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string") return value;
  }
  return undefined;
}

function readPriceValue(data: ElectricityMapsPriceRecord): number | undefined {
  const directKeys = ["price", "value", "dayAheadPrice", "marketPrice", "priceDayAhead"];
  for (const key of directKeys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      !["lat", "latitude", "lon", "longitude"].includes(key)
    ) {
      return value;
    }
  }

  return undefined;
}

function normalizePriceSnapshot(
  data: ElectricityMapsPriceRecord,
): DayAheadPriceSnapshot {
  const currency = readStringField(data, ["currency"]);
  const unit = readStringField(data, ["unit"]) ?? (currency ? `${currency}/MWh` : undefined);

  return {
    zone: readStringField(data, ["zone"]) ?? "unknown",
    datetime: readStringField(data, ["datetime", "time", "date"]) ?? new Date().toISOString(),
    updatedAt: readStringField(data, ["updatedAt", "updated_at"]),
    price: readPriceValue(data),
    currency,
    unit,
    source: readStringField(data, ["source", "provider", "dataSource"]),
  };
}

export async function fetchElectricityMapsPriceLatest(
  env: RuntimeEnv,
  lat: number,
  lng: number,
): Promise<DayAheadPriceSnapshot> {
  const token = requireElectricityMapsToken(env);
  const params = `lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`;

  const data = await fetchJson<ElectricityMapsPriceRecord>(
    `https://api.electricitymap.org/v4/price-day-ahead/latest?${params}`,
    { headers: { "auth-token": token } },
  );

  return normalizePriceSnapshot(data);
}

export async function fetchElectricityMapsPriceHistory(
  env: RuntimeEnv,
  lat: number,
  lng: number,
  start: string,
  end: string,
  temporalGranularity: "hourly" | "daily",
): Promise<{
  zone?: string;
  currency?: string;
  unit?: string;
  points: DayAheadPricePoint[];
}> {
  const token = requireElectricityMapsToken(env);
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    start,
    end,
    temporalGranularity,
  });

  const data = await fetchJson<ElectricityMapsPriceRecord>(
    `https://api.electricitymap.org/v4/price-day-ahead/past-range?${params.toString()}`,
    { headers: { "auth-token": token } },
  );

  const series = Object.values(data).find(
    (value): value is ElectricityMapsPriceRecord[] =>
      Array.isArray(value) &&
      value.every(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          !Array.isArray(entry),
      ),
  );

  const currency = readStringField(data, ["currency"]);
  const unit = readStringField(data, ["unit"]) ?? (currency ? `${currency}/MWh` : undefined);

  return {
    zone: readStringField(data, ["zone"]),
    currency,
    unit,
    points:
      series?.map((entry) => {
        const pointCurrency = readStringField(entry, ["currency"]) ?? currency;
        return {
          datetime:
            readStringField(entry, ["datetime", "time", "date"]) ?? new Date().toISOString(),
          price: readPriceValue(entry),
          currency: pointCurrency,
          unit:
            readStringField(entry, ["unit"]) ??
            unit ??
            (pointCurrency ? `${pointCurrency}/MWh` : undefined),
          source: readStringField(entry, ["source", "provider", "dataSource"]),
        };
      }) ?? [],
  };
}

export function createElectricityMapsProvider(env: RuntimeEnv): DataProvider {
  const live = Boolean(env.ELECTRICITY_MAPS_API_KEY);

  return {
    descriptor: descriptor(live),
    getData: live
      ? async ({ env: runtimeEnv, lat, lng }) =>
          fetchElectricityMaps(runtimeEnv, lat, lng)
      : undefined,
  };
}
