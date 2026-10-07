#!/usr/bin/env node
/**
 * Points the SMTP parameters of the processes listed in SMTP_CONFS at MailPit (tests) or back at the real
 * relay configured in app/process_configurations/*.conf (e.g. Brevo). No redeploy needed.
 *
 *   node smtp.mjs mailpit     -> localhost:1025, no SSL. Nothing leaves the machine.
 *   node smtp.mjs restore     -> values from the .conf files. Never printed.
 *   node smtp.mjs status      -> host, port and SSL of each process.
 *
 * MailPit must accept the connector's Basic auth:
 *   mailpit --smtp-auth-accept-any --smtp-auth-allow-insecure
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONF_DIR = process.env.CONF_DIR || join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'process_configurations');
// ADAPT: process name -> Studio .conf id (app/process_configurations/<id>.conf)
const CONFS = JSON.parse(process.env.SMTP_CONFS || '{}');
if (!Object.keys(CONFS).length) { console.error('set SMTP_CONFS, e.g. {"MyProcess":"_abc123"} (process name -> .conf id)'); process.exit(2); }
const MAILPIT = { smtpHost: 'localhost', smtpPort: '1025', smtpSsl: 'false' };
const [mode = 'status', BASE = 'http://localhost:8080/bonita'] = process.argv.slice(2);

const login = await fetch(`${BASE}/loginservice`, {
  method: 'POST', redirect: 'manual',
  body: new URLSearchParams({ username: process.env.BONITA_USER || 'install', password: process.env.BONITA_PASSWORD || 'install', redirect: 'false' }),
});
const cookies = login.headers.getSetCookie().map((c) => c.split(';')[0]);
const headers = { Cookie: cookies.join('; '), 'X-Bonita-API-Token': cookies.find((c) => c.startsWith('X-Bonita-API-Token=')).split('=')[1] };
const api = async (method, path, body) => {
  const r = await fetch(`${BASE}/API/${path}`, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path}: HTTP ${r.status}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
};

for (const p of await api('GET', 'bpm/process?p=0&c=100')) {
  if (!CONFS[p.name]) continue;
  if (mode === 'mailpit' || mode === 'restore') {
    const values = mode === 'mailpit' ? MAILPIT : Object.fromEntries(
      [...readFileSync(join(CONF_DIR, `${CONFS[p.name]}.conf`), 'utf8').matchAll(/<parameters name="(smtp[^"]*)" value="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    for (const [name, value] of Object.entries(values)) await api('PUT', `bpm/processParameter/${p.id}/${name}`, { value });
  }
  const prm = Object.fromEntries((await api('GET', `bpm/processParameter?p=0&c=50&f=process_id=${p.id}`)).map((x) => [x.name, x.value]));
  console.log(`${p.name}: ${prm.smtpHost}:${prm.smtpPort} ssl=${prm.smtpSsl}`);
}
