# Bonita Test Toolkit 3.1.0: real API

Extracted from `bonita-test-toolkit-3.1.0-sources.jar`. Package root: `com.bonitasoft.test.toolkit`.
Configuration system properties: `bonita.url`, `bonita.tech.user`, `bonita.tech.password`,
`bonita.client.disable.certificate.check`, `bonita.client.http.connection.timeout`.

## Entry points

```java
@BonitaTests(disableReport = false)        // junit.extension.BonitaTests -> BonitaTestExtension
BonitaTestToolkitFactory.INSTANCE.get(MyIT.class)   // without the JUnit extension
```

## BonitaTestToolkit

```
ProcessDefinition getProcessDefinition(String name)
ProcessDefinition getProcessDefinition(String name, String version)
User getUser(String userName)
List<User> findUsersInGroup(String groupPath, int pageIndex, int count)
List<User> findUsersWithRole(String role, int pageIndex, int count)
List<User> findUsersWithMembership(String groupPath, String role, int pageIndex, int count)
BusinessObjectDAO<BusinessData> getBusinessObjectDAO(String businessObjectType)
<T> BusinessObjectDAO<T> getBusinessObjectDAO(String typeName, Class<T> type)
void send(MessageEvent message)
void send(SignalEvent signal)
void deleteProcessInstances()   // DANGER: all instances on the server
void deleteBDMContent()         // DANGER: all business data on the server
```

## ProcessDefinition

```
String getId() / getName() / getVersion()
ProcessInstance startProcessFor(User user)
ProcessInstance startProcessFor(User user, Contract contract)
Set<User> getInitiators()
List<ProcessInstance> getProcessInstances(int p, int c) / getArchivedProcessInstances(int p, int c)
String getParameterValue(String name)
void updateParameterValue(String name, String value)
```

## ProcessInstance

```
String getId() / getArchivedId()
ProcessDefinition getProcessDefinition()
LocalDateTime getStartDate() / getEndDate()
ProcessInstanceState getState()          // INITIALIZING STARTED SUSPENDED CANCELLED ABORTING ABORTED COMPLETING COMPLETED ERROR
boolean isArchived()
User getStartedBy() / getStartedBySubstitute()
BusinessData getBusinessData(String name);  <T> T getBusinessData(String name, Class<T> type)
List<BusinessData> getMultipleBusinessData(String name)
Document getDocument(String name);  List<Document> getMultipleDocument(String name)
Variable getVariable(String name)        // getName getType getDescription getValue (String)
String getSearchKey(String name)
UserTask getFirstPendingUserTask(String name)
List<UserTask> searchPendingUserTasks() / searchPendingUserTasks(String name)
List<UserTask> searchUserTasks() / searchUserTasks(String name)
Task getFirstTask(String name);  List<Task> searchTasks() / searchTasks(String name)
int getNumberOfFailedFlowNodes() / getNumberOfActiveFlowNodes()
TimerEventTrigger getTimerEventTrigger(String timerEventName)   // getId getName getExecutionDate execute()
Connector getConnector(String name)      // getState: DONE FAILED TO_BE_EXECUTED EXECUTING TO_RE_EXECUTE SKIPPED
List<ProcessInstance> getSubprocessInstances(SubprocessInstancesCriteria c)          // DIRECTLY_INVOKED, ALL_FROM_ROOT, LEGACY_ALL_FROM_ROOT
List<ProcessInstance> getArchivedSubprocessInstances(SubprocessInstancesCriteria c)
```

## UserTask (extends AbstractTask)

```
AbstractTask: getId getName getDescription getDisplayName getDisplayDescription getState isArchived
              getType getVariable(name) getRootProcessInstance getParentProcessInstance getConnector(name)
Instant getDueDate();  User getExecutedBy();  Set<User> getCandidates();  User getAssignee()
UserTask assignTo(User user)
UserTask execute() / execute(User) / execute(Contract) / execute(User, Contract)   // throws ExecuteTaskException
BusinessData getIteratorBusinessVariable(String name)    // multi-instance iterator
```
TaskState: READY FAILED COMPLETED INITIALIZING EXECUTING COMPLETING WAITING SKIPPED CANCELLED ABORTED ...
TaskType: USER_TASK HUMAN_TASK MANUAL_TASK AUTOMATIC_TASK CALL_ACTIVITY LOOP_ACTIVITY MULTI_INSTANCE_ACTIVITY

## Contracts

```java
ContractBuilder.newContract()
    .textInput / integerInput / longInput / decimalInput / booleanInput
    .dateInput / localDateInput / localDateTimeInput / offsetDateTimeInput
    .fileInput(name, classpathURL)
    .multipleTextInput(name, List) ... (multiple* for every type)
    .complexInput(name, ComplexInputBuilder.complexInput().textInput(...))
    .build();
ContractBuilder.newContract().fromClasspathResource("contracts/start.json")
```

## BusinessObjectDAO<T> / BusinessData

```
T findByPersistenceId(String id);  List<T> find(int p, int c)
List<T> query(String name, List<QueryParameter<?>> params, int p, int c);  List<T> query(String name, int p, int c)
T querySingle(String name[, params]);  <R> R querySingle(String name[, params], Class<R> resultType)
QueryParameter.stringParameter / booleanParameter / integerParameter / longParameter / doubleParameter / floatParameter / dateParameter
BusinessData.getStringField / getIntegerField / getLongField / getDoubleField / getBooleanField / getFloatField
            / getLocalDateField / getLocalDateTimeField / getOffsetDateTimeField (+ getMultiple*Field)
```

## Events

```java
MessageEvent.create("msgName").targetProcess("Proc").targetFlowNode("CatchMsg") ...build-style setters for content/correlations
SignalEvent.create("signalName")
```

## Predicates (for Awaitility: `await().until(obj, predicate)`)

```
ProcessInstancePredicates: processInstanceStarted/Completed/Archived/Aborted/Cancelled/Suspended/HasError,
    containsPendingUserTasks(String...), hasActiveFlowNodes(n), hasFailedFlowNodes(n),
    hasTimerEventTrigger(name), hasSubprocessInstances(def[, ...]), hasBeenStartedBy(user)
UserTaskPredicates: isAssignedTo(user), hasCandidates(User...), isNotAssigned(), hasBeenExecutedBy(user)
TaskPredicates: taskCompleted(), taskReady(), taskFailed(), taskArchived()
ConnectorPredicates: connectorIsToBeExecuted(), connectorIsDone(), connectorHasFailed()
ProcessDefinitionPredicates: canBeStartedBy(user), hasProcessInstances(n), hasArchivedProcessInstances(n)
```
