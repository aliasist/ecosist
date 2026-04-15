import type { RuntimeEnv } from "../../types";
import type { PriceProvider } from "../types";
import { createElectricityMapsPriceProvider } from "./electricityMaps";
import { createUsIsoPriceProvider } from "./usIso";

export function createPriceProviders(env: RuntimeEnv): PriceProvider[] {
  return [
    createUsIsoPriceProvider(),
    createElectricityMapsPriceProvider(env),
  ];
}
