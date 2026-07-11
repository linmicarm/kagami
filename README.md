# 鏡 Kagami

A gentle mirror for your day. Write an entry, receive a soft reflection.

The first slice of the larger "Save Point" life-almanac vision: just journaling + AI reflection.

## Run it

```bash
npm install
npm run dev
```

## How it's built

- **Vite + React** — deliberately featherweight, separate from the 404 Offline stack.
- **`src/lib/reflect.js`** — the single place the app talks to "the model."
  Currently returns a *mocked* reflection (Path 2) so the whole app works with
  no API key. To go live: delete the mock block in `getReflection` and
  uncomment the `getReflectionViaProxy` line. The proxy fetch + thematic
  error handling are already written.
- **`src/lib/journal.js`** — season tagging + light localStorage history.
- Wellbeing guardrail is built in: distress screening runs *before* any model
  call and surfaces real support resources (988, findahelpline.com) instead of
  a reflection. A visible disclaimer marks this as a reflective space, not a
  mental-health tool.

## Next step (Path 1): the serverless proxy

Add a serverless function (e.g. Vercel `/api/reflect`) that holds your
Anthropic/OpenAI key server-side, sends a system prompt defining Kagami's warm,
non-advice-y voice, and returns `{ reflection: "..." }`. The client never sees
the key. Then flip the one line in `reflect.js`.
