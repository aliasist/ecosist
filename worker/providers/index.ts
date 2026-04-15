import type { DataProvider, RuntimeEnv } from "../types";
import { createBiologyProvider } from "./biology";
import { createBiodiversityProvider } from "./biodiversity";
import { createClimateProvider } from "./climate";
import { createEarthSystemsProvider } from "./earthSystems";
import { createElectricityMapsProvider } from "./electricityMaps";
import { createGeohazardsProvider } from "./geohazards";
import { createWeatherProvider } from "./weather";
import { createWildfireProvider } from "./wildfire";

export function createProviders(env: RuntimeEnv): DataProvider[] {
  return [
    createElectricityMapsProvider(env),
    createWeatherProvider(),
    createEarthSystemsProvider(),
    createClimateProvider(),
    createGeohazardsProvider(),
    createWildfireProvider(),
    createBiodiversityProvider(),
    createBiologyProvider(),
  ];
}
