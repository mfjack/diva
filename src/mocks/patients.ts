import type { Patient, PatientId } from "@/features/patients/types";
import type { Cents } from "@/lib/money";
import { mockDateKey, mockDateTime } from "./mock-dates";

type MockPatientSeed = Pick<Patient, "fullName" | "status"> &
  Partial<Omit<Patient, "id" | "fullName" | "status">>;

function patient(id: string, seed: MockPatientSeed): Patient {
  return {
    id: id as PatientId,
    email: null,
    phone: null,
    birthDate: null,
    cpf: null,
    sessionPriceCents: 22000 as Cents,
    healthInsurance: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    notes: null,
    startedAt: mockDateKey(-180),
    nextAppointmentAt: null,
    completedSessionCount: 0,
    pendingAmountCents: 0 as Cents,
    ...seed,
  };
}

export const CURRENT_PATIENT_ID = "patient-mariana" as PatientId;

export const mockPatients: Patient[] = [
  patient("patient-mariana", {
    fullName: "Mariana Costa",
    status: "active",
    email: "mariana.costa@email.com",
    phone: "11987654321",
    birthDate: "1994-03-12",
    cpf: "52998224725",
    healthInsurance: "SulAmérica (reembolso)",
    emergencyContactName: "Paulo Costa (irmão)",
    emergencyContactPhone: "11991234567",
    notes: "Prefere atendimento às segundas pela manhã.",
    startedAt: mockDateKey(-240),
    nextAppointmentAt: mockDateTime(4, "09:00"),
    completedSessionCount: 31,
    pendingAmountCents: 22000 as Cents,
  }),
  patient("patient-rafael", {
    fullName: "Rafael Nogueira",
    status: "active",
    email: "rafael.nogueira@email.com",
    phone: "11976543210",
    birthDate: "1988-07-21",
    sessionPriceCents: 18000 as Cents,
    startedAt: mockDateKey(-120),
    nextAppointmentAt: mockDateTime(0, "15:00"),
    completedSessionCount: 15,
    pendingAmountCents: 36000 as Cents,
  }),
  patient("patient-beatriz", {
    fullName: "Beatriz Almeida",
    status: "active",
    email: "bia.almeida@email.com",
    phone: "21998761234",
    birthDate: "2001-11-02",
    sessionPriceCents: 12000 as Cents,
    notes: "Valor social combinado até o fim da faculdade.",
    startedAt: mockDateKey(-60),
    nextAppointmentAt: mockDateTime(0, "17:00"),
    completedSessionCount: 8,
  }),
  patient("patient-joao", {
    fullName: "João Pedro Lima",
    status: "active",
    email: "jp.lima@email.com",
    phone: "11955554444",
    birthDate: "2009-05-30",
    emergencyContactName: "Cláudia Lima (mãe)",
    emergencyContactPhone: "11944443333",
    startedAt: mockDateKey(-90),
    nextAppointmentAt: mockDateTime(1, "14:00"),
    completedSessionCount: 11,
  }),
  patient("patient-carla", {
    fullName: "Carla Mendes",
    status: "active",
    email: "carla.mendes@email.com",
    phone: "11933332222",
    birthDate: "1979-01-15",
    healthInsurance: "Bradesco Saúde (reembolso)",
    startedAt: mockDateKey(-300),
    nextAppointmentAt: mockDateTime(0, "10:00"),
    completedSessionCount: 40,
  }),
  patient("patient-lucas", {
    fullName: "Lucas Ferreira",
    status: "active",
    email: "lucas.f@email.com",
    phone: "11922221111",
    birthDate: "1996-09-08",
    startedAt: mockDateKey(-30),
    nextAppointmentAt: mockDateTime(2, "18:00"),
    completedSessionCount: 4,
    pendingAmountCents: 22000 as Cents,
  }),
  patient("patient-ana", {
    fullName: "Ana Luísa Rocha",
    status: "paused",
    email: "analuisa@email.com",
    phone: "11911110000",
    birthDate: "1990-12-19",
    notes: "Pausa por viagem de trabalho. Retorno previsto em dois meses.",
    startedAt: mockDateKey(-400),
    completedSessionCount: 52,
  }),
  patient("patient-tiago", {
    fullName: "Tiago Martins",
    status: "discharged",
    email: "tiago.martins@email.com",
    phone: "11900009999",
    birthDate: "1985-04-04",
    startedAt: mockDateKey(-500),
    completedSessionCount: 64,
  }),
];

export function findMockPatient(patientId: string): Patient | undefined {
  return mockPatients.find((mockPatient) => mockPatient.id === patientId);
}

export function getMockPatient(patientId: string): Patient {
  const mockPatient = findMockPatient(patientId);
  if (!mockPatient) throw new Error(`Unknown mock patient: ${patientId}`);
  return mockPatient;
}
