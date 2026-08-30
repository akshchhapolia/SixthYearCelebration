const KEY = "song-and-verse-ticket";

export function loadTicket() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTicket(ticket) {
  localStorage.setItem(KEY, JSON.stringify(ticket));
}

export function clearTicket() {
  localStorage.removeItem(KEY);
}
