import { formatLongDate, formatTime } from "@/lib/format";
import type { Appointment } from "./types";

export function resolveMeetingUrl(
  appointment: Pick<Appointment, "modality" | "meetingUrl">,
  practiceMeetingUrl: string | null,
): string | null {
  if (appointment.modality !== "online") return null;
  return appointment.meetingUrl ?? practiceMeetingUrl;
}

export function buildMeetingLinkMessage(
  appointment: Pick<Appointment, "patientName" | "startsAt">,
  meetingUrl: string,
): string {
  const firstName = appointment.patientName.trim().split(/\s+/)[0] ?? "";
  return [
    `Olá, ${firstName}! Tudo bem?`,
    `Segue o link da nossa sessão online de ${formatLongDate(appointment.startsAt)}, às ${formatTime(appointment.startsAt)}:`,
    meetingUrl,
    "Se a sala pedir para aguardar, é só esperar que eu libero a entrada.",
  ].join("\n\n");
}
