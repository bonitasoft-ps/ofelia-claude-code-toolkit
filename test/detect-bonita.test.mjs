/**
 * Tests for scripts/detect-bonita.mjs (SessionStart hook).
 * Run with: node --test test/
 *
 * Each test creates an isolated temp directory, runs the hook with that
 * directory as cwd, and asserts on the JSON context it emits (or on silence).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../scripts/detect-bonita.mjs", import.meta.url));

function runDetectIn(setup) {
  const dir = mkdtempSync(join(tmpdir(), "detect-bonita-"));
  try {
    setup(dir);
    const result = spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: "utf8" });
    return { status: result.status, stdout: result.stdout ?? "" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function contextOf(stdout) {
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "SessionStart");
  return parsed.hookSpecificOutput.additionalContext;
}

test("maven_pom_with_bonitasoft_groupid_is_detected_as_connector_subtype", () => {
  const { status, stdout } = runDetectIn((dir) => {
    writeFileSync(
      join(dir, "pom.xml"),
      `<project><groupId>org.bonitasoft.connectors</groupId><artifactId>my-connector</artifactId></project>`
    );
  });
  assert.equal(status, 0);
  const context = contextOf(stdout);
  assert.match(context, /Bonita project detected/);
  assert.match(context, /connector \/ extension \(Maven\)/);
  assert.match(context, /spec-connector/);
});

test("bonita_project_yml_is_detected_as_studio_project_with_core_template", () => {
  const { status, stdout } = runDetectIn((dir) => {
    writeFileSync(join(dir, "bonita-project.yml"), "name: my-app\nversion: 1.0.0\n");
  });
  assert.equal(status, 0);
  const context = contextOf(stdout);
  assert.match(context, /Bonita Studio project/);
  assert.match(context, /sdd-core-bonita/);
  assert.match(context, /studioProject/);
});

test("package_json_with_vue_dependency_is_detected_as_vue_frontend", () => {
  const { status, stdout } = runDetectIn((dir) => {
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "my-form", dependencies: { vue: "^3.4.0" } })
    );
  });
  assert.equal(status, 0);
  const context = contextOf(stdout);
  assert.match(context, /frontend \(vue\)/);
  assert.match(context, /spec-front-vue/);
});

test("page_properties_with_apiExtension_is_detected_as_rest_api_extension", () => {
  const { status, stdout } = runDetectIn((dir) => {
    writeFileSync(join(dir, "page.properties"), "name=myapi\ncontentType=apiExtension\n");
  });
  assert.equal(status, 0);
  const context = contextOf(stdout);
  assert.match(context, /rest-api-extension/);
  assert.match(context, /spec-rest-api/);
});

test("empty_directory_produces_no_context_and_exits_cleanly", () => {
  const { status, stdout } = runDetectIn((dir) => {
    // a non-Bonita file must not trigger detection either
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src", "notes.txt"), "nothing bonita here");
  });
  assert.equal(status, 0);
  assert.equal(stdout.trim(), "");
});
