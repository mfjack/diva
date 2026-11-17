import "server-only";

import type {
  AvailabilityBlock,
  AvailabilityRule,
  PracticeSettings,
} from "@/features/practice-settings/types";
import { getMockDatabase, saveMockDatabase } from "./store";

export function getMockPracticeSettings(): PracticeSettings {
  return getMockDatabase().practiceSettings;
}

export function updateMockPracticeSettings(
  changes: Partial<PracticeSettings>,
): void {
  Object.assign(getMockDatabase().practiceSettings, changes);
  saveMockDatabase();
}

export function listMockAvailabilityRules(): AvailabilityRule[] {
  return getMockDatabase().availabilityRules;
}

export function replaceMockAvailabilityRules(rules: AvailabilityRule[]): void {
  getMockDatabase().availabilityRules = rules;
  saveMockDatabase();
}

export function listMockAvailabilityBlocks(): AvailabilityBlock[] {
  return getMockDatabase().availabilityBlocks;
}

export function insertMockAvailabilityBlock(block: AvailabilityBlock): void {
  getMockDatabase().availabilityBlocks.push(block);
  saveMockDatabase();
}

export function deleteMockAvailabilityBlock(blockId: string): void {
  const database = getMockDatabase();
  database.availabilityBlocks = database.availabilityBlocks.filter(
    ({ id }) => id !== blockId,
  );
  saveMockDatabase();
}
