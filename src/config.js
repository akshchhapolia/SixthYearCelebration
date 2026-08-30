/** Change the Meet link before you send this to her. */
export const EVENT = {
  title: "Song & Verse",
  subtitle: "A private evening of poetry and song",
  date: "2026-09-01",
  dateLabel: "Monday, 1 September 2026",
  shortDate: "1 September 2026",
  venue: "Google Meet",
  venueNote: "A private salon — the link is on your ticket",
  durationMinutes: 60,
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  seats: 1,
  meetLink: "https://meet.google.com/kmj-xcrx-xnf",
  guestName: "Sakshi",
  guestNote:
    "You are the love of my life — every song I know, every line I keep, finds its way back to you.",
};

export function meetCode(link = EVENT.meetLink) {
  return link.replace(/^https?:\/\/meet\.google\.com\//, "");
}
