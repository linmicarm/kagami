<div align="center">

# 鏡 Kagami

**A gentle mirror for your day.**

Write about how you're doing. Receive one soft reflection back — not advice, not a fix, just a quiet noticing.

[Live demo](#) · [How it works](#how-it-works) · [Run it locally](#run-it-locally)

</div>

---

## What it is

Most journaling apps hand you a blank page and walk away. The ones that don't tend to turn into productivity tools — streaks, mood charts, analytics, a dashboard of your feelings.

Kagami does one thing. You write an entry. It reflects it back to you, gently, and asks one open question. Then it gets out of the way.

The name means *mirror* in Japanese, and the whole interface is built around that: your words sit in a white card, and beneath a soft waterline, the reflection surfaces — like something appearing in still water.

It's the first slice of a larger idea (a seasons-based life almanac), deliberately scoped down to the part that mattered most.

## The interesting part isn't the AI call

Calling a language model is four lines of code. Everything worth talking about in this project is what surrounds it.

**Designing a voice.** The model is generic; the character isn't. Kagami's system prompt defines a specific register — warm, unhurried, 2–4 sentences, ends with one open question, no advice, no toxic positivity, no lists, no emoji. Getting a model to reliably *not* be a life coach took more iteration than getting it to respond at all.

**A wellbeing guardrail, by design.** A journaling app will eventually receive an entry from someone who is genuinely struggling. That isn't an edge case to patch later — it's a day-one requirement. So distress screening runs *before* the model is ever consulted. If an entry signals serious distress, Kagami doesn't produce a clever reframe: it steps back, says so plainly, and surfaces real human support (988, findahelpline.com). Every reflection also carries a visible line: *a reflective space, not medical or mental-health advice.*

I'd rather this app be honest about what it isn't than pretend to be a therapist.

**Keeping the key off the client.** The Gemini API key never touches the browser. All model calls route through a serverless function that holds the key server-side and returns only the reflection text.

**Failing in character.** When the API times out or errors, Kagami doesn't throw a stack trace at someone who just wrote about their hard day. It says the mirror clouded over, notes the entry is safe, and invites them to try again.

## How it works

```
  browser                      serverless function            Google Gemini
 ─────────                    ─────────────────────          ───────────────
  entry  ──▶  distress screen  ──▶  system prompt  ──▶  model
                    │                  (voice + safety)         │
                    │                                           │
              signals distress?                          reflection
                    │                                           │
                    └──▶  support resources  ◀────────────────  ┘
                              (no model call)
```

`src/lib/reflect.js` is the only place the front end talks to the reflection service — the guardrail runs there, first, always.
`api/reflect.js` is the serverless proxy. It holds the key and the system prompt. Swapping model providers means editing one file; the front end never changes.

## Built with

**React + Vite** · **Google Gemini** · **Vercel serverless functions** · no framework beyond what the job needed

Typography does real work here: entries are set in Zen Maru Gothic (rounded, warm — *your* voice), and reflections answer back in Fraunces (a soft serif — a *different* voice). Two speakers, visually distinct.

## Run it locally

You'll need a free Gemini API key from [Google AI Studio](https://aistudio.google.com) (no card required).

```bash
git clone https://github.com/linmicarm/kagami.git
cd kagami
npm install

# add your key
cp .env.example .env       # then paste your key into .env

npm i -g vercel            # once
vercel dev                 # runs the app AND the /api function
```

> `npm run dev` alone serves the front end but **not** the serverless function — reflections will fail. Use `vercel dev`.

Want to run the UI with no backend at all? In `src/lib/reflect.js`, comment out the `getReflectionViaProxy` line and uncomment the mock block below it.

## Deploying

Push to GitHub, import the repo at [vercel.com](https://vercel.com), and add `GEMINI_API_KEY` under **Settings → Environment Variables**. Vercel serves the app and the function together.

GitHub Pages won't work — it can't run the serverless function, so every reflection would fail.

---

<div align="center">
<sub>Kagami is a reflective space, not a mental-health tool. If you're struggling, please reach out to someone real.</sub>
</div>