#!/usr/bin/env node
/**
 * save-session.mjs - Continuidad entre sesiones de Claude Code.
 *
 * Genera/actualiza LAST_SESSION.md en el directorio de trabajo con un resumen
 * inteligente de la sesion (via `claude -p` con Haiku), pensado para retomarla.
 *
 * Diseno:
 *  - Hook `Stop` (async): estrangulado a 1 resumen / ThrottleMinutes (def. 30),
 *    asi la mayoria de paradas no gastan tokens (solo miran un marcador y salen).
 *  - Hook `SessionEnd` (--force): resumen final completo al cerrar la sesion.
 *  - Comando manual `/save-session` (--force): guarda al momento (tipo Ctrl+G).
 *
 * Cross-platform: un solo fichero Node, invocado igual en PowerShell y bash.
 * Sin tokens cuando estrangula; barato (Haiku) cuando genera.
 *
 * Flags:  --force            ignora el throttle de 30 min
 *         --throttle <min>   cambia la ventana de throttle (def. 30)
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

// Guard anti-recursion: el `claude -p` hijo re-dispara los hooks Stop/SessionEnd.
if (process.env.CC_NO_SESSION_SUMMARY === '1') process.exit(0);

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const tIdx = argv.indexOf('--throttle');
const throttleMin = tIdx >= 0 && argv[tIdx + 1] ? Number(argv[tIdx + 1]) : 30;

const cwd = process.cwd();
const OUT = join(cwd, 'LAST_SESSION.md');

// --- Throttle: marcador por proyecto en TEMP (no ensucia el repo) ---
const key = cwd.replace(/[^A-Za-z0-9]/g, '_');
const marker = join(tmpdir(), `cc_sess_${key}.txt`);
if (existsSync(marker)) {
  const ageMin = (Date.now() - statSync(marker).mtimeMs) / 60000;
  if (!force && ageMin < throttleMin) process.exit(0); // fresco: nada que hacer
  if (ageMin < 0.25) process.exit(0);                  // anti doble-disparo (15s)
}
try { writeFileSync(marker, new Date().toISOString()); } catch { /* ignore */ }

// --- Localizar el transcript: 1) stdin del hook, 2) derivado del proyecto ---
let raw = '';
if (!process.stdin.isTTY) {
  try { raw = readFileSync(0, 'utf8'); } catch { /* sin stdin */ }
}
let tp = null;
if (raw) { try { tp = JSON.parse(raw).transcript_path; } catch { /* no json */ } }
if (!tp) {
  const san = cwd.replace(/[/\\:]/g, '-'); // p.ej. C:\Users\X -> C--Users-X
  const pdir = join(homedir(), '.claude', 'projects', san);
  try {
    const newest = readdirSync(pdir)
      .filter((f) => f.endsWith('.jsonl'))
      .map((f) => ({ f, m: statSync(join(pdir, f)).mtimeMs }))
      .sort((a, b) => b.m - a.m)[0];
    if (newest) tp = join(pdir, newest.f);
  } catch { /* no projects dir */ }
}

const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
let branch = '(no git repo)';
try {
  const r = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' });
  if (r.status === 0 && r.stdout.trim()) branch = r.stdout.trim();
} catch { /* no git */ }

// --- Generar el resumen con Haiku (instrucciones via stdin para evitar quoting) ---
let out = null;
if (tp && existsSync(tp)) {
  const tail = readFileSync(tp, 'utf8').split('\n').slice(-500).join('\n');
  const instr =
    'Resume esta sesion de Claude Code para poder retomarla mas tarde. ' +
    'Devuelve SOLO Markdown con: la cabecera "# Last Session Context", ' +
    'las lineas **Date**, **Branch**, **Summary** (1-2 frases), y las secciones ' +
    '## Hecho, ## Decisiones, ## Pendiente, ## Ficheros. En espanol, breve y ' +
    'accionable. NUNCA incluyas datos sensibles (tokens, passwords, nombres de clientes). ' +
    'El transcript JSONL viene tras la linea ---TRANSCRIPT---.';
  const input = `${instr}\n\n---TRANSCRIPT---\n${tail}`;
  process.env.CC_NO_SESSION_SUMMARY = '1'; // el hijo no re-dispara los hooks
  const r = spawnSync(
    'claude',
    ['-p', 'Sigue las instrucciones del inicio y devuelve solo el Markdown pedido.',
      '--model', 'claude-haiku-4-5-20251001', '--no-session-persistence'],
    { input, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 }
  );
  if (r.status === 0 && r.stdout && r.stdout.trim()) out = r.stdout.trim();
}

const fallback =
  `# Last Session Context\n**Date**: ${now}\n**Branch**: ${branch}\n\n` +
  `_Resumen IA no disponible; contexto basico._\n`;

try { writeFileSync(OUT, out ? `${out}\n` : fallback, 'utf8'); } catch { /* read-only cwd */ }
