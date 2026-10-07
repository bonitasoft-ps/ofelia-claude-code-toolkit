#!/usr/bin/env node
/**
 * Deletes every case of the root process started since a given instant (the test run): open and archived.
 * Why: open test cases carry reminder timers. Once SMTP is switched back to the real relay those
 * timers would mail fake test addresses and real advisors. Must run BEFORE `smtp.mjs restore`.
 * Archived ones are removed too, so test runs leave no trace in the monitoring screens.
 * Business data (Applicant, Opportunity...) written by the cases is NOT deleted.
 *
 * Usage: node cleanup-cases.mjs <sinceIso> [baseUrl]      env: ROOT_PROCESS (required: name of the root process)
 */
const [since, BASE = 'http://localhost:8080/bonita'] = process.argv.slice(2);
if (!since) { console.error('usage: node cleanup-cases.mjs <sinceIso> [baseUrl]'); process.exit(2); }
const from = new Date(since).getTime();
if (!process.env.ROOT_PROCESS) { console.error('set ROOT_PROCESS to the root process name'); process.exit(2); }

const login = await fetch(`${BASE}/loginservice`, {
  method: 'POST', redirect: 'manual',
  body: new URLSearchParams({ username: process.env.BONITA_USER || 'install', password: process.env.BONITA_PASSWORD || 'install', redirect: 'false' }),
});
const cookies = login.headers.getSetCookie().map((c) => c.split(';')[0]);
const headers = { Cookie: cookies.join('; '), 'X-Bonita-API-Token': cookies.find((c) => c.startsWith('X-Bonita-API-Token=')).split('=')[1], 'Content-Type': 'application/json' };

const [parent] = await (await fetch(`${BASE}/API/bpm/process?p=0&c=1&f=name=${encodeURIComponent(process.env.ROOT_PROCESS)}`, { headers })).json();
const open = await (await fetch(`${BASE}/API/bpm/case?p=0&c=500&f=processDefinitionId=${parent.id}`, { headers })).json();
// Bonita returns "yyyy-MM-dd HH:mm:ss.SSS" in server local time.
const inRun = (c) => new Date(c.start.replace(' ', 'T')).getTime() >= from;
const ids = open.filter(inRun).map((c) => c.id);
if (ids.length) {
  const r = await fetch(`${BASE}/API/bpm/case`, { method: 'DELETE', headers, body: JSON.stringify(ids) });
  if (!r.ok) throw new Error(`delete cases: HTTP ${r.status}`);
}
const archived = await (await fetch(`${BASE}/API/bpm/archivedCase?p=0&c=500&f=processDefinitionId=${parent.id}`, { headers })).json();
const archivedIds = archived.filter(inRun).map((c) => c.id);
if (archivedIds.length) {
  const r = await fetch(`${BASE}/API/bpm/archivedCase`, { method: 'DELETE', headers, body: JSON.stringify(archivedIds) });
  if (!r.ok) throw new Error(`delete archived cases: HTTP ${r.status}`);
}
console.log(`[ok] test cases deleted: ${ids.length} open, ${archivedIds.length} archived`);
