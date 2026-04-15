import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import ecosistSignalPortrait from "./assets/2811292-portrait-ai-and-overlay-with-a-digital-woman-in-studio-on-a-dark-background-for-3d-information-technology.-face-future-and-cyber-space-with-a-female-hologram-interface-as-a-dashboard-for-security-fit_400_400.jpg";
import ecosistDashboardVisual from "./assets/still-77883d60a95842ddf684ee7ab2e12b10.png";
import ecosistLogo from "./assets/ecosist-logo.svg";

// Banner component for logo/banner design
function Banner() {
  return (
    <div className="ecosist-banner">
      {/* Replace this with your logo or custom banner design */}
      <span className="ecosist-banner-logo">eCoSist <span className="ecosist-banner-by">by Aliasist</span></span>
    </div>
  );
}
import { siteConfig } from "./data";
import type {
  CapabilityCard,
  CoordinatePreset,
  DomainCard,
  EnvironmentSnapshotResponse,
  HealthResponse,
  Metric,
  PriceHistoryResponse,
  ProviderDescriptor,
  SiteSection,
  SourceNote,
  Trend,
  WorkflowStep,
} from "./types";

const trendLabel: Record<Trend, string> = {
  up: "Improving",
  down: "Falling",
  steady: "Stable",
};

type RequestState<T> = {
  data?: T;
  error?: string;
  loading: boolean;
};

type ComparisonSnapshot = {
  preset: CoordinatePreset;
  data?: EnvironmentSnapshotResponse;
  error?: string;
};

function formatCoordinateValue(value: number): string {
  return value.toFixed(4);
}

function formatProviderStatus(provider: ProviderDescriptor): string {
  if (provider.live) return "Live";
  if (provider.health === "configured") return "Configured";
  if (provider.health === "unconfigured") return "Not configured";
  return "Planned";
}

function formatTimestamp(value?: string): string {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMetricValue(value?: number, unit?: string): string {
  if (value === undefined) return "Unavailable";
  return `${value} ${unit ?? ""}`.trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeSignal(value: number | undefined, max: number): number {
  if (value === undefined) return 0;
  return clamp(value / max, 0, 1);
}

function SectionHeader({ section }: { section: SiteSection }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{section.eyebrow}</p>
      <h2>{section.title}</h2>
      {section.description ? (
        <p className="section-description">{section.description}</p>
      ) : null}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="card">
      <p className="metric-label">{metric.label}</p>
      <p className="metric-value">{metric.value}</p>
      <p className="metric-detail">{metric.detail}</p>
      <span className="trend-pill">{trendLabel[metric.trend]}</span>
    </article>
  );
}

function DomainCardView({ domain }: { domain: DomainCard }) {
  return (
    <article className="card card-domain">
      <h3>{domain.title}</h3>
      <p>{domain.summary}</p>
      <ul className="feed-list">
        {domain.feeds.map((feed) => (
          <li key={feed}>{feed}</li>
        ))}
      </ul>
    </article>
  );
}

function WorkflowCard({
  step,
  index,
}: {
  step: WorkflowStep;
  index: number;
}) {
  return (
    <article className="card card-step">
      <p className="step-index">{String(index + 1).padStart(2, "0")}</p>
      <h3>{step.title}</h3>
      <p>{step.detail}</p>
    </article>
  );
}

function CapabilityCardView({ item }: { item: CapabilityCard }) {
  return (
    <article className="card">
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </article>
  );
}

function SourceCard({ source }: { source: SourceNote }) {
  return (
    <article className="card source-card">
      <h3>{source.label}</h3>
      <p>{source.detail}</p>
    </article>
  );
}

function LiveMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="signal-tile">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}

function SignalMapPanel({
  label,
  lat,
  lng,
  environment,
}: {
  label: string;
  lat: number;
  lng: number;
  environment?: EnvironmentSnapshotResponse;
}) {
  const carbonLevel = normalizeSignal(
    environment?.electricityMaps?.carbonIntensityGCO2eqPerKWh,
    600,
  );
  const airLevel = normalizeSignal(environment?.earthSystems.snapshot?.usAqi, 150);
  const fireLevel = normalizeSignal(environment?.wildfire.snapshot?.activeEventCount, 12);
  const bioLevel = normalizeSignal(
    environment?.biology.snapshot?.distinctSpeciesCount,
    100,
  );
  const quakeLevel = normalizeSignal(
    environment?.geohazards.snapshot?.countPast30Days,
    60,
  );
  const windLevel = normalizeSignal(environment?.weather?.windSpeedKph, 40);

  const x = `${((lng + 180) / 360) * 100}%`;
  const y = `${((90 - lat) / 180) * 100}%`;

  const layers = [
    { label: "Carbon", value: carbonLevel, tone: "energy" },
    { label: "Air", value: airLevel, tone: "air" },
    { label: "Fire", value: fireLevel, tone: "hazard" },
    { label: "Biology", value: bioLevel, tone: "bio" },
    { label: "Seismic", value: quakeLevel, tone: "hazard" },
    { label: "Wind", value: windLevel, tone: "climate" },
  ];

  return (
    <section className="signal-map panel" aria-label="Spatial signal map">
      <div className="signal-map-header">
        <div>
          <p className="eyebrow">Spatial View</p>
          <h3>{label}</h3>
        </div>
        <p className="section-description">
          Localized energy, atmosphere, hazard, and biodiversity signals anchored to the selected coordinates.
        </p>
      </div>

      <div className="signal-map-stage">
        <div className="signal-map-grid" />
        <div className="signal-map-ring signal-map-ring-carbon" style={{ opacity: 0.18 + carbonLevel * 0.45 }} />
        <div className="signal-map-ring signal-map-ring-air" style={{ opacity: 0.16 + airLevel * 0.45 }} />
        <div className="signal-map-ring signal-map-ring-bio" style={{ opacity: 0.14 + bioLevel * 0.45 }} />
        <div className="signal-map-ring signal-map-ring-hazard" style={{ opacity: 0.14 + Math.max(fireLevel, quakeLevel) * 0.45 }} />
        <div className="signal-map-crosshair-h" />
        <div className="signal-map-crosshair-v" />
        <div className="signal-map-marker" style={{ left: x, top: y }}>
          <span className="signal-map-ping" />
          <span className="signal-map-dot" />
        </div>
        <div className="signal-map-coordinates">
          <span>Lat {lat.toFixed(2)}</span>
          <span>Lng {lng.toFixed(2)}</span>
        </div>
      </div>

      <div className="signal-layer-grid">
        {layers.map((layer) => (
          <div className="signal-layer-row" key={layer.label}>
            <span>{layer.label}</span>
            <div className="signal-layer-track">
              <div
                className={`signal-layer-fill signal-layer-fill-${layer.tone}`}
                style={{ width: `${Math.max(layer.value * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildLinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TrendPanel({
  label,
  history,
  environment,
}: {
  label: string;
  history?: PriceHistoryResponse;
  environment?: EnvironmentSnapshotResponse;
}) {
  const priceValues =
    history?.series.points
      .map((point) => point.price)
      .filter((value): value is number => typeof value === "number") ?? [];

  const pricePath = buildLinePath(priceValues, 360, 120);
  const mixSignals = [
    {
      label: "Carbon",
      value: normalizeSignal(environment?.electricityMaps?.carbonIntensityGCO2eqPerKWh, 600),
      tone: "energy",
    },
    {
      label: "Price",
      value: normalizeSignal(history?.series.points.at(-1)?.price, 300),
      tone: "market",
    },
    {
      label: "Air",
      value: normalizeSignal(environment?.earthSystems.snapshot?.usAqi, 150),
      tone: "air",
    },
    {
      label: "Fire",
      value: normalizeSignal(environment?.wildfire.snapshot?.activeEventCount, 12),
      tone: "hazard",
    },
    {
      label: "Species",
      value: normalizeSignal(environment?.biology.snapshot?.distinctSpeciesCount, 100),
      tone: "bio",
    },
  ];

  return (
    <section className="trend-panel panel">
      <div className="trend-panel-header">
        <div>
          <p className="eyebrow">Trends</p>
          <h3>{label}</h3>
        </div>
        <p className="section-description">
          Real historical pricing where available, with current Earth-state layers aligned beside it.
        </p>
      </div>
      <div className="trend-grid">
        <article className="trend-card">
          <p className="metric-label">Price History</p>
          {priceValues.length > 1 ? (
            <>
              <svg viewBox="0 0 360 120" className="trend-chart" role="img" aria-label="Price history">
                <path d={pricePath} className="trend-line trend-line-market" />
              </svg>
              <div className="trend-scale">
                <span>{history?.series.points[0]?.datetime?.slice(11, 16) ?? "Start"}</span>
                <strong>
                  {history?.series.points.at(-1)?.price !== undefined
                    ? `${history?.series.points.at(-1)?.price} ${history?.series.unit ?? ""}`.trim()
                    : "Unavailable"}
                </strong>
              </div>
            </>
          ) : (
            <p className="section-description">
              Price history is not yet available for this market.
            </p>
          )}
        </article>

        <article className="trend-card">
          <p className="metric-label">Signal Mix</p>
          <div className="trend-stack">
            {mixSignals.map((signal) => (
              <div className="trend-stack-row" key={signal.label}>
                <span>{signal.label}</span>
                <div className="signal-layer-track">
                  <div
                    className={`signal-layer-fill signal-layer-fill-${signal.tone}`}
                    style={{ width: `${Math.max(signal.value * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function RegionComparePanel({
  snapshots,
  loading,
}: {
  snapshots?: ComparisonSnapshot[];
  loading: boolean;
}) {
  return (
    <section className="section" id="compare">
      <div className="section-heading">
        <p className="eyebrow">Compare</p>
        <h2>Regional signal comparison</h2>
        <p className="section-description">
          Live readings across the default regions, aligned to the same energy, atmosphere, hazard, and biology fields.
        </p>
      </div>
      {loading ? <p className="section-description">Loading regional comparison...</p> : null}
      <div className="compare-grid">
        {snapshots?.map(({ preset, data, error }) => {
          const carbon = data?.electricityMaps?.carbonIntensityGCO2eqPerKWh;
          const price = data?.priceDayAhead?.price;
          const air = data?.earthSystems.snapshot?.usAqi;
          const fire = data?.wildfire.snapshot?.activeEventCount;
          const species = data?.biology.snapshot?.distinctSpeciesCount;
          const carbonLevel = normalizeSignal(carbon, 600);
          const airLevel = normalizeSignal(air, 150);
          const fireLevel = normalizeSignal(fire, 12);
          const speciesLevel = normalizeSignal(species, 100);

          return (
            <article className="compare-card" key={preset.label}>
              <div className="compare-card-header">
                <div>
                  <p className="eyebrow">Region</p>
                  <h3>{preset.label}</h3>
                </div>
                <span className="trend-pill">
                  {data?.electricityMaps?.zone ?? "No zone"}
                </span>
              </div>
              {error ? <p className="warning-text">{error}</p> : null}
              <div className="compare-values">
                <div>
                  <span>Carbon</span>
                  <strong>{formatMetricValue(carbon, "gCO2eq/kWh")}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>{formatMetricValue(price, data?.priceDayAhead?.unit)}</strong>
                </div>
                <div>
                  <span>Air</span>
                  <strong>{air !== undefined ? `AQI ${air}` : "Unavailable"}</strong>
                </div>
                <div>
                  <span>Species</span>
                  <strong>{species !== undefined ? String(species) : "Unavailable"}</strong>
                </div>
              </div>
              <div className="compare-bars">
                {[
                  { label: "Carbon", value: carbonLevel, tone: "energy" },
                  { label: "Air", value: airLevel, tone: "air" },
                  { label: "Fire", value: fireLevel, tone: "hazard" },
                  { label: "Biology", value: speciesLevel, tone: "bio" },
                ].map((row) => (
                  <div className="trend-stack-row" key={row.label}>
                    <span>{row.label}</span>
                    <div className="signal-layer-track">
                      <div
                        className={`signal-layer-fill signal-layer-fill-${row.tone}`}
                        style={{ width: `${Math.max(row.value * 100, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PresetButton({
  preset,
  onSelect,
}: {
  preset: CoordinatePreset;
  onSelect: (preset: CoordinatePreset) => void;
}) {
  return (
    <button className="preset-button" type="button" onClick={() => onSelect(preset)}>
      {preset.label}
    </button>
  );
}

export default function App() {
  const {
    capabilities,
    capabilitiesSection,
    coordinatePresets,
    defaultCoordinates,
    description,
    domains,
    domainsSection,
    heroActions,
    heroPanel,
    metrics,
    metricsSection,
    nav,
    operationsSection,
    productName,
    sources,
    sourcesSection,
    tagline,
    theme,
    workflow,
    workflowSection,
  } = siteConfig;

  const [lat, setLat] = useState(formatCoordinateValue(defaultCoordinates.lat));
  const [lng, setLng] = useState(formatCoordinateValue(defaultCoordinates.lng));
  const [selectedLabel, setSelectedLabel] = useState(defaultCoordinates.label);
  const [healthState, setHealthState] = useState<RequestState<HealthResponse>>({
    loading: true,
  });
  const [environmentState, setEnvironmentState] =
    useState<RequestState<EnvironmentSnapshotResponse>>({
      loading: true,
    });
  const [priceHistoryState, setPriceHistoryState] =
    useState<RequestState<PriceHistoryResponse>>({
      loading: true,
    });
  const [compareState, setCompareState] =
    useState<RequestState<ComparisonSnapshot[]>>({
      loading: true,
    });

  const environmentUrl = useMemo(() => {
    const params = new URLSearchParams({ lat, lng });
    return `/api/environment/latest?${params.toString()}`;
  }, [lat, lng]);

  const priceHistoryUrl = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      lat,
      lng,
      start: start.toISOString(),
      end: end.toISOString(),
      temporalGranularity: "hourly",
    });
    return `/api/prices/history?${params.toString()}`;
  }, [lat, lng]);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      setHealthState({ loading: true });
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error(`Health request failed: ${response.status}`);
        }
        const data = (await response.json()) as HealthResponse;
        if (!cancelled) {
          setHealthState({ data, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setHealthState({
            error: error instanceof Error ? error.message : "Health request failed.",
            loading: false,
          });
        }
      }
    }

    void loadHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEnvironment() {
      setEnvironmentState({ loading: true });
      try {
        const response = await fetch(environmentUrl);
        if (!response.ok) {
          throw new Error(`Environment request failed: ${response.status}`);
        }
        const data = (await response.json()) as EnvironmentSnapshotResponse;
        if (!cancelled) {
          setEnvironmentState({ data, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setEnvironmentState({
            error:
              error instanceof Error
                ? error.message
                : "Environment snapshot request failed.",
            loading: false,
          });
        }
      }
    }

    void loadEnvironment();
    return () => {
      cancelled = true;
    };
  }, [environmentUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadPriceHistory() {
      setPriceHistoryState({ loading: true });
      try {
        const response = await fetch(priceHistoryUrl);
        if (!response.ok) {
          throw new Error(`Price history request failed: ${response.status}`);
        }
        const data = (await response.json()) as PriceHistoryResponse;
        if (!cancelled) {
          setPriceHistoryState({ data, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setPriceHistoryState({
            error:
              error instanceof Error
                ? error.message
                : "Price history request failed.",
            loading: false,
          });
        }
      }
    }

    void loadPriceHistory();
    return () => {
      cancelled = true;
    };
  }, [priceHistoryUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadComparison() {
      setCompareState({ loading: true });
      try {
        const snapshots = await Promise.all(
          coordinatePresets.map(async (preset) => {
            const params = new URLSearchParams({
              lat: formatCoordinateValue(preset.lat),
              lng: formatCoordinateValue(preset.lng),
            });
            try {
              const response = await fetch(`/api/environment/latest?${params.toString()}`);
              if (!response.ok) {
                throw new Error(`Compare request failed: ${response.status}`);
              }
              const data = (await response.json()) as EnvironmentSnapshotResponse;
              return { preset, data };
            } catch (error) {
              return {
                preset,
                error:
                  error instanceof Error
                    ? error.message
                    : "Compare request failed.",
              };
            }
          }),
        );

        if (!cancelled) {
          setCompareState({ data: snapshots, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setCompareState({
            error:
              error instanceof Error
                ? error.message
                : "Regional comparison failed.",
            loading: false,
          });
        }
      }
    }

    void loadComparison();
    return () => {
      cancelled = true;
    };
  }, [coordinatePresets]);

  const liveSourceNotes = healthState.data?.providers ?? [];
  const liveSnapshot = environmentState.data?.electricityMaps;
  const livePriceSnapshot = environmentState.data?.priceDayAhead;
  const weatherSnapshot = environmentState.data?.weather;
  const earthSnapshot = environmentState.data?.earthSystems.snapshot;
  const climateSnapshot = environmentState.data?.climate.snapshot;
  const geohazardsSnapshot = environmentState.data?.geohazards.snapshot;
  const wildfireSnapshot = environmentState.data?.wildfire.snapshot;
  const biodiversitySnapshot = environmentState.data?.biology.snapshot;
  const stateHighlights = [
    {
      label: "Grid Carbon",
      value: formatMetricValue(liveSnapshot?.carbonIntensityGCO2eqPerKWh, "gCO2eq/kWh"),
      tone: "energy",
    },
    {
      label: "Price",
      value: formatMetricValue(livePriceSnapshot?.price, livePriceSnapshot?.unit),
      tone: "market",
    },
    {
      label: "Air",
      value: earthSnapshot?.usAqi !== undefined ? `AQI ${earthSnapshot.usAqi}` : "Unavailable",
      tone: "air",
    },
    {
      label: "Weather",
      value: formatMetricValue(weatherSnapshot?.temperatureC, "C"),
      tone: "climate",
    },
    {
      label: "Fire",
      value:
        wildfireSnapshot?.activeEventCount !== undefined
          ? String(wildfireSnapshot.activeEventCount)
          : "Unavailable",
      tone: "hazard",
    },
    {
      label: "Species",
      value:
        biodiversitySnapshot?.distinctSpeciesCount !== undefined
          ? String(biodiversitySnapshot.distinctSpeciesCount)
          : "Unavailable",
      tone: "bio",
    },
  ];

  return (
    <main
      className="app-shell"
      id="top"
      style={
        {
          "--page-background": theme.pageBackground,
          "--card-background": theme.cardBackground,
          "--card-border": theme.cardBorder,
          "--accent": theme.accent,
          "--accent-strong": theme.accentStrong,
          "--text-primary": theme.textPrimary,
          "--text-secondary": theme.textSecondary,
        } as CSSProperties
      }
    >
      <Banner />
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label={`${productName} home`}>
          <img className="brand-image" src={ecosistLogo} alt={`${productName} logo`} />
        </a>
        <nav className="topnav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{productName}</p>
          <h1>{tagline}</h1>
          <p className="lede">{description}</p>
          <div className="hero-actions">
            {heroActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`button button-${action.variant}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-media-grid">
            <figure className="hero-media hero-media-primary">
              <img
                className="hero-visual"
                src={ecosistDashboardVisual}
                alt="EcoSist environmental dashboard concept"
              />
              <figcaption className="hero-media-caption">
                Live energy and environmental monitoring
              </figcaption>
            </figure>
            <figure className="hero-media hero-media-secondary">
              <img
                className="hero-visual hero-visual-portrait"
                src={ecosistSignalPortrait}
                alt="AI-assisted environmental intelligence portrait"
              />
              <figcaption className="hero-media-caption">
                AI context layer for earth and biology signals
              </figcaption>
            </figure>
          </div>
          <h2>{heroPanel.title}</h2>
          <ul>
            {heroPanel.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="state-ribbon" aria-label="Earth state">
        {stateHighlights.map((item) => (
          <article className={`state-pill state-pill-${item.tone}`} key={item.label}>
            <p className="state-pill-label">{item.label}</p>
            <p className="state-pill-value">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="section" id={operationsSection.id}>
        <SectionHeader section={operationsSection} />
        <div className="operations-grid">
          <article className="panel operations-card">
            <h3>Provider status</h3>
            <p className="section-description">
              Worker health, secret readiness, and provider availability are read directly from the API.
            </p>
            {healthState.data && !healthState.data.electricityMapsConfigured ? (
              <p className="warning-text">
                Electricity Maps is not configured yet. Add `ELECTRICITY_MAPS_API_KEY` in `.dev.vars`
                for local Wrangler runs, or set the Worker secret before deploy.
              </p>
            ) : null}
            {healthState.loading ? <p>Loading provider health...</p> : null}
            {healthState.error ? <p>{healthState.error}</p> : null}
            {healthState.data ? (
              <div className="provider-list">
                {healthState.data.providers.map((provider) => (
                  <div className="provider-row" key={provider.id}>
                    <div>
                      <p className="provider-name">{provider.name}</p>
                      <p className="provider-category">{provider.category}</p>
                    </div>
                    <span className="trend-pill">
                      {formatProviderStatus(provider)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel operations-card">
            <h3>Environment snapshot</h3>
            <p className="section-description">
              Change the target coordinates to compare different regions without changing code.
            </p>
            <div className="preset-list">
              {coordinatePresets.map((preset) => (
                <PresetButton
                  key={preset.label}
                  preset={preset}
                  onSelect={(nextPreset) => {
                    setLat(formatCoordinateValue(nextPreset.lat));
                    setLng(formatCoordinateValue(nextPreset.lng));
                    setSelectedLabel(nextPreset.label);
                  }}
                />
              ))}
            </div>
            <div className="coordinate-grid">
              <label className="field">
                <span>Latitude</span>
                <input value={lat} onChange={(event) => setLat(event.target.value)} />
              </label>
              <label className="field">
                <span>Longitude</span>
                <input value={lng} onChange={(event) => setLng(event.target.value)} />
              </label>
            </div>
            <p className="selected-label">Selected region: {selectedLabel}</p>
            <div className="signal-band">
              <div className="signal-band-copy">
                <p className="eyebrow">Current Read</p>
                <h3>{selectedLabel}</h3>
                <p className="section-description">
                  Unified live read across energy, atmosphere, hazard, and biodiversity layers.
                </p>
              </div>
              <div className="signal-band-stats">
                <div>
                  <span>Zone</span>
                  <strong>{liveSnapshot?.zone ?? "Unavailable"}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>{formatMetricValue(livePriceSnapshot?.price, livePriceSnapshot?.unit)}</strong>
                </div>
                <div>
                  <span>Air</span>
                  <strong>
                    {earthSnapshot?.usAqi !== undefined ? `AQI ${earthSnapshot.usAqi}` : "Unavailable"}
                  </strong>
                </div>
                <div>
                  <span>Species</span>
                  <strong>
                    {biodiversitySnapshot?.distinctSpeciesCount !== undefined
                      ? `${biodiversitySnapshot.distinctSpeciesCount} seen`
                      : "Unavailable"}
                  </strong>
                </div>
              </div>
            </div>
            <SignalMapPanel
              label={selectedLabel}
              lat={Number(lat)}
              lng={Number(lng)}
              environment={environmentState.data}
            />
            {environmentState.loading ? <p>Loading environment snapshot...</p> : null}
            {environmentState.error ? <p>{environmentState.error}</p> : null}
            {environmentState.data ? (
              <>
                <TrendPanel
                  label={selectedLabel}
                  history={priceHistoryState.data}
                  environment={environmentState.data}
                />
                <div className="live-metric-grid">
                <LiveMetricCard
                  label="Carbon Intensity"
                  value={
                    liveSnapshot?.carbonIntensityGCO2eqPerKWh !== undefined
                      ? `${liveSnapshot.carbonIntensityGCO2eqPerKWh} gCO2eq/kWh`
                      : "Unavailable"
                  }
                  detail="Latest available carbon-intensity reading."
                />
                <LiveMetricCard
                  label="Renewable Share"
                  value={
                    liveSnapshot?.renewablePercentage !== undefined
                      ? `${liveSnapshot.renewablePercentage}%`
                      : "Unavailable"
                  }
                  detail="Latest available renewable-percentage reading."
                />
                <LiveMetricCard
                  label="Carbon-Free Share"
                  value={
                    liveSnapshot?.carbonFreePercentage !== undefined
                      ? `${liveSnapshot.carbonFreePercentage}%`
                      : "Unavailable"
                  }
                  detail="Latest available carbon-free-percentage reading."
                />
                <LiveMetricCard
                  label="Day-Ahead Price"
                  value={
                    livePriceSnapshot?.price !== undefined
                      ? `${livePriceSnapshot.price} ${livePriceSnapshot.unit ?? ""}`.trim()
                      : "Unavailable"
                  }
                  detail="Latest published day-ahead electricity price for the selected market when supported."
                />
                <LiveMetricCard
                  label="Price Market"
                  value={livePriceSnapshot?.zone ?? "Unavailable"}
                  detail={
                    livePriceSnapshot?.source
                      ? `Price source: ${livePriceSnapshot.source}.`
                      : "Electricity Maps day-ahead market identifier for the selected coordinates."
                  }
                />
                <LiveMetricCard
                  label="Temperature"
                  value={
                    weatherSnapshot?.temperatureC !== undefined
                      ? `${weatherSnapshot.temperatureC} C`
                      : "Unavailable"
                  }
                  detail="Current weather temperature from the live weather provider."
                />
                <LiveMetricCard
                  label="Wind Speed"
                  value={
                    weatherSnapshot?.windSpeedKph !== undefined
                      ? `${weatherSnapshot.windSpeedKph} km/h`
                      : "Unavailable"
                  }
                  detail="Current wind speed for the selected coordinates."
                />
                <LiveMetricCard
                  label="Updated"
                  value={formatTimestamp(liveSnapshot?.updatedAt)}
                  detail="Timestamp returned by the environment API."
                />
                <LiveMetricCard
                  label="Electricity Maps Mode"
                  value={
                    liveSnapshot
                      ? liveSnapshot.isEstimated
                        ? "Estimated"
                        : "Measured"
                      : "Unavailable"
                  }
                  detail={
                    liveSnapshot?.estimationMethod
                      ? `Estimation method: ${liveSnapshot.estimationMethod}.`
                      : "Whether the latest grid reading is estimated or measured."
                  }
                />
                <LiveMetricCard
                  label="Solar Radiation"
                  value={
                    climateSnapshot?.solarRadiationKwhPerM2 !== undefined
                      ? `${climateSnapshot.solarRadiationKwhPerM2} kWh/m2`
                      : "Unavailable"
                  }
                  detail="Latest NASA POWER daily solar radiation signal."
                />
                <LiveMetricCard
                  label="Climate Precipitation"
                  value={
                    climateSnapshot?.precipitationMm !== undefined
                      ? `${climateSnapshot.precipitationMm} mm`
                      : "Unavailable"
                  }
                  detail="Latest NASA POWER daily precipitation total."
                />
                <LiveMetricCard
                  label="US AQI"
                  value={
                    earthSnapshot?.usAqi !== undefined
                      ? String(earthSnapshot.usAqi)
                      : "Unavailable"
                  }
                  detail="Latest Open-Meteo air quality index for the selected coordinates."
                />
                <LiveMetricCard
                  label="PM2.5"
                  value={
                    earthSnapshot?.pm2_5 !== undefined
                      ? `${earthSnapshot.pm2_5} ug/m3`
                      : "Unavailable"
                  }
                  detail="Latest particulate matter concentration from the earth-systems provider."
                />
                <LiveMetricCard
                  label="Ozone"
                  value={
                    earthSnapshot?.ozone !== undefined
                      ? `${earthSnapshot.ozone} ug/m3`
                      : "Unavailable"
                  }
                  detail="Latest ozone concentration from Open-Meteo."
                />
                <LiveMetricCard
                  label="Quakes 30d"
                  value={
                    geohazardsSnapshot?.countPast30Days !== undefined
                      ? String(geohazardsSnapshot.countPast30Days)
                      : "Unavailable"
                  }
                  detail="Recent earthquakes within 250 km over the past 30 days."
                />
                <LiveMetricCard
                  label="Latest Quake"
                  value={
                    geohazardsSnapshot?.latestMagnitude !== undefined
                      ? `M${geohazardsSnapshot.latestMagnitude}`
                      : "Unavailable"
                  }
                  detail={
                    geohazardsSnapshot?.latestPlace ??
                    "Most recent nearby earthquake from USGS."
                  }
                />
                <LiveMetricCard
                  label="Wildfires Open"
                  value={
                    wildfireSnapshot?.activeEventCount !== undefined
                      ? String(wildfireSnapshot.activeEventCount)
                      : "Unavailable"
                  }
                  detail="Nearby open wildfire events from NASA EONET."
                />
                <LiveMetricCard
                  label="Latest Fire"
                  value={wildfireSnapshot?.latestSource ?? "Unavailable"}
                  detail={
                    wildfireSnapshot?.latestEventTitle ??
                    "Most recent nearby open wildfire event."
                  }
                />
                <LiveMetricCard
                  label="Species Seen"
                  value={
                    biodiversitySnapshot?.distinctSpeciesCount !== undefined
                      ? String(biodiversitySnapshot.distinctSpeciesCount)
                      : "Unavailable"
                  }
                  detail="Distinct species represented in recent GBIF local occurrence records."
                />
                <LiveMetricCard
                  label="Bio Records"
                  value={
                    biodiversitySnapshot?.occurrenceCount !== undefined
                      ? String(biodiversitySnapshot.occurrenceCount)
                      : "Unavailable"
                  }
                  detail={
                    biodiversitySnapshot?.featuredSpecies?.length
                      ? `Examples: ${biodiversitySnapshot.featuredSpecies.join(", ")}`
                      : "Recent biodiversity occurrence records in the local search area."
                  }
                />
                <LiveMetricCard
                  label="Earth Updated"
                  value={formatTimestamp(earthSnapshot?.hourlyTime)}
                  detail="Most recent hourly timestamp from the earth-systems layer."
                />
                </div>
              </>
            ) : null}
            {environmentState.data?.warning ? (
              <p className="warning-text">{environmentState.data.warning}</p>
            ) : null}
          </article>
        </div>

        {liveSourceNotes.length > 0 ? (
          <div className="provider-source-grid">
            {liveSourceNotes.map((provider) => (
              <article className="card source-card" key={provider.id}>
                <h3>{provider.name}</h3>
                <p>{provider.notes[0]}</p>
                <a className="source-link" href={provider.citationUrl} target="_blank" rel="noreferrer">
                  View citation source
                </a>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <RegionComparePanel
        snapshots={compareState.data}
        loading={compareState.loading}
      />

      <section className="section" id={metricsSection.id}>
        <SectionHeader section={metricsSection} />
        <div className="metric-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <section className="section" id={domainsSection.id}>
        <SectionHeader section={domainsSection} />
        <div className="domain-grid">
          {domains.map((domain) => (
            <DomainCardView key={domain.title} domain={domain} />
          ))}
        </div>
      </section>

      <section className="section" id={workflowSection.id}>
        <SectionHeader section={workflowSection} />
        <div className="workflow-grid">
          {workflow.map((step, index) => (
            <WorkflowCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </section>

      <section className="section" id={capabilitiesSection.id}>
        <SectionHeader section={capabilitiesSection} />
        <div className="capability-grid">
          {capabilities.map((item) => (
            <CapabilityCardView key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="section" id={sourcesSection.id}>
        <SectionHeader section={sourcesSection} />
        <div className="source-grid">
          {sources.map((source) => (
            <SourceCard key={source.label} source={source} />
          ))}
        </div>
      </section>
    </main>
  );
}
