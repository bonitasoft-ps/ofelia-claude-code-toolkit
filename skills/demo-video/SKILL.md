---
name: demo-video
description: Make a narrated, navigable demo video of a real application (Bonita apps or any web app) the token-free way used for Bantrab and Grupo Universal - script as data (guion.json), Chrome records and assembles, edge-tts voice, long and short WebM with chapters, subtitles and an HTML player. Use ALWAYS when the user asks for a video, demo video, vídeo de la demo, grabar la demo, video explicativo or similar.
---

# Demo video (token-free, navigable)

The user wants every demo video made this way. Do not improvise another method (no screen recorder, no ffmpeg, no
hand-made slideshow). Regenerating must cost no LLM tokens: the script is data and a double click redoes it.

## Reference implementation (copy from here, it has every fix)

- **Latest pipeline:** `C:\PSProjects\grupo-universal\gu-bonita\tools\video\` (README.md in English, `guion.json`,
  `hacer_video.py`, `grabar.mjs`, `montar.mjs`, `montar.html`, `reproductor.html`, `modo-correo.mjs`,
  `seekable.mjs`, `duracion.mjs`, `rehacer-video.bat`, `package.json`).
- **Output example:** `G:\Mi unidad\Prospects\Grupo Universal\Video\` (`DEMO-...-largo.webm`, `-corto.webm`, `.srt`,
  `.vtt`, `.chapters.json`, `<Cliente> - Video de la demo.html`, `COMO-REHACER-EL-VIDEO.md`).
- **Older first version:** Bantrab, `C:\PSProjects\_work\demo-bantrab-bonita-postgen\runtime\video\`. It has the
  `seekable.mjs` bug that writes Cues, so seeking fails in Chrome. Use the Grupo Universal copy instead.

## How it works

1. **Script.** `guion.json` has one entry per scene:
   - `id`;
   - `capitulo`: the flow of the demo guide, for example F1 to F10;
   - `titulo`: the chapter title in the player;
   - `distintivo`: the capability band shown on top;
   - `narracion`;
   - `usuario`, `url` and `pasos`: playwright actions inside the app frame;
   - `prep` and `despues`: API waits that are not shown;
   - `corto`: whether the scene goes into the short video;
   - `tarjeta`: a title card instead of a screen.
2. **Voice.** edge-tts neural voice in the country's Spanish (es-DO, es-GT...). The voice is cached while the text
   does not change. It sends only the narration text, so narration must hold fictitious data only.
3. **Recording.** Headless Chrome through `playwright-core`, at a human pace, with a visible cursor and a ring on each
   click.
4. **Assembly.** Chrome assembles with MediaRecorder: WebM VP9 + Opus, in real time. Each video gets its chapters
   JSON from the measured scene starts, plus SRT and VTT.
5. **Player.** A navigable HTML page:
   - chapter list (click seeks) with the current chapter highlighted;
   - switch between long and short;
   - subtitles toggle, keyboard control;
   - responsive at 390 px, light and dark mode.

## Rules

- **Two videos:** a long one with every flow, and a short one of about 4 to 5 minutes.
- **Spanish narration** that is easy to follow.
- **Product branding:**
  - Bonita BPM: Plum `#723253` and Lila `#A98BE1`, with Burgundy `#5C1932` for titles.
  - Agentic and Ofelia: see the global CLAUDE.md palettes.
  - The app screens keep the client's branding.
- **Capability bands** use neutral wording ("Capacidad · ..."). Never write "lo que buscan", "sus requisitos" or
  "nos pidieron".
- **Nothing internal on screen:** no internal Ofelia or PS content, no consultant names, no consultant mail aliases.
- **Mail stays in TEST mode** while recording, then goes back to its previous mode (verify it). Clean the demo data
  before and after the run.
- **Things that cannot be recorded headless** (Studio, procedures): use title cards, or the engine's process
  visualization.
- **Where files go:**
  - Assemble into a local work folder (`C:\PSProjects\_work\video-<client>\out`). Copy to the Drive folder only when
    the video is complete and its duration was read correctly.
  - Pipeline code goes in the client repo under `tools/video`, with `node_modules` gitignored.
  - Never commit webm, frames or audio.
- **Binaries and credentials:** no ffmpeg or other unsigned binaries; `playwright-core` drives the installed Chrome.
  Credentials go through env vars or files, never on a command line.
- **Laptop sleep:** `hacer_video.py` keeps the laptop awake (SetThreadExecutionState) while it records and assembles.
  A cut assembly shows "NO CUADRA" and is redone with `rehacer-video.bat ninguna`.
- **The cleanup deletes the user's own test data** (cases, claims, AI runs, mail logs of the day). Tell the user before
  recording, and archive the local mailbox first.
- **Languages:** ES first; EN/FR reuse the same scenes with a translated `guion` and the app switched to that language.
  Mail templates, PDF letters and seeded data stay in the source language unless they are translated too: say so.
  One player for all languages (switch changes video, chapters, subtitles and page texts, remembered per viewer).
- **Sharing:** one zip with the player, every video (no re-encoding, ZIP_STORED), `.srt`, `.vtt`, `.chapters.json`;
  relative paths only, works offline from file://. Never include guion, scripts, logs or internal docs. Test it by
  extracting to a temp folder and opening it in Chrome.

## Verify before announcing

- **Duration:** `duracion.mjs` must match the expected duration for both videos.
- **Frames:** open a few frames per scene (`scenes/<id>/`) and at the chapter cuts, instead of watching the whole
  video.
- **Player:** check it in Chrome at 1440 and 390 px:
  - clicking 3 chapters jumps `currentTime`;
  - long/short switch and subtitles work;
  - no console errors and no horizontal overflow.
- **Environment:** restored (mail mode, clean data, services up).

## Execution

Delegate the build to ONE background agent with a big scope (default model, not fable), and explicitly forbid it from
spawning sub-agents. Give the agent:

- the reference paths above;
- the app URLs, users and the demo guide with the flows and field values;
- an existing E2E script with selectors, if there is one;
- the cleanup tool;
- the branding.

While it works, the user must not use the app. Report the paths, durations, the chapter list, which parts are cards,
how to regenerate (`rehacer-video.bat`, `rehacer-video.bat ninguna`, `rehacer-video.bat <scene ids>`) and the
restored state.
