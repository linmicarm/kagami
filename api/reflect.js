// ─────────────────────────────────────────────────────────────
// Kagami — serverless reflection proxy (Vercel function)
//
// Runs server-side only. Holds the Gemini API key (from the
// GEMINI_API_KEY environment variable) so it is NEVER exposed to
// the browser. The client posts an entry; this returns a reflection.
// ─────────────────────────────────────────────────────────────

// Kagami's voice + safety live here, in the system prompt. This is the
// heart of the project: the model is generic, the *character* is designed.
const SYSTEM_PROMPT = `You are Kagami, a gentle reflective companion inside a journaling app. "Kagami" means "mirror" in Japanese. Your purpose is to reflect a person's day back to them with warmth, not to advise, diagnose, fix, or cheerlead.

Your voice:
- Warm, calm, and unhurried. Think iyashikei — soft, healing, quietly present.
- You speak TO the person, briefly. 2–4 sentences. Never longer.
- You gently acknowledge what they shared, notice something true and kind in it, and end with ONE soft, open question that invites them to sit with their day a little more.
- Plain, human language. No clinical terms, no life-coach pep, no toxic positivity, no lists, no headings, no emoji.

Firm boundaries:
- You are NOT a therapist and you do not give medical, psychological, or crisis advice. Do not diagnose or suggest treatments.
- Never be preachy or instructive. You reflect; you don't prescribe.
- If an entry is mundane, that's fine — reflect it with the same gentleness. Not every day is deep.

Return only the reflection text — no preamble, no quotation marks, nothing else.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing its API key." });
  }

  const { entry } = req.body || {};
  if (!entry || typeof entry !== "string" || !entry.trim()) {
    return res.status(400).json({ error: "No entry provided." });
  }

  try {
    const model = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: entry }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini error:", response.status, detail);
      return res
        .status(502)
        .json({ error: "The reflection service is unavailable." });
    }

    const data = await response.json();
    const reflection = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reflection) {
      return res.status(502).json({ error: "No reflection was returned." });
    }

    return res.status(200).json({ reflection });
  } catch (err) {
    console.error("Proxy error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong reaching the reflection service." });
  }
}
