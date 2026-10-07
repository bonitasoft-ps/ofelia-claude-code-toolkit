import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
const xml = readFileSync(homedir() + '/.m2/settings.xml', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const servers = [...xml.matchAll(/<server>([\s\S]*?)<\/server>/g)].map(m => m[1]);
console.log('server ids:', servers.map(s => (s.match(/<id>([^<]*)/) || [])[1]).join(', '));
const srv = servers.find(s => /<id>(bonitasoft-)?releases<\/id>/.test(s) && /<password>/.test(s));
const u = srv.match(/<username>([^<]*)/)[1], p = srv.match(/<password>([^<]*)/)[1];
const auth = 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
for (const repo of ['releases', 'maven']) {
  const r = await fetch(`https://bonitasoft.jfrog.io/artifactory/${repo}/com/bonitasoft/bonita-test-toolkit/maven-metadata.xml`, { headers: { Authorization: auth } });
  const t = await r.text();
  console.log(repo, r.status, (t.match(/<version>[^<]+/g) || []).map(v => v.slice(9)).slice(-12).join(' '), '| release:', (t.match(/<release>([^<]+)/) || [])[1]);
}
