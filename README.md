# MesoForge

A personal hypertrophy training PWA — plan mesocycles, log workouts, and let the
app autoregulate your weekly volume. All data stays on your device (IndexedDB);
no accounts, no server, works offline once installed.

## How the training engine works

- **Mesocycles**: pick a split (Full Body 3d, Upper/Lower 4d, UL+PPL 5d, PPL 6d),
  a length (3–5 accumulation weeks + deload), an effort ramp, and exercises for
  each muscle slot.
- **Effort ramp**: selectable per meso — 3→0 RIR (standard), 2→0 (aggressive),
  or 3→1 (conservative) — then a deload (half sets, ~60% loads, 4+ RIR).
- **Volume landmarks**: each muscle starts week 1 near its minimum effective
  weekly volume and is never pushed past its maximum recoverable weekly volume
  (approximations of publicly discussed hypertrophy-volume ranges, per muscle).
  Both landmarks show as reference lines on the weekly-sets chart.
- **Volume autoregulation**: after each session you rate every muscle you trained
  (soreness / pump / workload / joint stress). Still sore, overwhelmed, or painful
  joints → next week loses a set. Achy joints → volume holds. Low pump and easy
  workload → next week adds sets. Otherwise volume creeps up gradually. Each
  week's session is generated from the last one's actual results.
- **Progression hints**: each exercise shows last week's top set and pre-fills
  suggestions; tapping ✓ on an empty row accepts the suggestion.
- **Swaps**: swap any exercise mid-meso (⇄) — applies to that session and all
  future weeks.
- **Analytics**: weekly sets per muscle group, weekly tonnage, and estimated-1RM
  trends per exercise.
- **Backup**: Settings → Export JSON / Import JSON.

## Hosting it (required for PWA install)

A PWA needs to be served over HTTPS (or localhost). Any static host works:

**Easiest — Netlify Drop:** go to https://app.netlify.com/drop and drag this
folder in. You get an HTTPS URL immediately.

**GitHub Pages:** push this folder to a repo, enable Pages (Settings → Pages →
deploy from branch), open the URL.

**Local testing:** `python3 -m http.server` in this folder, then open
http://localhost:8000

## Installing on your phone

Open the hosted URL, then:
- **Android/Chrome**: menu ⋮ → "Add to Home screen" / "Install app"
- **iOS/Safari**: Share → "Add to Home Screen"

It launches full-screen like a native app and works offline. Your data lives in
that installed app's storage — export a backup occasionally.

## Files

- `index.html`, `style.css`, `app.js` — the whole app (no build step, no deps)
- `sw.js` — service worker (offline cache)
- `manifest.webmanifest`, `icons/` — install metadata
- `smoke.test.mjs` — headless Playwright test of the core flows (dev only)
