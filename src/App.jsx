import { useMemo, useState } from "react";
import { EVENT, meetCode } from "./config";
import { SLOTS } from "./data/slots";
import { clearTicket, loadTicket, saveTicket } from "./lib/storage";
import { downloadIcs, googleCalendarUrl, ticketCode } from "./lib/calendar";

const STEPS = [
  { id: "details", label: "Evening" },
  { id: "slots", label: "Time" },
];

export default function App() {
  const existing = useMemo(() => {
    const stored = loadTicket();
    if (!stored) return null;
    return {
      ...stored,
      name: EVENT.guestName,
      note: EVENT.guestNote,
      meetLink: stored.meetLink || EVENT.meetLink,
    };
  }, []);
  const [screen, setScreen] = useState(existing ? "ticket" : "home");
  const [step, setStep] = useState("details");
  const [slotId, setSlotId] = useState(existing?.slot.id ?? "");
  const [ticket, setTicket] = useState(existing);

  const slot = SLOTS.find((item) => item.id === slotId);

  function startBooking() {
    setScreen("book");
    setStep("details");
  }

  function issueTicket(chosen = slot) {
    if (!chosen) return;

    const issued = {
      name: EVENT.guestName,
      note: EVENT.guestNote,
      slot: chosen,
      meetLink: EVENT.meetLink,
      code: ticketCode(EVENT.guestName, chosen.id),
      issuedAt: new Date().toISOString(),
    };

    saveTicket(issued);
    setTicket(issued);
    setScreen("ticket");
  }

  function goHome() {
    setScreen("home");
  }

  function rebook() {
    clearTicket();
    setTicket(null);
    setSlotId("");
    setStep("details");
    setScreen("home");
  }

  return (
    <div className="app">
      <div className="wash" aria-hidden="true" />
      <Header onLogo={goHome} />

      <main className="shell">
        {screen === "home" && <Home onBook={startBooking} />}
        {screen === "book" && (
          <Booking
            step={step}
            setStep={setStep}
            slot={slot}
            slotId={slotId}
            setSlotId={setSlotId}
            onIssue={issueTicket}
            onHome={goHome}
          />
        )}
        {screen === "ticket" && ticket && (
          <TicketView ticket={ticket} onRebook={rebook} />
        )}
      </main>

      <footer className="footer">
        <span>{EVENT.shortDate}</span>
        <span className="dot">·</span>
        <span>One seat · one evening</span>
      </footer>
    </div>
  );
}

function Header({ onLogo }) {
  return (
    <header className="header">
      <button className="brand" type="button" onClick={onLogo} aria-label="Back to home">
        <span className="mark">S</span>
        <span className="brand-text">
          <strong>Song &amp; Verse</strong>
          <small>Private salon</small>
        </span>
      </button>
      <p className="header-meta">1 Sep · Meet</p>
    </header>
  );
}

function Home({ onBook }) {
  return (
    <section className="home fade-in">
      <p className="kicker">Invitation · admit one</p>
      <h1>
        An evening of
        <em> song and verse</em>
      </h1>
      <p className="lead">
        A quiet hour of poetry and singing, reserved for Sakshi.
        Choose your time, collect your ticket, and step into a private
        Google Meet salon.
      </p>

      <article className="event-card">
        <div className="poster">
          <img
            src={`${import.meta.env.BASE_URL}music-night.png`}
            alt="Music night with Sukiiiiiiii — 1 September, Google Meet"
          />
        </div>

        <ul className="facts">
          <li>
            <span>When</span>
            {EVENT.dateLabel}
          </li>
          <li>
            <span>Where</span>
            {EVENT.venueNote}
          </li>
          <li>
            <span>Length</span>
            {EVENT.durationMinutes} minutes
          </li>
          <li>
            <span>Seats</span>
            Reserved for Sakshi
          </li>
        </ul>

        <div className="acts">
          <div>
            <span>Act I</span>
            <strong>Verse</strong>
            <p>Poems read slowly, the way evening settles on a page.</p>
          </div>
          <div>
            <span>Act II</span>
            <strong>Song</strong>
            <p>A handful of pieces, sung as if the room were only ours.</p>
          </div>
        </div>

        <button className="btn btn-primary" type="button" onClick={onBook}>
          Reserve a time
          <span aria-hidden="true">→</span>
        </button>
      </article>
    </section>
  );
}

function Booking({
  step,
  setStep,
  slot,
  slotId,
  setSlotId,
  onIssue,
  onHome,
}) {
  const index = STEPS.findIndex((item) => item.id === step);

  return (
    <section className="booking fade-in">
      <ol className="steps" aria-label="Booking steps">
        {STEPS.map((item, i) => (
          <li
            key={item.id}
            className={
              item.id === step ? "is-current" : i < index ? "is-done" : ""
            }
          >
            <span>{i + 1}</span>
            {item.label}
          </li>
        ))}
      </ol>

      {step === "details" && (
        <div className="panel">
          <h2>The evening</h2>
          <p className="lead">
            Two acts. One seat. You pick the hour that feels like yours —
            the way you would choose a showing at a small theatre.
          </p>
          <div className="acts">
            <div>
              <span>Act I</span>
              <strong>Verse</strong>
              <p>Poetry, unhurried.</p>
            </div>
            <div>
              <span>Act II</span>
              <strong>Song</strong>
              <p>A private recital.</p>
            </div>
          </div>
          <div className="row">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={onHome}
            >
              Home
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setStep("slots")}
            >
              Choose a time
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}

      {step === "slots" && (
        <div className="panel">
          <h2>Select a time</h2>
          <p className="lead">
            All hours are on {EVENT.shortDate}, {EVENT.timezoneLabel}.
            Each showing is {EVENT.durationMinutes} minutes.
          </p>
          <div className="slot-grid" role="listbox" aria-label="Available hours">
            {SLOTS.map((item) => {
              const selected = item.id === slotId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`slot ${selected ? "is-selected" : ""}`}
                  onClick={() => setSlotId(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.name}</span>
                  <small>{item.blurb}</small>
                </button>
              );
            })}
          </div>
          <div className="row">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setStep("details")}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={!slot}
              onClick={() => onIssue(slot)}
            >
              Issue my ticket
              <span aria-hidden="true">✦</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TicketView({ ticket, onRebook }) {
  const salon = ticket.meetLink || EVENT.meetLink;

  return (
    <section className="ticket-screen fade-in">
      <p className="kicker">Admission granted</p>
      <h2>Your ticket</h2>
      <p className="lead">Your hour is reserved. The salon door is on this pass.</p>

      <article className="ticket" aria-label="Evening ticket">
        <div className="ticket-art">
          <img
            src={`${import.meta.env.BASE_URL}music-night.png`}
            alt="Music night with Sukiiiiiiii — 1 September, Google Meet"
          />
        </div>
        <div className="ticket-body">
          <div className="ticket-main">
            <p className="ticket-kicker">Private salon · Song &amp; Verse</p>
            <h3>{ticket.name}</h3>
            <p className="ticket-act">
              {ticket.slot.name} · {ticket.slot.blurb}
            </p>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>{EVENT.shortDate}</dd>
              </div>
              <div>
                <dt>Hour</dt>
                <dd>
                  {ticket.slot.label || ticket.slot.time} {EVENT.timezoneLabel}
                </dd>
              </div>
              <div>
                <dt>House</dt>
                <dd>{EVENT.venue}</dd>
              </div>
            </dl>
            {ticket.note && (
              <p className="ticket-note">
                “{ticket.note}”
                <small>for you, always</small>
              </p>
            )}
            <a className="ticket-meet" href={salon} target="_blank" rel="noreferrer">
              <span>Google Meet</span>
              <strong>{meetCode(salon)}</strong>
              <small>{salon.replace(/^https?:\/\//, "")}</small>
            </a>
          </div>
          <div className="ticket-stub">
            <p>Admit one</p>
            <div className="code-mark" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <strong>{ticket.code}</strong>
          </div>
        </div>
      </article>

      <div className="ticket-actions">
        <a
          className="btn btn-primary"
          href={salon}
          target="_blank"
          rel="noreferrer"
        >
          Join Google Meet
          <span aria-hidden="true">↗</span>
        </a>
        <a
          className="btn btn-ghost"
          href={googleCalendarUrl(ticket)}
          target="_blank"
          rel="noreferrer"
        >
          Add to calendar
        </a>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => downloadIcs(ticket)}
        >
          Download .ics
        </button>
      </div>

      <p className="whisper">
        Come a minute early. The lights will already be low.
      </p>
      <button className="text-btn" type="button" onClick={onRebook}>
        Book again — back to home
      </button>
    </section>
  );
}
