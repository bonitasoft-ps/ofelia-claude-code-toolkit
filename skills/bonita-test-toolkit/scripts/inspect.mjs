#!/usr/bin/env node
/**
 * Read what is REALLY deployed before writing tests. Design docs drift; the server does not.
 *
 *   node inspect.mjs processes            name, version, state, parameters (password-like values masked)
 *   node inspect.mjs start <processName>  instantiation contract (inputs, types, constraints)
 *   node inspect.mjs contract <caseId>    contract of every pending human task of the case (sub-processes included)
 *   node inspect.mjs flow <caseId>        active flow nodes + last archived ones (where did the case go?)
 *
 * env: BONITA_URL (default http://localhost:8080/bonita), BONITA_USER / BONITA_PASSWORD (default install)
 */
const BASE = process.env.BONITA_URL || 'http://localhost:8080/bonita';
const [mode = 'processes', arg] = process.argv.slice(2);

const login = await fetch(`${BASE}/loginservice`, {
  method: 'POST', redirect: 'manual',
  body: new URLSearchParams({ username: process.env.BONITA_USER || 'install', password: process.env.BONITA_PASSWORD || 'install', redirect: 'false' }),
});
if (login.status >= 300) throw new Error(`login failed: HTTP ${login.status}`);
const cookies = login.headers.getSetCookie().map((c) => c.split(';')[0]);
const headers = { Cookie: cookies.join('; '), 'X-Bonita-API-Token': cookies.find((c) => c.startsWith('X-Bonita-API-Token=')).split('=')[1] };
const get = async (p) => { const r = await fetch(`${BASE}/API/${p}`, { headers }); if (!r.ok) throw new Error(`GET ${p}: HTTP ${r.status}`); return r.json(); };
const printContract = (c, pad = '  ') => {
  const walk = (inputs, pre) => inputs.forEach((i) => {
    console.log(`${pre}${i.name}: ${i.type || 'COMPLEX'}${i.multiple ? '[]' : ''}${i.description ? '  // ' + i.description.slice(0, 80) : ''}`);
    if (i.inputs?.length) walk(i.inputs, pre + '  ');
  });
  walk(c.inputs || [], pad);
  (c.constraints || []).forEach((x) => console.log(`${pad}rule ${x.name}: ${x.expression.replace(/\s+/g, ' ').slice(0, 160)}`));
};

if (mode === 'processes') {
  for (const p of await get('bpm/process?p=0&c=200&o=name ASC')) {
    console.log(`${p.name} ${p.version}  ${p.activationState}/${p.configurationState}  id=${p.id}  deployed ${p.deploymentDate}`);
    for (const prm of await get(`bpm/processParameter?p=0&c=100&f=process_id=${p.id}`)) {
      const masked = /pass|secret|token|key/i.test(prm.name) ? (prm.value ? '***' : '(empty)') : prm.value;
      console.log(`    param ${prm.name} = ${masked}`);
    }
    if (p.configurationState !== 'RESOLVED') {
      for (const pb of await get(`bpm/processResolutionProblem?p=0&c=50&f=process_id=${p.id}`)) console.log(`    PROBLEM ${pb.message}`);
    }
  }
} else if (mode === 'start') {
  const [p] = await get(`bpm/process?p=0&c=1&f=name=${encodeURIComponent(arg)}&o=version DESC`);
  console.log(`${p.name} ${p.version} instantiation contract`);
  printContract(await get(`bpm/process/${p.id}/contract`));
} else if (mode === 'contract') {
  for (const t of await get(`bpm/humanTask?p=0&c=50&f=rootCaseId=${arg}`)) {
    console.log(`TASK ${t.name} (id ${t.id}, case ${t.caseId})`);
    printContract(await get(`bpm/userTask/${t.id}/contract`));
  }
} else if (mode === 'flow') {
  console.log('active  :', (await get(`bpm/flowNode?p=0&c=100&f=rootCaseId=${arg}`)).map((f) => `${f.name}[${f.state}]`).join(', ') || '-');
  const archived = await get(`bpm/archivedFlowNode?p=0&c=20&o=archivedDate%20DESC&f=rootCaseId=${arg}`).catch(() => []);
  console.log('archived:', archived.map((f) => `${f.name}[${f.state}]`).join(', ') || '-');
} else {
  console.error('usage: node inspect.mjs processes | start <processName> | contract <caseId> | flow <caseId>');
  process.exit(2);
}
