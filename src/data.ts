import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  productName: "EcoSist",
  tagline: "API-first environmental intelligence for data teams and AI workflows.",
  description:
    "A professional data platform for combining energy, climate, hazard, and biodiversity signals into one API-ready interface for products, dashboards, and agents.",
  heroPanel: {
    title: "Platform posture",
    bullets: [
      "API responses are structured for dashboards, internal tools, and agent workflows.",
      "Live energy, climate, hazard, and biology feeds stay aligned in one surface.",
      "The interface is config-driven so new regions and modules can be added without layout rewrites.",
    ],
  },
  defaultCoordinates: {
    label: "Northern Virginia",
    lat: 38.9531,
    lng: -77.3579,
  },
  coordinatePresets: [
    {
      label: "Northern Virginia",
      lat: 38.9531,
      lng: -77.3579,
    },
    {
      label: "Sao Paulo",
      lat: -23.5505,
      lng: -46.6333,
    },
    {
      label: "Frankfurt",
      lat: 50.1109,
      lng: 8.6821,
    },
  ],
  nav: [
    { label: "Overview", href: "#top" },
    { label: "Operations", href: "#operations" },
    { label: "Domains", href: "#domains" },
    { label: "Pipeline", href: "#workflow" },
    { label: "Scaling", href: "#capabilities" },
    { label: "Sources", href: "#sources" },
  ],
  heroActions: [
    { label: "Explore domains", href: "#domains", variant: "primary" },
    { label: "View live operations", href: "#operations", variant: "secondary" },
  ],
  operationsSection: {
    id: "operations",
    eyebrow: "Operations",
    title: "API health, system readiness, and live environmental reads",
    description:
      "The operations surface reads directly from the Worker API so the frontend reflects provider health, key configuration, and current environmental conditions.",
  },
  metricsSection: {
    id: "metrics",
    eyebrow: "Snapshot",
    title: "Signal framing for product and AI context",
    description:
      "These values show how the platform can frame live environmental data for product, ops, and AI use cases.",
  },
  domainsSection: {
    id: "domains",
    eyebrow: "Coverage",
    title: "Three live API domains",
    description:
      "Each domain is structured content so coverage can expand without rewriting the rendering logic.",
  },
  workflowSection: {
    id: "workflow",
    eyebrow: "Pipeline",
    title: "How the app evolves from shell to platform",
    description:
      "The workflow cards map directly to backend normalization, trust, and API consistency work.",
  },
  capabilitiesSection: {
    id: "capabilities",
    eyebrow: "Scaling",
    title: "System extension points",
    description:
      "Branding, page structure, and future data modules are designed to grow through configuration rather than rewrites.",
  },
  sourcesSection: {
    id: "sources",
    eyebrow: "Attribution",
    title: "Source handling and provenance",
    description:
      "Citations stay visible as the monitored surface area grows across power, climate, land, water, and biology.",
  },
  metrics: [
    {
      label: "Grid Carbon Intensity",
      value: "389 gCO2eq/kWh",
      detail: "Sample Electricity Maps snapshot for a PJM-style zone.",
      trend: "down",
    },
    {
      label: "Renewable Share",
      value: "31%",
      detail: "Designed to ingest live renewable-percentage signals.",
      trend: "up",
    },
    {
      label: "Carbon-Free Share",
      value: "39%",
      detail: "Useful for comparing power quality by geography and time.",
      trend: "up",
    },
    {
      label: "Biodiversity Watch",
      value: "12 tracked indicators",
      detail: "Scaffolded for ecology, species, habitat, and watershed feeds.",
      trend: "steady",
    },
  ],
  domains: [
    {
      title: "Electricity & Emissions",
      summary:
        "Compare live grid carbon intensity, renewable share, and carbon-free share across regions and facilities.",
      feeds: [
        "Electricity Maps zone snapshots",
        "Power mix history",
        "Facility geolocation overlays",
      ],
    },
    {
      title: "Earth Systems",
      summary:
        "Layer climate, atmosphere, water, and land signals next to energy data so users can see environmental context, not just power metrics.",
      feeds: [
        "Air temperature anomalies",
        "Watershed stress and drought indexes",
        "Land cover and wildfire risk",
      ],
    },
    {
      title: "Biology & Ecology",
      summary:
        "Track ecosystem stress, species habitat pressure, pollinator risk, and restoration targets around the regions you monitor.",
      feeds: [
        "Biodiversity hotspot references",
        "Species observation APIs",
        "Conservation or habitat quality datasets",
      ],
    },
  ],
  workflow: [
    {
      title: "Ingest",
      detail:
        "Pull Electricity Maps plus environmental datasets through a server-side API layer so keys stay private.",
    },
    {
      title: "Normalize",
      detail:
        "Convert location, timestamp, units, and taxonomy fields into one shared environmental schema.",
    },
    {
      title: "Visualize",
      detail:
        "Render maps, regional comparison cards, and timeline views tuned for sustainability and earth science storytelling.",
    },
    {
      title: "Cite",
      detail:
        "Keep source attribution visible for Electricity Maps and any biology or earth data provider used in the app.",
    },
  ],
  capabilities: [
    {
      title: "Config-Driven Sections",
      summary:
        "Hero copy, navigation, metrics, domains, workflows, and source notes all come from a single typed configuration object.",
    },
    {
      title: "Theme Tokens",
      summary:
        "Core colors are centralized so future white-labeling or brand variations can happen without redesigning each component.",
    },
    {
      title: "Composable Data Modules",
      summary:
        "New environmental feeds can be added as their own modules while the UI keeps a stable contract for cards, timelines, and maps.",
    },
    {
      title: "API-Ready Frontend",
      summary:
        "The current scaffold is ready for a server-side API layer that can normalize Electricity Maps and future biology datasets.",
    },
  ],
  sources: [
    {
      label: "Electricity Maps",
      detail: "Primary source for live electricity carbon and grid mix context.",
    },
    {
      label: "Earth Data",
      detail:
        "Climate, land, water, and atmosphere providers can be added under the same citation model.",
    },
    {
      label: "Biology Data",
      detail:
        "Biodiversity, habitat, and species-level datasets can be surfaced with explicit attribution.",
    },
  ],
  theme: {
    pageBackground:
      "radial-gradient(circle at top, rgba(74, 114, 148, 0.2), transparent 38%), radial-gradient(circle at 80% 14%, rgba(123, 150, 170, 0.12), transparent 24%), linear-gradient(180deg, #081017 0%, #08120f 48%, #070d12 100%)",
    cardBackground: "rgba(11, 18, 23, 0.82)",
    cardBorder: "rgba(126, 150, 168, 0.2)",
    accent: "#90c6d8",
    accentStrong: "#d6e7ef",
    textPrimary: "#e9eff2",
    textSecondary: "#b8c7ce",
  },
};
