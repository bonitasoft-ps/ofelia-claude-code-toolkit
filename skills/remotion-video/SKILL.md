---
name: remotion-video
description: Make a produced video (product explainer, marketing, animated intro) with Remotion, reusing the UI components of a React repo so the screens match the real app, with a script-as-data file and a pluggable voice (ElevenLabs, edge-tts or local). Use when the user asks for a Remotion video, an animated or marketing video of a product whose source code is a React repo, or "film director" style videos. For recorded walkthroughs of customer Bonita apps use demo-video instead.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
user-invocable: true
---

# Remotion video (React code to video)

Complements `demo-video`; it does not replace it. Voice adapter details: `references/voice-adapter.md`.

## Choose the method first

| Situation | Use |
|---|---|
| Customer Bonita app (UI Designer, Appsmith, no React source), or any real running app we must show as is | **`demo-video`** (Playwright records the real app, free, token-free) |
| Our own product with a React repo (Ofelia Agentic, admin-training, PolyGo, ui-generator), animations, intros, marketing | **`remotion-video`** |
| Customer data, credentials, confidential content in the narration | Either method, but voice **only local** (edge-tts is cloud too: use Ollama/local TTS or fictitious data) |

If unsure, default to `demo-video`: it already works, costs nothing and spends no tokens.

## Hard rules (check before starting)

1. **License.** Remotion is free only for individuals and for-profit organizations of up to 3 people. Ofelia is bigger,
   so a paid Company License is required (Creators about 25 USD per seat per month, Automators 0.01 USD per render with
   100 USD per month minimum; verify at remotion.dev/docs/pricing). **Ask the user to confirm the license is covered
   before building anything that is delivered or published.** Prototypes for internal evaluation: say so explicitly.
   Account setup: the Remotion account/license is registered with the user's **personal** email (see the user's private
   memory; never write that address in this repo). The personal account does not change the licensing terms for
   company work. Everything else (repos, ElevenLabs, code) stays on Ofelia accounts and in the organization.
2. **Secrets.** `ELEVENLABS_API_KEY` only as environment variable or file outside the repo. Never in argv (the EDR logs
   the command line), never committed.
3. **Cloud voice = text leaves the machine.** ElevenLabs gets the narration text. Allowed only for public or
   fictitious content. Customer data: local voice.
4. **EDR (Bitdefender).** Remotion downloads Chrome Headless Shell and uses ffmpeg inside its own packages: unsigned
   binaries on first run. Warn the user before the first `npx remotion render`. If an alert appears, explain it and
   remove the cause; never ask for EDR exclusions.
5. **Brand.** Load `marca-ofelia` first. Suite = Ofelia Agentic + Bonita BPM; never "Bonitasoft" externally, never
   "intelligent automation" (it is governed AI orchestration). No em dashes in narration or on-screen text.
6. **Never commit** mp4/webm, audio, `out/`, `node_modules`, `.env`. Add them to `.gitignore`.
7. **Capability bands and internal content:** same rules as `demo-video` (neutral wording, nothing internal on screen).

## Workflow

1. **Analyze the repo** (use `scout` for large repos): framework, design tokens, reusable presentational components,
   fonts, logos. Prefer pure presentational components with props; mock data, never real API calls or auth.
2. **Scaffold** in a separate folder, not inside the app source: `<repo>/tools/video-remotion/` with its own
   `package.json`. Import app components through a path alias or a copy of the needed ones. Install the official agent
   skills for best practices: `npx skills add remotion-dev/skills` (then `/remotion-best-practices`).
3. **Script as data:** `guion.json`, same shape as `demo-video` so both pipelines share scripts:
   `id`, `capitulo`, `titulo`, `narracion`, `componente` (React component and props for the scene), `duracion`
   (optional; otherwise taken from the audio), `corto` (goes into the short cut), `tarjeta`.
4. **Voice adapter** (one script, `voz.mjs`, reads `guion.json`, writes `public/audio/<id>.mp3`, caches by text hash):
   - `elevenlabs`: REST or the ElevenLabs MCP server; key from env; pick a Spanish voice; cache so unchanged text costs
     nothing.
   - `edge-tts`: free fallback, same as `demo-video`.
   - Measure each audio duration and write it back, so scene length follows the narration.
5. **Compose:** one `<Composition>` that sequences scenes with `<Series>`, each scene animating the real components
   (`spring`, `interpolate`), cursor and click rings to imitate use. Subtitles from the script (SRT/VTT).
6. **Review without watching it all:** `npx remotion still` for 2 or 3 frames per scene, then look at them. Render the
   full video once.
7. **Render:** long and short (about 4 to 5 minutes) with `npx remotion render`. Keep `rehacer-video.bat`/`.sh`
   style one-command regeneration, so remaking costs no tokens.
8. **Report:** paths, durations, chapters, voice used, license status, how to regenerate.

## Token discipline

- Delegate the build to ONE background agent with a large scope, default model, explicitly forbidden to spawn
  sub-agents. The agent gets: repo path, script, brand rules, voice provider, this skill.
- Only the script and component code consume tokens; regeneration and cached voice must not.
- Never load frames or video into the main context: sample stills only.

## Verification

- Audio duration equals the scene duration (no cut narration).
- Stills at scene starts and chapter cuts look like the real app (fonts, colors, spacing).
- No secrets in the diff (`git diff | grep -i "api_key\|xi-api"` is empty).
- Output is outside the repo or gitignored.
