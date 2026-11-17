import "server-only";

import {
  getMockPracticeSettings,
  listMockAvailabilityBlocks,
  listMockAvailabilityRules,
} from "@/mocks/practice";
import type {
  AvailabilityBlock,
  AvailabilityRule,
  PracticeSettings,
} from "./types";

export async function getPracticeSettings(): Promise<PracticeSettings> {
  return getMockPracticeSettings();
}

export async function listAvailabilityRules(): Promise<AvailabilityRule[]> {
  return listMockAvailabilityRules();
}

export async function listAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
  return listMockAvailabilityBlocks();
}
