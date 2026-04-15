import type { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  productName: "EcoSist",
  tagline: "Environmental intelligence built around Electricity Maps.",
  description:
    "A configurable environmental platform for reading grid emissions in context with climate, earth systems, biology, and ecosystem health data.",
  heroPanel: {
    title: "Scaling posture",
    bullets: [
      "Electricity Maps is the primary live energy layer.",
      "Earth and biology feeds add ecological context.",
      "The page is driven from a central site configuration object.",
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
    title: "Live system and provider readiness",
    description:
      "This section reads from the Worker API so the frontend can reflect provider health, key configuration, and live environment snapshots.",
  },
  metricsSection: {
    id: "metrics",
    eyebrow: "Snapshot",
    title: "Example metrics for the first dashboard pass",
    description:
      "These sample values are placeholders today, but the section contract is ready for live API-backed metrics later.",
  },
  domainsSection: {
    id: "domains",
    eyebrow: "Coverage",
    title: "Three core data domains",
    description:
      "Each domain is defined as structured content so new categories can be added without changing the rendering logic.",
  },
  workflowSection: {
    id: "workflow",
    eyebrow: "Pipeline",
    title: "How the app should evolve from scaffold to live product",
    description:
      "The workflow cards map directly to the backend and data-normalization work that comes next.",
  },
  capabilitiesSection: {
    id: "capabilities",
    eyebrow: "Scaling",
    title: "Customization points for growth",
    description:
      "The app is set up so branding, page sections, and future data modules can be extended through configuration instead of rewrites.",
  },
  sourcesSection: {
    id: "sources",
    eyebrow: "Attribution",
    title: "Source handling",
    description:
      "Citations stay visible as the data surface area grows across power, climate, land, water, and biology.",
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
      "radial-gradient(circle at top, rgba(55, 130, 95, 0.22), transparent 42%), linear-gradient(180deg, #0a1712 0%, #08120f 100%)",
    cardBackground: "rgba(9, 26, 20, 0.82)",
    cardBorder: "rgba(129, 187, 154, 0.18)",
    accent: "#8fd6ac",
    accentStrong: "#98e3b7",
    textPrimary: "#e5f2ea",
    textSecondary: "#c0d7cc",
  },
};
