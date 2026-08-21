# Provision Index

## Intent

Use this generated page to resolve a provision ID to its heading and owning page.

Run `node tools/generate-provisions.mjs` after any provision change. The repository validator fails when this page and the active standards disagree.

The active release states 778 provisions across 8 areas.

## BACKEND

| ID | Provision | Page |
|:---|:---|:---|
| BACKEND.API.ACTOR.001 | [Derive authenticated identity from claims](../conventions/backend/api.md#derive-authenticated-identity-from-claims-backendapiactor001) | `conventions/backend/api.md` |
| BACKEND.API.ACTOR.002 | [Reject a client-supplied actor identifier](../conventions/backend/api.md#reject-a-client-supplied-actor-identifier-backendapiactor002) | `conventions/backend/api.md` |
| BACKEND.API.AUTHZ.001 | [Authorize the target resource](../conventions/backend/api.md#authorize-the-target-resource-backendapiauthz001) | `conventions/backend/api.md` |
| BACKEND.API.BOUNDARY.001 | [Keep endpoint dependencies transport-focused](../conventions/backend/api.md#keep-endpoint-dependencies-transport-focused-backendapiboundary001) | `conventions/backend/api.md` |
| BACKEND.API.BOUNDARY.002 | [Defer error mapping to the global handler](../conventions/backend/api.md#defer-error-mapping-to-the-global-handler-backendapiboundary002) | `conventions/backend/api.md` |
| BACKEND.API.CONVENTION.001 | [Use this endpoint layout](../conventions/backend/api.md#use-this-endpoint-layout-backendapiconvention001) | `conventions/backend/api.md` |
| BACKEND.API.CONVENTION.002 | [Keep transport models independent](../conventions/backend/api.md#keep-transport-models-independent-backendapiconvention002) | `conventions/backend/api.md` |
| BACKEND.API.CONVENTION.003 | [Name routes from resources](../conventions/backend/api.md#name-routes-from-resources-backendapiconvention003) | `conventions/backend/api.md` |
| BACKEND.API.CONVENTION.004 | [Keep numeric transport types precise](../conventions/backend/api.md#keep-numeric-transport-types-precise-backendapiconvention004) | `conventions/backend/api.md` |
| BACKEND.API.CONVENTION.005 | [Keep Program.cs as composition](../conventions/backend/api.md#keep-programcs-as-composition-backendapiconvention005) | `conventions/backend/api.md` |
| BACKEND.API.ENDPOINTS.001 | [Use one endpoint per operation](../conventions/backend/api.md#use-one-endpoint-per-operation-backendapiendpoints001) | `conventions/backend/api.md` |
| BACKEND.API.ENDPOINTS.002 | [Exclude MVC controllers from the profile](../conventions/backend/api.md#exclude-mvc-controllers-from-the-profile-backendapiendpoints002) | `conventions/backend/api.md` |
| BACKEND.API.ERRORS.001 | [Return stable Problem Details](../conventions/backend/api.md#return-stable-problem-details-backendapierrors001) | `conventions/backend/api.md` |
| BACKEND.API.ERRORS.002 | [Keep error responses free of internal detail](../conventions/backend/api.md#keep-error-responses-free-of-internal-detail-backendapierrors002) | `conventions/backend/api.md` |
| BACKEND.API.MODELS.001 | [Mirror a Domain closed set as a transport model of the same shape](../conventions/backend/api.md#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape-backendapimodels001) | `conventions/backend/api.md` |
| BACKEND.API.MODELS.002 | [Reject a collapsed or borrowed wire contract](../conventions/backend/api.md#reject-a-collapsed-or-borrowed-wire-contract-backendapimodels002) | `conventions/backend/api.md` |
| BACKEND.API.OPENAPI.001 | [Treat OpenAPI as a generated contract](../conventions/backend/api.md#treat-openapi-as-a-generated-contract-backendapiopenapi001) | `conventions/backend/api.md` |
| BACKEND.API.OPENAPI.002 | [Reflect enforced authentication in the contract](../conventions/backend/api.md#reflect-enforced-authentication-in-the-contract-backendapiopenapi002) | `conventions/backend/api.md` |
| BACKEND.API.OPENAPI.003 | [Publish precise, complete schemas](../conventions/backend/api.md#publish-precise-complete-schemas-backendapiopenapi003) | `conventions/backend/api.md` |
| BACKEND.API.OPENAPI.004 | [Commit the generated contract its consumers read](../conventions/backend/api.md#commit-the-generated-contract-its-consumers-read-backendapiopenapi004) | `conventions/backend/api.md` |
| BACKEND.API.PAGING.001 | [Bound collection queries](../conventions/backend/api.md#bound-collection-queries-backendapipaging001) | `conventions/backend/api.md` |
| BACKEND.API.ROUTES.001 | [Keep routes resource-oriented](../conventions/backend/api.md#keep-routes-resource-oriented-backendapiroutes001) | `conventions/backend/api.md` |
| BACKEND.API.STATUS.001 | [Use consistent status codes](../conventions/backend/api.md#use-consistent-status-codes-backendapistatus001) | `conventions/backend/api.md` |
| BACKEND.API.STATUS.002 | [Reject a success status for a failed outcome](../conventions/backend/api.md#reject-a-success-status-for-a-failed-outcome-backendapistatus002) | `conventions/backend/api.md` |
| BACKEND.APPLICATION.AUTHORIZATION.001 | [Enforce target authorization in the use case](../conventions/backend/application.md#enforce-target-authorization-in-the-use-case-backendapplicationauthorization001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CLOSEDSET.001 | [Mirror a Domain closed set in the result](../conventions/backend/application.md#mirror-a-domain-closed-set-in-the-result-backendapplicationclosedset001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.COMMAND.001 | [Keep command handlers narrow](../conventions/backend/application.md#keep-command-handlers-narrow-backendapplicationcommand001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CONTRACTS.001 | [Co-locate contracts and implementations](../conventions/backend/application.md#co-locate-contracts-and-implementations-backendapplicationcontracts001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.001 | [Use this operation layout](../conventions/backend/application.md#use-this-operation-layout-backendapplicationconvention001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.002 | [Keep messages immutable](../conventions/backend/application.md#keep-messages-immutable-backendapplicationconvention002) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.003 | [Return use-case results](../conventions/backend/application.md#return-use-case-results-backendapplicationconvention003) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.004 | [Keep mappings at the owning boundary](../conventions/backend/application.md#keep-mappings-at-the-owning-boundary-backendapplicationconvention004) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.FAILURES.001 | [Model expected use-case failures explicitly](../conventions/backend/application.md#model-expected-use-case-failures-explicitly-backendapplicationfailures001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.MEDIATOR.001 | [Use specific LiteBus entry points](../conventions/backend/application.md#use-specific-litebus-entry-points-backendapplicationmediator001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.ORCHESTRATION.001 | [Keep one state-changing Use case in one Command pipeline](../conventions/backend/application.md#keep-one-state-changing-use-case-in-one-command-pipeline-backendapplicationorchestration001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.PORTS.001 | [Define narrow external ports](../conventions/backend/application.md#define-narrow-external-ports-backendapplicationports001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.QUERY.001 | [Project queries directly](../conventions/backend/application.md#project-queries-directly-backendapplicationquery001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.REACTION.001 | [Keep event reaction implementations explicit](../conventions/backend/application.md#keep-event-reaction-implementations-explicit-backendapplicationreaction001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.STRUCTURE.001 | [Organize Application by operation](../conventions/backend/application.md#organize-application-by-operation-backendapplicationstructure001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.VALIDATION.001 | [Separate input validation from invariants](../conventions/backend/application.md#separate-input-validation-from-invariants-backendapplicationvalidation001) | `conventions/backend/application.md` |
| BACKEND.APPLICATION.WORKFLOW.001 | [Advance durable Workflows through separate Commands](../conventions/backend/application.md#advance-durable-workflows-through-separate-commands-backendapplicationworkflow001) | `conventions/backend/application.md` |
| BACKEND.ARCHITECTURE.APPLICATION.001 | [Keep one Application assembly](../conventions/backend/architecture.md#keep-one-application-assembly-backendarchitectureapplication001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.COMPOSITION.001 | [Compose each process explicitly](../conventions/backend/architecture.md#compose-each-process-explicitly-backendarchitecturecomposition001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONTRACTS.001 | [Own each layer's contract types](../conventions/backend/architecture.md#own-each-layers-contract-types-backendarchitecturecontracts001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.001 | [Use mirrored module folders](../conventions/backend/architecture.md#use-mirrored-module-folders-backendarchitectureconvention001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.002 | [Keep composition in hosts](../conventions/backend/architecture.md#keep-composition-in-hosts-backendarchitectureconvention002) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.003 | [Use one public assembly marker per scanned project](../conventions/backend/architecture.md#use-one-public-assembly-marker-per-scanned-project-backendarchitectureconvention003) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.CQRS.001 | [Separate command and query behavior](../conventions/backend/architecture.md#separate-command-and-query-behavior-backendarchitecturecqrs001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.DEPENDENCIES.001 | [Point dependencies inward](../conventions/backend/architecture.md#point-dependencies-inward-backendarchitecturedependencies001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.DOMAIN.001 | [Keep business invariants in Domain](../conventions/backend/architecture.md#keep-business-invariants-in-domain-backendarchitecturedomain001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.ENFORCEMENT.001 | [Test structural boundaries](../conventions/backend/architecture.md#test-structural-boundaries-backendarchitectureenforcement001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.MODULES.001 | [Organize every layer by module and use case](../conventions/backend/architecture.md#organize-every-layer-by-module-and-use-case-backendarchitecturemodules001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.PROJECTS.001 | [Use four application projects](../conventions/backend/architecture.md#use-four-application-projects-backendarchitectureprojects001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.VISIBILITY.001 | [Keep implementation types internal](../conventions/backend/architecture.md#keep-implementation-types-internal-backendarchitecturevisibility001) | `conventions/backend/architecture.md` |
| BACKEND.ARCHITECTURE.WORKER.001 | [Add Worker only for an independent process boundary](../conventions/backend/architecture.md#add-worker-only-for-an-independent-process-boundary-backendarchitectureworker001) | `conventions/backend/architecture.md` |
| BACKEND.DOMAIN.AGGREGATE.001 | [Treat aggregates as consistency boundaries](../conventions/backend/domain.md#treat-aggregates-as-consistency-boundaries-backenddomainaggregate001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.BASE.001 | [Use the project aggregate root contract](../conventions/backend/domain.md#use-the-project-aggregate-root-contract-backenddomainbase001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.BEHAVIOR.001 | [Express transitions through business methods](../conventions/backend/domain.md#express-transitions-through-business-methods-backenddomainbehavior001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CLOSEDSET.001 | [Model every closed set of domain values without enums](../conventions/backend/domain.md#model-every-closed-set-of-domain-values-without-enums-backenddomainclosedset001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.COLLECTION.001 | [Define collection value semantics explicitly](../conventions/backend/domain.md#define-collection-value-semantics-explicitly-backenddomaincollection001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.001 | [Apply the documented defaults](../conventions/backend/domain.md#apply-the-documented-defaults-backenddomainconvention001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.002 | [Organize a module by aggregate and concept](../conventions/backend/domain.md#organize-a-module-by-aggregate-and-concept-backenddomainconvention002) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.003 | [Use these Domain names](../conventions/backend/domain.md#use-these-domain-names-backenddomainconvention003) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.004 | [Define the shared Domain contracts once](../conventions/backend/domain.md#define-the-shared-domain-contracts-once-backenddomainconvention004) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.005 | [Define typed IDs without primitive escape hatches](../conventions/backend/domain.md#define-typed-ids-without-primitive-escape-hatches-backenddomainconvention005) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.006 | [Keep ID representations aligned at every boundary](../conventions/backend/domain.md#keep-id-representations-aligned-at-every-boundary-backenddomainconvention006) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.007 | [Keep state records as the only Aggregate lifecycle representation](../conventions/backend/domain.md#keep-state-records-as-the-only-aggregate-lifecycle-representation-backenddomainconvention007) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.008 | [Keep value creation and equality explicit](../conventions/backend/domain.md#keep-value-creation-and-equality-explicit-backenddomainconvention008) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.009 | [Keep domain services pure](../conventions/backend/domain.md#keep-domain-services-pure-backenddomainconvention009) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.010 | [Keep repository contracts aggregate-specific](../conventions/backend/domain.md#keep-repository-contracts-aggregate-specific-backenddomainconvention010) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.DOCUMENTATION.001 | [Document every public Domain contract](../conventions/backend/domain.md#document-every-public-domain-contract-backenddomaindocumentation001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.ENTITY.001 | [Keep child entities inside the aggregate boundary](../conventions/backend/domain.md#keep-child-entities-inside-the-aggregate-boundary-backenddomainentity001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.ERROR.001 | [Reject business violations with Domain exceptions](../conventions/backend/domain.md#reject-business-violations-with-domain-exceptions-backenddomainerror001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.EVENT.001 | [Raise immutable domain facts](../conventions/backend/domain.md#raise-immutable-domain-facts-backenddomainevent001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.FACTORY.001 | [Create valid aggregates through named factories](../conventions/backend/domain.md#create-valid-aggregates-through-named-factories-backenddomainfactory001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.ID.001 | [Use strongly typed version 7 identifiers](../conventions/backend/domain.md#use-strongly-typed-version-7-identifiers-backenddomainid001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.LANGUAGE.001 | [Use one ubiquitous language](../conventions/backend/domain.md#use-one-ubiquitous-language-backenddomainlanguage001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.MONEY.001 | [Make money and decimal rules explicit](../conventions/backend/domain.md#make-money-and-decimal-rules-explicit-backenddomainmoney001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.PURITY.001 | [Keep Domain free of outer-layer concerns](../conventions/backend/domain.md#keep-domain-free-of-outer-layer-concerns-backenddomainpurity001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.REFERENCE.001 | [Reference other aggregates by ID](../conventions/backend/domain.md#reference-other-aggregates-by-id-backenddomainreference001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.REPOSITORY.001 | [Keep repository interfaces in Domain](../conventions/backend/domain.md#keep-repository-interfaces-in-domain-backenddomainrepository001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.SERVICE.001 | [Use stateless domain services for ownerless rules](../conventions/backend/domain.md#use-stateless-domain-services-for-ownerless-rules-backenddomainservice001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.STATE.001 | [Model every Aggregate lifecycle with state records](../conventions/backend/domain.md#model-every-aggregate-lifecycle-with-state-records-backenddomainstate001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.TIME.001 | [Pass nondeterministic values into Domain](../conventions/backend/domain.md#pass-nondeterministic-values-into-domain-backenddomaintime001) | `conventions/backend/domain.md` |
| BACKEND.DOMAIN.VALUE.001 | [Use immutable value objects for domain concepts](../conventions/backend/domain.md#use-immutable-value-objects-for-domain-concepts-backenddomainvalue001) | `conventions/backend/domain.md` |
| BACKEND.PERSISTENCE.COMMIT.001 | [Commit once in the command pipeline](../conventions/backend/persistence-marten.md#commit-once-in-the-command-pipeline-backendpersistencecommit001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.001 | [Use this Infrastructure layout](../conventions/backend/persistence-marten.md#use-this-infrastructure-layout-backendpersistenceconvention001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.002 | [Register one scoped session](../conventions/backend/persistence-marten.md#register-one-scoped-session-backendpersistenceconvention002) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.003 | [Make ordering explicit](../conventions/backend/persistence-marten.md#make-ordering-explicit-backendpersistenceconvention003) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.004 | [Review query plans for new indexes](../conventions/backend/persistence-marten.md#review-query-plans-for-new-indexes-backendpersistenceconvention004) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.005 | [Add read documents for query-shaped data](../conventions/backend/persistence-marten.md#add-read-documents-for-query-shaped-data-backendpersistenceconvention005) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.CONVENTION.006 | [Persist one explicit state object](../conventions/backend/persistence-marten.md#persist-one-explicit-state-object-backendpersistenceconvention006) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.DOCUMENT.001 | [Bound aggregate document growth](../conventions/backend/persistence-marten.md#bound-aggregate-document-growth-backendpersistencedocument001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.EVENTS.001 | [Collect events without a public unit of work](../conventions/backend/persistence-marten.md#collect-events-without-a-public-unit-of-work-backendpersistenceevents001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.EVOLUTION.001 | [Evolve stored document contracts explicitly](../conventions/backend/persistence-marten.md#evolve-stored-document-contracts-explicitly-backendpersistenceevolution001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.MAPPING.001 | [Keep mappings and aliases explicit](../conventions/backend/persistence-marten.md#keep-mappings-and-aliases-explicit-backendpersistencemapping001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.NAMING.001 | [Use database naming conventions](../conventions/backend/persistence-marten.md#use-database-naming-conventions-backendpersistencenaming001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.READ.001 | [Query through IQuerySession](../conventions/backend/persistence-marten.md#query-through-iquerysession-backendpersistenceread001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.SCHEMA.001 | [Control production schema changes](../conventions/backend/persistence-marten.md#control-production-schema-changes-backendpersistenceschema001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.SERIALIZATION.001 | [Keep serialization behavior out of Domain](../conventions/backend/persistence-marten.md#keep-serialization-behavior-out-of-domain-backendpersistenceserialization001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.TEST.001 | [Test persistence against PostgreSQL](../conventions/backend/persistence-marten.md#test-persistence-against-postgresql-backendpersistencetest001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.WORKFLOW.001 | [Stage Workflow progress with outgoing work](../conventions/backend/persistence-marten.md#stage-workflow-progress-with-outgoing-work-backendpersistenceworkflow001) | `conventions/backend/persistence-marten.md` |
| BACKEND.PERSISTENCE.WRITE.001 | [Stage aggregate writes through repositories](../conventions/backend/persistence-marten.md#stage-aggregate-writes-through-repositories-backendpersistencewrite001) | `conventions/backend/persistence-marten.md` |
| BACKEND.TESTING.APPLICATION.001 | [Test Application coordination](../conventions/backend/testing.md#test-application-coordination-backendtestingapplication001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.ARCHITECTURE.001 | [Enforce architecture rules](../conventions/backend/testing.md#enforce-architecture-rules-backendtestingarchitecture001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.CONVENTION.001 | [Mirror production module names](../conventions/backend/testing.md#mirror-production-module-names-backendtestingconvention001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.CONVENTION.002 | [Name tests by observable behavior](../conventions/backend/testing.md#name-tests-by-observable-behavior-backendtestingconvention002) | `conventions/backend/testing.md` |
| BACKEND.TESTING.CONVENTION.003 | [Use builders for valid defaults](../conventions/backend/testing.md#use-builders-for-valid-defaults-backendtestingconvention003) | `conventions/backend/testing.md` |
| BACKEND.TESTING.CONVENTION.004 | [Keep assertions focused](../conventions/backend/testing.md#keep-assertions-focused-backendtestingconvention004) | `conventions/backend/testing.md` |
| BACKEND.TESTING.COVERAGE.001 | [Use evidence rather than one coverage target](../conventions/backend/testing.md#use-evidence-rather-than-one-coverage-target-backendtestingcoverage001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.DOMAIN.001 | [Test Domain in isolation](../conventions/backend/testing.md#test-domain-in-isolation-backendtestingdomain001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.GENERATED.001 | [Verify generated contracts](../conventions/backend/testing.md#verify-generated-contracts-backendtestinggenerated001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.HARNESS.001 | [Use one production-faithful integration harness](../conventions/backend/testing.md#use-one-production-faithful-integration-harness-backendtestingharness001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.INTEGRATION.001 | [Test persistence and HTTP with PostgreSQL](../conventions/backend/testing.md#test-persistence-and-http-with-postgresql-backendtestingintegration001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.ISOLATION.001 | [Isolate integration state](../conventions/backend/testing.md#isolate-integration-state-backendtestingisolation001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.PROJECTS.001 | [Use four baseline test projects](../conventions/backend/testing.md#use-four-baseline-test-projects-backendtestingprojects001) | `conventions/backend/testing.md` |
| BACKEND.TESTING.TRACE.001 | [Trace acceptance criteria](../conventions/backend/testing.md#trace-acceptance-criteria-backendtestingtrace001) | `conventions/backend/testing.md` |

## BLAZOR

| ID | Provision | Page |
|:---|:---|:---|
| BLAZOR.BROWSER.CONVENTION.001 | [Select the storage mechanism per shape](../conventions/frontend-blazor/persistence-browser.md#select-the-storage-mechanism-per-shape-blazorbrowserconvention001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.CONVENTION.002 | [Keep a stable serialization contract](../conventions/frontend-blazor/persistence-browser.md#keep-a-stable-serialization-contract-blazorbrowserconvention002) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.CONVENTION.003 | [Record the classification](../conventions/frontend-blazor/persistence-browser.md#record-the-classification-blazorbrowserconvention003) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.KEYS.001 | [Version and scope every storage key](../conventions/frontend-blazor/persistence-browser.md#version-and-scope-every-storage-key-blazorbrowserkeys001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.LIMITS.001 | [Bound what is stored](../conventions/frontend-blazor/persistence-browser.md#bound-what-is-stored-blazorbrowserlimits001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.MIGRATION.001 | [Provide a migration for every changed shape](../conventions/frontend-blazor/persistence-browser.md#provide-a-migration-for-every-changed-shape-blazorbrowsermigration001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.PERSISTENCE.001 | [Own storage in Infrastructure](../conventions/frontend-blazor/persistence-browser.md#own-storage-in-infrastructure-blazorbrowserpersistence001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.PORTABILITY.001 | [Provide export and import](../conventions/frontend-blazor/persistence-browser.md#provide-export-and-import-blazorbrowserportability001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.BROWSER.READS.001 | [Treat reads as fallible](../conventions/frontend-blazor/persistence-browser.md#treat-reads-as-fallible-blazorbrowserreads001) | `conventions/frontend-blazor/persistence-browser.md` |
| BLAZOR.COMPONENTS.CONVENTION.001 | [Name for the boundary role](../conventions/frontend-blazor/components.md#name-for-the-boundary-role-blazorcomponentsconvention001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.CONVENTION.002 | [Apply one styling system](../conventions/frontend-blazor/components.md#apply-one-styling-system-blazorcomponentsconvention002) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.CONVENTION.003 | [Keep accessibility in the component](../conventions/frontend-blazor/components.md#keep-accessibility-in-the-component-blazorcomponentsconvention003) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.EVENTS.001 | [Raise events rather than mutating](../conventions/frontend-blazor/components.md#raise-events-rather-than-mutating-blazorcomponentsevents001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.FILES.001 | [Place one component per file](../conventions/frontend-blazor/components.md#place-one-component-per-file-blazorcomponentsfiles001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.INTEROP.001 | [Resolve browser behavior through an interface](../conventions/frontend-blazor/components.md#resolve-browser-behavior-through-an-interface-blazorcomponentsinterop001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.PARAMETERS.001 | [Declare every parameter type](../conventions/frontend-blazor/components.md#declare-every-parameter-type-blazorcomponentsparameters001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.PRESENTATION.001 | [Keep components presentational](../conventions/frontend-blazor/components.md#keep-components-presentational-blazorcomponentspresentation001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.COMPONENTS.VIEWMODELS.001 | [Own the layer contract](../conventions/frontend-blazor/components.md#own-the-layer-contract-blazorcomponentsviewmodels001) | `conventions/frontend-blazor/components.md` |
| BLAZOR.DATA.CLASSIFICATION.001 | [Classify state](../conventions/frontend-blazor/data-and-state.md#classify-state-blazordataclassification001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.CONVENTION.001 | [Keep forms typed](../conventions/frontend-blazor/data-and-state.md#keep-forms-typed-blazordataconvention001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.CONVENTION.002 | [Prefer explicit refresh](../conventions/frontend-blazor/data-and-state.md#prefer-explicit-refresh-blazordataconvention002) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.DERIVED.001 | [Keep derived values single-sourced](../conventions/frontend-blazor/data-and-state.md#keep-derived-values-single-sourced-blazordataderived001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.LOAD.001 | [Load persisted state once](../conventions/frontend-blazor/data-and-state.md#load-persisted-state-once-blazordataload001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.RESULTS.001 | [Make failure explicit](../conventions/frontend-blazor/data-and-state.md#make-failure-explicit-blazordataresults001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.USECASE.001 | [Route use cases through Application](../conventions/frontend-blazor/data-and-state.md#route-use-cases-through-application-blazordatausecase001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.DATA.VALIDATION.001 | [Validate at the boundary](../conventions/frontend-blazor/data-and-state.md#validate-at-the-boundary-blazordatavalidation001) | `conventions/frontend-blazor/data-and-state.md` |
| BLAZOR.RENDERING.ACQUISITION.001 | [Keep the acquisition surface static](../conventions/frontend-blazor/rendering.md#keep-the-acquisition-surface-static-blazorrenderingacquisition001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.CONVENTION.001 | [Name routes for the reader](../conventions/frontend-blazor/rendering.md#name-routes-for-the-reader-blazorrenderingconvention001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.CONVENTION.002 | [Keep navigation state in the URL](../conventions/frontend-blazor/rendering.md#keep-navigation-state-in-the-url-blazorrenderingconvention002) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.MODE.001 | [Render on the client only](../conventions/frontend-blazor/rendering.md#render-on-the-client-only-blazorrenderingmode001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.OFFLINE.001 | [Operate offline after first load](../conventions/frontend-blazor/rendering.md#operate-offline-after-first-load-blazorrenderingoffline001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.ROUTES.001 | [Declare routes on pages](../conventions/frontend-blazor/rendering.md#declare-routes-on-pages-blazorrenderingroutes001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.RENDERING.STATES.001 | [Give every route explicit states](../conventions/frontend-blazor/rendering.md#give-every-route-explicit-states-blazorrenderingstates001) | `conventions/frontend-blazor/rendering.md` |
| BLAZOR.STRUCTURE.BOUNDARIES.001 | [Isolate module internals](../conventions/frontend-blazor/structure.md#isolate-module-internals-blazorstructureboundaries001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.CONVENTION.001 | [Place interop adapters together](../conventions/frontend-blazor/structure.md#place-interop-adapters-together-blazorstructureconvention001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.CONVENTION.002 | [Keep static content out of the assembly](../conventions/frontend-blazor/structure.md#keep-static-content-out-of-the-assembly-blazorstructureconvention002) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.DOMAIN.001 | [Keep Domain free of browser concerns](../conventions/frontend-blazor/structure.md#keep-domain-free-of-browser-concerns-blazorstructuredomain001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.FEATURES.001 | [Organize features by module and use case](../conventions/frontend-blazor/structure.md#organize-features-by-module-and-use-case-blazorstructurefeatures001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.IMPORTS.001 | [Keep imports directional](../conventions/frontend-blazor/structure.md#keep-imports-directional-blazorstructureimports001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.STRUCTURE.STRUCTURE.001 | [Use the client solution tree](../conventions/frontend-blazor/structure.md#use-the-client-solution-tree-blazorstructurestructure001) | `conventions/frontend-blazor/structure.md` |
| BLAZOR.TESTING.ACCEPTANCE.001 | [Cite acceptance criteria](../conventions/frontend-blazor/testing.md#cite-acceptance-criteria-blazortestingacceptance001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.BUDGET.001 | [Enforce the first-load budget](../conventions/frontend-blazor/testing.md#enforce-the-first-load-budget-blazortestingbudget001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.COMPONENTS.001 | [Replace interop in component tests](../conventions/frontend-blazor/testing.md#replace-interop-in-component-tests-blazortestingcomponents001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.CONVENTION.001 | [Keep browser-capability tests honest](../conventions/frontend-blazor/testing.md#keep-browser-capability-tests-honest-blazortestingconvention001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.CONVENTION.002 | [Keep end-to-end tests few](../conventions/frontend-blazor/testing.md#keep-end-to-end-tests-few-blazortestingconvention002) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.CORE.001 | [Test the core without a browser](../conventions/frontend-blazor/testing.md#test-the-core-without-a-browser-blazortestingcore001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.E2E.001 | [Verify real browser behavior end to end](../conventions/frontend-blazor/testing.md#verify-real-browser-behavior-end-to-end-blazortestinge2e001) | `conventions/frontend-blazor/testing.md` |
| BLAZOR.TESTING.PROJECTS.001 | [Use the four client test projects](../conventions/frontend-blazor/testing.md#use-the-four-client-test-projects-blazortestingprojects001) | `conventions/frontend-blazor/testing.md` |

## CORE

| ID | Provision | Page |
|:---|:---|:---|
| CORE.AGENT.COMPLETE.001 | [Run and report verification](../foundations/agent-protocol.md#run-and-report-verification-coreagentcomplete001) | `foundations/agent-protocol.md` |
| CORE.AGENT.CONFLICT.001 | [Stop on unresolved conflict](../foundations/agent-protocol.md#stop-on-unresolved-conflict-coreagentconflict001) | `foundations/agent-protocol.md` |
| CORE.AGENT.CONVENTION.001 | [Select one task label](../foundations/agent-protocol.md#select-one-task-label-coreagentconvention001) | `foundations/agent-protocol.md` |
| CORE.AGENT.CONVENTION.002 | [Escalate from summary to full document](../foundations/agent-protocol.md#escalate-from-summary-to-full-document-coreagentconvention002) | `foundations/agent-protocol.md` |
| CORE.AGENT.CONVENTION.003 | [Inspect local examples after standards](../foundations/agent-protocol.md#inspect-local-examples-after-standards-coreagentconvention003) | `foundations/agent-protocol.md` |
| CORE.AGENT.EDIT.001 | [Inspect existing work before editing](../foundations/agent-protocol.md#inspect-existing-work-before-editing-coreagentedit001) | `foundations/agent-protocol.md` |
| CORE.AGENT.EDIT.002 | [Restrict unapproved side effects](../foundations/agent-protocol.md#restrict-unapproved-side-effects-coreagentedit002) | `foundations/agent-protocol.md` |
| CORE.AGENT.EDIT.003 | [Make coherent scoped changes](../foundations/agent-protocol.md#make-coherent-scoped-changes-coreagentedit003) | `foundations/agent-protocol.md` |
| CORE.AGENT.LOAD.001 | [Select task context](../foundations/agent-protocol.md#select-task-context-coreagentload001) | `foundations/agent-protocol.md` |
| CORE.AGENT.LOAD.002 | [Load context by tier](../foundations/agent-protocol.md#load-context-by-tier-coreagentload002) | `foundations/agent-protocol.md` |
| CORE.AGENT.LOAD.003 | [Load applicable extensions](../foundations/agent-protocol.md#load-applicable-extensions-coreagentload003) | `foundations/agent-protocol.md` |
| CORE.AGENT.LOAD.004 | [Read active behavior specifications](../foundations/agent-protocol.md#read-active-behavior-specifications-coreagentload004) | `foundations/agent-protocol.md` |
| CORE.AGENT.PRECEDENCE.001 | [Apply guidance precedence](../foundations/agent-protocol.md#apply-guidance-precedence-coreagentprecedence001) | `foundations/agent-protocol.md` |
| CORE.AGENT.PRECEDENCE.002 | [Replace only declared conventions](../foundations/agent-protocol.md#replace-only-declared-conventions-coreagentprecedence002) | `foundations/agent-protocol.md` |
| CORE.AGENT.SYNC.001 | [Update behavior records with code](../foundations/agent-protocol.md#update-behavior-records-with-code-coreagentsync001) | `foundations/agent-protocol.md` |
| CORE.AUTHORING.ASCII.001 | [Keep authored prose ASCII-safe](../foundations/authoring-standard.md#keep-authored-prose-ascii-safe-coreauthoringascii001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.ASCII.002 | [Exclude declared content paths from the ASCII check](../foundations/authoring-standard.md#exclude-declared-content-paths-from-the-ascii-check-coreauthoringascii002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.CASE.001 | [Use controlled capitalization](../foundations/authoring-standard.md#use-controlled-capitalization-coreauthoringcase001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.CONVENTION.001 | [Prefer direct action headings](../foundations/authoring-standard.md#prefer-direct-action-headings-coreauthoringconvention001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.CONVENTION.002 | [Prefer positive instructions](../foundations/authoring-standard.md#prefer-positive-instructions-coreauthoringconvention002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.CONVENTION.003 | [Use tables for exact mappings](../foundations/authoring-standard.md#use-tables-for-exact-mappings-coreauthoringconvention003) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.DEFAULTS.001 | [Identify actionable conventions](../foundations/authoring-standard.md#identify-actionable-conventions-coreauthoringdefaults001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.EXAMPLE.001 | [Attach examples to their provisions](../foundations/authoring-standard.md#attach-examples-to-their-provisions-coreauthoringexample001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.IDENTIFIER.001 | [Use the declared identifier grammar](../foundations/authoring-standard.md#use-the-declared-identifier-grammar-coreauthoringidentifier001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.IDENTIFIER.002 | [Restrict the CONVENTION segment to replaceable defaults](../foundations/authoring-standard.md#restrict-the-convention-segment-to-replaceable-defaults-coreauthoringidentifier002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.INDEX.001 | [Regenerate the provision index](../foundations/authoring-standard.md#regenerate-the-provision-index-coreauthoringindex001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.METADATA.002 | [Declare structured specification metadata](../foundations/authoring-standard.md#declare-structured-specification-metadata-coreauthoringmetadata002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.METADATA.003 | [Use one metadata carrier](../foundations/authoring-standard.md#use-one-metadata-carrier-coreauthoringmetadata003) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.NORMATIVE.002 | [Use one normative vocabulary](../foundations/authoring-standard.md#use-one-normative-vocabulary-coreauthoringnormative002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.PAGE.001 | [Use the declared page contract](../foundations/authoring-standard.md#use-the-declared-page-contract-coreauthoringpage001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.PROSE.001 | [Apply controlled prose measures](../foundations/authoring-standard.md#apply-controlled-prose-measures-coreauthoringprose001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.QUALITY.001 | [Apply the four quality tests](../foundations/authoring-standard.md#apply-the-four-quality-tests-coreauthoringquality001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.REQUIREMENT.001 | [Write atomic Standards provisions](../foundations/authoring-standard.md#write-atomic-standards-provisions-coreauthoringrequirement001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.001 | [Validate current standards material](../foundations/authoring-standard.md#validate-current-standards-material-coreauthoringsnapshot001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.002 | [Exclude historical transition material](../foundations/authoring-standard.md#exclude-historical-transition-material-coreauthoringsnapshot002) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.003 | [Publish each release as a complete contract](../foundations/authoring-standard.md#publish-each-release-as-a-complete-contract-coreauthoringsnapshot003) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.004 | [Exclude cross-release compatibility work](../foundations/authoring-standard.md#exclude-cross-release-compatibility-work-coreauthoringsnapshot004) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.005 | [Keep a pinned release for as long as it serves](../foundations/authoring-standard.md#keep-a-pinned-release-for-as-long-as-it-serves-coreauthoringsnapshot005) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SNAPSHOT.006 | [Record the reviewed standards release](../foundations/authoring-standard.md#record-the-reviewed-standards-release-coreauthoringsnapshot006) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.SUMMARY.001 | [Keep Agent Summaries informative](../foundations/authoring-standard.md#keep-agent-summaries-informative-coreauthoringsummary001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.TERM.001 | [Use one term for one concept](../foundations/authoring-standard.md#use-one-term-for-one-concept-coreauthoringterm001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.VALIDATION.001 | [Run repeatable authoring checks](../foundations/authoring-standard.md#run-repeatable-authoring-checks-coreauthoringvalidation001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.VERIFICATION.001 | [Map provisions to evidence](../foundations/authoring-standard.md#map-provisions-to-evidence-coreauthoringverification001) | `foundations/authoring-standard.md` |
| CORE.AUTHORING.VOICE.001 | [Use active and explicit sentences](../foundations/authoring-standard.md#use-active-and-explicit-sentences-coreauthoringvoice001) | `foundations/authoring-standard.md` |
| CORE.PRINCIPLES.COMPLEXITY.001 | [Require current complexity activation](../foundations/principles.md#require-current-complexity-activation-coreprinciplescomplexity001) | `foundations/principles.md` |
| CORE.PRINCIPLES.COMPLEXITY.002 | [Select extensions by criteria](../foundations/principles.md#select-extensions-by-criteria-coreprinciplescomplexity002) | `foundations/principles.md` |
| CORE.PRINCIPLES.CONVENTION.001 | [Prefer direct owned dependencies](../foundations/principles.md#prefer-direct-owned-dependencies-coreprinciplesconvention001) | `foundations/principles.md` |
| CORE.PRINCIPLES.CONVENTION.002 | [Prefer local code until reuse is real](../foundations/principles.md#prefer-local-code-until-reuse-is-real-coreprinciplesconvention002) | `foundations/principles.md` |
| CORE.PRINCIPLES.DOCUMENTS.001 | [Declare specification ownership](../foundations/principles.md#declare-specification-ownership-coreprinciplesdocuments001) | `foundations/principles.md` |
| CORE.PRINCIPLES.DOCUMENTS.002 | [Classify specification authority](../foundations/principles.md#classify-specification-authority-coreprinciplesdocuments002) | `foundations/principles.md` |
| CORE.PRINCIPLES.DOCUMENTS.003 | [Separate authority from implementation](../foundations/principles.md#separate-authority-from-implementation-coreprinciplesdocuments003) | `foundations/principles.md` |
| CORE.PRINCIPLES.DOCUMENTS.004 | [Retire public behavior deliberately](../foundations/principles.md#retire-public-behavior-deliberately-coreprinciplesdocuments004) | `foundations/principles.md` |
| CORE.PRINCIPLES.ENFORCE.001 | [Prove enforceable boundaries mechanically](../foundations/principles.md#prove-enforceable-boundaries-mechanically-coreprinciplesenforce001) | `foundations/principles.md` |
| CORE.PRINCIPLES.NAMING.001 | [Name boundary intent](../foundations/principles.md#name-boundary-intent-coreprinciplesnaming001) | `foundations/principles.md` |
| CORE.PRINCIPLES.NAMING.002 | [Avoid generic boundary names](../foundations/principles.md#avoid-generic-boundary-names-coreprinciplesnaming002) | `foundations/principles.md` |
| CORE.PRINCIPLES.SLICE.001 | [Deliver complete use-case slices](../foundations/principles.md#deliver-complete-use-case-slices-coreprinciplesslice001) | `foundations/principles.md` |
| CORE.PRINCIPLES.SOURCE.001 | [Keep one authored source](../foundations/principles.md#keep-one-authored-source-coreprinciplessource001) | `foundations/principles.md` |
| CORE.PRINCIPLES.SOURCE.002 | [Locate package versions in the manifest](../foundations/principles.md#locate-package-versions-in-the-manifest-coreprinciplessource002) | `foundations/principles.md` |
| CORE.PRINCIPLES.SOURCE.003 | [Locate specification status in metadata](../foundations/principles.md#locate-specification-status-in-metadata-coreprinciplessource003) | `foundations/principles.md` |
| CORE.PRINCIPLES.SOURCE.004 | [Cite proved acceptance criteria](../foundations/principles.md#cite-proved-acceptance-criteria-coreprinciplessource004) | `foundations/principles.md` |
| CORE.RELEASE.CONVENTION.001 | [Store release records together](../foundations/release-standard.md#store-release-records-together-corereleaseconvention001) | `foundations/release-standard.md` |
| CORE.RELEASE.CONVENTION.002 | [Treat check warnings as failures](../foundations/release-standard.md#treat-check-warnings-as-failures-corereleaseconvention002) | `foundations/release-standard.md` |
| CORE.RELEASE.DERIVED.001 | [Regenerate application contracts](../foundations/release-standard.md#regenerate-application-contracts-corereleasederived001) | `foundations/release-standard.md` |
| CORE.RELEASE.DERIVED.002 | [Keep generated contracts stable](../foundations/release-standard.md#keep-generated-contracts-stable-corereleasederived002) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.001 | [Run boundary-selected checks](../foundations/release-standard.md#run-boundary-selected-checks-corereleasegates001) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.002 | [Run backend release checks](../foundations/release-standard.md#run-backend-release-checks-corereleasegates002) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.003 | [Run frontend release checks](../foundations/release-standard.md#run-frontend-release-checks-corereleasegates003) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.004 | [Run flow checks](../foundations/release-standard.md#run-flow-checks-corereleasegates004) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.005 | [Run consistency checks](../foundations/release-standard.md#run-consistency-checks-corereleasegates005) | `foundations/release-standard.md` |
| CORE.RELEASE.GATES.006 | [Run extension checks](../foundations/release-standard.md#run-extension-checks-corereleasegates006) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.001 | [Meet release readiness gates](../foundations/release-standard.md#meet-release-readiness-gates-corereleasereadiness001) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.002 | [Apply release access controls](../foundations/release-standard.md#apply-release-access-controls-corereleasereadiness002) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.003 | [Provide release data recovery](../foundations/release-standard.md#provide-release-data-recovery-corereleasereadiness003) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.004 | [Provide release operating visibility](../foundations/release-standard.md#provide-release-operating-visibility-corereleasereadiness004) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.005 | [Provide release delivery controls](../foundations/release-standard.md#provide-release-delivery-controls-corereleasereadiness005) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.006 | [Record the release artifact](../foundations/release-standard.md#record-the-release-artifact-corereleasereadiness006) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.007 | [Resolve release blockers](../foundations/release-standard.md#resolve-release-blockers-corereleasereadiness007) | `foundations/release-standard.md` |
| CORE.RELEASE.READINESS.008 | [Select conditional capabilities after activation](../foundations/release-standard.md#select-conditional-capabilities-after-activation-corereleasereadiness008) | `foundations/release-standard.md` |
| CORE.RELEASE.RECORD.001 | [Identify immutable release artifacts](../foundations/release-standard.md#identify-immutable-release-artifacts-corereleaserecord001) | `foundations/release-standard.md` |
| CORE.RELEASE.RECORD.002 | [List included release behavior](../foundations/release-standard.md#list-included-release-behavior-corereleaserecord002) | `foundations/release-standard.md` |
| CORE.RELEASE.RECORD.003 | [Record release evidence](../foundations/release-standard.md#record-release-evidence-corereleaserecord003) | `foundations/release-standard.md` |
| CORE.RELEASE.RECORD.004 | [Record operating readiness](../foundations/release-standard.md#record-operating-readiness-corereleaserecord004) | `foundations/release-standard.md` |
| CORE.RELEASE.RECORD.005 | [Keep release records non-authoritative](../foundations/release-standard.md#keep-release-records-non-authoritative-corereleaserecord005) | `foundations/release-standard.md` |
| CORE.RELEASE.REPORT.001 | [Report verification exactly](../foundations/release-standard.md#report-verification-exactly-corereleasereport001) | `foundations/release-standard.md` |
| CORE.RELEASE.REPORT.002 | [Avoid overbroad completion claims](../foundations/release-standard.md#avoid-overbroad-completion-claims-corereleasereport002) | `foundations/release-standard.md` |
| CORE.RELEASE.SLICE.001 | [Complete observable use-case slices](../foundations/release-standard.md#complete-observable-use-case-slices-corereleaseslice001) | `foundations/release-standard.md` |
| CORE.RELEASE.SLICE.002 | [Mark incomplete behavior as planned](../foundations/release-standard.md#mark-incomplete-behavior-as-planned-corereleaseslice002) | `foundations/release-standard.md` |
| CORE.RELEASE.SLICE.003 | [Verify connected end-to-end flows](../foundations/release-standard.md#verify-connected-end-to-end-flows-corereleaseslice003) | `foundations/release-standard.md` |
| CORE.SCOPE.APPLICATION.001 | [Use the supported application profile](../foundations/scope.md#use-the-supported-application-profile-corescopeapplication001) | `foundations/scope.md` |
| CORE.SCOPE.BACKEND.001 | [Declare a consumer that has no backend](../foundations/scope.md#declare-a-consumer-that-has-no-backend-corescopebackend001) | `foundations/scope.md` |
| CORE.SCOPE.CONTEXT.001 | [Keep one bounded context](../foundations/scope.md#keep-one-bounded-context-corescopecontext001) | `foundations/scope.md` |
| CORE.SCOPE.CONVENTION.001 | [Start with one API and database](../foundations/scope.md#start-with-one-api-and-database-corescopeconvention001) | `foundations/scope.md` |
| CORE.SCOPE.CONVENTION.002 | [Measure capacity before expansion](../foundations/scope.md#measure-capacity-before-expansion-corescopeconvention002) | `foundations/scope.md` |
| CORE.SCOPE.EXTENSIONS.001 | [Select conditional extensions explicitly](../foundations/scope.md#select-conditional-extensions-explicitly-corescopeextensions001) | `foundations/scope.md` |
| CORE.SCOPE.EXTENSIONS.002 | [Record selected extensions](../foundations/scope.md#record-selected-extensions-corescopeextensions002) | `foundations/scope.md` |
| CORE.SCOPE.OUTSIDE.001 | [Record unsupported scope decisions](../foundations/scope.md#record-unsupported-scope-decisions-corescopeoutside001) | `foundations/scope.md` |
| CORE.SYSTEM.ACCEPTANCE.001 | [Give acceptance criteria stable ownership](../foundations/engineering-system.md#give-acceptance-criteria-stable-ownership-coresystemacceptance001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.AGGREGATE.001 | [Make aggregate ownership explicit](../foundations/engineering-system.md#make-aggregate-ownership-explicit-coresystemaggregate001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.AUTHORITY.001 | [Keep decision authority with accountable people](../foundations/engineering-system.md#keep-decision-authority-with-accountable-people-coresystemauthority001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.001 | [Use this consumer documentation layout](../foundations/engineering-system.md#use-this-consumer-documentation-layout-coresystemconvention001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.002 | [Group module use-case files by aggregate root](../foundations/engineering-system.md#group-module-use-case-files-by-aggregate-root-coresystemconvention002) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.003 | [Keep operational and security references under operations](../foundations/engineering-system.md#keep-operational-and-security-references-under-operations-coresystemconvention003) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.004 | [Use established technical terms](../foundations/engineering-system.md#use-established-technical-terms-coresystemconvention004) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.005 | [Use ordinary capitalization in prose](../foundations/engineering-system.md#use-ordinary-capitalization-in-prose-coresystemconvention005) | `foundations/engineering-system.md` |
| CORE.SYSTEM.CONVENTION.006 | [Keep specifications readable without tooling](../foundations/engineering-system.md#keep-specifications-readable-without-tooling-coresystemconvention006) | `foundations/engineering-system.md` |
| CORE.SYSTEM.EXTENSIONS.001 | [Select extensions before applying them](../foundations/engineering-system.md#select-extensions-before-applying-them-coresystemextensions001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.EXTENSIONS.002 | [Exclude a project-scoped extension from local metadata](../foundations/engineering-system.md#exclude-a-project-scoped-extension-from-local-metadata-coresystemextensions002) | `foundations/engineering-system.md` |
| CORE.SYSTEM.FLOW.001 | [Connect one product outcome through an end-to-end flow](../foundations/engineering-system.md#connect-one-product-outcome-through-an-end-to-end-flow-coresystemflow001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.METADATA.001 | [Declare Specification Metadata](../foundations/engineering-system.md#declare-specification-metadata-coresystemmetadata001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.MODULE.001 | [Group language and use cases by module](../foundations/engineering-system.md#group-language-and-use-cases-by-module-coresystemmodule001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.REACTION.001 | [Record events and event reactions separately](../foundations/engineering-system.md#record-events-and-event-reactions-separately-coresystemreaction001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.RULES.001 | [Classify rules by enforcement boundary](../foundations/engineering-system.md#classify-rules-by-enforcement-boundary-coresystemrules001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.SPECIFICATION.001 | [Drive work from approved specifications](../foundations/engineering-system.md#drive-work-from-approved-specifications-coresystemspecification001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.STATE.001 | [Model every aggregate lifecycle with state records](../foundations/engineering-system.md#model-every-aggregate-lifecycle-with-state-records-coresystemstate001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.SYNC.001 | [Update specifications with behavior](../foundations/engineering-system.md#update-specifications-with-behavior-coresystemsync001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.USECASE.001 | [Deliver one complete use case](../foundations/engineering-system.md#deliver-one-complete-use-case-coresystemusecase001) | `foundations/engineering-system.md` |
| CORE.SYSTEM.WORKFLOW.001 | [Specify autonomous progress as a workflow](../foundations/engineering-system.md#specify-autonomous-progress-as-a-workflow-coresystemworkflow001) | `foundations/engineering-system.md` |

## EXT

| ID | Provision | Page |
|:---|:---|:---|
| EXT.AUTHJS.ADOPT.001 | [Keep Auth.js frontend-specific](../extensions/frontend-authjs.md#keep-authjs-frontend-specific-extauthjsadopt001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.ADOPT.002 | [Keep WebApi provider-neutral](../extensions/frontend-authjs.md#keep-webapi-provider-neutral-extauthjsadopt002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.API.001 | [Use a server API boundary](../extensions/frontend-authjs.md#use-a-server-api-boundary-extauthjsapi001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.API.002 | [Keep browser token access absent](../extensions/frontend-authjs.md#keep-browser-token-access-absent-extauthjsapi002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.AUTHZ.001 | [Keep frontend guards advisory](../extensions/frontend-authjs.md#keep-frontend-guards-advisory-extauthjsauthz001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.AUTHZ.002 | [Authorize protected resources in WebApi](../extensions/frontend-authjs.md#authorize-protected-resources-in-webapi-extauthjsauthz002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CALLBACK.001 | [Validate provider callback values](../extensions/frontend-authjs.md#validate-provider-callback-values-extauthjscallback001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CALLBACK.002 | [Reject unsafe return targets](../extensions/frontend-authjs.md#reject-unsafe-return-targets-extauthjscallback002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CONVENTION.001 | [Keep Auth.js configuration server-owned](../extensions/frontend-authjs.md#keep-authjs-configuration-server-owned-extauthjsconvention001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CONVENTION.002 | [Keep provider claims nearby](../extensions/frontend-authjs.md#keep-provider-claims-nearby-extauthjsconvention002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CONVENTION.003 | [Expose a project-owned session view](../extensions/frontend-authjs.md#expose-a-project-owned-session-view-extauthjsconvention003) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CONVENTION.004 | [Keep authentication handlers thin](../extensions/frontend-authjs.md#keep-authentication-handlers-thin-extauthjsconvention004) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CSRF.001 | [Verify Auth.js authentication requests](../extensions/frontend-authjs.md#verify-authjs-authentication-requests-extauthjscsrf001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CSRF.002 | [Verify state-changing browser requests](../extensions/frontend-authjs.md#verify-state-changing-browser-requests-extauthjscsrf002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.CSRF.003 | [Use POST for browser state changes](../extensions/frontend-authjs.md#use-post-for-browser-state-changes-extauthjscsrf003) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.FAILURE.001 | [Handle invalid sessions explicitly](../extensions/frontend-authjs.md#handle-invalid-sessions-explicitly-extauthjsfailure001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.FAILURE.002 | [Separate authentication from authorization failure](../extensions/frontend-authjs.md#separate-authentication-from-authorization-failure-extauthjsfailure002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.FAILURE.003 | [Avoid endless access retries](../extensions/frontend-authjs.md#avoid-endless-access-retries-extauthjsfailure003) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.001 | [Protect session cookies](../extensions/frontend-authjs.md#protect-session-cookies-extauthjssession001) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.002 | [Keep provider tokens server-side](../extensions/frontend-authjs.md#keep-provider-tokens-server-side-extauthjssession002) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.003 | [Select a session strategy](../extensions/frontend-authjs.md#select-a-session-strategy-extauthjssession003) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.004 | [Record session secret ownership](../extensions/frontend-authjs.md#record-session-secret-ownership-extauthjssession004) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.005 | [Minimize session content](../extensions/frontend-authjs.md#minimize-session-content-extauthjssession005) | `extensions/frontend-authjs.md` |
| EXT.AUTHJS.SESSION.006 | [Separate sessions from API bearer tokens](../extensions/frontend-authjs.md#separate-sessions-from-api-bearer-tokens-extauthjssession006) | `extensions/frontend-authjs.md` |
| EXT.BDD.ADOPT.001 | [Select shared critical examples](../extensions/acceptance-bdd.md#select-shared-critical-examples-extbddadopt001) | `extensions/acceptance-bdd.md` |
| EXT.BDD.ADOPT.002 | [Avoid routine Gherkin duplication](../extensions/acceptance-bdd.md#avoid-routine-gherkin-duplication-extbddadopt002) | `extensions/acceptance-bdd.md` |
| EXT.BDD.BOUNDARY.001 | [Drive public behavior](../extensions/acceptance-bdd.md#drive-public-behavior-extbddboundary001) | `extensions/acceptance-bdd.md` |
| EXT.BDD.BOUNDARY.002 | [Assert observable outcomes](../extensions/acceptance-bdd.md#assert-observable-outcomes-extbddboundary002) | `extensions/acceptance-bdd.md` |
| EXT.BDD.BOUNDARY.003 | [Limit database assertions](../extensions/acceptance-bdd.md#limit-database-assertions-extbddboundary003) | `extensions/acceptance-bdd.md` |
| EXT.BDD.CONVENTION.001 | [Group feature files by module](../extensions/acceptance-bdd.md#group-feature-files-by-module-extbddconvention001) | `extensions/acceptance-bdd.md` |
| EXT.BDD.CONVENTION.002 | [Keep steps vocabulary-scoped](../extensions/acceptance-bdd.md#keep-steps-vocabulary-scoped-extbddconvention002) | `extensions/acceptance-bdd.md` |
| EXT.BDD.CONVENTION.003 | [Limit scenario context](../extensions/acceptance-bdd.md#limit-scenario-context-extbddconvention003) | `extensions/acceptance-bdd.md` |
| EXT.BDD.CONVENTION.004 | [Mark pull-request scenarios](../extensions/acceptance-bdd.md#mark-pull-request-scenarios-extbddconvention004) | `extensions/acceptance-bdd.md` |
| EXT.BDD.STATE.001 | [Own scenario data](../extensions/acceptance-bdd.md#own-scenario-data-extbddstate001) | `extensions/acceptance-bdd.md` |
| EXT.BDD.STATE.002 | [Isolate scenario execution](../extensions/acceptance-bdd.md#isolate-scenario-execution-extbddstate002) | `extensions/acceptance-bdd.md` |
| EXT.BDD.STEPS.001 | [Translate business phrases](../extensions/acceptance-bdd.md#translate-business-phrases-extbddsteps001) | `extensions/acceptance-bdd.md` |
| EXT.BDD.STEPS.002 | [Exclude production internals](../extensions/acceptance-bdd.md#exclude-production-internals-extbddsteps002) | `extensions/acceptance-bdd.md` |
| EXT.BDD.STEPS.003 | [Preserve scenario failures](../extensions/acceptance-bdd.md#preserve-scenario-failures-extbddsteps003) | `extensions/acceptance-bdd.md` |
| EXT.BDD.TRACE.001 | [Tag scenarios with acceptance criteria](../extensions/acceptance-bdd.md#tag-scenarios-with-acceptance-criteria-extbddtrace001) | `extensions/acceptance-bdd.md` |
| EXT.CACHE.ADOPT.001 | [Record measured cache need](../extensions/caching.md#record-measured-cache-need-extcacheadopt001) | `extensions/caching.md` |
| EXT.CACHE.ADOPT.002 | [Remove unjustified caches](../extensions/caching.md#remove-unjustified-caches-extcacheadopt002) | `extensions/caching.md` |
| EXT.CACHE.CONVENTION.001 | [Place cache access at an outer boundary](../extensions/caching.md#place-cache-access-at-an-outer-boundary-extcacheconvention001) | `extensions/caching.md` |
| EXT.CACHE.FAILURE.001 | [Keep source data authoritative](../extensions/caching.md#keep-source-data-authoritative-extcachefailure001) | `extensions/caching.md` |
| EXT.CACHE.FAILURE.002 | [Define cache outage behavior](../extensions/caching.md#define-cache-outage-behavior-extcachefailure002) | `extensions/caching.md` |
| EXT.CACHE.INVALIDATE.001 | [Define cache invalidation](../extensions/caching.md#define-cache-invalidation-extcacheinvalidate001) | `extensions/caching.md` |
| EXT.CACHE.INVALIDATE.002 | [Prefer bounded staleness](../extensions/caching.md#prefer-bounded-staleness-extcacheinvalidate002) | `extensions/caching.md` |
| EXT.CACHE.KEY.001 | [Compose cache keys from result inputs](../extensions/caching.md#compose-cache-keys-from-result-inputs-extcachekey001) | `extensions/caching.md` |
| EXT.CACHE.KEY.002 | [Exclude unsafe cache key material](../extensions/caching.md#exclude-unsafe-cache-key-material-extcachekey002) | `extensions/caching.md` |
| EXT.CACHE.REFRESH.001 | [Bound cache refresh work](../extensions/caching.md#bound-cache-refresh-work-extcacherefresh001) | `extensions/caching.md` |
| EXT.CACHE.REFRESH.002 | [Avoid unbounded key locks](../extensions/caching.md#avoid-unbounded-key-locks-extcacherefresh002) | `extensions/caching.md` |
| EXT.COMPAT.COMPATIBILITY.001 | [Classify independent-consumer changes](../extensions/api-compatibility.md#classify-independent-consumer-changes-extcompatcompatibility001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.COMPATIBILITY.002 | [Classify breaking contract changes](../extensions/api-compatibility.md#classify-breaking-contract-changes-extcompatcompatibility002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.COMPATIBILITY.003 | [Classify compatible additions](../extensions/api-compatibility.md#classify-compatible-additions-extcompatcompatibility003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.COMPATIBILITY.004 | [Review exhaustive consumer changes](../extensions/api-compatibility.md#review-exhaustive-consumer-changes-extcompatcompatibility004) | `extensions/api-compatibility.md` |
| EXT.COMPAT.COMPATIBILITY.005 | [Preserve stable error codes](../extensions/api-compatibility.md#preserve-stable-error-codes-extcompatcompatibility005) | `extensions/api-compatibility.md` |
| EXT.COMPAT.COMPATIBILITY.006 | [Resolve uncertain classifications safely](../extensions/api-compatibility.md#resolve-uncertain-classifications-safely-extcompatcompatibility006) | `extensions/api-compatibility.md` |
| EXT.COMPAT.CONVENTION.001 | [Store current OpenAPI source](../extensions/api-compatibility.md#store-current-openapi-source-extcompatconvention001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.CONVENTION.002 | [Keep baseline references immutable](../extensions/api-compatibility.md#keep-baseline-references-immutable-extcompatconvention002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.CONVENTION.003 | [Use one diff tool](../extensions/api-compatibility.md#use-one-diff-tool-extcompatconvention003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.CONVENTION.004 | [Keep Problem Details codes stable](../extensions/api-compatibility.md#keep-problem-details-codes-stable-extcompatconvention004) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DEPRECATION.001 | [Signal planned public removal](../extensions/api-compatibility.md#signal-planned-public-removal-extcompatdeprecation001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DEPRECATION.002 | [Publish deprecation context](../extensions/api-compatibility.md#publish-deprecation-context-extcompatdeprecation002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DEPRECATION.003 | [Record deprecation conditions](../extensions/api-compatibility.md#record-deprecation-conditions-extcompatdeprecation003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DIFF.001 | [Retain release baselines](../extensions/api-compatibility.md#retain-release-baselines-extcompatdiff001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DIFF.002 | [Diff release contracts](../extensions/api-compatibility.md#diff-release-contracts-extcompatdiff002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.DIFF.003 | [Reject unapproved breaking diffs](../extensions/api-compatibility.md#reject-unapproved-breaking-diffs-extcompatdiff003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.ERRORS.001 | [Treat errors as contracts](../extensions/api-compatibility.md#treat-errors-as-contracts-extcompaterrors001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.ERRORS.002 | [Gate new error outcomes](../extensions/api-compatibility.md#gate-new-error-outcomes-extcompaterrors002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.ERRORS.003 | [Exercise generated consumers](../extensions/api-compatibility.md#exercise-generated-consumers-extcompaterrors003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.OPERATION.001 | [Assign operation IDs](../extensions/api-compatibility.md#assign-operation-ids-extcompatoperation001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.OPERATION.002 | [Retain compatible operation IDs](../extensions/api-compatibility.md#retain-compatible-operation-ids-extcompatoperation002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.OPERATION.003 | [Assign versioned operation IDs](../extensions/api-compatibility.md#assign-versioned-operation-ids-extcompatoperation003) | `extensions/api-compatibility.md` |
| EXT.COMPAT.VERSION.001 | [Version breaking contracts](../extensions/api-compatibility.md#version-breaking-contracts-extcompatversion001) | `extensions/api-compatibility.md` |
| EXT.COMPAT.VERSION.002 | [Retain supported versions](../extensions/api-compatibility.md#retain-supported-versions-extcompatversion002) | `extensions/api-compatibility.md` |
| EXT.COMPAT.VERSION.003 | [Record version retirement](../extensions/api-compatibility.md#record-version-retirement-extcompatversion003) | `extensions/api-compatibility.md` |
| EXT.CONCURRENCY.ADOPT.001 | [Document write conflict behavior](../extensions/concurrency-idempotency.md#document-write-conflict-behavior-extconcurrencyadopt001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.ADOPT.002 | [Limit version checks](../extensions/concurrency-idempotency.md#limit-version-checks-extconcurrencyadopt002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.CONVENTION.001 | [Use the standard idempotency header](../extensions/concurrency-idempotency.md#use-the-standard-idempotency-header-extconcurrencyconvention001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.CONVENTION.002 | [Keep idempotency persistence in Infrastructure](../extensions/concurrency-idempotency.md#keep-idempotency-persistence-in-infrastructure-extconcurrencyconvention002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.CONVENTION.003 | [Map replay responses at the API boundary](../extensions/concurrency-idempotency.md#map-replay-responses-at-the-api-boundary-extconcurrencyconvention003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.CONVENTION.004 | [Declare applicable headers](../extensions/concurrency-idempotency.md#declare-applicable-headers-extconcurrencyconvention004) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.001 | [Scope client keys](../extensions/concurrency-idempotency.md#scope-client-keys-extconcurrencyidempotentkey001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.002 | [Store idempotency state atomically](../extensions/concurrency-idempotency.md#store-idempotency-state-atomically-extconcurrencyidempotentkey002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.003 | [Reject conflicting key reuse](../extensions/concurrency-idempotency.md#reject-conflicting-key-reuse-extconcurrencyidempotentkey003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.004 | [Enforce key uniqueness](../extensions/concurrency-idempotency.md#enforce-key-uniqueness-extconcurrencyidempotentkey004) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.005 | [Canonicalize request fingerprints](../extensions/concurrency-idempotency.md#canonicalize-request-fingerprints-extconcurrencyidempotentkey005) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.006 | [Protect fingerprint source data](../extensions/concurrency-idempotency.md#protect-fingerprint-source-data-extconcurrencyidempotentkey006) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.001 | [Declare replayed transport outcomes](../extensions/concurrency-idempotency.md#declare-replayed-transport-outcomes-extconcurrencyidempotentout001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.002 | [Restrict replay data](../extensions/concurrency-idempotency.md#restrict-replay-data-extconcurrencyidempotentout002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.003 | [Exclude unsafe replay outcomes](../extensions/concurrency-idempotency.md#exclude-unsafe-replay-outcomes-extconcurrencyidempotentout003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.001 | [Replay completed results](../extensions/concurrency-idempotency.md#replay-completed-results-extconcurrencyidempotentrep001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.002 | [Define concurrent retry behavior](../extensions/concurrency-idempotency.md#define-concurrent-retry-behavior-extconcurrencyidempotentrep002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.003 | [Commit replay records with changes](../extensions/concurrency-idempotency.md#commit-replay-records-with-changes-extconcurrencyidempotentrep003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.004 | [Reload concurrent winners](../extensions/concurrency-idempotency.md#reload-concurrent-winners-extconcurrencyidempotentrep004) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.005 | [Discard failed replay state](../extensions/concurrency-idempotency.md#discard-failed-replay-state-extconcurrencyidempotentrep005) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.006 | [Delay irreversible provider calls](../extensions/concurrency-idempotency.md#delay-irreversible-provider-calls-extconcurrencyidempotentrep006) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.007 | [Route required external effects durably](../extensions/concurrency-idempotency.md#route-required-external-effects-durably-extconcurrencyidempotentrep007) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.001 | [Set key retention](../extensions/concurrency-idempotency.md#set-key-retention-extconcurrencyidempotentret001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.002 | [Bound expired-record cleanup](../extensions/concurrency-idempotency.md#bound-expired-record-cleanup-extconcurrencyidempotentret002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.003 | [Retain safe retry keys](../extensions/concurrency-idempotency.md#retain-safe-retry-keys-extconcurrencyidempotentret003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.001 | [Compare expected aggregate versions](../extensions/concurrency-idempotency.md#compare-expected-aggregate-versions-extconcurrencyversion001) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.002 | [Map failed expected versions](../extensions/concurrency-idempotency.md#map-failed-expected-versions-extconcurrencyversion002) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.003 | [Reject silent overwrites](../extensions/concurrency-idempotency.md#reject-silent-overwrites-extconcurrencyversion003) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.004 | [Apply HTTP version preconditions](../extensions/concurrency-idempotency.md#apply-http-version-preconditions-extconcurrencyversion004) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.005 | [Return precondition outcomes](../extensions/concurrency-idempotency.md#return-precondition-outcomes-extconcurrencyversion005) | `extensions/concurrency-idempotency.md` |
| EXT.CONCURRENCY.VERSION.006 | [Hide provider version values](../extensions/concurrency-idempotency.md#hide-provider-version-values-extconcurrencyversion006) | `extensions/concurrency-idempotency.md` |
| EXT.CONTAINERS.CONFIG.001 | [Supply runtime configuration externally](../extensions/deployment-containers.md#supply-runtime-configuration-externally-extcontainersconfig001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.CONFIG.002 | [Exclude environment configuration from images](../extensions/deployment-containers.md#exclude-environment-configuration-from-images-extcontainersconfig002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.CONVENTION.001 | [Place Dockerfiles beside deployables](../extensions/deployment-containers.md#place-dockerfiles-beside-deployables-extcontainersconvention001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.CONVENTION.002 | [Build from the workspace root](../extensions/deployment-containers.md#build-from-the-workspace-root-extcontainersconvention002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.IMAGE.001 | [Build release images in stages](../extensions/deployment-containers.md#build-release-images-in-stages-extcontainersimage001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.IMAGE.002 | [Run images as non-root](../extensions/deployment-containers.md#run-images-as-non-root-extcontainersimage002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.IMAGE.003 | [Copy only runtime files](../extensions/deployment-containers.md#copy-only-runtime-files-extcontainersimage003) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.IMAGE.004 | [Exclude build and secret material](../extensions/deployment-containers.md#exclude-build-and-secret-material-extcontainersimage004) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.001 | [Apply OCI release labels](../extensions/deployment-containers.md#apply-oci-release-labels-extcontainersmetadata001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.002 | [Record image digests](../extensions/deployment-containers.md#record-image-digests-extcontainersmetadata002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.003 | [Exclude build timestamps from contracts](../extensions/deployment-containers.md#exclude-build-timestamps-from-contracts-extcontainersmetadata003) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.004 | [Separate frontend configuration classes](../extensions/deployment-containers.md#separate-frontend-configuration-classes-extcontainersmetadata004) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.005 | [Use protected frontend secret delivery](../extensions/deployment-containers.md#use-protected-frontend-secret-delivery-extcontainersmetadata005) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.METADATA.006 | [Exclude insecure frontend secret carriers](../extensions/deployment-containers.md#exclude-insecure-frontend-secret-carriers-extcontainersmetadata006) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.PROCESS.001 | [Run the application as PID 1](../extensions/deployment-containers.md#run-the-application-as-pid-1-extcontainersprocess001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.PROCESS.002 | [Set sufficient shutdown time](../extensions/deployment-containers.md#set-sufficient-shutdown-time-extcontainersprocess002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.PROCESS.003 | [Write runtime logs to streams](../extensions/deployment-containers.md#write-runtime-logs-to-streams-extcontainersprocess003) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.PROCESS.004 | [Keep mutable data external](../extensions/deployment-containers.md#keep-mutable-data-external-extcontainersprocess004) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.ROLLBACK.001 | [Retain rollback material](../extensions/deployment-containers.md#retain-rollback-material-extcontainersrollback001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.ROLLBACK.002 | [Check rollback compatibility](../extensions/deployment-containers.md#check-rollback-compatibility-extcontainersrollback002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.SCHEMA.001 | [Apply schema work before traffic](../extensions/deployment-containers.md#apply-schema-work-before-traffic-extcontainersschema001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.SCHEMA.002 | [Keep schema work out of startup](../extensions/deployment-containers.md#keep-schema-work-out-of-startup-extcontainersschema002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.SECURITY.001 | [Limit container privileges](../extensions/deployment-containers.md#limit-container-privileges-extcontainerssecurity001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.SECURITY.002 | [Declare writable paths and limits](../extensions/deployment-containers.md#declare-writable-paths-and-limits-extcontainerssecurity002) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.TRAFFIC.001 | [Wait for replica readiness](../extensions/deployment-containers.md#wait-for-replica-readiness-extcontainerstraffic001) | `extensions/deployment-containers.md` |
| EXT.CONTAINERS.TRAFFIC.003 | [Test released traffic](../extensions/deployment-containers.md#test-released-traffic-extcontainerstraffic003) | `extensions/deployment-containers.md` |
| EXT.EFCORE.ADOPT.001 | [Record EF Core replacement scope](../extensions/persistence-ef-core.md#record-ef-core-replacement-scope-extefcoreadopt001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.ADOPT.002 | [Retain unaffected baseline persistence](../extensions/persistence-ef-core.md#retain-unaffected-baseline-persistence-extefcoreadopt002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.COMMIT.001 | [Commit EF Core Command work once](../extensions/persistence-ef-core.md#commit-ef-core-command-work-once-extefcorecommit001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.COMMIT.002 | [Process changed aggregate events](../extensions/persistence-ef-core.md#process-changed-aggregate-events-extefcorecommit002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.COMMIT.003 | [Use durable outbox delivery](../extensions/persistence-ef-core.md#use-durable-outbox-delivery-extefcorecommit003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.CONCURRENCY.001 | [Configure optimistic tokens](../extensions/persistence-ef-core.md#configure-optimistic-tokens-extefcoreconcurrency001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.CONCURRENCY.002 | [Map EF Core concurrency conflict](../extensions/persistence-ef-core.md#map-ef-core-concurrency-conflict-extefcoreconcurrency002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.CONCURRENCY.003 | [Reject automatic command retry](../extensions/persistence-ef-core.md#reject-automatic-command-retry-extefcoreconcurrency003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.CONVENTION.001 | [Use the EF Core Infrastructure layout](../extensions/persistence-ef-core.md#use-the-ef-core-infrastructure-layout-extefcoreconvention001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.CONVENTION.002 | [Use snake-case relational names](../extensions/persistence-ef-core.md#use-snake-case-relational-names-extefcoreconvention002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MAPPING.001 | [Configure EF Core mappings in Infrastructure](../extensions/persistence-ef-core.md#configure-ef-core-mappings-in-infrastructure-extefcoremapping001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MAPPING.002 | [Configure relational details explicitly](../extensions/persistence-ef-core.md#configure-relational-details-explicitly-extefcoremapping002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.001 | [Generate migrations for schema changes](../extensions/persistence-ef-core.md#generate-migrations-for-schema-changes-extefcoremigrations001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.002 | [Review migration effects](../extensions/persistence-ef-core.md#review-migration-effects-extefcoremigrations002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.003 | [Apply migrations as release work](../extensions/persistence-ef-core.md#apply-migrations-as-release-work-extefcoremigrations003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.004 | [Keep migration files together](../extensions/persistence-ef-core.md#keep-migration-files-together-extefcoremigrations004) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.005 | [Test migration starting states](../extensions/persistence-ef-core.md#test-migration-starting-states-extefcoremigrations005) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.MIGRATIONS.006 | [Reject startup schema mutation](../extensions/persistence-ef-core.md#reject-startup-schema-mutation-extefcoremigrations006) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.OUTBOX.001 | [Stage EF Core outbox records together](../extensions/persistence-ef-core.md#stage-ef-core-outbox-records-together-extefcoreoutbox001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.OUTBOX.002 | [Commit EF Core outbox records once](../extensions/persistence-ef-core.md#commit-ef-core-outbox-records-once-extefcoreoutbox002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.OUTBOX.003 | [Reject cross-provider outbox storage](../extensions/persistence-ef-core.md#reject-cross-provider-outbox-storage-extefcoreoutbox003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.READ.001 | [Define EF Core query roots](../extensions/persistence-ef-core.md#define-ef-core-query-roots-extefcoreread001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.READ.002 | [Implement query roots in Infrastructure](../extensions/persistence-ef-core.md#implement-query-roots-in-infrastructure-extefcoreread002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.READ.003 | [Retain Marten query boundary](../extensions/persistence-ef-core.md#retain-marten-query-boundary-extefcoreread003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.READ.004 | [Project EF Core queries directly](../extensions/persistence-ef-core.md#project-ef-core-queries-directly-extefcoreread004) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.READ.005 | [Avoid per-aggregate read stores](../extensions/persistence-ef-core.md#avoid-per-aggregate-read-stores-extefcoreread005) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.STATE.001 | [Retain Domain state values](../extensions/persistence-ef-core.md#retain-domain-state-values-extefcorestate001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.STATE.002 | [Map stable relational state shape](../extensions/persistence-ef-core.md#map-stable-relational-state-shape-extefcorestate002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.STATE.003 | [Use direct state mapping only when supported](../extensions/persistence-ef-core.md#use-direct-state-mapping-only-when-supported-extefcorestate003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.STATE.004 | [Map unsupported state shapes in Infrastructure](../extensions/persistence-ef-core.md#map-unsupported-state-shapes-in-infrastructure-extefcorestate004) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.STATE.005 | [Review new persisted states](../extensions/persistence-ef-core.md#review-new-persisted-states-extefcorestate005) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.TRANSACTION.001 | [Use one write provider](../extensions/persistence-ef-core.md#use-one-write-provider-extefcoretransaction001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.TRANSACTION.002 | [Reject mixed provider writes](../extensions/persistence-ef-core.md#reject-mixed-provider-writes-extefcoretransaction002) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.TRANSACTION.003 | [Record provider selection](../extensions/persistence-ef-core.md#record-provider-selection-extefcoretransaction003) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.TRANSACTION.004 | [Register one Command post-handler](../extensions/persistence-ef-core.md#register-one-command-post-handler-extefcoretransaction004) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.TRANSACTION.005 | [Resolve cross-provider invariants](../extensions/persistence-ef-core.md#resolve-cross-provider-invariants-extefcoretransaction005) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.WRITE.001 | [Stage aggregate writes in repositories](../extensions/persistence-ef-core.md#stage-aggregate-writes-in-repositories-extefcorewrite001) | `extensions/persistence-ef-core.md` |
| EXT.EFCORE.WRITE.002 | [Exclude direct handler commits](../extensions/persistence-ef-core.md#exclude-direct-handler-commits-extefcorewrite002) | `extensions/persistence-ef-core.md` |
| EXT.INTEGRATIONS.CLIENT.001 | [Bind client configuration](../extensions/external-integrations.md#bind-client-configuration-extintegrationsclient001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.CLIENT.002 | [Use managed HTTP clients](../extensions/external-integrations.md#use-managed-http-clients-extintegrationsclient002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.CLIENT.003 | [Reject per-request HTTP clients](../extensions/external-integrations.md#reject-per-request-http-clients-extintegrationsclient003) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.001 | [Group provider code](../extensions/external-integrations.md#group-provider-code-extintegrationsconvention001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.002 | [Keep provider components together](../extensions/external-integrations.md#keep-provider-components-together-extintegrationsconvention002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.003 | [Keep ports near use cases](../extensions/external-integrations.md#keep-ports-near-use-cases-extintegrationsconvention003) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.FAILURE.001 | [Translate provider failure outcomes](../extensions/external-integrations.md#translate-provider-failure-outcomes-extintegrationsfailure001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.FAILURE.002 | [Exclude provider internals](../extensions/external-integrations.md#exclude-provider-internals-extintegrationsfailure002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.INBOUND.001 | [Verify inbound provider messages](../extensions/external-integrations.md#verify-inbound-provider-messages-extintegrationsinbound001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.INBOUND.002 | [Process duplicate messages safely](../extensions/external-integrations.md#process-duplicate-messages-safely-extintegrationsinbound002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.PORT.001 | [Define business-action ports](../extensions/external-integrations.md#define-business-action-ports-extintegrationsport001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.PORT.002 | [Isolate provider implementations](../extensions/external-integrations.md#isolate-provider-implementations-extintegrationsport002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.RETRY.001 | [Bound transient retries](../extensions/external-integrations.md#bound-transient-retries-extintegrationsretry001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.RETRY.002 | [Protect non-idempotent calls](../extensions/external-integrations.md#protect-non-idempotent-calls-extintegrationsretry002) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.TEST.001 | [Simulate integration boundaries](../extensions/external-integrations.md#simulate-integration-boundaries-extintegrationstest001) | `extensions/external-integrations.md` |
| EXT.INTEGRATIONS.TEST.002 | [Cover provider failure modes](../extensions/external-integrations.md#cover-provider-failure-modes-extintegrationstest002) | `extensions/external-integrations.md` |
| EXT.JOBS.ADOPT.001 | [Record schedule behavior](../extensions/scheduled-jobs.md#record-schedule-behavior-extjobsadopt001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.COMMAND.001 | [Dispatch Application behavior](../extensions/scheduled-jobs.md#dispatch-application-behavior-extjobscommand001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.COMMAND.002 | [Exclude direct storage and HTTP execution](../extensions/scheduled-jobs.md#exclude-direct-storage-and-http-execution-extjobscommand002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.CONVENTION.001 | [Place handlers with owned behavior](../extensions/scheduled-jobs.md#place-handlers-with-owned-behavior-extjobsconvention001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.CONVENTION.002 | [Use execution scopes](../extensions/scheduled-jobs.md#use-execution-scopes-extjobsconvention002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.CONVENTION.003 | [Separate schedule definitions](../extensions/scheduled-jobs.md#separate-schedule-definitions-extjobsconvention003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.LEASE.001 | [Store execution leases](../extensions/scheduled-jobs.md#store-execution-leases-extjobslease001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.LEASE.002 | [Renew only owned leases](../extensions/scheduled-jobs.md#renew-only-owned-leases-extjobslease002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.LEASE.003 | [Prevent duplicate completion](../extensions/scheduled-jobs.md#prevent-duplicate-completion-extjobslease003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.OCCURRENCE.001 | [Derive stable occurrence identity](../extensions/scheduled-jobs.md#derive-stable-occurrence-identity-extjobsoccurrence001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.OCCURRENCE.002 | [Persist occurrence state](../extensions/scheduled-jobs.md#persist-occurrence-state-extjobsoccurrence002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.OCCURRENCE.003 | [Scope command idempotency by occurrence](../extensions/scheduled-jobs.md#scope-command-idempotency-by-occurrence-extjobsoccurrence003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.OCCURRENCE.004 | [Restrict completion by fencing value](../extensions/scheduled-jobs.md#restrict-completion-by-fencing-value-extjobsoccurrence004) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.OCCURRENCE.005 | [Audit manual replay](../extensions/scheduled-jobs.md#audit-manual-replay-extjobsoccurrence005) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RECOVERY.001 | [Persist occurrence recovery points](../extensions/scheduled-jobs.md#persist-occurrence-recovery-points-extjobsrecovery001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RECOVERY.002 | [Define misfire recovery](../extensions/scheduled-jobs.md#define-misfire-recovery-extjobsrecovery002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RECOVERY.003 | [Provide operational recovery procedures](../extensions/scheduled-jobs.md#provide-operational-recovery-procedures-extjobsrecovery003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RETRY.001 | [Bound job retries](../extensions/scheduled-jobs.md#bound-job-retries-extjobsretry001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RETRY.002 | [Tolerate duplicate execution](../extensions/scheduled-jobs.md#tolerate-duplicate-execution-extjobsretry002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.RETRY.003 | [Treat unavailable schedule stores as outages](../extensions/scheduled-jobs.md#treat-unavailable-schedule-stores-as-outages-extjobsretry003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.TIME.001 | [Prefer UTC schedules](../extensions/scheduled-jobs.md#prefer-utc-schedules-extjobstime001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.TIME.002 | [Define business-local clock behavior](../extensions/scheduled-jobs.md#define-business-local-clock-behavior-extjobstime002) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.TIME.003 | [Test time transitions](../extensions/scheduled-jobs.md#test-time-transitions-extjobstime003) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.TIME.004 | [Exclude machine-local time](../extensions/scheduled-jobs.md#exclude-machine-local-time-extjobstime004) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.WORKER.001 | [Run jobs in Worker](../extensions/scheduled-jobs.md#run-jobs-in-worker-extjobsworker001) | `extensions/scheduled-jobs.md` |
| EXT.JOBS.WORKER.002 | [Bound job execution](../extensions/scheduled-jobs.md#bound-job-execution-extjobsworker002) | `extensions/scheduled-jobs.md` |
| EXT.LIFECYCLE.ADOPT.001 | [Record lifecycle scope](../extensions/data-lifecycle.md#record-lifecycle-scope-extlifecycleadopt001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.001 | [Model lifecycle operations in Domain](../extensions/data-lifecycle.md#model-lifecycle-operations-in-domain-extlifecyclebehavior001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.002 | [Authorize and audit lifecycle changes](../extensions/data-lifecycle.md#authorize-and-audit-lifecycle-changes-extlifecyclebehavior002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.003 | [Exclude persistence-only lifecycle behavior](../extensions/data-lifecycle.md#exclude-persistence-only-lifecycle-behavior-extlifecyclebehavior003) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.001 | [Name soft-delete timestamps](../extensions/data-lifecycle.md#name-soft-delete-timestamps-extlifecycleconvention001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.002 | [Keep archive records module-owned](../extensions/data-lifecycle.md#keep-archive-records-module-owned-extlifecycleconvention002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.003 | [Separate query-shaped history](../extensions/data-lifecycle.md#separate-query-shaped-history-extlifecycleconvention003) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.DELETE.001 | [Default to hard delete](../extensions/data-lifecycle.md#default-to-hard-delete-extlifecycledelete001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.DELETE.002 | [Model retained lifecycle states](../extensions/data-lifecycle.md#model-retained-lifecycle-states-extlifecycledelete002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.DELETE.003 | [Reject hidden lifecycle flags](../extensions/data-lifecycle.md#reject-hidden-lifecycle-flags-extlifecycledelete003) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.PURGE.001 | [Bound purge and archive work](../extensions/data-lifecycle.md#bound-purge-and-archive-work-extlifecyclepurge001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.PURGE.002 | [Preserve legal-hold data](../extensions/data-lifecycle.md#preserve-legal-hold-data-extlifecyclepurge002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.PURGE.003 | [Align backup deletion behavior](../extensions/data-lifecycle.md#align-backup-deletion-behavior-extlifecyclepurge003) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.READ.001 | [Exclude inactive records from normal reads](../extensions/data-lifecycle.md#exclude-inactive-records-from-normal-reads-extlifecycleread001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.READ.002 | [Authorize lifecycle access paths](../extensions/data-lifecycle.md#authorize-lifecycle-access-paths-extlifecycleread002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.READ.003 | [Define post-deletion references](../extensions/data-lifecycle.md#define-post-deletion-references-extlifecycleread003) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.001 | [Define storage lifecycle behavior](../extensions/data-lifecycle.md#define-storage-lifecycle-behavior-extlifecyclestorage001) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.002 | [Define relational lifecycle behavior](../extensions/data-lifecycle.md#define-relational-lifecycle-behavior-extlifecyclestorage002) | `extensions/data-lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.003 | [Test provider lifecycle paths](../extensions/data-lifecycle.md#test-provider-lifecycle-paths-extlifecyclestorage003) | `extensions/data-lifecycle.md` |
| EXT.LOCALE.ADOPT.001 | [Record supported locale behavior](../extensions/localization.md#record-supported-locale-behavior-extlocaleadopt001) | `extensions/localization.md` |
| EXT.LOCALE.ADOPT.002 | [Avoid catalog-only locale claims](../extensions/localization.md#avoid-catalog-only-locale-claims-extlocaleadopt002) | `extensions/localization.md` |
| EXT.LOCALE.CONTENT.001 | [Localize public presentation content](../extensions/localization.md#localize-public-presentation-content-extlocalecontent001) | `extensions/localization.md` |
| EXT.LOCALE.CONTENT.002 | [Keep stable error codes locale-neutral](../extensions/localization.md#keep-stable-error-codes-locale-neutral-extlocalecontent002) | `extensions/localization.md` |
| EXT.LOCALE.CONVENTION.001 | [Use one catalog root](../extensions/localization.md#use-one-catalog-root-extlocaleconvention001) | `extensions/localization.md` |
| EXT.LOCALE.CONVENTION.002 | [Split catalogs by module when needed](../extensions/localization.md#split-catalogs-by-module-when-needed-extlocaleconvention002) | `extensions/localization.md` |
| EXT.LOCALE.CONVENTION.003 | [Use BCP 47 identifiers](../extensions/localization.md#use-bcp-47-identifiers-extlocaleconvention003) | `extensions/localization.md` |
| EXT.LOCALE.CONVENTION.004 | [Keep locale selection explicit](../extensions/localization.md#keep-locale-selection-explicit-extlocaleconvention004) | `extensions/localization.md` |
| EXT.LOCALE.FORMAT.001 | [Format values with active locale](../extensions/localization.md#format-values-with-active-locale-extlocaleformat001) | `extensions/localization.md` |
| EXT.LOCALE.FORMAT.002 | [Preserve locale-neutral business data](../extensions/localization.md#preserve-locale-neutral-business-data-extlocaleformat002) | `extensions/localization.md` |
| EXT.LOCALE.MESSAGES.001 | [Store user-facing copy in catalogs](../extensions/localization.md#store-user-facing-copy-in-catalogs-extlocalemessages001) | `extensions/localization.md` |
| EXT.LOCALE.MESSAGES.002 | [Name messages by meaning](../extensions/localization.md#name-messages-by-meaning-extlocalemessages002) | `extensions/localization.md` |
| EXT.LOCALE.MESSAGES.003 | [Complete or fall back catalog values](../extensions/localization.md#complete-or-fall-back-catalog-values-extlocalemessages003) | `extensions/localization.md` |
| EXT.LOCALE.ROUTES.001 | [Define one locale route shape](../extensions/localization.md#define-one-locale-route-shape-extlocaleroutes001) | `extensions/localization.md` |
| EXT.LOCALE.ROUTES.002 | [Handle unavailable locale segments](../extensions/localization.md#handle-unavailable-locale-segments-extlocaleroutes002) | `extensions/localization.md` |
| EXT.LOCALE.ROUTES.003 | [Avoid duplicate localized URLs](../extensions/localization.md#avoid-duplicate-localized-urls-extlocaleroutes003) | `extensions/localization.md` |
| EXT.OUTBOX.ADOPT.001 | [Record durable delivery behavior](../extensions/outbox-worker.md#record-durable-delivery-behavior-extoutboxadopt001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ADOPT.002 | [Exclude manually repeatable reactions](../extensions/outbox-worker.md#exclude-manually-repeatable-reactions-extoutboxadopt002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.001 | [Stage messages with business work](../extensions/outbox-worker.md#stage-messages-with-business-work-extoutboxatomic001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.002 | [Serialize durable messages](../extensions/outbox-worker.md#serialize-durable-messages-extoutboxatomic002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.003 | [Commit staged work once](../extensions/outbox-worker.md#commit-staged-work-once-extoutboxatomic003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.004 | [Store required message fields](../extensions/outbox-worker.md#store-required-message-fields-extoutboxatomic004) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.005 | [Store failure and completion evidence](../extensions/outbox-worker.md#store-failure-and-completion-evidence-extoutboxatomic005) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.006 | [Classify message kinds](../extensions/outbox-worker.md#classify-message-kinds-extoutboxatomic006) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.007 | [Use the scoped business session](../extensions/outbox-worker.md#use-the-scoped-business-session-extoutboxatomic007) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ATOMIC.008 | [Reject independent outbox commits](../extensions/outbox-worker.md#reject-independent-outbox-commits-extoutboxatomic008) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.CONVENTION.001 | [Group outbox infrastructure](../extensions/outbox-worker.md#group-outbox-infrastructure-extoutboxconvention001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.CONVENTION.002 | [Isolate the Worker host](../extensions/outbox-worker.md#isolate-the-worker-host-extoutboxconvention002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.CONVENTION.003 | [Keep provider mapping with integration](../extensions/outbox-worker.md#keep-provider-mapping-with-integration-extoutboxconvention003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.CONVENTION.004 | [Dispatch Workflow Commands in a new scope](../extensions/outbox-worker.md#dispatch-workflow-commands-in-a-new-scope-extoutboxconvention004) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.CONVENTION.005 | [Avoid automatic durable-bus adoption](../extensions/outbox-worker.md#avoid-automatic-durable-bus-adoption-extoutboxconvention005) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.IDEMPOTENCY.001 | [Accept repeated delivery](../extensions/outbox-worker.md#accept-repeated-delivery-extoutboxidempotency001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.IDEMPOTENCY.002 | [Identify repeated delivery](../extensions/outbox-worker.md#identify-repeated-delivery-extoutboxidempotency002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.IDEMPOTENCY.003 | [Await target acceptance](../extensions/outbox-worker.md#await-target-acceptance-extoutboxidempotency003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.OPERATIONS.001 | [Publish backlog indicators](../extensions/outbox-worker.md#publish-backlog-indicators-extoutboxoperations001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.OPERATIONS.002 | [Set delivery alerts](../extensions/outbox-worker.md#set-delivery-alerts-extoutboxoperations002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.READINESS.001 | [Distinguish dependency outage](../extensions/outbox-worker.md#distinguish-dependency-outage-extoutboxreadiness001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.READINESS.002 | [Back off unavailable-store polling](../extensions/outbox-worker.md#back-off-unavailable-store-polling-extoutboxreadiness002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.READINESS.003 | [Restrict message retry to claimed records](../extensions/outbox-worker.md#restrict-message-retry-to-claimed-records-extoutboxreadiness003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.READINESS.004 | [Gate dispatch on readiness](../extensions/outbox-worker.md#gate-dispatch-on-readiness-extoutboxreadiness004) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.RETRY.001 | [Bound delivery retries](../extensions/outbox-worker.md#bound-delivery-retries-extoutboxretry001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.RETRY.002 | [Classify permanent delivery failure](../extensions/outbox-worker.md#classify-permanent-delivery-failure-extoutboxretry002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ROLLOUT.001 | [Protect active Worker compatibility](../extensions/outbox-worker.md#protect-active-worker-compatibility-extoutboxrollout001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ROLLOUT.002 | [Deploy readers before writers](../extensions/outbox-worker.md#deploy-readers-before-writers-extoutboxrollout002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.ROLLOUT.003 | [Plan undispatched rollback records](../extensions/outbox-worker.md#plan-undispatched-rollback-records-extoutboxrollout003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.SCHEMA.001 | [Version message types](../extensions/outbox-worker.md#version-message-types-extoutboxschema001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.SCHEMA.002 | [Support coexisting message producers](../extensions/outbox-worker.md#support-coexisting-message-producers-extoutboxschema002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.STATE.001 | [Model outbox lifecycle states](../extensions/outbox-worker.md#model-outbox-lifecycle-states-extoutboxstate001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.STATE.002 | [Preserve message identity during retry](../extensions/outbox-worker.md#preserve-message-identity-during-retry-extoutboxstate002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.STATE.003 | [Audit outbox replay](../extensions/outbox-worker.md#audit-outbox-replay-extoutboxstate003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.001 | [Dispatch claimed records in Worker](../extensions/outbox-worker.md#dispatch-claimed-records-in-worker-extoutboxworker001) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.002 | [Exclude request-transaction dispatch](../extensions/outbox-worker.md#exclude-request-transaction-dispatch-extoutboxworker002) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.003 | [Define claim ownership](../extensions/outbox-worker.md#define-claim-ownership-extoutboxworker003) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.004 | [Release claim transactions before calls](../extensions/outbox-worker.md#release-claim-transactions-before-calls-extoutboxworker004) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.005 | [Restrict completion to current lease owners](../extensions/outbox-worker.md#restrict-completion-to-current-lease-owners-extoutboxworker005) | `extensions/outbox-worker.md` |
| EXT.OUTBOX.WORKER.006 | [Requeue expired claims](../extensions/outbox-worker.md#requeue-expired-claims-extoutboxworker006) | `extensions/outbox-worker.md` |
| EXT.REALTIME.ADOPT.001 | [Record realtime need](../extensions/realtime.md#record-realtime-need-extrealtimeadopt001) | `extensions/realtime.md` |
| EXT.REALTIME.ADOPT.002 | [Reject cosmetic realtime adoption](../extensions/realtime.md#reject-cosmetic-realtime-adoption-extrealtimeadopt002) | `extensions/realtime.md` |
| EXT.REALTIME.AUTH.001 | [Authenticate and authorize subscriptions](../extensions/realtime.md#authenticate-and-authorize-subscriptions-extrealtimeauth001) | `extensions/realtime.md` |
| EXT.REALTIME.AUTH.002 | [Revalidate long-lived access](../extensions/realtime.md#revalidate-long-lived-access-extrealtimeauth002) | `extensions/realtime.md` |
| EXT.REALTIME.CAPACITY.001 | [Bound realtime resources](../extensions/realtime.md#bound-realtime-resources-extrealtimecapacity001) | `extensions/realtime.md` |
| EXT.REALTIME.CAPACITY.002 | [Reject unbounded slow-client buffering](../extensions/realtime.md#reject-unbounded-slow-client-buffering-extrealtimecapacity002) | `extensions/realtime.md` |
| EXT.REALTIME.CONVENTION.001 | [Place realtime code at outer boundaries](../extensions/realtime.md#place-realtime-code-at-outer-boundaries-extrealtimeconvention001) | `extensions/realtime.md` |
| EXT.REALTIME.CONVENTION.002 | [Subscribe through narrow functions](../extensions/realtime.md#subscribe-through-narrow-functions-extrealtimeconvention002) | `extensions/realtime.md` |
| EXT.REALTIME.RECOVERY.001 | [Reconnect and refresh authoritative state](../extensions/realtime.md#reconnect-and-refresh-authoritative-state-extrealtimerecovery001) | `extensions/realtime.md` |
| EXT.REALTIME.RECOVERY.002 | [Tolerate notification ordering differences](../extensions/realtime.md#tolerate-notification-ordering-differences-extrealtimerecovery002) | `extensions/realtime.md` |
| EXT.REALTIME.TRANSPORT.001 | [Use server-sent events for notifications](../extensions/realtime.md#use-server-sent-events-for-notifications-extrealtimetransport001) | `extensions/realtime.md` |
| EXT.REALTIME.TRANSPORT.002 | [Use SignalR for interactive messaging](../extensions/realtime.md#use-signalr-for-interactive-messaging-extrealtimetransport002) | `extensions/realtime.md` |
| EXT.REALTIME.TRANSPORT.003 | [Record transport support](../extensions/realtime.md#record-transport-support-extrealtimetransport003) | `extensions/realtime.md` |
| EXT.REPORT.ADOPT.001 | [Record reporting need](../extensions/reporting.md#record-reporting-need-extreportadopt001) | `extensions/reporting.md` |
| EXT.REPORT.ADOPT.002 | [Avoid speculative reporting systems](../extensions/reporting.md#avoid-speculative-reporting-systems-extreportadopt002) | `extensions/reporting.md` |
| EXT.REPORT.AUTHZ.001 | [Apply item-read authorization](../extensions/reporting.md#apply-item-read-authorization-extreportauthz001) | `extensions/reporting.md` |
| EXT.REPORT.CONTENT.001 | [Escape formula-leading export values](../extensions/reporting.md#escape-formula-leading-export-values-extreportcontent001) | `extensions/reporting.md` |
| EXT.REPORT.CONTENT.002 | [Define export encoding and columns](../extensions/reporting.md#define-export-encoding-and-columns-extreportcontent002) | `extensions/reporting.md` |
| EXT.REPORT.CONVENTION.001 | [Keep report definitions in Application](../extensions/reporting.md#keep-report-definitions-in-application-extreportconvention001) | `extensions/reporting.md` |
| EXT.REPORT.CONVENTION.002 | [Keep report providers in Infrastructure](../extensions/reporting.md#keep-report-providers-in-infrastructure-extreportconvention002) | `extensions/reporting.md` |
| EXT.REPORT.CONVENTION.003 | [Separate Worker orchestration](../extensions/reporting.md#separate-worker-orchestration-extreportconvention003) | `extensions/reporting.md` |
| EXT.REPORT.EXPORT.001 | [Run budget-exceeding exports in Worker](../extensions/reporting.md#run-budget-exceeding-exports-in-worker-extreportexport001) | `extensions/reporting.md` |
| EXT.REPORT.EXPORT.002 | [Protect export output](../extensions/reporting.md#protect-export-output-extreportexport002) | `extensions/reporting.md` |
| EXT.REPORT.LIMITS.001 | [Define report limits](../extensions/reporting.md#define-report-limits-extreportlimits001) | `extensions/reporting.md` |
| EXT.REPORT.LIMITS.002 | [Support report cancellation](../extensions/reporting.md#support-report-cancellation-extreportlimits002) | `extensions/reporting.md` |
| EXT.REPORT.SQL.001 | [Parameterize report SQL](../extensions/reporting.md#parameterize-report-sql-extreportsql001) | `extensions/reporting.md` |
| EXT.REPORT.SQL.002 | [Keep raw SQL in Infrastructure](../extensions/reporting.md#keep-raw-sql-in-infrastructure-extreportsql002) | `extensions/reporting.md` |
| EXT.REPORT.SQL.003 | [Review report plans](../extensions/reporting.md#review-report-plans-extreportsql003) | `extensions/reporting.md` |
| EXT.TENANCY.ADOPT.001 | [Define tenant isolation](../extensions/multitenancy.md#define-tenant-isolation-exttenancyadopt001) | `extensions/multitenancy.md` |
| EXT.TENANCY.ADOPT.002 | [Avoid unplanned isolation models](../extensions/multitenancy.md#avoid-unplanned-isolation-models-exttenancyadopt002) | `extensions/multitenancy.md` |
| EXT.TENANCY.AUTHZ.001 | [Verify actor and target tenancy](../extensions/multitenancy.md#verify-actor-and-target-tenancy-exttenancyauthz001) | `extensions/multitenancy.md` |
| EXT.TENANCY.AUTHZ.002 | [Isolate administrative cross-tenant access](../extensions/multitenancy.md#isolate-administrative-cross-tenant-access-exttenancyauthz002) | `extensions/multitenancy.md` |
| EXT.TENANCY.CONVENTION.001 | [Use typed tenant identities](../extensions/multitenancy.md#use-typed-tenant-identities-exttenancyconvention001) | `extensions/multitenancy.md` |
| EXT.TENANCY.CONVENTION.002 | [Use one tenant accessor](../extensions/multitenancy.md#use-one-tenant-accessor-exttenancyconvention002) | `extensions/multitenancy.md` |
| EXT.TENANCY.CONVENTION.003 | [Pass tenant scope explicitly](../extensions/multitenancy.md#pass-tenant-scope-explicitly-exttenancyconvention003) | `extensions/multitenancy.md` |
| EXT.TENANCY.DISCLOSURE.001 | [Apply cross-tenant disclosure policy](../extensions/multitenancy.md#apply-cross-tenant-disclosure-policy-exttenancydisclosure001) | `extensions/multitenancy.md` |
| EXT.TENANCY.DISCLOSURE.002 | [Protect tenant diagnostics](../extensions/multitenancy.md#protect-tenant-diagnostics-exttenancydisclosure002) | `extensions/multitenancy.md` |
| EXT.TENANCY.OPERATIONS.001 | [Scope tenant operations](../extensions/multitenancy.md#scope-tenant-operations-exttenancyoperations001) | `extensions/multitenancy.md` |
| EXT.TENANCY.RESOLVE.001 | [Resolve tenant identity from trusted context](../extensions/multitenancy.md#resolve-tenant-identity-from-trusted-context-exttenancyresolve001) | `extensions/multitenancy.md` |
| EXT.TENANCY.RESOLVE.002 | [Reject unrestricted tenant input](../extensions/multitenancy.md#reject-unrestricted-tenant-input-exttenancyresolve002) | `extensions/multitenancy.md` |
| EXT.TENANCY.STORAGE.001 | [Use selected tenant storage support](../extensions/multitenancy.md#use-selected-tenant-storage-support-exttenancystorage001) | `extensions/multitenancy.md` |
| EXT.TENANCY.STORAGE.002 | [Scope tenant-owned records](../extensions/multitenancy.md#scope-tenant-owned-records-exttenancystorage002) | `extensions/multitenancy.md` |

## FRONTEND

| ID | Provision | Page |
|:---|:---|:---|
| FRONTEND.COMPONENTS.ACCESSIBILITY.001 | [Meet accessibility requirements](../conventions/frontend/components.md#meet-accessibility-requirements-frontendcomponentsaccessibility001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONTENT.001 | [Protect rich content boundaries](../conventions/frontend/components.md#protect-rich-content-boundaries-frontendcomponentscontent001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.001 | [Name components for their role](../conventions/frontend/components.md#name-components-for-their-role-frontendcomponentsconvention001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.002 | [Give card and section titles heading semantics](../conventions/frontend/components.md#give-card-and-section-titles-heading-semantics-frontendcomponentsconvention002) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.003 | [Keep domain values typed until display](../conventions/frontend/components.md#keep-domain-values-typed-until-display-frontendcomponentsconvention003) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.004 | [Use `cn` for class composition](../conventions/frontend/components.md#use-cn-for-class-composition-frontendcomponentsconvention004) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.005 | [Keep error boundaries scoped](../conventions/frontend/components.md#keep-error-boundaries-scoped-frontendcomponentsconvention005) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.IMAGE.001 | [Use the framework image component for content images](../conventions/frontend/components.md#use-the-framework-image-component-for-content-images-frontendcomponentsimage001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.OWNERSHIP.001 | [Use the component ownership levels](../conventions/frontend/components.md#use-the-component-ownership-levels-frontendcomponentsownership001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.PROPS.001 | [Keep props narrow](../conventions/frontend/components.md#keep-props-narrow-frontendcomponentsprops001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.STATES.001 | [Render complete states](../conventions/frontend/components.md#render-complete-states-frontendcomponentsstates001) | `conventions/frontend/components.md` |
| FRONTEND.COMPONENTS.VARIANTS.001 | [Use declared visual variants](../conventions/frontend/components.md#use-declared-visual-variants-frontendcomponentsvariants001) | `conventions/frontend/components.md` |
| FRONTEND.DATA.CLIENT.001 | [Use one typed API client](../conventions/frontend/data-and-state.md#use-one-typed-api-client-frontenddataclient001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.CONVENTION.001 | [Use this API layout for one frontend](../conventions/frontend/data-and-state.md#use-this-api-layout-for-one-frontend-frontenddataconvention001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.CONVENTION.002 | [Keep schemas operation-specific](../conventions/frontend/data-and-state.md#keep-schemas-operation-specific-frontenddataconvention002) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.CONVENTION.003 | [Use native and framework form support first](../conventions/frontend/data-and-state.md#use-native-and-framework-form-support-first-frontenddataconvention003) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.CONVENTION.004 | [Keep cache invalidation close to mutations](../conventions/frontend/data-and-state.md#keep-cache-invalidation-close-to-mutations-frontenddataconvention004) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.ERRORS.001 | [Parse errors consistently](../conventions/frontend/data-and-state.md#parse-errors-consistently-frontenddataerrors001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.FORM.001 | [Keep forms aligned with use cases](../conventions/frontend/data-and-state.md#keep-forms-aligned-with-use-cases-frontenddataform001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.MUTATIONS.001 | [Keep mutations at a declared boundary](../conventions/frontend/data-and-state.md#keep-mutations-at-a-declared-boundary-frontenddatamutations001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.OPTIMISTIC.001 | [Make optimistic behavior recoverable](../conventions/frontend/data-and-state.md#make-optimistic-behavior-recoverable-frontenddataoptimistic001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.OWNER.001 | [Assign state to the narrowest owner](../conventions/frontend/data-and-state.md#assign-state-to-the-narrowest-owner-frontenddataowner001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.READS.001 | [Read initial data on the server](../conventions/frontend/data-and-state.md#read-initial-data-on-the-server-frontenddatareads001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.SECRETS.001 | [Keep secrets out of browser storage](../conventions/frontend/data-and-state.md#keep-secrets-out-of-browser-storage-frontenddatasecrets001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.DATA.TYPES.001 | [Generate transport types](../conventions/frontend/data-and-state.md#generate-transport-types-frontenddatatypes001) | `conventions/frontend/data-and-state.md` |
| FRONTEND.RENDERING.ASYNC.001 | [Await Next.js request APIs](../conventions/frontend/rendering.md#await-nextjs-request-apis-frontendrenderingasync001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.CACHE.001 | [Keep authenticated caching explicit](../conventions/frontend/rendering.md#keep-authenticated-caching-explicit-frontendrenderingcache001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.CLIENT.001 | [Document client boundaries](../conventions/frontend/rendering.md#document-client-boundaries-frontendrenderingclient001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.001 | [Use route groups for shells](../conventions/frontend/rendering.md#use-route-groups-for-shells-frontendrenderingconvention001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.002 | [Keep layouts stable](../conventions/frontend/rendering.md#keep-layouts-stable-frontendrenderingconvention002) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.003 | [Keep server-only code identifiable](../conventions/frontend/rendering.md#keep-server-only-code-identifiable-frontendrenderingconvention003) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.METADATA.001 | [Define route metadata deliberately](../conventions/frontend/rendering.md#define-route-metadata-deliberately-frontendrenderingmetadata001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.PROXY.001 | [Keep proxy behavior at the edge](../conventions/frontend/rendering.md#keep-proxy-behavior-at-the-edge-frontendrenderingproxy001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.ROUTES.001 | [Keep route files as composition boundaries](../conventions/frontend/rendering.md#keep-route-files-as-composition-boundaries-frontendrenderingroutes001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.SERVER.001 | [Prefer server execution](../conventions/frontend/rendering.md#prefer-server-execution-frontendrenderingserver001) | `conventions/frontend/rendering.md` |
| FRONTEND.RENDERING.STATES.001 | [Represent route states](../conventions/frontend/rendering.md#represent-route-states-frontendrenderingstates001) | `conventions/frontend/rendering.md` |
| FRONTEND.STRUCTURE.APPS.001 | [Keep applications independent](../conventions/frontend/structure.md#keep-applications-independent-frontendstructureapps001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.BOUNDARIES.001 | [Isolate module internals](../conventions/frontend/structure.md#isolate-module-internals-frontendstructureboundaries001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.001 | [Use this feature layout](../conventions/frontend/structure.md#use-this-feature-layout-frontendstructureconvention001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.002 | [Use explicit public entry points for workspace packages](../conventions/frontend/structure.md#use-explicit-public-entry-points-for-workspace-packages-frontendstructureconvention002) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.003 | [Keep tests near their ownership boundary](../conventions/frontend/structure.md#keep-tests-near-their-ownership-boundary-frontendstructureconvention003) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.FEATURES.001 | [Organize features by module and use case](../conventions/frontend/structure.md#organize-features-by-module-and-use-case-frontendstructurefeatures001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.IMPORTS.001 | [Keep imports directional](../conventions/frontend/structure.md#keep-imports-directional-frontendstructureimports001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.PACKAGES.001 | [Keep shared packages non-application-specific](../conventions/frontend/structure.md#keep-shared-packages-non-application-specific-frontendstructurepackages001) | `conventions/frontend/structure.md` |
| FRONTEND.STRUCTURE.STRUCTURE.001 | [Use the frontend application tree](../conventions/frontend/structure.md#use-the-frontend-application-tree-frontendstructurestructure001) | `conventions/frontend/structure.md` |
| FRONTEND.TESTING.CONVENTION.001 | [Keep focused tests beside source](../conventions/frontend/testing.md#keep-focused-tests-beside-source-frontendtestingconvention001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.CONVENTION.002 | [Query by accessible behavior](../conventions/frontend/testing.md#query-by-accessible-behavior-frontendtestingconvention002) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.CONVENTION.003 | [Keep test support narrow](../conventions/frontend/testing.md#keep-test-support-narrow-frontendtestingconvention003) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.GATES.001 | [Run the changed application gates](../conventions/frontend/testing.md#run-the-changed-application-gates-frontendtestinggates001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.ISOLATION.001 | [Isolate browser tests](../conventions/frontend/testing.md#isolate-browser-tests-frontendtestingisolation001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.LEVEL.001 | [Match test level to risk](../conventions/frontend/testing.md#match-test-level-to-risk-frontendtestinglevel001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.MOCKS.001 | [Keep mocks at owned boundaries](../conventions/frontend/testing.md#keep-mocks-at-owned-boundaries-frontendtestingmocks001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.STATES.001 | [Test observable states](../conventions/frontend/testing.md#test-observable-states-frontendtestingstates001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.TRACE.001 | [Trace acceptance behavior](../conventions/frontend/testing.md#trace-acceptance-behavior-frontendtestingtrace001) | `conventions/frontend/testing.md` |
| FRONTEND.TESTING.UI.001 | [Prove controlled UI changes](../conventions/frontend/testing.md#prove-controlled-ui-changes-frontendtestingui001) | `conventions/frontend/testing.md` |
| FRONTEND.UI.COMPANION.001 | [Govern behavior companions and specialist controls](../conventions/frontend/ui-governance.md#govern-behavior-companions-and-specialist-controls-frontenduicompanion001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.CONVENTION.001 | [Use the product profiles](../conventions/frontend/ui-governance.md#use-the-product-profiles-frontenduiconvention001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.CONVENTION.002 | [Use the source update procedure](../conventions/frontend/ui-governance.md#use-the-source-update-procedure-frontenduiconvention002) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.EVIDENCE.001 | [Prove UI behavior and appearance](../conventions/frontend/ui-governance.md#prove-ui-behavior-and-appearance-frontenduievidence001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.FORKS.001 | [Track source changes](../conventions/frontend/ui-governance.md#track-source-changes-frontenduiforks001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.GOVERNANCE.001 | [Select one visual authority](../conventions/frontend/ui-governance.md#select-one-visual-authority-frontenduigovernance001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.PAGES.001 | [Specify pages before composition](../conventions/frontend/ui-governance.md#specify-pages-before-composition-frontenduipages001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.PROTOCOL.001 | [Follow the agent UI protocol](../conventions/frontend/ui-governance.md#follow-the-agent-ui-protocol-frontenduiprotocol001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.SHADCN.001 | [Use the pinned shadcn/ui baseline](../conventions/frontend/ui-governance.md#use-the-pinned-shadcnui-baseline-frontenduishadcn001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.TAILWIND.001 | [Restrict CSS decisions](../conventions/frontend/ui-governance.md#restrict-css-decisions-frontenduitailwind001) | `conventions/frontend/ui-governance.md` |
| FRONTEND.UI.VOCABULARY.001 | [Declare the UI vocabulary](../conventions/frontend/ui-governance.md#declare-the-ui-vocabulary-frontenduivocabulary001) | `conventions/frontend/ui-governance.md` |

## PLATFORM

| ID | Provision | Page |
|:---|:---|:---|
| PLATFORM.BLAZOR.COMPOSITION.001 | [Apply the complete profile](../profile/dotnet-blazor.md#apply-the-complete-profile-platformblazorcomposition001) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.CONVENTION.001 | [Keep the platform profile visible](../profile/dotnet-blazor.md#keep-the-platform-profile-visible-platformblazorconvention001) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.CONVENTION.002 | [Verify with the .NET toolchain](../profile/dotnet-blazor.md#verify-with-the-net-toolchain-platformblazorconvention002) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.CONVENTION.003 | [Record a first-load budget](../profile/dotnet-blazor.md#record-a-first-load-budget-platformblazorconvention003) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.RENDERING.001 | [Publish static WebAssembly output](../profile/dotnet-blazor.md#publish-static-webassembly-output-platformblazorrendering001) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.REPLACEMENT.001 | [Declare replacements](../profile/dotnet-blazor.md#declare-replacements-platformblazorreplacement001) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.SCOPE.001 | [List excluded baselines](../profile/dotnet-blazor.md#list-excluded-baselines-platformblazorscope001) | `profile/dotnet-blazor.md` |
| PLATFORM.BLAZOR.VERSIONS.001 | [Use manifest version pins](../profile/dotnet-blazor.md#use-manifest-version-pins-platformblazorversions001) | `profile/dotnet-blazor.md` |
| PLATFORM.NEXTJS.COMPOSITION.001 | [Apply the complete profile](../profile/dotnet-nextjs.md#apply-the-complete-profile-platformnextjscomposition001) | `profile/dotnet-nextjs.md` |
| PLATFORM.NEXTJS.CONVENTION.001 | [Keep the platform profile visible](../profile/dotnet-nextjs.md#keep-the-platform-profile-visible-platformnextjsconvention001) | `profile/dotnet-nextjs.md` |
| PLATFORM.NEXTJS.REPLACEMENT.001 | [Declare replacements](../profile/dotnet-nextjs.md#declare-replacements-platformnextjsreplacement001) | `profile/dotnet-nextjs.md` |
| PLATFORM.NEXTJS.VERSIONS.001 | [Use manifest version pins](../profile/dotnet-nextjs.md#use-manifest-version-pins-platformnextjsversions001) | `profile/dotnet-nextjs.md` |

## QUALITY

| ID | Provision | Page |
|:---|:---|:---|
| QUALITY.CI.CONTRACTS.001 | [Keep generated contracts fresh](../conventions/quality/ci.md#keep-generated-contracts-fresh-qualitycicontracts001) | `conventions/quality/ci.md` |
| QUALITY.CI.CONVENTION.001 | [Apply the documented defaults](../conventions/quality/ci.md#apply-the-documented-defaults-qualityciconvention001) | `conventions/quality/ci.md` |
| QUALITY.CI.DOCS.001 | [Check code and documentation consistency](../conventions/quality/ci.md#check-code-and-documentation-consistency-qualitycidocs001) | `conventions/quality/ci.md` |
| QUALITY.CI.GATES.001 | [Run applicable gates on every pull request](../conventions/quality/ci.md#run-applicable-gates-on-every-pull-request-qualitycigates001) | `conventions/quality/ci.md` |
| QUALITY.CI.JOBS.001 | [Keep a canonical job graph](../conventions/quality/ci.md#keep-a-canonical-job-graph-qualitycijobs001) | `conventions/quality/ci.md` |
| QUALITY.CI.PROTECTION.001 | [Protect the default branch](../conventions/quality/ci.md#protect-the-default-branch-qualityciprotection001) | `conventions/quality/ci.md` |
| QUALITY.CI.RELEASE.001 | [Promote verified artifacts](../conventions/quality/ci.md#promote-verified-artifacts-qualitycirelease001) | `conventions/quality/ci.md` |
| QUALITY.CI.SCHEMA.001 | [Review schema artifacts](../conventions/quality/ci.md#review-schema-artifacts-qualitycischema001) | `conventions/quality/ci.md` |
| QUALITY.CI.SUPPLY.001 | [Scan dependencies and release artifacts](../conventions/quality/ci.md#scan-dependencies-and-release-artifacts-qualitycisupply001) | `conventions/quality/ci.md` |
| QUALITY.OPERATIONS.ALERTS.001 | [Define actionable baseline alerts](../conventions/quality/operations.md#define-actionable-baseline-alerts-qualityoperationsalerts001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.001 | [Use one local start command](../conventions/quality/operations.md#use-one-local-start-command-qualityoperationsconvention001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.002 | [Use stable service names](../conventions/quality/operations.md#use-stable-service-names-qualityoperationsconvention002) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.003 | [Keep runbooks near project documentation](../conventions/quality/operations.md#keep-runbooks-near-project-documentation-qualityoperationsconvention003) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.DATA.001 | [Define backup and restore behavior](../conventions/quality/operations.md#define-backup-and-restore-behavior-qualityoperationsdata001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.DEPENDENCIES.001 | [Bound external calls](../conventions/quality/operations.md#bound-external-calls-qualityoperationsdependencies001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.DEPLOY.001 | [Use a repeatable deployment](../conventions/quality/operations.md#use-a-repeatable-deployment-qualityoperationsdeploy001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.HEALTH.001 | [Separate liveness and readiness](../conventions/quality/operations.md#separate-liveness-and-readiness-qualityoperationshealth001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.LOCAL.001 | [Use Aspire for local orchestration](../conventions/quality/operations.md#use-aspire-for-local-orchestration-qualityoperationslocal001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.OBSERVABILITY.001 | [Emit correlated diagnostics](../conventions/quality/operations.md#emit-correlated-diagnostics-qualityoperationsobservability001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.ROLLBACK.001 | [Keep rollback executable](../conventions/quality/operations.md#keep-rollback-executable-qualityoperationsrollback001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.SCHEMA.001 | [Apply schema changes outside request startup](../conventions/quality/operations.md#apply-schema-changes-outside-request-startup-qualityoperationsschema001) | `conventions/quality/operations.md` |
| QUALITY.OPERATIONS.WORKER.001 | [Operate background work independently](../conventions/quality/operations.md#operate-background-work-independently-qualityoperationsworker001) | `conventions/quality/operations.md` |
| QUALITY.SECURITY.ABUSE.001 | [Bound abuse at exposed endpoints](../conventions/quality/security.md#bound-abuse-at-exposed-endpoints-qualitysecurityabuse001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.ACTOR.001 | [Derive the actor from claims](../conventions/quality/security.md#derive-the-actor-from-claims-qualitysecurityactor001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.AUDIT.001 | [Record security audit events](../conventions/quality/security.md#record-security-audit-events-qualitysecurityaudit001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.AUTHN.001 | [Keep backend authentication provider-neutral](../conventions/quality/security.md#keep-backend-authentication-provider-neutral-qualitysecurityauthn001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.AUTHZ.001 | [Authorize each target resource](../conventions/quality/security.md#authorize-each-target-resource-qualitysecurityauthz001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.CONVENTION.001 | [Use one current actor abstraction](../conventions/quality/security.md#use-one-current-actor-abstraction-qualitysecurityconvention001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.CONVENTION.002 | [Keep secure headers in host configuration](../conventions/quality/security.md#keep-secure-headers-in-host-configuration-qualitysecurityconvention002) | `conventions/quality/security.md` |
| QUALITY.SECURITY.CONVENTION.003 | [Use deny-by-default policies](../conventions/quality/security.md#use-deny-by-default-policies-qualitysecurityconvention003) | `conventions/quality/security.md` |
| QUALITY.SECURITY.CONVENTION.004 | [Test the resource authorization matrix](../conventions/quality/security.md#test-the-resource-authorization-matrix-qualitysecurityconvention004) | `conventions/quality/security.md` |
| QUALITY.SECURITY.CORS.001 | [Restrict cross-origin access](../conventions/quality/security.md#restrict-cross-origin-access-qualitysecuritycors001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.DATA.001 | [Minimize sensitive data](../conventions/quality/security.md#minimize-sensitive-data-qualitysecuritydata001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.ERRORS.001 | [Limit public error detail](../conventions/quality/security.md#limit-public-error-detail-qualitysecurityerrors001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.FRONTEND.001 | [Protect browser boundaries](../conventions/quality/security.md#protect-browser-boundaries-qualitysecurityfrontend001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.INPUT.001 | [Validate at trust boundaries](../conventions/quality/security.md#validate-at-trust-boundaries-qualitysecurityinput001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.ROTATION.001 | [Rotate production secrets](../conventions/quality/security.md#rotate-production-secrets-qualitysecurityrotation001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.SECRETS.001 | [Keep secrets out of tracked and observable data](../conventions/quality/security.md#keep-secrets-out-of-tracked-and-observable-data-qualitysecuritysecrets001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.SQL.001 | [Parameterize database input](../conventions/quality/security.md#parameterize-database-input-qualitysecuritysql001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.SUPPLY.001 | [Pin and review dependencies](../conventions/quality/security.md#pin-and-review-dependencies-qualitysecuritysupply001) | `conventions/quality/security.md` |
| QUALITY.SECURITY.SUPPLY.002 | [Enforce supply-chain gates in CI](../conventions/quality/security.md#enforce-supply-chain-gates-in-ci-qualitysecuritysupply002) | `conventions/quality/security.md` |

## WORKSPACE

| ID | Provision | Page |
|:---|:---|:---|
| WORKSPACE.CONFIG.BUILD.001 | [Centralize .NET build settings](../conventions/workspace/configuration.md#centralize-net-build-settings-workspaceconfigbuild001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.CONVENTION.001 | [Keep environment examples beside applications](../conventions/workspace/configuration.md#keep-environment-examples-beside-applications-workspaceconfigconvention001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.CONVENTION.002 | [Keep local overrides untracked](../conventions/workspace/configuration.md#keep-local-overrides-untracked-workspaceconfigconvention002) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.CONVENTION.003 | [Keep logging configuration provider-neutral](../conventions/workspace/configuration.md#keep-logging-configuration-provider-neutral-workspaceconfigconvention003) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.CONVENTION.004 | [Keep documentation directories out of build-artifact ignore rules](../conventions/workspace/configuration.md#keep-documentation-directories-out-of-build-artifact-ignore-rules-workspaceconfigconvention004) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.ESLINT.001 | [Pin the React version in the ESLint flat config](../conventions/workspace/configuration.md#pin-the-react-version-in-the-eslint-flat-config-workspaceconfigeslint001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.FRONTEND.001 | [Validate frontend environment access](../conventions/workspace/configuration.md#validate-frontend-environment-access-workspaceconfigfrontend001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.NODE.001 | [Pin the JavaScript toolchain](../conventions/workspace/configuration.md#pin-the-javascript-toolchain-workspaceconfignode001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.NUGET.001 | [Centralize NuGet versions](../conventions/workspace/configuration.md#centralize-nuget-versions-workspaceconfignuget001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.OPTIONS.001 | [Validate backend options at startup](../conventions/workspace/configuration.md#validate-backend-options-at-startup-workspaceconfigoptions001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.PNPM.001 | [Use one frontend dependency graph](../conventions/workspace/configuration.md#use-one-frontend-dependency-graph-workspaceconfigpnpm001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.SDK.001 | [Pin the SDK at the workspace root](../conventions/workspace/configuration.md#pin-the-sdk-at-the-workspace-root-workspaceconfigsdk001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.SECRETS.001 | [Keep secrets outside source control](../conventions/workspace/configuration.md#keep-secrets-outside-source-control-workspaceconfigsecrets001) | `conventions/workspace/configuration.md` |
| WORKSPACE.CONFIG.TOOLS.001 | [Commit the tool manifest](../conventions/workspace/configuration.md#commit-the-tool-manifest-workspaceconfigtools001) | `conventions/workspace/configuration.md` |
| WORKSPACE.DEPENDENCIES.APPLICATION.001 | [Keep Application dependencies narrow](../conventions/workspace/dependencies.md#keep-application-dependencies-narrow-workspacedependenciesapplication001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.APPROVAL.001 | [Approve new packages explicitly](../conventions/workspace/dependencies.md#approve-new-packages-explicitly-workspacedependenciesapproval001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.001 | [Reference only the LiteBus module required](../conventions/workspace/dependencies.md#reference-only-the-litebus-module-required-workspacedependenciesconvention001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.002 | [Keep generated packages dependency-light](../conventions/workspace/dependencies.md#keep-generated-packages-dependency-light-workspacedependenciesconvention002) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.003 | [Keep test dependencies in test projects](../conventions/workspace/dependencies.md#keep-test-dependencies-in-test-projects-workspacedependenciesconvention003) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.004 | [Use this baseline package ownership](../conventions/workspace/dependencies.md#use-this-baseline-package-ownership-workspacedependenciesconvention004) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.DOMAIN.001 | [Keep Domain package-free](../conventions/workspace/dependencies.md#keep-domain-package-free-workspacedependenciesdomain001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.FRONTEND.001 | [Keep frontend applications isolated](../conventions/workspace/dependencies.md#keep-frontend-applications-isolated-workspacedependenciesfrontend001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.INFRASTRUCTURE.001 | [Keep providers in Infrastructure](../conventions/workspace/dependencies.md#keep-providers-in-infrastructure-workspacedependenciesinfrastructure001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.PINS.001 | [Pin every dependency centrally](../conventions/workspace/dependencies.md#pin-every-dependency-centrally-workspacedependenciespins001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.PROJECTS.001 | [Use the project reference graph](../conventions/workspace/dependencies.md#use-the-project-reference-graph-workspacedependenciesprojects001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.UI.001 | [Keep the approved web UI dependency boundary](../conventions/workspace/dependencies.md#keep-the-approved-web-ui-dependency-boundary-workspacedependenciesui001) | `conventions/workspace/dependencies.md` |
| WORKSPACE.NAMING.AGGREGATE.001 | [Anchor aggregate-owned types on the aggregate root](../conventions/workspace/naming.md#anchor-aggregate-owned-types-on-the-aggregate-root-workspacenamingaggregate001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.ASYNC.001 | [Name asynchronous methods completely](../conventions/workspace/naming.md#name-asynchronous-methods-completely-workspacenamingasync001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.BOOLEAN.001 | [Use intent-revealing boolean names](../conventions/workspace/naming.md#use-intent-revealing-boolean-names-workspacenamingboolean001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.001 | [Align business names across layers](../conventions/workspace/naming.md#align-business-names-across-layers-workspacenamingconvention001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.002 | [Keep namespaces aligned with folders](../conventions/workspace/naming.md#keep-namespaces-aligned-with-folders-workspacenamingconvention002) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.003 | [Avoid generic type names](../conventions/workspace/naming.md#avoid-generic-type-names-workspacenamingconvention003) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.004 | [Derive boundary names from the ubiquitous term](../conventions/workspace/naming.md#derive-boundary-names-from-the-ubiquitous-term-workspacenamingconvention004) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CSHARP.001 | [Keep implementation style consistent](../conventions/workspace/naming.md#keep-implementation-style-consistent-workspacenamingcsharp001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.CSHARP.002 | [Use current language features](../conventions/workspace/naming.md#use-current-language-features-workspacenamingcsharp002) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.EXCEPTION.001 | [Name exceptions by failed rule](../conventions/workspace/naming.md#name-exceptions-by-failed-rule-workspacenamingexception001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.FILE.001 | [Match C# files and primary types](../conventions/workspace/naming.md#match-c-files-and-primary-types-workspacenamingfile001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.FRONTEND.001 | [Use predictable frontend names](../conventions/workspace/naming.md#use-predictable-frontend-names-workspacenamingfrontend001) | `conventions/workspace/naming.md` |
| WORKSPACE.NAMING.SUFFIX.001 | [Use architectural suffixes](../conventions/workspace/naming.md#use-architectural-suffixes-workspacenamingsuffix001) | `conventions/workspace/naming.md` |
| WORKSPACE.STRUCTURE.APPS.001 | [Keep runnable applications under apps](../conventions/workspace/structure.md#keep-runnable-applications-under-apps-workspacestructureapps001) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.001 | [Name frontends by audience](../conventions/workspace/structure.md#name-frontends-by-audience-workspacestructureconvention001) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.002 | [Keep scripts at the root](../conventions/workspace/structure.md#keep-scripts-at-the-root-workspacestructureconvention002) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.003 | [Keep generated API contracts in packages](../conventions/workspace/structure.md#keep-generated-api-contracts-in-packages-workspacestructureconvention003) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOCS.001 | [Keep consumer documentation at the root](../conventions/workspace/structure.md#keep-consumer-documentation-at-the-root-workspacestructuredocs001) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOCS.002 | [Keep orientation documents separate from canonical records](../conventions/workspace/structure.md#keep-orientation-documents-separate-from-canonical-records-workspacestructuredocs002) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOTNET.001 | [Keep .NET production and test projects separate](../conventions/workspace/structure.md#keep-net-production-and-test-projects-separate-workspacestructuredotnet001) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.PACKAGES.001 | [Limit shared TypeScript packages](../conventions/workspace/structure.md#limit-shared-typescript-packages-workspacestructurepackages001) | `conventions/workspace/structure.md` |
| WORKSPACE.STRUCTURE.STRUCTURE.001 | [Use the canonical root tree](../conventions/workspace/structure.md#use-the-canonical-root-tree-workspacestructurestructure001) | `conventions/workspace/structure.md` |

