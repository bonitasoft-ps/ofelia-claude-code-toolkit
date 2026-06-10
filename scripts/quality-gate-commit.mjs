#!/usr/bin/env node
/**
 * PreToolUse hook (matcher: Bash): cheap quality gate for git commits in
 * Bonita projects.
 *
 * 1. BLOCKS the commit when staged files (or files named in the command)
 *    include *.db binaries or anything under app/h2_database/ (the H2 dev
 *    database must never be versioned).
 * 2. WARNS (non-blocking) when a staged bom.xml declares custom queries
 *    returning java.util.List without their countFor counterpart
 *    (sdd-core-bonita.md §3: every collection query must be pageable).
 *
 * Never throws: on any internal error it exits 0 (allow) so it can never
 * break an unrelated commit. Limitation: files staged by a `git add` chained
 * in the same command are not yet in the index when this hook runs, so the
 * command text itself is also scanned for forbidden paths.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function out(obj) {
  process.stdout.write(JSON.stringify(obj));
  process.exit(0);
}
const allow = () => process.exit(0);

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  allow();
}

if (input.tool_name !== "Bash") allow();
const command = input.tool_input?.command ?? "";
if (!/\bgit\b[^|;&]*\bcommit\b/.test(command)) allow();

const cwd = input.cwd || process.cwd();
const git = (args) => {
  try {
    return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
};

// Files about to be committed: index, plus tracked changes if `-a`, plus
// anything named in the command itself (covers `git add X && git commit`).
const staged = git("diff --cached --name-only");
if (/\bcommit\b[^|;&]*(\s-\w*a|\s--all\b)/.test(command)) staged.push(...git("diff --name-only"));

const FORBIDDEN = (p) => /\.db$/i.test(p) || /(^|\/)app\/h2_database(\/|$)/.test(p.replace(/\\/g, "/"));
const blocked = [...new Set(staged.filter(FORBIDDEN))];
if (blocked.length === 0 && /\.db\b|h2_database/i.test(command)) blocked.push("(referenced in command)");

if (blocked.length > 0) {
  out({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        `Blocked: committing local database files is forbidden (*.db, app/h2_database/). ` +
        `Offending paths: ${blocked.join(", ")}. Unstage them (git restore --staged <path>) ` +
        `and add them to .gitignore.`,
    },
  });
}

// bom.xml: every custom query returning java.util.List needs a countFor twin.
const warnings = [];
for (const file of staged.filter((f) => f.endsWith("bom.xml"))) {
  let xml = "";
  try {
    xml = readFileSync(join(cwd, file), "utf8");
  } catch {
    continue;
  }
  const names = [...xml.matchAll(/<query\s[^>]*name="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const listQueries = [...xml.matchAll(/<query\s[^>]*name="([^"]+)"[^>]*returnType="java\.util\.List"[^>]*>/g)]
    .map((m) => m[1])
    .filter((n) => !n.startsWith("countFor"));
  const missing = listQueries.filter(
    (n) => !names.includes(`countFor${n.charAt(0).toUpperCase()}${n.slice(1)}`)
  );
  if (missing.length > 0) {
    warnings.push(`${file}: queries returning java.util.List without countFor counterpart: ${missing.join(", ")}`);
  }
}

if (warnings.length > 0) {
  out({
    systemMessage:
      `BDM quality warning (commit allowed): ${warnings.join(" | ")}. ` +
      `Collection queries must be pageable (sdd-core-bonita.md, section 3).`,
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow" },
  });
}

allow();
