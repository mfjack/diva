import { describe, expect, it } from "vitest";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type {
  ClinicalRecordId,
  ClinicalRecordSummary,
} from "@/features/clinical-records/types";
import type { PatientId } from "@/features/patients/types";
import type { Payment, PaymentId } from "@/features/payments/types";
import type { Cents } from "@/lib/money";
import {
  buildSessionHistory,
  getSessionPaymentFilter,
} from "./session-history";

const NOW = "2026-11-25T15:00:00.000Z";
const PATIENT_ID = "patient-1" as PatientId;

function appointment(id: string, startsAt: string): Appointment {
  return {
    id: id as AppointmentId,
    patientId: PATIENT_ID,
    patientName: "Mariana Costa",
    seriesId: null,
    startsAt,
    endsAt: startsAt,
    modality: "online",
    status: "confirmed",
    priceCents: 15000 as Cents,
    paymentStatus: "pending",
    meetingUrl: null,
    cancellation: null,
  };
}

function payment(
  appointmentId: string,
  overrides: Pick<Payment, "status" | "dueDate">,
): Payment {
  return {
    id: `payment-${appointmentId}` as PaymentId,
    appointmentId: appointmentId as AppointmentId,
    patientId: PATIENT_ID,
    patientName: "Mariana Costa",
    patientPhone: null,
    sessionStartsAt: NOW,
    amountCents: 15000 as Cents,
    method: null,
    paidAt: null,
    ...overrides,
  };
}

function record(
  id: string,
  appointmentId: string | null,
): ClinicalRecordSummary {
  return {
    id: id as ClinicalRecordId,
    patientId: PATIENT_ID,
    patientName: "Mariana Costa",
    appointmentId: appointmentId as AppointmentId | null,
    sessionStartsAt: null,
    title: "Anotação",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("buildSessionHistory", () => {
  it("joins each past session with its payment and record, newest first", () => {
    const history = buildSessionHistory({
      appointments: [
        appointment("older", "2026-11-04T22:00:00.000Z"),
        appointment("newer", "2026-11-18T22:00:00.000Z"),
      ],
      payments: [payment("older", { status: "paid", dueDate: "2026-11-04" })],
      records: [record("record-newer", "newer"), record("loose", null)],
      now: NOW,
    });

    expect(
      history.entries.map(
        ({
          appointment: { id },
          payment: linkedPayment,
          record: linkedRecord,
        }) => [id, linkedPayment?.status ?? null, linkedRecord?.id ?? null],
      ),
    ).toEqual([
      ["newer", null, "record-newer"],
      ["older", "paid", null],
    ]);
    expect(history.unlinkedRecords.map(({ id }) => id)).toEqual(["loose"]);
  });

  it("keeps upcoming sessions only when they are already paid or due", () => {
    const history = buildSessionHistory({
      appointments: [
        appointment("prepaid", "2026-12-02T22:00:00.000Z"),
        appointment("due", "2026-12-09T22:00:00.000Z"),
        appointment("later", "2026-12-16T22:00:00.000Z"),
      ],
      payments: [
        payment("prepaid", { status: "paid", dueDate: "2026-12-01" }),
        payment("due", { status: "pending", dueDate: "2026-11-01" }),
        payment("later", { status: "pending", dueDate: "2026-12-16" }),
      ],
      records: [],
      now: NOW,
    });

    expect(history.entries.map(({ appointment: { id } }) => id)).toEqual([
      "due",
      "prepaid",
    ]);
  });
});

describe("getSessionPaymentFilter", () => {
  const now = new Date(NOW);

  it("splits pending payments into overdue and still to receive", () => {
    expect(
      getSessionPaymentFilter(
        payment("a", { status: "pending", dueDate: "2026-11-10" }),
        now,
      ),
    ).toBe("overdue");
    expect(
      getSessionPaymentFilter(
        payment("b", { status: "pending", dueDate: "2026-12-10" }),
        now,
      ),
    ).toBe("pending");
  });

  it("keeps paid and waived payments as they are", () => {
    expect(
      getSessionPaymentFilter(
        payment("c", { status: "paid", dueDate: "2026-11-10" }),
        now,
      ),
    ).toBe("paid");
    expect(
      getSessionPaymentFilter(
        payment("d", { status: "waived", dueDate: "2026-11-10" }),
        now,
      ),
    ).toBe("waived");
    expect(getSessionPaymentFilter(null, now)).toBeNull();
  });
});
