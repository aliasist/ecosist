import { createProviders } from "./providers";
import { buildPricePipelineRecords } from "./prices/pipeline";
import {
  resolveHistoricalPriceSeries,
  resolveLatestPriceSeries,
} from "./prices/resolve";
import type { PriceQuery, PriceSeries } from "./prices/types";
import type {
  BiodiversitySnapshot,
  DayAheadPriceSnapshot,
  ClimateSnapshot,
  EarthSystemsSnapshot,
  ElectricitySnapshot,
  EnvironmentSnapshot,
  GeohazardSnapshot,
  RuntimeEnv,
  WildfireSnapshot,
  WeatherSnapshot,
} from "./types";
import {
  badRequest,
  json,
  notFound,
  parseIsoDateTime,
  parseLatLng,
  parseTemporalGranularity,
} from "./utils";

function buildEnvironmentSnapshot(
  lat: number,
  lng: number,
  electricityMaps: ElectricitySnapshot | undefined,
  priceDayAhead: DayAheadPriceSnapshot | undefined,
  weatherSnapshot: WeatherSnapshot | undefined,
  earthSystemsSnapshot: EarthSystemsSnapshot | undefined,
  climateSnapshot: ClimateSnapshot | undefined,
  geohazardsSnapshot: GeohazardSnapshot | undefined,
  wildfireSnapshot: WildfireSnapshot | undefined,
  biodiversitySnapshot: BiodiversitySnapshot | undefined,
  env: RuntimeEnv,
): EnvironmentSnapshot {
  const providers = createProviders(env);
  return {
    requested: { lat, lng },
    electricityMaps,
    priceDayAhead,
    weather: weatherSnapshot,
    earthSystems: {
      status: earthSystemsSnapshot ? "available" : "planned",
      plannedFeeds: [
        "Air temperature anomalies",
        "Watershed stress",
        "Wildfire and land-cover layers",
      ],
      snapshot: earthSystemsSnapshot,
    },
    climate: {
      status: climateSnapshot ? "available" : "planned",
      plannedFeeds: [
        "Temperature anomalies",
        "Daily precipitation totals",
        "Solar radiation exposure",
      ],
      snapshot: climateSnapshot,
    },
    geohazards: {
      status: geohazardsSnapshot ? "available" : "planned",
      plannedFeeds: [
        "Recent earthquakes",
        "Magnitude and depth context",
        "Regional hazard awareness",
      ],
      snapshot: geohazardsSnapshot,
    },
    wildfire: {
      status: wildfireSnapshot ? "available" : "planned",
      plannedFeeds: [
        "Open wildfire events",
        "Recent incident metadata",
        "Regional fire awareness",
      ],
      snapshot: wildfireSnapshot,
    },
    biology: {
      status: biodiversitySnapshot ? "available" : "planned",
      plannedFeeds: [
        "Species observations",
        "Habitat quality indexes",
        "Pollinator and biodiversity indicators",
      ],
      snapshot: biodiversitySnapshot,
    },
    sources: providers.map((provider) => provider.descriptor),
  };
}

function toDayAheadPriceSnapshot(series: PriceSeries): DayAheadPriceSnapshot | undefined {
  const point = series.points[0];
  if (!point) return undefined;

  return {
    zone: series.regionId ?? "unknown",
    datetime: point.datetime,
    updatedAt: point.datetime,
    price: point.price,
    currency: point.currency ?? series.currency,
    unit: point.unit ?? series.unit,
    source: point.source,
  };
}

async function handleApiRequest(request: Request, env: RuntimeEnv): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return json({
      status: "ok",
      app: "EcoSist",
      providers: createProviders(env).map((provider) => provider.descriptor),
      electricityMapsConfigured: Boolean(env.ELECTRICITY_MAPS_API_KEY),
    });
  }

  if (url.pathname === "/api/config") {
    return json({
      app: "EcoSist",
      modules: {
        electricityMaps: Boolean(env.ELECTRICITY_MAPS_API_KEY),
        earthSystems: true,
        biology: true,
      },
      deployment: "worker-plus-assets",
    });
  }

  if (url.pathname === "/api/sources") {
    return json({ sources: createProviders(env).map((provider) => provider.descriptor) });
  }

  if (url.pathname === "/api/environment/latest") {
    const coords = parseLatLng(url);
    if (!coords) {
      return badRequest("Query params lat and lng are required and must be valid coordinates.");
    }

    const providers = createProviders(env);
    const electricityProvider = providers.find(
      (entry) => entry.descriptor.id === "electricity-maps",
    );
    const earthProvider = providers.find(
      (entry) => entry.descriptor.id === "earth-systems",
    );
    const weatherProvider = providers.find(
      (entry) => entry.descriptor.id === "weather-now",
    );
    const climateProvider = providers.find(
      (entry) => entry.descriptor.id === "nasa-power-climate",
    );
    const geohazardProvider = providers.find(
      (entry) => entry.descriptor.id === "usgs-earthquakes",
    );
    const biodiversityProvider = providers.find(
      (entry) => entry.descriptor.id === "gbif-biodiversity",
    );
    const wildfireProvider = providers.find(
      (entry) => entry.descriptor.id === "nasa-eonet-wildfire",
    );

    let electricityMaps: ElectricitySnapshot | undefined;
    let priceDayAhead: DayAheadPriceSnapshot | undefined;
    let weatherSnapshot: WeatherSnapshot | undefined;
    let earthSystemsSnapshot: EarthSystemsSnapshot | undefined;
    let climateSnapshot: ClimateSnapshot | undefined;
    let geohazardsSnapshot: GeohazardSnapshot | undefined;
    let wildfireSnapshot: WildfireSnapshot | undefined;
    let biodiversitySnapshot: BiodiversitySnapshot | undefined;
    let providerWarning: string | undefined;

    if (electricityProvider && !electricityProvider.getData) {
      providerWarning =
        "Electricity Maps is not configured yet. Add ELECTRICITY_MAPS_API_KEY to enable live grid carbon and renewable-share data.";
    }

    if (electricityProvider?.getData) {
      try {
        electricityMaps = (await electricityProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as ElectricitySnapshot;
      } catch (error) {
        providerWarning =
          error instanceof Error ? error.message : "Electricity Maps fetch failed.";
      }
    }

    if (env.ELECTRICITY_MAPS_API_KEY) {
      try {
        const latestPriceSeries = await resolveLatestPriceSeries(env, {
          lat: coords.lat,
          lng: coords.lng,
          marketType: "day-ahead",
          temporalGranularity: "latest",
        });
        priceDayAhead = toDayAheadPriceSnapshot(latestPriceSeries);
        if (latestPriceSeries.warning) {
          providerWarning = providerWarning
            ? `${providerWarning} | ${latestPriceSeries.warning}`
            : latestPriceSeries.warning;
        }
      } catch (error) {
        const priceWarning =
          error instanceof Error ? error.message : "Electricity Maps day-ahead price fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${priceWarning}`
          : priceWarning;
      }
    }

    if (weatherProvider?.getData) {
      try {
        weatherSnapshot = (await weatherProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as WeatherSnapshot;
      } catch (error) {
        const weatherWarning =
          error instanceof Error ? error.message : "Weather fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${weatherWarning}`
          : weatherWarning;
      }
    }

    if (earthProvider?.getData) {
      try {
        earthSystemsSnapshot = (await earthProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as EarthSystemsSnapshot;
      } catch (error) {
        const earthWarning =
          error instanceof Error ? error.message : "Earth systems fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${earthWarning}`
          : earthWarning;
      }
    }

    if (climateProvider?.getData) {
      try {
        climateSnapshot = (await climateProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as ClimateSnapshot;
      } catch (error) {
        const climateWarning =
          error instanceof Error ? error.message : "Climate fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${climateWarning}`
          : climateWarning;
      }
    }

    if (geohazardProvider?.getData) {
      try {
        geohazardsSnapshot = (await geohazardProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as GeohazardSnapshot;
      } catch (error) {
        const geohazardWarning =
          error instanceof Error ? error.message : "Geohazard fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${geohazardWarning}`
          : geohazardWarning;
      }
    }

    if (wildfireProvider?.getData) {
      try {
        wildfireSnapshot = (await wildfireProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as WildfireSnapshot;
      } catch (error) {
        const wildfireWarning =
          error instanceof Error ? error.message : "Wildfire fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${wildfireWarning}`
          : wildfireWarning;
      }
    }

    if (biodiversityProvider?.getData) {
      try {
        biodiversitySnapshot = (await biodiversityProvider.getData({
          env,
          lat: coords.lat,
          lng: coords.lng,
        })) as BiodiversitySnapshot;
      } catch (error) {
        const biodiversityWarning =
          error instanceof Error ? error.message : "Biodiversity fetch failed.";
        providerWarning = providerWarning
          ? `${providerWarning} | ${biodiversityWarning}`
          : biodiversityWarning;
      }
    }

    return json({
      ...buildEnvironmentSnapshot(
        coords.lat,
        coords.lng,
        electricityMaps,
        priceDayAhead,
        weatherSnapshot,
        earthSystemsSnapshot,
        climateSnapshot,
        geohazardsSnapshot,
        wildfireSnapshot,
        biodiversitySnapshot,
        env,
      ),
      warning: providerWarning,
    });
  }

  if (url.pathname === "/api/prices/day-ahead/latest") {
    const coords = parseLatLng(url);
    if (!coords) {
      return badRequest("Query params lat and lng are required and must be valid coordinates.");
    }

    try {
      const query: PriceQuery = {
        lat: coords.lat,
        lng: coords.lng,
        marketType: "day-ahead",
        temporalGranularity: "latest",
      };
      const series = await resolveLatestPriceSeries(env, query);
      return json({
        requested: coords,
        provider: series.providerId,
        marketType: "day-ahead",
        status: series.status,
        notes: series.notes,
        snapshot: toDayAheadPriceSnapshot(series),
        pipelineRecords: buildPricePipelineRecords(query, series),
        warning: series.warning,
      });
    } catch (error) {
      return json(
        {
          requested: coords,
          provider: "electricity-maps",
          marketType: "day-ahead",
          error:
            error instanceof Error
              ? error.message
              : "Electricity Maps day-ahead price fetch failed.",
        },
        { status: 502 },
      );
    }
  }

  if (url.pathname === "/api/prices/day-ahead/history") {
    const coords = parseLatLng(url);
    if (!coords) {
      return badRequest("Query params lat and lng are required and must be valid coordinates.");
    }

    const start = parseIsoDateTime(url.searchParams.get("start"));
    const end = parseIsoDateTime(url.searchParams.get("end"));
    const temporalGranularity = parseTemporalGranularity(
      url.searchParams.get("temporalGranularity"),
    );

    if (!start || !end) {
      return badRequest("Query params start and end are required and must be valid ISO datetimes.");
    }

    if (!temporalGranularity) {
      return badRequest("temporalGranularity must be either hourly or daily.");
    }

    if (new Date(start) >= new Date(end)) {
      return badRequest("start must be earlier than end.");
    }

    try {
      const query: PriceQuery = {
        lat: coords.lat,
        lng: coords.lng,
        marketType: "day-ahead",
        temporalGranularity,
        start,
        end,
      };
      const history = await resolveHistoricalPriceSeries(env, query);

      return json({
        requested: coords,
        provider: history.providerId,
        marketType: "day-ahead",
        status: history.status,
        temporalGranularity,
        start,
        end,
        regionId: history.regionId,
        regionType: history.regionType,
        currency: history.currency,
        unit: history.unit,
        notes: history.notes,
        points: history.points,
        pipelineRecords: buildPricePipelineRecords(query, history),
        warning: history.warning,
      });
    } catch (error) {
      return json(
        {
          requested: coords,
          provider: "electricity-maps",
          marketType: "day-ahead",
          error:
            error instanceof Error
              ? error.message
              : "Electricity Maps price history fetch failed.",
        },
        { status: 502 },
      );
    }
  }

  if (url.pathname === "/api/prices/latest") {
    const coords = parseLatLng(url);
    if (!coords) {
      return badRequest("Query params lat and lng are required and must be valid coordinates.");
    }

    try {
      const query: PriceQuery = {
        lat: coords.lat,
        lng: coords.lng,
        marketType: "day-ahead",
        temporalGranularity: "latest",
      };
      const series = await resolveLatestPriceSeries(env, query);
      return json({
        requested: coords,
        marketType: query.marketType,
        status: series.status,
        provider: {
          id: series.providerId,
          name: series.providerName,
        },
        series,
        pipelineRecords: buildPricePipelineRecords(query, series),
      });
    } catch (error) {
      return json(
        {
          requested: coords,
          error:
            error instanceof Error
              ? error.message
              : "Normalized price latest fetch failed.",
        },
        { status: 502 },
      );
    }
  }

  if (url.pathname === "/api/prices/history") {
    const coords = parseLatLng(url);
    if (!coords) {
      return badRequest("Query params lat and lng are required and must be valid coordinates.");
    }

    const start = parseIsoDateTime(url.searchParams.get("start"));
    const end = parseIsoDateTime(url.searchParams.get("end"));
    const temporalGranularity = parseTemporalGranularity(
      url.searchParams.get("temporalGranularity"),
    );

    if (!start || !end) {
      return badRequest("Query params start and end are required and must be valid ISO datetimes.");
    }

    if (!temporalGranularity) {
      return badRequest("temporalGranularity must be either hourly or daily.");
    }

    try {
      const query: PriceQuery = {
        lat: coords.lat,
        lng: coords.lng,
        marketType: "day-ahead",
        temporalGranularity,
        start,
        end,
      };
      const series = await resolveHistoricalPriceSeries(env, query);
      return json({
        requested: coords,
        marketType: query.marketType,
        start,
        end,
        temporalGranularity,
        status: series.status,
        provider: {
          id: series.providerId,
          name: series.providerName,
        },
        series,
        pipelineRecords: buildPricePipelineRecords(query, series),
      });
    } catch (error) {
      return json(
        {
          requested: coords,
          error:
            error instanceof Error
              ? error.message
              : "Normalized price history fetch failed.",
        },
        { status: 502 },
      );
    }
  }

  return notFound();
}

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env);
    }

    if (env.ASSETS) {
      // Try to serve the static asset first
      const assetResponse = await env.ASSETS.fetch(request);
      // If found and not a 404, and not HTML, return it (for assets)
      if (assetResponse && assetResponse.status !== 404) {
        // If the request is for an asset (js, css, images, etc.), always return the asset
        const assetPath = url.pathname;
        if (
          assetPath.startsWith("/assets/") ||
          assetPath.endsWith(".js") ||
          assetPath.endsWith(".css") ||
          assetPath.endsWith(".png") ||
          assetPath.endsWith(".jpg") ||
          assetPath.endsWith(".jpeg") ||
          assetPath.endsWith(".svg") ||
          assetPath.endsWith(".ico") ||
          assetPath.endsWith(".webmanifest") ||
          assetPath.endsWith(".json")
        ) {
          return assetResponse;
        }
        // If the asset is not HTML, return it
        const contentType = assetResponse.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
          return assetResponse;
        }
        // Otherwise, continue to SPA fallback below
      }
      // If not found, and it's a navigation request (SPA), serve index.html
      const acceptHeader = request.headers.get("accept") || "";
      if (
        request.method === "GET" &&
        !url.pathname.startsWith("/api/") &&
        acceptHeader.includes("text/html")
      ) {
        // Rewrite to /index.html for SPA fallback
        const indexRequest = new Request(new URL("/index.html", url), request);
        return env.ASSETS.fetch(indexRequest);
      }
    }

    return notFound();
  },
};
