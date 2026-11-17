import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Appointment } from "@/features/appointments/types";
import type { AuditLogEntry } from "@/features/audit/record-audit-log";
import type { ClinicalRecord } from "@/features/clinical-records/types";
import type { Expense, ExpensePayment } from "@/features/expenses/types";
import type { Patient } from "@/features/patients/types";
import type { Payment } from "@/features/payments/types";
import type { StudyNote } from "@/features/studies/types";

export type StoredPatient = Omit<
  Patient,
  "nextAppointmentAt" | "completedSessionCount" | "pendingAmountCents"
> & { deletedAt?: string | null };

export type StoredClinicalRecord = Omit<ClinicalRecord, "content"> & {
  encryptedContent: string;
};

export type StoredStudyNote = StudyNote & { deletedAt?: string | null };

export type MockDatabase = {
  patients: StoredPatient[];
  appointments: Appointment[];
  payments: Payment[];
  clinicalRecords: StoredClinicalRecord[];
  expenses: Expense[];
  expensePayments: ExpensePayment[];
  studyNotes: StoredStudyNote[];
  auditLogs: AuditLogEntry[];
};

const DATABASE_FILE = path.join(process.cwd(), ".data", "mock-db.json");

function createEmptyDatabase(): MockDatabase {
  return {
    patients: [],
    appointments: [],
    payments: [],
    clinicalRecords: [],
    expenses: [],
    expensePayments: [],
    studyNotes: [],
    auditLogs: [],
  };
}

function withMissingCollections(database: Partial<MockDatabase>): MockDatabase {
  return Object.assign(database, { ...createEmptyDatabase(), ...database });
}

function loadDatabase(): Partial<MockDatabase> {
  try {
    return JSON.parse(readFileSync(DATABASE_FILE, "utf8"));
  } catch {
    return {};
  }
}

const globalStore = globalThis as typeof globalThis & {
  divaMockDatabase?: Partial<MockDatabase>;
};

export function getMockDatabase(): MockDatabase {
  const database = withMissingCollections(
    globalStore.divaMockDatabase ?? loadDatabase(),
  );
  globalStore.divaMockDatabase = database;
  return database;
}

export function saveMockDatabase(): void {
  mkdirSync(path.dirname(DATABASE_FILE), { recursive: true });
  writeFileSync(DATABASE_FILE, JSON.stringify(getMockDatabase(), null, 2));
}
