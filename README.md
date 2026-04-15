# EcoSist

EcoSist is a new environmental intelligence app scaffold centered on Electricity Maps and designed to expand into climate, earth systems, and biology data.

## Current Scope

- Vite + React frontend scaffold
- Environmental dashboard landing page
- Typed sample metrics and data domains
- Config-driven navigation, sections, and theme tokens
- Explicit source attribution section
- Cloudflare Worker API scaffold with provider registry

## Planned Next Step

Add a server-side API layer for:

- Electricity Maps live grid data
- Earth system feeds
- Biology and biodiversity feeds

Keep API keys server-side and return normalized, cited data to the frontend.

## API Endpoints

- `GET /api/health`
- `GET /api/config`
- `GET /api/sources`
- `GET /api/environment/latest?lat=...&lng=...`
- `GET /api/prices/latest?lat=...&lng=...`
- `GET /api/prices/history?lat=...&lng=...&start=...&end=...&temporalGranularity=hourly`
- `GET /api/prices/day-ahead/latest?lat=...&lng=...`
- `GET /api/prices/day-ahead/history?lat=...&lng=...&start=...&end=...&temporalGranularity=hourly`

## Price Data Notes

EcoSist can now expose normalized Electricity Maps day-ahead price data for supported markets.

- Europe, Japan, and Australia have direct day-ahead market support in Electricity Maps.
- The Electricity Maps signal documentation says U.S. support is not yet enabled for day-ahead prices because U.S. markets are structured around locational marginal prices across multiple geographical levels.
- The history endpoint is designed to be storage-friendly so the returned `points` can be ingested into DataSist later for correlation analysis.
- The normalized price endpoints also emit `pipelineRecords`, a storage-ready series contract for a future DataSist ingest worker.

## Price Provider Layer

The backend now includes a dedicated `worker/prices/*` subsystem:

- provider registry
- provider resolver
- normalized price series types
- DataSist-ready pipeline record builder

Current providers:

- `Electricity Maps Day-Ahead` for supported international markets
- `U.S. ISO/RTO Router` placeholder, which marks U.S. requests as unsupported until ISO-specific integrations are added

## Public No-Key Providers

EcoSist now also integrates public no-key Earth data providers:

- Open-Meteo Forecast API for live weather
- Open-Meteo Air Quality API for air quality
- NASA POWER Daily API for climate and solar context
- NASA EONET API for active wildfire events
- USGS Earthquake Catalog API for recent seismic activity

These feeds make the app useful immediately before additional account-based providers are added.

## Deployment

EcoSist is structured to deploy as one Cloudflare Worker with static asset serving plus API routes.

Set the Electricity Maps key as a Worker secret:

```sh
npx wrangler secret put ELECTRICITY_MAPS_API_KEY --name ecosist
```

For local development with `wrangler dev`, create a `.dev.vars` file in the project root:

```sh
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` and set:

```sh
ELECTRICITY_MAPS_API_KEY=your-key-here
```

Run the full app with Worker routes enabled:

```sh
npm run cf:dev
```

Open:

- `http://localhost:8787/` for the full app with API routes
- `http://localhost:5173/` for the Vite frontend only

## Customization Model

Most page content now lives in [src/data.ts](/home/blake/projects/ecosist/src/data.ts) as a typed `siteConfig` object.

This gives you clean extension points for:

- branding and theme changes
- additional sections
- new domain cards
- future live metrics
- source attribution growth
