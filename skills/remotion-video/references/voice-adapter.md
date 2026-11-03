# Voice adapter (voz.mjs) notes

- Input: `guion.json` scenes with `id` and `narracion`. Output: `public/audio/<id>.mp3` plus `public/audio/durations.json`.
- Cache key: sha1 of `provider + voiceId + narracion`. Skip the call when the file exists. Unchanged text costs 0.
- ElevenLabs: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with header `xi-api-key` taken from
  `process.env.ELEVENLABS_API_KEY`. Never from argv, never logged. Use a multilingual model for Spanish.
  The ElevenLabs MCP server is an alternative for interactive voice choice; use the REST call for batch regeneration.
- edge-tts fallback: same voices as the `demo-video` skill (es-ES, es-DO, es-GT...). Free.
- Duration: read with `music-metadata` or `@remotion/media-utils getAudioDurationInSeconds`; scene frames =
  ceil((duration + 0.6 s pause) * fps).
- Customer or confidential text: do not call any cloud provider.
