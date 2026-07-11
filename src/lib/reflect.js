// ─────────────────────────────────────────────────────────────
// Kagami — reflection service
//
// This is the ONE place the app talks to "the model." Right now it
// returns a mocked reflection so the whole UI works with no API key.
// When you're ready, replace the body of `getReflection` with a fetch
// to your serverless proxy (see getReflectionViaProxy below) — nothing
// else in the app has to change.
// ─────────────────────────────────────────────────────────────

// Lightweight, transparent distress check. This is intentionally simple
// and errs toward showing support. It is NOT a diagnostic tool — its only
// job is to decide when Kagami should step back from "reflecting" and
// gently surface real human support instead.
const DISTRESS_SIGNALS = [
  "kill myself", "want to die", "end it all", "suicidal", "suicide",
  "hurt myself", "harm myself", "self harm", "self-harm",
  "no reason to live", "don't want to be here", "better off without me",
  "can't go on", "cant go on",
];

export function screenForDistress(text) {
  const lower = text.toLowerCase();
  return DISTRESS_SIGNALS.some((phrase) => lower.includes(phrase));
}

// The gentle, human response shown instead of an AI reflection when an
// entry signals serious distress. Kagami is explicit here that it is not
// a substitute for real support.
export const SUPPORT_RESPONSE = {
  kind: "support",
  body:
    "It sounds like you're carrying something really heavy right now, and I don't want to hand you a tidy reflection when what matters is that you're supported by a real person. You deserve that. If you're in the US, you can call or text 988 any time to reach the Suicide & Crisis Lifeline. If you're elsewhere, findahelpline.com lists free, confidential options near you. I'm glad you wrote this down — please reach out to someone who can be with you in it.",
};

// A small, hand-written pool so the mock feels alive rather than canned.
// The real model will replace this entirely.
const MOCK_REFLECTIONS = [
  "Naming how you feel is its own small act of care. Whatever today asked of you, you showed up to meet it. What's one moment that felt even a little gentler than the rest?",
  "There's something steady in the way you're paying attention to yourself. You don't have to resolve any of it tonight. What would it look like to be 5% kinder to yourself tomorrow?",
  "That's a lot to hold, and you held it anyway. Slow counts as moving. Is there one thing, however small, you'd like to carry a little more lightly?",
  "It takes something to sit with a feeling instead of rushing past it. You did that here. What's quietly asking for your attention right now?",
  "You wrote it down, and that already makes it a little less heavy to carry alone. What's one thing you're grateful made it into today?",
];

// Deterministic-ish pick so the same entry tends to get the same reflection
// during a session, but different entries feel varied.
function pickMock(text) {
  const seed = text.length % MOCK_REFLECTIONS.length;
  return MOCK_REFLECTIONS[seed];
}

// Simulate network latency so loading / async states are real during dev.
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ── The public API the UI uses ──────────────────────────────
// Returns { kind: "reflection" | "support", body: string }
export async function getReflection(entryText) {
  // Guardrail runs first, always — before any "model" is consulted.
  if (screenForDistress(entryText)) {
    await delay(400);
    return SUPPORT_RESPONSE;
  }

  // ── REAL (Path 1, live) ──
  // Calls the serverless proxy at /api/reflect, which holds the API key
  // server-side and talks to Gemini. The client never sees the key.
  return getReflectionViaProxy(entryText);

  // ── MOCK (Path 2, fallback) ──
  // If you ever want to run the app with no backend (e.g. plain `npm run
  // dev` without `vercel dev`), comment out the line above and uncomment:
  // await delay(1100);
  // return { kind: "reflection", body: pickMock(entryText) };
}

// Wiring for later. Points at a serverless function you'll add (e.g. a
// Vercel function at /api/reflect) that holds the API key server-side and
// calls Anthropic/OpenAI. The client never sees the key.
export async function getReflectionViaProxy(entryText) {
  try {
    const res = await fetch("/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: entryText }),
    });
    if (!res.ok) throw new Error(`Proxy responded ${res.status}`);
    const data = await res.json();
    return { kind: "reflection", body: data.reflection };
  } catch (err) {
    // Thematic, on-brand failure — never a raw error.
    return {
      kind: "error",
      body:
        "The mirror's a little foggy right now — I couldn't reach for a reflection. Your entry is saved safely. Take a breath, and try again in a moment.",
    };
  }
}