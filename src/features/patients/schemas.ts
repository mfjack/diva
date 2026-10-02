import { z } from "zod";
import { isValidCpf, isValidPhone } from "@/lib/masks";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength, "Texto muito longo.");

const optionalPhone = z
  .string()
  .refine(
    (phone) => phone === "" || isValidPhone(phone),
    "Telefone incompleto.",
  );

export const patientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Informe o nome do paciente.")
    .max(120, "Nome muito longo."),
  email: z.union([z.literal(""), z.email("E-mail inválido.")]),
  phone: optionalPhone,
  cpf: z
    .string()
    .refine((cpf) => cpf === "" || isValidCpf(cpf), "CPF inválido."),
  birthDate: z.union([z.literal(""), z.iso.date("Data inválida.")]),
  sessionPrice: z
    .number()
    .nonnegative("O valor não pode ser negativo.")
    .optional(),
  healthInsurance: optionalText(80),
  emergencyContactName: optionalText(120),
  emergencyContactPhone: optionalPhone,
  notes: optionalText(500),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const EMPTY_PATIENT_INPUT: PatientInput = {
  fullName: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  sessionPrice: undefined,
  healthInsurance: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  notes: "",
};
