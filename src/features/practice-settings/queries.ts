import "server-only";

import {
  mockAvailabilityBlocks,
  mockAvailabilityRules,
  mockPracticeSettings,
} from "@/mocks/practice";
import type {
  AvailabilityBlock,
  AvailabilityRule,
  PracticeSettings,
} from "./types";

export async function getPracticeSettings(): Promise<PracticeSettings> {
  return mockPracticeSettings;
}

export async function listAvailabilityRules(): Promise<AvailabilityRule[]> {
  return mockAvailabilityRules;
}

export async function listAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
  return mockAvailabilityBlocks;
}
