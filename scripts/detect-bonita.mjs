#!/usr/bin/env node
/**
 * SessionStart hook: detects whether the current working directory is a Bonita
 * project and, if so, injects context telling Claude which SDD rail commands
 * are available and which artifact subtype was detected.
 *
 * Zero side effects, read-only. Never throws: on any error it stays silent so
 * it can never block a session start.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();

function safeRead(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function hasFileMatching(dir, predicate, depth = 2) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "target") continue;
      const full = join(dir, entry.name);
      if (entry.isFile() && predicate(entry.name)) return true;
      if (entry.isDirectory() && depth > 0 && hasFileMatching(full, predicate, depth - 1)) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

const markers = {
  studioProject: existsSync(join(cwd, "bonita-project.yml")),
  bdm: existsSync(join(cwd, "bdm", "bom.xml")) || existsSync(join(cwd, "bom.xml")),
  process: hasFileMatching(cwd, (n) => n.endsWith(".proc"), 1),
  mavenBonita: (() => {
    const pom = safeRead(join(cwd, "pom.xml"));
    return pom.includes("org.bonitasoft") || pom.includes("bonita-connector") || pom.includes("rest-api-extension");
  })(),
  restApiExt: (() => {
    const pp = safeRead(join(cwd, "page.properties"));
    return pp.includes("contentType=apiExtension");
  })(),
};

// Front framework detection (project that consumes the Bonita REST API)
const pkg = safeRead(join(cwd, "package.json"));
let frontFramework = null;
if (pkg) {
  if (/"(react|react-dom)"/.test(pkg)) frontFramework = "react";
  else if (/"vue"/.test(pkg)) frontFramework = "vue";
  else if (/"@angular\/core"/.test(pkg)) frontFramework = "angular";
  else if (/"svelte"/.test(pkg)) frontFramework = "svelte";
  else if (/"@builder\.io\/qwik"/.test(pkg)) frontFramework = "qwik";
}

const isBonita = Object.values(markers).some(Boolean) || frontFramework;
if (!isBonita) process.exit(0);

// Decide subtype + recommended template
let subtype = "bonita-project";
let template = "sdd-core-bonita";
if (markers.restApiExt) {
  subtype = "rest-api-extension";
  template = "spec-rest-api";
} else if (markers.mavenBonita && !markers.studioProject) {
  subtype = "connector / extension (Maven)";
  template = "spec-connector";
} else if (frontFramework) {
  subtype = `frontend (${frontFramework})`;
  template = `spec-front-${frontFramework}`;
} else if (markers.studioProject || markers.process || markers.bdm) {
  subtype = "Bonita Studio project";
  template = "sdd-core-bonita";
}

const detected = Object.entries(markers)
  .filter(([, v]) => v)
  .map(([k]) => k)
  .concat(frontFramework ? [`front:${frontFramework}`] : [])
  .join(", ");

const context = `## Bonita project detected (SDD)

This working directory looks like a **Bonita** artifact. Detected markers: ${detected || "front framework"}.
Recommended SDD subtype: **${subtype}** (template: \`${template}\`).

Spec-Driven Development rail is available. Suggested commands:
- \`/sdd-init\`  start a new artifact (detect type → spec → plan → tasks)
- \`/spec\`      write or refine the specification (acceptance criteria, contracts)
- \`/plan\`      architecture + ADRs + risks (delegates to the matching lifecycle skill)
- \`/tasks\`     break the plan into actionable tasks with quality gates
- \`/sdd-adopt\` reverse-engineer an SDD.md for this existing project (read-only first)

The SDD rail ORCHESTRATES the existing lifecycle skills (connector / rest-api /
process / bdm / audit / upgrade / testing). It does not replace them. Quality
gates: JaCoCo >=80%, PIT mutation >=80%, Checkstyle+PMD+SpotBugs, OWASP; front:
ESLint+Prettier+Vitest+Playwright.`;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context,
    },
  })
);
