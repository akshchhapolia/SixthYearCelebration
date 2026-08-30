import { EVENT } from "../config";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toUtcStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function slotRange(slot) {
  const [hours, minutes] = slot.time.split(":").map(Number);
  const start = new Date(`${EVENT.date}T${pad(hours)}:${pad(minutes)}:00+05:30`);
  const end = new Date(start.getTime() + EVENT.durationMinutes * 60 * 1000);
  return { start, end };
}

function salonLink(ticket) {
  return ticket.meetLink || EVENT.meetLink;
}

export function googleCalendarUrl(ticket) {
  const { start, end } = slotRange(ticket.slot);
  const meet = salonLink(ticket);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENT.title} — ${ticket.slot.name}`,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: `Your reserved hour for ${EVENT.title}.\n\nJoin: ${meet}\n\n${ticket.note || "A private salon. One seat. Yours."}`,
    location: meet,
    ctz: EVENT.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(ticket) {
  const { start, end } = slotRange(ticket.slot);
  const meet = salonLink(ticket);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Song & Verse//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${ticket.code}@song-and-verse`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${EVENT.title} — ${ticket.slot.name}`,
    `DESCRIPTION:Join the salon: ${meet}`,
    `LOCATION:${meet}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "song-and-verse.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export function ticketCode(name, slotId) {
  const seed = `${name}-${slotId}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `SV-${seed.slice(0, 3)}${slotId.slice(0, 2).toUpperCase()}${String(seed.length).padStart(2, "0")}`;
}
