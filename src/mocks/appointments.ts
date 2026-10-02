import type {
  Appointment,
  AppointmentCancellation,
  AppointmentId,
  AppointmentModality,
  AppointmentStatus,
} from "@/features/appointments/types";
import type { PaymentStatus } from "@/features/payments/types";
import { mockDateTime, mockSessionEnd } from "./mock-dates";
import { getMockPatient } from "./patients";

type WeeklySchedule = {
  patientId: string;
  dayOffset: number;
  time: string;
  modality: AppointmentModality;
  firstWeek: number;
  lastWeek: number;
  pendingWeeks?: readonly number[];
  exceptions?: Readonly<
    Record<
      number,
      {
        status: AppointmentStatus;
        cancellation?: Omit<AppointmentCancellation, "cancelledAt">;
        paymentStatus?: PaymentStatus;
      }
    >
  >;
};

const WEEKLY_SCHEDULES: readonly WeeklySchedule[] = [
  {
    patientId: "patient-mariana",
    dayOffset: 4,
    time: "09:00",
    modality: "online",
    firstWeek: -8,
    lastWeek: 3,
    pendingWeeks: [-1],
    exceptions: {
      [-3]: {
        status: "cancelled",
        cancellation: {
          cancelledBy: "patient",
          reason: "Problema de saúde: gripe forte, sem condições de conversar.",
          isLateCancellation: false,
        },
        paymentStatus: "waived",
      },
    },
  },
  {
    patientId: "patient-rafael",
    dayOffset: 0,
    time: "15:00",
    modality: "in_person",
    firstWeek: -8,
    lastWeek: 3,
    pendingWeeks: [-1, -2],
  },
  {
    patientId: "patient-beatriz",
    dayOffset: 0,
    time: "17:00",
    modality: "online",
    firstWeek: -6,
    lastWeek: 3,
    exceptions: {
      [-2]: {
        status: "cancelled",
        cancellation: {
          cancelledBy: "patient",
          reason:
            "Compromisso de trabalho: reunião marcada de última hora no estágio.",
          isLateCancellation: true,
        },
        paymentStatus: "paid",
      },
    },
  },
  {
    patientId: "patient-joao",
    dayOffset: 1,
    time: "14:00",
    modality: "in_person",
    firstWeek: -8,
    lastWeek: 3,
    exceptions: {
      [-4]: { status: "no_show", paymentStatus: "paid" },
    },
  },
  {
    patientId: "patient-carla",
    dayOffset: 0,
    time: "10:00",
    modality: "in_person",
    firstWeek: -8,
    lastWeek: 3,
    exceptions: {
      [1]: {
        status: "cancelled",
        cancellation: {
          cancelledBy: "psychologist",
          reason: "Viagem: participação no Congresso de Psicologia.",
          isLateCancellation: false,
        },
        paymentStatus: "waived",
      },
    },
  },
  {
    patientId: "patient-lucas",
    dayOffset: 2,
    time: "18:00",
    modality: "online",
    firstWeek: -4,
    lastWeek: 3,
    pendingWeeks: [-1],
  },
];

const MEETING_URL = "https://meet.jit.si/diva-sessao";
const CANCELLATION_LEAD_DAYS = 2;

function getDefaultStatus(week: number, dayOffset: number): AppointmentStatus {
  const sessionDay = week * 7 + dayOffset;
  if (sessionDay < 0) return "completed";
  return sessionDay <= 2 ? "confirmed" : "scheduled";
}

function buildAppointment(schedule: WeeklySchedule, week: number): Appointment {
  const patient = getMockPatient(schedule.patientId);
  const sessionDay = week * 7 + schedule.dayOffset;
  const startsAt = mockDateTime(sessionDay, schedule.time);
  const exception = schedule.exceptions?.[week];
  const status =
    exception?.status ?? getDefaultStatus(week, schedule.dayOffset);
  const isPending =
    status !== "completed" || schedule.pendingWeeks?.includes(week);

  return {
    id: `appointment-${schedule.patientId}-${week}` as AppointmentId,
    patientId: patient.id,
    patientName: patient.fullName,
    startsAt,
    endsAt: mockSessionEnd(startsAt),
    modality: schedule.modality,
    status,
    priceCents: patient.sessionPriceCents,
    paymentStatus: exception?.paymentStatus ?? (isPending ? "pending" : "paid"),
    meetingUrl: schedule.modality === "online" ? MEETING_URL : null,
    cancellation: exception?.cancellation
      ? {
          ...exception.cancellation,
          cancelledAt: mockDateTime(
            sessionDay -
              (exception.cancellation.isLateCancellation
                ? 0
                : CANCELLATION_LEAD_DAYS),
            "08:30",
          ),
        }
      : null,
  };
}

export const mockAppointments: Appointment[] = WEEKLY_SCHEDULES.flatMap(
  (schedule) =>
    Array.from(
      { length: schedule.lastWeek - schedule.firstWeek + 1 },
      (_, index) => buildAppointment(schedule, schedule.firstWeek + index),
    ),
).sort((first, second) => first.startsAt.localeCompare(second.startsAt));
