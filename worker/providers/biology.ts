import type { DataProvider } from "../types";

export function createBiologyProvider(): DataProvider {
  return {
    descriptor: {
      id: "biology-ecology",
      name: "Biology and Ecology Layer",
      category: "biology",
      health: "planned",
      live: false,
      citationUrl: "https://www.gbif.org/",
      notes: [
        "Reserved for biodiversity, habitat, and species-level datasets.",
        "Structured as a separate provider so biology feeds can scale independently.",
      ],
    },
  };
}
