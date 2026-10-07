---
name: bonita-test-toolkit
description: Write, run and debug end-to-end process tests with Bonita Test Toolkit (BTT) 3.1.x against a live Bonita runtime, including gateway/task/timer/mail checks with MailPit. Use when the user mentions Bonita Test Toolkit, BTT, process or flow tests, integration tests (*IT.java) against a running Bonita, "test process", "flow test", "test toolkit", or setting up a tests/ module in a Bonita project. Replaces bonita-flow-testing. Grounded in the real 3.1.0 jar API (template-test-toolkit docs before 2026-10 used invented APIs).
---

# Bonita Test Toolkit 3.1.x

BTT drives a **live** Bonita through REST: it starts cases, executes human tasks as real users, waits,
reads BDM and variables, forces timers, sends messages/signals. It does not deploy `.bar` files and
does not mock connectors: you test what is deployed.

Everything below was verified against `bonita-test-toolkit-3.1.0.jar` and a Bonita 2026.2 runtime.
Full signatures: `references/api.md`. Templates in `templates/`, helper scripts in `scripts/`.

## 1. Before writing any test (do not skip)

1. **Confirm the version and coordinates**: `com.bonitasoft:bonita-test-toolkit:3.1.0` (latest release
   as of 2026-10). The groupId is `com.bonitasoft`. NOT `org.bonitasoft`, NOT `com.bonitasoft.test`
   (both appear in older PS docs and make Maven fail with `.lastUpdated` files). Repo: Bonitasoft JFrog
   `releases` (employees) or `maven` (customers). Check newer versions with the metadata script in
   `scripts/btt-versions.mjs` (reads `~/.m2/settings.xml`, never prints credentials).
2. **Check what is actually deployed**, not what the docs say: process names/versions, state
   (`RESOLVED`/`ENABLED`), process parameters. `scripts/inspect.mjs` does it over REST.
3. **Read the real contracts** of the instantiation and of each human task with
   `scripts/inspect.mjs contract <caseId>`. Design documents drift: in the reference project the
   doc said `callDateInput: LOCALDATE`, the deployed contract said `OFFSETDATETIME`, and the interest
   decision had moved to another task.
4. **Decide where mail goes** (section 5) before the first case is started.

## 2. Module setup

Standalone Maven module (e.g. `tests/`), not a module of the Studio project, so Studio builds are
unaffected. Template: `templates/pom.xml`. Key points:

- Failsafe runs `*IT.java`; pass `bonita.url`, `bonita.tech.user`, `bonita.tech.password` as
  `systemPropertyVariables` (these are the exact property names BTT reads).
- Do NOT declare `bonita-java-client` yourself: BTT brings its own and a mismatch gives
  `NoSuchMethodError` on `BusinessData`.
- BTT deploys its own REST API extension (`bonita-test-rest-api-extension.zip`, bundled in the jar) on
  first use. The tech user must be allowed to do that.
- Add `awaitility`, `assertj-core`, `junit-jupiter`, `slf4j-simple`; `jackson-databind` if you read MailPit.

## 3. Test class skeleton

```java
@BonitaTests                                   // JUnit 5 extension; injects BonitaTestToolkit
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class MyProcessIT {
    private static final String RUN = String.valueOf(System.currentTimeMillis()); // unique data per run

    @Test @Order(1)
    void should_startCase_when_contractIsValid(BonitaTestToolkit toolkit) {
        var contract = newContract().complexInput("requestInput", complexInput()
                .textInput("email", "btt." + RUN + "@pruebas.local")
                .integerInput("amount", 500)).build();
        ProcessInstance pi = toolkit.getProcessDefinition("MyProcess")
                .startProcessFor(toolkit.getUser("walter.bates"), contract);
        await().atMost(Duration.ofSeconds(60)).until(pi, containsPendingUserTasks("Review"));
        assertThat(pi.getNumberOfFailedFlowNodes()).isZero();
    }
}
```

Static imports: `ContractBuilder.newContract`, `ComplexInputBuilder.complexInput`,
`ProcessInstancePredicates.*`, `Awaitility.await`, `Assertions.assertThat`.
Every model object is a `Callable<Self>`, so `await().until(pi, predicate)` re-reads it from the server.

## 4. Patterns that work

**Execute a human task as whoever the actor filter picked** (do not hard-code the user):
```java
UserTask task = pi.getFirstPendingUserTask("Review");
User executor = task.getCandidates().stream().findFirst().orElseThrow();
task.execute(executor, newContract().booleanInput("approved", true).build());
```

**Tasks inside call activities** are not returned by the root instance. Collect them:
```java
List<UserTask> all = new ArrayList<>(root.searchPendingUserTasks());
for (ProcessInstance sub : root.getSubprocessInstances(SubprocessInstancesCriteria.ALL_FROM_ROOT))
    all.addAll(sub.searchPendingUserTasks());
```
Guard with `root.isArchived()` first: an archived root has nothing pending.

**Timers** do not fire on their own in a test of reasonable length:
`pi.getTimerEventTrigger("Reminder").execute()` (retry with Awaitility until the trigger exists).

**BDM**: `toolkit.getBusinessObjectDAO("com.acme.model.Order")` then `find`, `query(name, params, p, c)`,
`querySingle`; fields via `getStringField`, `getLongField`... (unknown field = `IllegalArgumentException`).
Or `pi.getBusinessData("order")` for the case's own business variable.

**Process parameters**: `def.getParameterValue(name)` / `def.updateParameterValue(name, value)`. Use it
to point SMTP or external URLs at test doubles without redeploying.

**Messages / signals**: `toolkit.send(MessageEvent.create("msg").targetProcess("P").targetFlowNode("Catch")...)`,
`toolkit.send(SignalEvent.create("sig"))`.

**Connector state**: `pi.getConnector("name").getState()` / `ConnectorPredicates.connectorHasFailed()`.

## 5. Mail: test with MailPit, never with the real relay

- Start MailPit so it accepts the Email connector's Basic auth:
  `mailpit --smtp 0.0.0.0:1025 --listen 0.0.0.0:8025 --smtp-auth-accept-any --smtp-auth-allow-insecure`
- Make SMTP host, port, **SSL**, user, password and from **process parameters**. If SSL is a constant
  in the connector you cannot switch to MailPit (no TLS on 1025) without editing every connector.
- Flip them before the run and restore after, in a `finally`: `scripts/smtp.mjs mailpit|restore|status`
  (set `SMTP_CONFS` = JSON map process name -> Studio `.conf` id). Restore values are read from the `.conf`, never printed.
- First test = guard rail: assert `smtpHost` is `localhost` in every process, so a misconfigured run
  fails before sending anything real.
- Assert on content through the MailPit API (`templates/MailPit.java`): HTML part present, no
  unresolved placeholders (`[[`, `{{`), no raw tags in the text part, expected subject.

## 6. Cleanup and safety

- **Never call `toolkit.deleteProcessInstances()` or `toolkit.deleteBDMContent()`** on a server that
  holds anything you care about (demo data, shared test env). They wipe everything, not just your cases.
- Use unique data per run (e-mail/mobile with a run id) so runs never collide with each other or with
  existing data (deduplication logic will otherwise route your case differently).
- **Open test cases keep timers.** Delete the cases the run created (open AND archived) BEFORE
  restoring the real SMTP, or reminders will mail real people later: `scripts/cleanup-cases.mjs <since>`.
  If cleanup fails, leave SMTP on MailPit.
- BDM rows created by the cases are not removed; make them recognisable (`btt.*@pruebas.local`).

## 7. Gotchas (all hit for real)

| Symptom | Cause | Fix |
|---|---|---|
| Every test errors with `StringIndexOutOfBoundsException` in `BonitaTestExtension.getMethodName` | `@DisplayName` on test methods | Remove it. Keep readable descriptions elsewhere (report generator map) |
| `ExecuteTask status: 400`, log: `Expected input [x] is missing` | Bonita requires every contract input key, even optional ones | Send them all: `textInput("x", "")`, `localDateInput("d", null)` |
| `StartProcess status: 500`, H2/DB `NOT NULL` violation | BDM update adds columns but **never relaxes existing NOT NULL** | Relax the column (`templates/BdmNullability.java`, server stopped, H2 backed up) or redeploy BDM on a clean DB |
| Process `UNRESOLVED` after deploying a Studio-built `.bar` | The `local` environment bar has empty `parameters.properties` and no actor mapping | Set parameters and actor members via REST after deploy (`scripts/deploy.mjs` pattern), mapping Studio groups to the server's organization |
| Test waits forever for a mail or a task | Flow differs from the design doc | Inspect the case: active/archived flow nodes and pending tasks via REST before blaming the test |
| `TenantStatusException` installing BDM | Services not paused | `PUT /API/system/maintenance {"maintenanceState":"ENABLED"}`, install, then `DISABLED` (`/API/system/tenant` is gone in 2026.x) |
| `mvn` 404 on `maven-metadata.xml` | Wrong groupId | `com.bonitasoft` |

## 8. Running and reporting

- `mvn -B verify` in the tests module. BTT writes an HTML report per run in
  `target/bonita-test-reports/<Class>_<timestamp>.html`: BPMN diagrams with the path each test took.
  It is the best artefact to share. Disable with `@BonitaTests(disableReport = true)`.
- One-command cycle: `smtp.mjs mailpit` -> `mvn verify` -> (finally) `cleanup-cases.mjs <start>` -> `smtp.mjs restore`. If cleanup fails, do not restore.
- Failing tests that reveal process defects are the point: report them as findings, do not bend the
  assertion to make the suite green.

## 9. Workflow checklist

1. Back up the target DB if the server matters (H2: copy with the server stopped).
2. Confirm deployed processes/parameters/contracts (`inspect.mjs`).
3. Set up MailPit + SMTP parameters; write the guard-rail test first.
4. Happy path to the first human task, then one test per gateway branch, then mails, then timers.
5. Run, read failures in `bonita.log` (`o.b.c.e.EmailConnector` logs every resolved input), iterate.
6. Cleanup cases, restore SMTP, share the BTT report.
