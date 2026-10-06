import type { AdminLead, LeadAppointment } from "./admin-types";
export function currentConsultation(appointments: LeadAppointment[] = []) {
  const ordered = [...appointments].sort((a, b) => b.starts_at.localeCompare(a.starts_at) || b.id.localeCompare(a.id));
  return ordered.find((item) => item.status === "scheduled") || ordered.find((item) => !item.rescheduled) || ordered[0] || null;
}
export function consultationLabel(lead: AdminLead) {
  if (lead.consultation_sync_available === false) return "Consultation data unavailable";
  const appointment = currentConsultation(lead.appointments);
  if (!appointment) return "No linked consultation";
  if (appointment.status === "canceled" && appointment.rescheduled) return "Consult rescheduled · awaiting replacement";
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }).format(new Date(appointment.starts_at));
  return `Consult${appointment.status === "canceled" ? " canceled" : ""}: ${date}`;
}
