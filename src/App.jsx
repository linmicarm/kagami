import { useState, useEffect, useRef } from "react";
import { getReflection } from "./lib/reflect";
import {
  currentSeason,
  formatEntryDate,
  loadEntries,
  saveEntry,
} from "./lib/journal";

export default function App() {
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState("idle"); // idle | reflecting | done
  const [reflection, setReflection] = useState(null);
  const [history, setHistory] = useState([]);
  const reflectionRef = useRef(null);

  const season = currentSeason();
  const today = formatEntryDate();

  useEffect(() => {
    setHistory(loadEntries());
  }, []);

  useEffect(() => {
    if (status === "done" && reflectionRef.current) {
      reflectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [status]);

  async function handleReflect() {
    const text = entry.trim();
    if (!text || status === "reflecting") return;

    setStatus("reflecting");
    setReflection(null);

    const result = await getReflection(text);
    setReflection(result);
    setStatus("done");

    // Save to light history (we don't store the support/error responses as
    // "reflections" — the entry itself is what's kept).
    const saved = {
      id: Date.now(),
      text,
      date: today,
      season,
      responseKind: result.kind,
    };
    setHistory(saveEntry(saved));
  }

  function startFresh() {
    setEntry("");
    setReflection(null);
    setStatus("idle");
  }

  const isSupport = reflection?.kind === "support";
  const kicker = isSupport
    ? "a moment to pause"
    : reflection?.kind === "error"
    ? "the mirror clouded"
    : "a gentle reflection";

  return (
    <div className="app">
      <header className="masthead">
        <div className="wordmark">
          <span className="kanji">鏡</span>Kagami
        </div>
        <div className="tagline">a gentle mirror for your day</div>
        <div className="season-chip">
          <span className="dot" />
          {season} · {today}
        </div>
      </header>

      <main>
        <section className="entry-card">
          <div className="entry-label">today's entry</div>
          <textarea
            className="entry-input"
            placeholder="How are you, really? Write as much or as little as you like…"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            disabled={status === "reflecting"}
            aria-label="Write your journal entry"
          />
          <div className="entry-footer">
            <span className="char-hint">
              {status === "done" ? "saved to your history" : "just for you"}
            </span>
            {status === "done" ? (
              <button className="reflect-btn" onClick={startFresh}>
                new entry
              </button>
            ) : (
              <button
                className="reflect-btn"
                onClick={handleReflect}
                disabled={!entry.trim() || status === "reflecting"}
              >
                {status === "reflecting" ? "reflecting…" : "reflect"}
              </button>
            )}
          </div>
        </section>

        {(status === "reflecting" || reflection) && (
          <div className="mirror" ref={reflectionRef}>
            {status === "reflecting" && (
              <div className="reflecting">
                <span className="ripple" />
                looking into it…
              </div>
            )}
            {reflection && status === "done" && (
              <div className={`reflection-card ${isSupport ? "support" : ""}`}>
                <div className="reflection-head">
                  <span className="reflection-badge">{isSupport ? "♡" : "✿"}</span>
                  <span className="reflection-kicker">{kicker}</span>
                </div>
                <p className="reflection-body">{reflection.body}</p>
                {!isSupport && reflection.kind !== "error" && (
                  <p className="reflection-disclaimer">
                    a reflective space, not medical or mental-health advice
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <section className="history">
          <div className="history-label">past reflections</div>
          {history.length === 0 ? (
            <p className="history-empty">
              Your entries will gather here, quietly. Nothing to look back on just yet.
            </p>
          ) : (
            <div className="history-list">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="history-item"
                  tabIndex={0}
                  role="button"
                  onClick={() => setEntry(h.text)}
                  onKeyDown={(e) => e.key === "Enter" && setEntry(h.text)}
                >
                  <div className="history-meta">
                    <span>{h.date}</span>
                    <span>·</span>
                    <span className="history-season">{h.season}</span>
                  </div>
                  <div className="history-snippet">{h.text}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
