# Provisions

## Intent

Use this generated page to resolve a provision ID to its heading and owning page.

Run `node tools/generate-provisions.mjs` after any provision change. The repository validator fails when this page and the active standards disagree.

The active release states 822 provisions across 8 areas.

## BACKEND

| ID | Provision | Page |
|:---|:---|:---|
| BACKEND.API.ACTOR.001 | [Derive authenticated identity from claims](../backend/api.md#derive-authenticated-identity-from-claims-backendapiactor001) | `backend/api.md` |
| BACKEND.API.ACTOR.002 | [Reject a client-supplied actor identifier](../backend/api.md#reject-a-client-supplied-actor-identifier-backendapiactor002) | `backend/api.md` |
| BACKEND.API.AUTHZ.001 | [Authorize the target resource](../backend/api.md#authorize-the-target-resource-backendapiauthz001) | `backend/api.md` |
| BACKEND.API.BOUNDARY.001 | [Keep endpoint dependencies transport-focused](../backend/api.md#keep-endpoint-dependencies-transport-focused-backendapiboundary001) | `backend/api.md` |
| BACKEND.API.BOUNDARY.002 | [Defer error mapping to the global handler](../backend/api.md#defer-error-mapping-to-the-global-handler-backendapiboundary002) | `backend/api.md` |
| BACKEND.API.CONVENTION.001 | [Use this endpoint layout](../backend/api.md#use-this-endpoint-layout-backendapiconvention001) | `backend/api.md` |
| BACKEND.API.CONVENTION.002 | [Keep transport models independent](../backend/api.md#keep-transport-models-independent-backendapiconvention002) | `backend/api.md` |
| BACKEND.API.CONVENTION.003 | [Name routes from resources](../backend/api.md#name-routes-from-resources-backendapiconvention003) | `backend/api.md` |
| BACKEND.API.CONVENTION.004 | [Keep numeric transport types precise](../backend/api.md#keep-numeric-transport-types-precise-backendapiconvention004) | `backend/api.md` |
| BACKEND.API.CONVENTION.005 | [Keep Program.cs as composition](../backend/api.md#keep-programcs-as-composition-backendapiconvention005) | `backend/api.md` |
| BACKEND.API.ENDPOINTS.001 | [Use one endpoint per operation](../backend/api.md#use-one-endpoint-per-operation-backendapiendpoints001) | `backend/api.md` |
| BACKEND.API.ENDPOINTS.002 | [Exclude MVC controllers from the profile](../backend/api.md#exclude-mvc-controllers-from-the-profile-backendapiendpoints002) | `backend/api.md` |
| BACKEND.API.ERROR.001 | [Return stable Problem Details](../backend/api.md#return-stable-problem-details-backendapierror001) | `backend/api.md` |
| BACKEND.API.ERROR.002 | [Keep error responses free of internal detail](../backend/api.md#keep-error-responses-free-of-internal-detail-backendapierror002) | `backend/api.md` |
| BACKEND.API.MODEL.001 | [Mirror a Domain closed set as a transport model of the same shape](../backend/api.md#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape-backendapimodel001) | `backend/api.md` |
| BACKEND.API.MODEL.002 | [Reject a collapsed or borrowed wire contract](../backend/api.md#reject-a-collapsed-or-borrowed-wire-contract-backendapimodel002) | `backend/api.md` |
| BACKEND.API.OPENAPI.001 | [Treat OpenAPI as a generated contract](../backend/api.md#treat-openapi-as-a-generated-contract-backendapiopenapi001) | `backend/api.md` |
| BACKEND.API.OPENAPI.002 | [Reflect enforced authentication in the contract](../backend/api.md#reflect-enforced-authentication-in-the-contract-backendapiopenapi002) | `backend/api.md` |
| BACKEND.API.OPENAPI.003 | [Publish precise, complete schemas](../backend/api.md#publish-precise-complete-schemas-backendapiopenapi003) | `backend/api.md` |
| BACKEND.API.OPENAPI.004 | [Commit the generated contract its consumers read](../backend/api.md#commit-the-generated-contract-its-consumers-read-backendapiopenapi004) | `backend/api.md` |
| BACKEND.API.PAGING.001 | [Bound collection queries](../backend/api.md#bound-collection-queries-backendapipaging001) | `backend/api.md` |
| BACKEND.API.ROUTES.001 | [Keep routes resource-oriented](../backend/api.md#keep-routes-resource-oriented-backendapiroutes001) | `backend/api.md` |
| BACKEND.API.STATUS.001 | [Use consistent status codes](../backend/api.md#use-consistent-status-codes-backendapistatus001) | `backend/api.md` |
| BACKEND.API.STATUS.002 | [Reject a success status for a failed outcome](../backend/api.md#reject-a-success-status-for-a-failed-outcome-backendapistatus002) | `backend/api.md` |
| BACKEND.APPLICATION.AUTHZ.001 | [Enforce target authorization in the use case](../backend/application.md#enforce-target-authorization-in-the-use-case-backendapplicationauthz001) | `backend/application.md` |
| BACKEND.APPLICATION.CLOSEDSET.001 | [Mirror a Domain closed set in the result](../backend/application.md#mirror-a-domain-closed-set-in-the-result-backendapplicationclosedset001) | `backend/application.md` |
| BACKEND.APPLICATION.COMMAND.001 | [Keep command handlers narrow](../backend/application.md#keep-command-handlers-narrow-backendapplicationcommand001) | `backend/application.md` |
| BACKEND.APPLICATION.CONTRACTS.001 | [Co-locate contracts and implementations](../backend/application.md#co-locate-contracts-and-implementations-backendapplicationcontracts001) | `backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.001 | [Use this operation layout](../backend/application.md#use-this-operation-layout-backendapplicationconvention001) | `backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.002 | [Keep messages immutable](../backend/application.md#keep-messages-immutable-backendapplicationconvention002) | `backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.003 | [Return use-case results](../backend/application.md#return-use-case-results-backendapplicationconvention003) | `backend/application.md` |
| BACKEND.APPLICATION.CONVENTION.004 | [Keep mappings at the owning boundary](../backend/application.md#keep-mappings-at-the-owning-boundary-backendapplicationconvention004) | `backend/application.md` |
| BACKEND.APPLICATION.FAILURE.001 | [Model expected use-case failures explicitly](../backend/application.md#model-expected-use-case-failures-explicitly-backendapplicationfailure001) | `backend/application.md` |
| BACKEND.APPLICATION.MEDIATOR.001 | [Use specific LiteBus entry points](../backend/application.md#use-specific-litebus-entry-points-backendapplicationmediator001) | `backend/application.md` |
| BACKEND.APPLICATION.ORCHESTRATION.001 | [Keep one state-changing Use case in one Command pipeline](../backend/application.md#keep-one-state-changing-use-case-in-one-command-pipeline-backendapplicationorchestration001) | `backend/application.md` |
| BACKEND.APPLICATION.PORT.001 | [Define narrow external ports](../backend/application.md#define-narrow-external-ports-backendapplicationport001) | `backend/application.md` |
| BACKEND.APPLICATION.QUERY.001 | [Project queries directly](../backend/application.md#project-queries-directly-backendapplicationquery001) | `backend/application.md` |
| BACKEND.APPLICATION.REACTION.001 | [Keep event reaction implementations explicit](../backend/application.md#keep-event-reaction-implementations-explicit-backendapplicationreaction001) | `backend/application.md` |
| BACKEND.APPLICATION.STRUCTURE.001 | [Organize Application by operation](../backend/application.md#organize-application-by-operation-backendapplicationstructure001) | `backend/application.md` |
| BACKEND.APPLICATION.VALIDATION.001 | [Separate input validation from invariants](../backend/application.md#separate-input-validation-from-invariants-backendapplicationvalidation001) | `backend/application.md` |
| BACKEND.APPLICATION.WORKFLOW.001 | [Advance durable Workflows through separate Commands](../backend/application.md#advance-durable-workflows-through-separate-commands-backendapplicationworkflow001) | `backend/application.md` |
| BACKEND.ARCHITECTURE.APPLICATION.001 | [Keep one Application assembly](../backend/architecture.md#keep-one-application-assembly-backendarchitectureapplication001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.COMPOSITION.001 | [Compose each process explicitly](../backend/architecture.md#compose-each-process-explicitly-backendarchitecturecomposition001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONTRACTS.001 | [Own each layer's contract types](../backend/architecture.md#own-each-layers-contract-types-backendarchitecturecontracts001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.001 | [Use mirrored module folders](../backend/architecture.md#use-mirrored-module-folders-backendarchitectureconvention001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.002 | [Keep composition in hosts](../backend/architecture.md#keep-composition-in-hosts-backendarchitectureconvention002) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.CONVENTION.003 | [Use one public assembly marker per scanned project](../backend/architecture.md#use-one-public-assembly-marker-per-scanned-project-backendarchitectureconvention003) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.CQRS.001 | [Separate command and query behavior](../backend/architecture.md#separate-command-and-query-behavior-backendarchitecturecqrs001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.DEPENDENCIES.001 | [Point dependencies inward](../backend/architecture.md#point-dependencies-inward-backendarchitecturedependencies001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.DOMAIN.001 | [Keep business invariants in Domain](../backend/architecture.md#keep-business-invariants-in-domain-backendarchitecturedomain001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.ENFORCEMENT.001 | [Test structural boundaries](../backend/architecture.md#test-structural-boundaries-backendarchitectureenforcement001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.MODULE.001 | [Organize every layer by module and use case](../backend/architecture.md#organize-every-layer-by-module-and-use-case-backendarchitecturemodule001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.PROJECTS.001 | [Use four application projects](../backend/architecture.md#use-four-application-projects-backendarchitectureprojects001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.VISIBILITY.001 | [Keep implementation types internal](../backend/architecture.md#keep-implementation-types-internal-backendarchitecturevisibility001) | `backend/architecture.md` |
| BACKEND.ARCHITECTURE.WORKER.001 | [Add Worker only for an independent process boundary](../backend/architecture.md#add-worker-only-for-an-independent-process-boundary-backendarchitectureworker001) | `backend/architecture.md` |
| BACKEND.DOMAIN.AGGREGATE.001 | [Treat aggregates as consistency boundaries](../backend/domain.md#treat-aggregates-as-consistency-boundaries-backenddomainaggregate001) | `backend/domain.md` |
| BACKEND.DOMAIN.BASE.001 | [Use the project aggregate root contract](../backend/domain.md#use-the-project-aggregate-root-contract-backenddomainbase001) | `backend/domain.md` |
| BACKEND.DOMAIN.BEHAVIOR.001 | [Express transitions through business methods](../backend/domain.md#express-transitions-through-business-methods-backenddomainbehavior001) | `backend/domain.md` |
| BACKEND.DOMAIN.CLOSEDSET.001 | [Model every closed set of domain values without enums](../backend/domain.md#model-every-closed-set-of-domain-values-without-enums-backenddomainclosedset001) | `backend/domain.md` |
| BACKEND.DOMAIN.COLLECTION.001 | [Define collection value semantics explicitly](../backend/domain.md#define-collection-value-semantics-explicitly-backenddomaincollection001) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.001 | [Apply the documented defaults](../backend/domain.md#apply-the-documented-defaults-backenddomainconvention001) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.002 | [Organize a module by aggregate and concept](../backend/domain.md#organize-a-module-by-aggregate-and-concept-backenddomainconvention002) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.003 | [Use these Domain names](../backend/domain.md#use-these-domain-names-backenddomainconvention003) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.004 | [Define the shared Domain contracts once](../backend/domain.md#define-the-shared-domain-contracts-once-backenddomainconvention004) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.005 | [Define typed IDs without primitive escape hatches](../backend/domain.md#define-typed-ids-without-primitive-escape-hatches-backenddomainconvention005) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.006 | [Keep ID representations aligned at every boundary](../backend/domain.md#keep-id-representations-aligned-at-every-boundary-backenddomainconvention006) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.007 | [Keep state records as the only Aggregate lifecycle representation](../backend/domain.md#keep-state-records-as-the-only-aggregate-lifecycle-representation-backenddomainconvention007) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.008 | [Keep value creation and equality explicit](../backend/domain.md#keep-value-creation-and-equality-explicit-backenddomainconvention008) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.009 | [Keep domain services pure](../backend/domain.md#keep-domain-services-pure-backenddomainconvention009) | `backend/domain.md` |
| BACKEND.DOMAIN.CONVENTION.010 | [Keep repository contracts aggregate-specific](../backend/domain.md#keep-repository-contracts-aggregate-specific-backenddomainconvention010) | `backend/domain.md` |
| BACKEND.DOMAIN.DOCS.001 | [Document every public Domain contract](../backend/domain.md#document-every-public-domain-contract-backenddomaindocs001) | `backend/domain.md` |
| BACKEND.DOMAIN.ENTITY.001 | [Keep child entities inside the aggregate boundary](../backend/domain.md#keep-child-entities-inside-the-aggregate-boundary-backenddomainentity001) | `backend/domain.md` |
| BACKEND.DOMAIN.ERROR.001 | [Reject business violations with Domain exceptions](../backend/domain.md#reject-business-violations-with-domain-exceptions-backenddomainerror001) | `backend/domain.md` |
| BACKEND.DOMAIN.EVENT.001 | [Raise immutable domain facts](../backend/domain.md#raise-immutable-domain-facts-backenddomainevent001) | `backend/domain.md` |
| BACKEND.DOMAIN.FACTORY.001 | [Create valid aggregates through named factories](../backend/domain.md#create-valid-aggregates-through-named-factories-backenddomainfactory001) | `backend/domain.md` |
| BACKEND.DOMAIN.ID.001 | [Use strongly typed version 7 identifiers](../backend/domain.md#use-strongly-typed-version-7-identifiers-backenddomainid001) | `backend/domain.md` |
| BACKEND.DOMAIN.LANGUAGE.001 | [Use one ubiquitous language](../backend/domain.md#use-one-ubiquitous-language-backenddomainlanguage001) | `backend/domain.md` |
| BACKEND.DOMAIN.MONEY.001 | [Make money and decimal rules explicit](../backend/domain.md#make-money-and-decimal-rules-explicit-backenddomainmoney001) | `backend/domain.md` |
| BACKEND.DOMAIN.PURITY.001 | [Keep Domain free of outer-layer concerns](../backend/domain.md#keep-domain-free-of-outer-layer-concerns-backenddomainpurity001) | `backend/domain.md` |
| BACKEND.DOMAIN.REFERENCE.001 | [Reference other aggregates by ID](../backend/domain.md#reference-other-aggregates-by-id-backenddomainreference001) | `backend/domain.md` |
| BACKEND.DOMAIN.REPOSITORY.001 | [Keep repository interfaces in Domain](../backend/domain.md#keep-repository-interfaces-in-domain-backenddomainrepository001) | `backend/domain.md` |
| BACKEND.DOMAIN.SERVICE.001 | [Use stateless domain services for ownerless rules](../backend/domain.md#use-stateless-domain-services-for-ownerless-rules-backenddomainservice001) | `backend/domain.md` |
| BACKEND.DOMAIN.STATE.001 | [Model every Aggregate lifecycle with state records](../backend/domain.md#model-every-aggregate-lifecycle-with-state-records-backenddomainstate001) | `backend/domain.md` |
| BACKEND.DOMAIN.TIME.001 | [Pass nondeterministic values into Domain](../backend/domain.md#pass-nondeterministic-values-into-domain-backenddomaintime001) | `backend/domain.md` |
| BACKEND.DOMAIN.VALUE.001 | [Use immutable value objects for domain concepts](../backend/domain.md#use-immutable-value-objects-for-domain-concepts-backenddomainvalue001) | `backend/domain.md` |
| BACKEND.PERSISTENCE.COMMIT.001 | [Commit once in the command pipeline](../backend/persistence.md#commit-once-in-the-command-pipeline-backendpersistencecommit001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.001 | [Use this Infrastructure layout](../backend/persistence.md#use-this-infrastructure-layout-backendpersistenceconvention001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.002 | [Register one scoped session](../backend/persistence.md#register-one-scoped-session-backendpersistenceconvention002) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.003 | [Make ordering explicit](../backend/persistence.md#make-ordering-explicit-backendpersistenceconvention003) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.004 | [Review query plans for new indexes](../backend/persistence.md#review-query-plans-for-new-indexes-backendpersistenceconvention004) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.005 | [Add read documents for query-shaped data](../backend/persistence.md#add-read-documents-for-query-shaped-data-backendpersistenceconvention005) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.CONVENTION.006 | [Persist one explicit state object](../backend/persistence.md#persist-one-explicit-state-object-backendpersistenceconvention006) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.EVENT.001 | [Collect events without a public unit of work](../backend/persistence.md#collect-events-without-a-public-unit-of-work-backendpersistenceevent001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.EVOLUTION.001 | [Evolve stored document contracts explicitly](../backend/persistence.md#evolve-stored-document-contracts-explicitly-backendpersistenceevolution001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.GROWTH.001 | [Bound aggregate document growth](../backend/persistence.md#bound-aggregate-document-growth-backendpersistencegrowth001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.MAPPING.001 | [Keep mappings and aliases explicit](../backend/persistence.md#keep-mappings-and-aliases-explicit-backendpersistencemapping001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.NAMING.001 | [Use database naming conventions](../backend/persistence.md#use-database-naming-conventions-backendpersistencenaming001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.READ.001 | [Query through IQuerySession](../backend/persistence.md#query-through-iquerysession-backendpersistenceread001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.SCHEMA.001 | [Control production schema changes](../backend/persistence.md#control-production-schema-changes-backendpersistenceschema001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.SERIALIZATION.001 | [Keep serialization behavior out of Domain](../backend/persistence.md#keep-serialization-behavior-out-of-domain-backendpersistenceserialization001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.TEST.001 | [Test persistence against PostgreSQL](../backend/persistence.md#test-persistence-against-postgresql-backendpersistencetest001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.WORKFLOW.001 | [Stage Workflow progress with outgoing work](../backend/persistence.md#stage-workflow-progress-with-outgoing-work-backendpersistenceworkflow001) | `backend/persistence.md` |
| BACKEND.PERSISTENCE.WRITE.001 | [Stage aggregate writes through repositories](../backend/persistence.md#stage-aggregate-writes-through-repositories-backendpersistencewrite001) | `backend/persistence.md` |
| BACKEND.TESTING.APPLICATION.001 | [Test Application coordination](../backend/testing.md#test-application-coordination-backendtestingapplication001) | `backend/testing.md` |
| BACKEND.TESTING.ARCHITECTURE.001 | [Enforce architecture rules](../backend/testing.md#enforce-architecture-rules-backendtestingarchitecture001) | `backend/testing.md` |
| BACKEND.TESTING.CONVENTION.001 | [Mirror production module names](../backend/testing.md#mirror-production-module-names-backendtestingconvention001) | `backend/testing.md` |
| BACKEND.TESTING.CONVENTION.002 | [Name tests by observable behavior](../backend/testing.md#name-tests-by-observable-behavior-backendtestingconvention002) | `backend/testing.md` |
| BACKEND.TESTING.CONVENTION.003 | [Use builders for valid defaults](../backend/testing.md#use-builders-for-valid-defaults-backendtestingconvention003) | `backend/testing.md` |
| BACKEND.TESTING.CONVENTION.004 | [Keep assertions focused](../backend/testing.md#keep-assertions-focused-backendtestingconvention004) | `backend/testing.md` |
| BACKEND.TESTING.COVERAGE.001 | [Use evidence rather than one coverage target](../backend/testing.md#use-evidence-rather-than-one-coverage-target-backendtestingcoverage001) | `backend/testing.md` |
| BACKEND.TESTING.DOMAIN.001 | [Test Domain in isolation](../backend/testing.md#test-domain-in-isolation-backendtestingdomain001) | `backend/testing.md` |
| BACKEND.TESTING.GENERATED.001 | [Verify generated contracts](../backend/testing.md#verify-generated-contracts-backendtestinggenerated001) | `backend/testing.md` |
| BACKEND.TESTING.HARNESS.001 | [Use one production-faithful integration harness](../backend/testing.md#use-one-production-faithful-integration-harness-backendtestingharness001) | `backend/testing.md` |
| BACKEND.TESTING.INTEGRATION.001 | [Test persistence and HTTP with PostgreSQL](../backend/testing.md#test-persistence-and-http-with-postgresql-backendtestingintegration001) | `backend/testing.md` |
| BACKEND.TESTING.ISOLATION.001 | [Isolate integration state](../backend/testing.md#isolate-integration-state-backendtestingisolation001) | `backend/testing.md` |
| BACKEND.TESTING.PROJECTS.001 | [Use four baseline test projects](../backend/testing.md#use-four-baseline-test-projects-backendtestingprojects001) | `backend/testing.md` |
| BACKEND.TESTING.TRACE.001 | [Trace acceptance criteria](../backend/testing.md#trace-acceptance-criteria-backendtestingtrace001) | `backend/testing.md` |

## BLAZOR

| ID | Provision | Page |
|:---|:---|:---|
| BLAZOR.BROWSER.CONVENTION.001 | [Select the storage mechanism per shape](../blazor/browser.md#select-the-storage-mechanism-per-shape-blazorbrowserconvention001) | `blazor/browser.md` |
| BLAZOR.BROWSER.CONVENTION.002 | [Keep a stable serialization contract](../blazor/browser.md#keep-a-stable-serialization-contract-blazorbrowserconvention002) | `blazor/browser.md` |
| BLAZOR.BROWSER.CONVENTION.003 | [Record the classification](../blazor/browser.md#record-the-classification-blazorbrowserconvention003) | `blazor/browser.md` |
| BLAZOR.BROWSER.KEY.001 | [Version and scope every storage key](../blazor/browser.md#version-and-scope-every-storage-key-blazorbrowserkey001) | `blazor/browser.md` |
| BLAZOR.BROWSER.LIMITS.001 | [Bound what is stored](../blazor/browser.md#bound-what-is-stored-blazorbrowserlimits001) | `blazor/browser.md` |
| BLAZOR.BROWSER.MIGRATION.001 | [Provide a migration for every changed shape](../blazor/browser.md#provide-a-migration-for-every-changed-shape-blazorbrowsermigration001) | `blazor/browser.md` |
| BLAZOR.BROWSER.PERSISTENCE.001 | [Own storage in Infrastructure](../blazor/browser.md#own-storage-in-infrastructure-blazorbrowserpersistence001) | `blazor/browser.md` |
| BLAZOR.BROWSER.PORTABILITY.001 | [Provide export and import](../blazor/browser.md#provide-export-and-import-blazorbrowserportability001) | `blazor/browser.md` |
| BLAZOR.BROWSER.READ.001 | [Treat reads as fallible](../blazor/browser.md#treat-reads-as-fallible-blazorbrowserread001) | `blazor/browser.md` |
| BLAZOR.COMPONENTS.CONVENTION.001 | [Name for the boundary role](../blazor/components.md#name-for-the-boundary-role-blazorcomponentsconvention001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.CONVENTION.002 | [Apply one styling system](../blazor/components.md#apply-one-styling-system-blazorcomponentsconvention002) | `blazor/components.md` |
| BLAZOR.COMPONENTS.CONVENTION.003 | [Keep accessibility in the component](../blazor/components.md#keep-accessibility-in-the-component-blazorcomponentsconvention003) | `blazor/components.md` |
| BLAZOR.COMPONENTS.EVENT.001 | [Raise events rather than mutating](../blazor/components.md#raise-events-rather-than-mutating-blazorcomponentsevent001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.FILE.001 | [Place one component per file](../blazor/components.md#place-one-component-per-file-blazorcomponentsfile001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.INTEROP.001 | [Resolve browser behavior through an interface](../blazor/components.md#resolve-browser-behavior-through-an-interface-blazorcomponentsinterop001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.PARAMETERS.001 | [Declare every parameter type](../blazor/components.md#declare-every-parameter-type-blazorcomponentsparameters001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.PRESENTATION.001 | [Keep components presentational](../blazor/components.md#keep-components-presentational-blazorcomponentspresentation001) | `blazor/components.md` |
| BLAZOR.COMPONENTS.VIEWMODELS.001 | [Own the layer contract](../blazor/components.md#own-the-layer-contract-blazorcomponentsviewmodels001) | `blazor/components.md` |
| BLAZOR.DATA.CLASSIFICATION.001 | [Classify state](../blazor/data.md#classify-state-blazordataclassification001) | `blazor/data.md` |
| BLAZOR.DATA.CONVENTION.001 | [Keep forms typed](../blazor/data.md#keep-forms-typed-blazordataconvention001) | `blazor/data.md` |
| BLAZOR.DATA.CONVENTION.002 | [Prefer explicit refresh](../blazor/data.md#prefer-explicit-refresh-blazordataconvention002) | `blazor/data.md` |
| BLAZOR.DATA.DERIVED.001 | [Keep derived values single-sourced](../blazor/data.md#keep-derived-values-single-sourced-blazordataderived001) | `blazor/data.md` |
| BLAZOR.DATA.LOAD.001 | [Load persisted state once](../blazor/data.md#load-persisted-state-once-blazordataload001) | `blazor/data.md` |
| BLAZOR.DATA.RESULTS.001 | [Make failure explicit](../blazor/data.md#make-failure-explicit-blazordataresults001) | `blazor/data.md` |
| BLAZOR.DATA.USECASE.001 | [Route use cases through Application](../blazor/data.md#route-use-cases-through-application-blazordatausecase001) | `blazor/data.md` |
| BLAZOR.DATA.VALIDATION.001 | [Validate at the boundary](../blazor/data.md#validate-at-the-boundary-blazordatavalidation001) | `blazor/data.md` |
| BLAZOR.RENDERING.ACQUISITION.001 | [Keep the acquisition surface static](../blazor/rendering.md#keep-the-acquisition-surface-static-blazorrenderingacquisition001) | `blazor/rendering.md` |
| BLAZOR.RENDERING.CONVENTION.001 | [Name routes for the reader](../blazor/rendering.md#name-routes-for-the-reader-blazorrenderingconvention001) | `blazor/rendering.md` |
| BLAZOR.RENDERING.CONVENTION.002 | [Keep navigation state in the URL](../blazor/rendering.md#keep-navigation-state-in-the-url-blazorrenderingconvention002) | `blazor/rendering.md` |
| BLAZOR.RENDERING.MODE.001 | [Render on the client only](../blazor/rendering.md#render-on-the-client-only-blazorrenderingmode001) | `blazor/rendering.md` |
| BLAZOR.RENDERING.OFFLINE.001 | [Operate offline after first load](../blazor/rendering.md#operate-offline-after-first-load-blazorrenderingoffline001) | `blazor/rendering.md` |
| BLAZOR.RENDERING.ROUTES.001 | [Declare routes on pages](../blazor/rendering.md#declare-routes-on-pages-blazorrenderingroutes001) | `blazor/rendering.md` |
| BLAZOR.RENDERING.STATE.001 | [Give every route explicit states](../blazor/rendering.md#give-every-route-explicit-states-blazorrenderingstate001) | `blazor/rendering.md` |
| BLAZOR.STRUCTURE.BOUNDARY.001 | [Isolate module internals](../blazor/structure.md#isolate-module-internals-blazorstructureboundary001) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.CONVENTION.001 | [Place interop adapters together](../blazor/structure.md#place-interop-adapters-together-blazorstructureconvention001) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.CONVENTION.002 | [Keep static content out of the assembly](../blazor/structure.md#keep-static-content-out-of-the-assembly-blazorstructureconvention002) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.DOMAIN.001 | [Keep Domain free of browser concerns](../blazor/structure.md#keep-domain-free-of-browser-concerns-blazorstructuredomain001) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.FEATURES.001 | [Organize features by module and use case](../blazor/structure.md#organize-features-by-module-and-use-case-blazorstructurefeatures001) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.IMPORTS.001 | [Keep imports directional](../blazor/structure.md#keep-imports-directional-blazorstructureimports001) | `blazor/structure.md` |
| BLAZOR.STRUCTURE.TREE.001 | [Use the client solution tree](../blazor/structure.md#use-the-client-solution-tree-blazorstructuretree001) | `blazor/structure.md` |
| BLAZOR.TESTING.ACCEPTANCE.001 | [Cite acceptance criteria](../blazor/testing.md#cite-acceptance-criteria-blazortestingacceptance001) | `blazor/testing.md` |
| BLAZOR.TESTING.BUDGET.001 | [Enforce the first-load budget](../blazor/testing.md#enforce-the-first-load-budget-blazortestingbudget001) | `blazor/testing.md` |
| BLAZOR.TESTING.COMPONENTS.001 | [Replace interop in component tests](../blazor/testing.md#replace-interop-in-component-tests-blazortestingcomponents001) | `blazor/testing.md` |
| BLAZOR.TESTING.CONVENTION.001 | [Keep browser-capability tests honest](../blazor/testing.md#keep-browser-capability-tests-honest-blazortestingconvention001) | `blazor/testing.md` |
| BLAZOR.TESTING.CONVENTION.002 | [Keep end-to-end tests few](../blazor/testing.md#keep-end-to-end-tests-few-blazortestingconvention002) | `blazor/testing.md` |
| BLAZOR.TESTING.CORE.001 | [Test the core without a browser](../blazor/testing.md#test-the-core-without-a-browser-blazortestingcore001) | `blazor/testing.md` |
| BLAZOR.TESTING.E2E.001 | [Verify real browser behavior end to end](../blazor/testing.md#verify-real-browser-behavior-end-to-end-blazortestinge2e001) | `blazor/testing.md` |
| BLAZOR.TESTING.PROJECTS.001 | [Use the four client test projects](../blazor/testing.md#use-the-four-client-test-projects-blazortestingprojects001) | `blazor/testing.md` |

## CORE

| ID | Provision | Page |
|:---|:---|:---|
| CORE.AGENT.COMPLETE.001 | [Run and report verification](../core/agent.md#run-and-report-verification-coreagentcomplete001) | `core/agent.md` |
| CORE.AGENT.CONFLICT.001 | [Stop on unresolved conflict](../core/agent.md#stop-on-unresolved-conflict-coreagentconflict001) | `core/agent.md` |
| CORE.AGENT.CONVENTION.001 | [Select one task label](../core/agent.md#select-one-task-label-coreagentconvention001) | `core/agent.md` |
| CORE.AGENT.CONVENTION.002 | [Escalate from summary to full document](../core/agent.md#escalate-from-summary-to-full-document-coreagentconvention002) | `core/agent.md` |
| CORE.AGENT.CONVENTION.003 | [Inspect local examples after standards](../core/agent.md#inspect-local-examples-after-standards-coreagentconvention003) | `core/agent.md` |
| CORE.AGENT.EDIT.001 | [Inspect existing work before editing](../core/agent.md#inspect-existing-work-before-editing-coreagentedit001) | `core/agent.md` |
| CORE.AGENT.EDIT.002 | [Restrict unapproved side effects](../core/agent.md#restrict-unapproved-side-effects-coreagentedit002) | `core/agent.md` |
| CORE.AGENT.EDIT.003 | [Make coherent scoped changes](../core/agent.md#make-coherent-scoped-changes-coreagentedit003) | `core/agent.md` |
| CORE.AGENT.LOAD.001 | [Select task context](../core/agent.md#select-task-context-coreagentload001) | `core/agent.md` |
| CORE.AGENT.LOAD.002 | [Load context by tier](../core/agent.md#load-context-by-tier-coreagentload002) | `core/agent.md` |
| CORE.AGENT.LOAD.003 | [Load applicable extensions](../core/agent.md#load-applicable-extensions-coreagentload003) | `core/agent.md` |
| CORE.AGENT.LOAD.004 | [Read active behavior specifications](../core/agent.md#read-active-behavior-specifications-coreagentload004) | `core/agent.md` |
| CORE.AGENT.PRECEDENCE.001 | [Apply guidance precedence](../core/agent.md#apply-guidance-precedence-coreagentprecedence001) | `core/agent.md` |
| CORE.AGENT.PRECEDENCE.002 | [Replace only declared conventions](../core/agent.md#replace-only-declared-conventions-coreagentprecedence002) | `core/agent.md` |
| CORE.AGENT.SYNC.001 | [Update behavior records with code](../core/agent.md#update-behavior-records-with-code-coreagentsync001) | `core/agent.md` |
| CORE.AUTHORING.ASCII.001 | [Keep authored prose ASCII-safe](../core/authoring.md#keep-authored-prose-ascii-safe-coreauthoringascii001) | `core/authoring.md` |
| CORE.AUTHORING.ASCII.002 | [Exclude declared content paths from the ASCII check](../core/authoring.md#exclude-declared-content-paths-from-the-ascii-check-coreauthoringascii002) | `core/authoring.md` |
| CORE.AUTHORING.CASE.001 | [Use controlled capitalization](../core/authoring.md#use-controlled-capitalization-coreauthoringcase001) | `core/authoring.md` |
| CORE.AUTHORING.CONVENTION.001 | [Prefer direct action headings](../core/authoring.md#prefer-direct-action-headings-coreauthoringconvention001) | `core/authoring.md` |
| CORE.AUTHORING.CONVENTION.002 | [Prefer positive instructions](../core/authoring.md#prefer-positive-instructions-coreauthoringconvention002) | `core/authoring.md` |
| CORE.AUTHORING.CONVENTION.003 | [Use tables for exact mappings](../core/authoring.md#use-tables-for-exact-mappings-coreauthoringconvention003) | `core/authoring.md` |
| CORE.AUTHORING.DEFAULTS.001 | [Identify actionable conventions](../core/authoring.md#identify-actionable-conventions-coreauthoringdefaults001) | `core/authoring.md` |
| CORE.AUTHORING.EXAMPLE.001 | [Attach examples to their provisions](../core/authoring.md#attach-examples-to-their-provisions-coreauthoringexample001) | `core/authoring.md` |
| CORE.AUTHORING.IDENTIFIER.001 | [Use the declared identifier grammar](../core/authoring.md#use-the-declared-identifier-grammar-coreauthoringidentifier001) | `core/authoring.md` |
| CORE.AUTHORING.IDENTIFIER.002 | [Restrict the CONVENTION segment to replaceable defaults](../core/authoring.md#restrict-the-convention-segment-to-replaceable-defaults-coreauthoringidentifier002) | `core/authoring.md` |
| CORE.AUTHORING.IDENTIFIER.003 | [Use a registered topic segment](../core/authoring.md#use-a-registered-topic-segment-coreauthoringidentifier003) | `core/authoring.md` |
| CORE.AUTHORING.INDEX.001 | [Regenerate the provision index](../core/authoring.md#regenerate-the-provision-index-coreauthoringindex001) | `core/authoring.md` |
| CORE.AUTHORING.METADATA.002 | [Declare structured specification metadata](../core/authoring.md#declare-structured-specification-metadata-coreauthoringmetadata002) | `core/authoring.md` |
| CORE.AUTHORING.METADATA.003 | [Use one metadata carrier](../core/authoring.md#use-one-metadata-carrier-coreauthoringmetadata003) | `core/authoring.md` |
| CORE.AUTHORING.NORMATIVE.002 | [Use one normative vocabulary](../core/authoring.md#use-one-normative-vocabulary-coreauthoringnormative002) | `core/authoring.md` |
| CORE.AUTHORING.PAGE.001 | [Use the declared page contract](../core/authoring.md#use-the-declared-page-contract-coreauthoringpage001) | `core/authoring.md` |
| CORE.AUTHORING.PROSE.001 | [Apply controlled prose measures](../core/authoring.md#apply-controlled-prose-measures-coreauthoringprose001) | `core/authoring.md` |
| CORE.AUTHORING.QUALITY.001 | [Apply the four quality tests](../core/authoring.md#apply-the-four-quality-tests-coreauthoringquality001) | `core/authoring.md` |
| CORE.AUTHORING.REQUIREMENT.001 | [Write atomic Standards provisions](../core/authoring.md#write-atomic-standards-provisions-coreauthoringrequirement001) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.001 | [Validate current standards material](../core/authoring.md#validate-current-standards-material-coreauthoringsnapshot001) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.002 | [Exclude historical transition material](../core/authoring.md#exclude-historical-transition-material-coreauthoringsnapshot002) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.003 | [Publish each release as a complete contract](../core/authoring.md#publish-each-release-as-a-complete-contract-coreauthoringsnapshot003) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.004 | [Exclude cross-release compatibility work](../core/authoring.md#exclude-cross-release-compatibility-work-coreauthoringsnapshot004) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.005 | [Keep a pinned release for as long as it serves](../core/authoring.md#keep-a-pinned-release-for-as-long-as-it-serves-coreauthoringsnapshot005) | `core/authoring.md` |
| CORE.AUTHORING.SNAPSHOT.006 | [Record the reviewed standards release](../core/authoring.md#record-the-reviewed-standards-release-coreauthoringsnapshot006) | `core/authoring.md` |
| CORE.AUTHORING.SUMMARY.001 | [Keep Agent Summaries informative](../core/authoring.md#keep-agent-summaries-informative-coreauthoringsummary001) | `core/authoring.md` |
| CORE.AUTHORING.TERM.001 | [Use one term for one concept](../core/authoring.md#use-one-term-for-one-concept-coreauthoringterm001) | `core/authoring.md` |
| CORE.AUTHORING.VALIDATION.001 | [Run repeatable authoring checks](../core/authoring.md#run-repeatable-authoring-checks-coreauthoringvalidation001) | `core/authoring.md` |
| CORE.AUTHORING.VERIFICATION.001 | [Map provisions to evidence](../core/authoring.md#map-provisions-to-evidence-coreauthoringverification001) | `core/authoring.md` |
| CORE.AUTHORING.VOICE.001 | [Use active and explicit sentences](../core/authoring.md#use-active-and-explicit-sentences-coreauthoringvoice001) | `core/authoring.md` |
| CORE.PRINCIPLES.COMPLEXITY.001 | [Require current complexity activation](../core/principles.md#require-current-complexity-activation-coreprinciplescomplexity001) | `core/principles.md` |
| CORE.PRINCIPLES.COMPLEXITY.002 | [Select extensions by criteria](../core/principles.md#select-extensions-by-criteria-coreprinciplescomplexity002) | `core/principles.md` |
| CORE.PRINCIPLES.CONVENTION.001 | [Prefer direct owned dependencies](../core/principles.md#prefer-direct-owned-dependencies-coreprinciplesconvention001) | `core/principles.md` |
| CORE.PRINCIPLES.CONVENTION.002 | [Prefer local code until reuse is real](../core/principles.md#prefer-local-code-until-reuse-is-real-coreprinciplesconvention002) | `core/principles.md` |
| CORE.PRINCIPLES.ENFORCEMENT.001 | [Prove enforceable boundaries mechanically](../core/principles.md#prove-enforceable-boundaries-mechanically-coreprinciplesenforcement001) | `core/principles.md` |
| CORE.PRINCIPLES.NAMING.001 | [Name boundary intent](../core/principles.md#name-boundary-intent-coreprinciplesnaming001) | `core/principles.md` |
| CORE.PRINCIPLES.NAMING.002 | [Avoid generic boundary names](../core/principles.md#avoid-generic-boundary-names-coreprinciplesnaming002) | `core/principles.md` |
| CORE.PRINCIPLES.SLICE.001 | [Deliver complete use-case slices](../core/principles.md#deliver-complete-use-case-slices-coreprinciplesslice001) | `core/principles.md` |
| CORE.PRINCIPLES.SOURCE.001 | [Keep one authored source](../core/principles.md#keep-one-authored-source-coreprinciplessource001) | `core/principles.md` |
| CORE.PRINCIPLES.SOURCE.002 | [Locate package versions in the manifest](../core/principles.md#locate-package-versions-in-the-manifest-coreprinciplessource002) | `core/principles.md` |
| CORE.PRINCIPLES.SOURCE.003 | [Locate specification status in metadata](../core/principles.md#locate-specification-status-in-metadata-coreprinciplessource003) | `core/principles.md` |
| CORE.PRINCIPLES.SOURCE.004 | [Cite proved acceptance criteria](../core/principles.md#cite-proved-acceptance-criteria-coreprinciplessource004) | `core/principles.md` |
| CORE.PRINCIPLES.SPECIFICATION.001 | [Declare specification ownership](../core/principles.md#declare-specification-ownership-coreprinciplesspecification001) | `core/principles.md` |
| CORE.PRINCIPLES.SPECIFICATION.002 | [Classify specification authority](../core/principles.md#classify-specification-authority-coreprinciplesspecification002) | `core/principles.md` |
| CORE.PRINCIPLES.SPECIFICATION.003 | [Separate authority from implementation](../core/principles.md#separate-authority-from-implementation-coreprinciplesspecification003) | `core/principles.md` |
| CORE.PRINCIPLES.SPECIFICATION.004 | [Retire public behavior deliberately](../core/principles.md#retire-public-behavior-deliberately-coreprinciplesspecification004) | `core/principles.md` |
| CORE.RELEASE.CONVENTION.001 | [Store release records together](../core/release.md#store-release-records-together-corereleaseconvention001) | `core/release.md` |
| CORE.RELEASE.CONVENTION.002 | [Treat check warnings as failures](../core/release.md#treat-check-warnings-as-failures-corereleaseconvention002) | `core/release.md` |
| CORE.RELEASE.DERIVED.001 | [Regenerate application contracts](../core/release.md#regenerate-application-contracts-corereleasederived001) | `core/release.md` |
| CORE.RELEASE.DERIVED.002 | [Keep generated contracts stable](../core/release.md#keep-generated-contracts-stable-corereleasederived002) | `core/release.md` |
| CORE.RELEASE.GATES.001 | [Run boundary-selected checks](../core/release.md#run-boundary-selected-checks-corereleasegates001) | `core/release.md` |
| CORE.RELEASE.GATES.002 | [Run backend release checks](../core/release.md#run-backend-release-checks-corereleasegates002) | `core/release.md` |
| CORE.RELEASE.GATES.003 | [Run frontend release checks](../core/release.md#run-frontend-release-checks-corereleasegates003) | `core/release.md` |
| CORE.RELEASE.GATES.004 | [Run flow checks](../core/release.md#run-flow-checks-corereleasegates004) | `core/release.md` |
| CORE.RELEASE.GATES.005 | [Run consistency checks](../core/release.md#run-consistency-checks-corereleasegates005) | `core/release.md` |
| CORE.RELEASE.GATES.006 | [Run extension checks](../core/release.md#run-extension-checks-corereleasegates006) | `core/release.md` |
| CORE.RELEASE.READINESS.001 | [Meet release readiness gates](../core/release.md#meet-release-readiness-gates-corereleasereadiness001) | `core/release.md` |
| CORE.RELEASE.READINESS.002 | [Apply release access controls](../core/release.md#apply-release-access-controls-corereleasereadiness002) | `core/release.md` |
| CORE.RELEASE.READINESS.003 | [Provide release data recovery](../core/release.md#provide-release-data-recovery-corereleasereadiness003) | `core/release.md` |
| CORE.RELEASE.READINESS.004 | [Provide release operating visibility](../core/release.md#provide-release-operating-visibility-corereleasereadiness004) | `core/release.md` |
| CORE.RELEASE.READINESS.005 | [Provide release delivery controls](../core/release.md#provide-release-delivery-controls-corereleasereadiness005) | `core/release.md` |
| CORE.RELEASE.READINESS.006 | [Record the release artifact](../core/release.md#record-the-release-artifact-corereleasereadiness006) | `core/release.md` |
| CORE.RELEASE.READINESS.007 | [Resolve release blockers](../core/release.md#resolve-release-blockers-corereleasereadiness007) | `core/release.md` |
| CORE.RELEASE.READINESS.008 | [Select conditional capabilities after activation](../core/release.md#select-conditional-capabilities-after-activation-corereleasereadiness008) | `core/release.md` |
| CORE.RELEASE.RECORD.001 | [Identify immutable release artifacts](../core/release.md#identify-immutable-release-artifacts-corereleaserecord001) | `core/release.md` |
| CORE.RELEASE.RECORD.002 | [List included release behavior](../core/release.md#list-included-release-behavior-corereleaserecord002) | `core/release.md` |
| CORE.RELEASE.RECORD.003 | [Record release evidence](../core/release.md#record-release-evidence-corereleaserecord003) | `core/release.md` |
| CORE.RELEASE.RECORD.004 | [Record operating readiness](../core/release.md#record-operating-readiness-corereleaserecord004) | `core/release.md` |
| CORE.RELEASE.RECORD.005 | [Keep release records non-authoritative](../core/release.md#keep-release-records-non-authoritative-corereleaserecord005) | `core/release.md` |
| CORE.RELEASE.REPORT.001 | [Report verification exactly](../core/release.md#report-verification-exactly-corereleasereport001) | `core/release.md` |
| CORE.RELEASE.REPORT.002 | [Avoid overbroad completion claims](../core/release.md#avoid-overbroad-completion-claims-corereleasereport002) | `core/release.md` |
| CORE.RELEASE.SLICE.001 | [Complete observable use-case slices](../core/release.md#complete-observable-use-case-slices-corereleaseslice001) | `core/release.md` |
| CORE.RELEASE.SLICE.002 | [Mark incomplete behavior as planned](../core/release.md#mark-incomplete-behavior-as-planned-corereleaseslice002) | `core/release.md` |
| CORE.RELEASE.SLICE.003 | [Verify connected end-to-end flows](../core/release.md#verify-connected-end-to-end-flows-corereleaseslice003) | `core/release.md` |
| CORE.SCOPE.APPLICATION.001 | [Use the supported application profile](../core/scope.md#use-the-supported-application-profile-corescopeapplication001) | `core/scope.md` |
| CORE.SCOPE.BACKEND.001 | [Declare a consumer that has no backend](../core/scope.md#declare-a-consumer-that-has-no-backend-corescopebackend001) | `core/scope.md` |
| CORE.SCOPE.CONTEXT.001 | [Keep one bounded context](../core/scope.md#keep-one-bounded-context-corescopecontext001) | `core/scope.md` |
| CORE.SCOPE.CONVENTION.001 | [Start with one API and database](../core/scope.md#start-with-one-api-and-database-corescopeconvention001) | `core/scope.md` |
| CORE.SCOPE.CONVENTION.002 | [Measure capacity before expansion](../core/scope.md#measure-capacity-before-expansion-corescopeconvention002) | `core/scope.md` |
| CORE.SCOPE.EXTENSIONS.001 | [Select conditional extensions explicitly](../core/scope.md#select-conditional-extensions-explicitly-corescopeextensions001) | `core/scope.md` |
| CORE.SCOPE.EXTENSIONS.002 | [Record selected extensions](../core/scope.md#record-selected-extensions-corescopeextensions002) | `core/scope.md` |
| CORE.SCOPE.OUTSIDE.001 | [Record unsupported scope decisions](../core/scope.md#record-unsupported-scope-decisions-corescopeoutside001) | `core/scope.md` |
| CORE.SYSTEM.ACCEPTANCE.001 | [Give acceptance criteria stable ownership](../core/system.md#give-acceptance-criteria-stable-ownership-coresystemacceptance001) | `core/system.md` |
| CORE.SYSTEM.AGGREGATE.001 | [Make aggregate ownership explicit](../core/system.md#make-aggregate-ownership-explicit-coresystemaggregate001) | `core/system.md` |
| CORE.SYSTEM.AUTHORITY.001 | [Keep decision authority with accountable people](../core/system.md#keep-decision-authority-with-accountable-people-coresystemauthority001) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.001 | [Use this consumer documentation layout](../core/system.md#use-this-consumer-documentation-layout-coresystemconvention001) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.002 | [Group module use-case files by aggregate root](../core/system.md#group-module-use-case-files-by-aggregate-root-coresystemconvention002) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.003 | [Keep operational and security references under operations](../core/system.md#keep-operational-and-security-references-under-operations-coresystemconvention003) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.004 | [Use established technical terms](../core/system.md#use-established-technical-terms-coresystemconvention004) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.005 | [Use ordinary capitalization in prose](../core/system.md#use-ordinary-capitalization-in-prose-coresystemconvention005) | `core/system.md` |
| CORE.SYSTEM.CONVENTION.006 | [Keep specifications readable without tooling](../core/system.md#keep-specifications-readable-without-tooling-coresystemconvention006) | `core/system.md` |
| CORE.SYSTEM.EXTENSIONS.001 | [Select extensions before applying them](../core/system.md#select-extensions-before-applying-them-coresystemextensions001) | `core/system.md` |
| CORE.SYSTEM.EXTENSIONS.002 | [Exclude a project-scoped extension from local metadata](../core/system.md#exclude-a-project-scoped-extension-from-local-metadata-coresystemextensions002) | `core/system.md` |
| CORE.SYSTEM.FLOW.001 | [Connect one product outcome through an end-to-end flow](../core/system.md#connect-one-product-outcome-through-an-end-to-end-flow-coresystemflow001) | `core/system.md` |
| CORE.SYSTEM.METADATA.001 | [Declare Specification Metadata](../core/system.md#declare-specification-metadata-coresystemmetadata001) | `core/system.md` |
| CORE.SYSTEM.MODULE.001 | [Group language and use cases by module](../core/system.md#group-language-and-use-cases-by-module-coresystemmodule001) | `core/system.md` |
| CORE.SYSTEM.REACTION.001 | [Record events and event reactions separately](../core/system.md#record-events-and-event-reactions-separately-coresystemreaction001) | `core/system.md` |
| CORE.SYSTEM.RULES.001 | [Classify domain rules by enforcement boundary](../core/system.md#classify-domain-rules-by-enforcement-boundary-coresystemrules001) | `core/system.md` |
| CORE.SYSTEM.SPECIFICATION.001 | [Drive work from approved specifications](../core/system.md#drive-work-from-approved-specifications-coresystemspecification001) | `core/system.md` |
| CORE.SYSTEM.STATE.001 | [Model every aggregate lifecycle with state records](../core/system.md#model-every-aggregate-lifecycle-with-state-records-coresystemstate001) | `core/system.md` |
| CORE.SYSTEM.SYNC.001 | [Update specifications with behavior](../core/system.md#update-specifications-with-behavior-coresystemsync001) | `core/system.md` |
| CORE.SYSTEM.USECASE.001 | [Deliver one complete use case](../core/system.md#deliver-one-complete-use-case-coresystemusecase001) | `core/system.md` |
| CORE.SYSTEM.USECASE.002 | [State implemented before acceptance evidence exists](../core/system.md#state-implemented-before-acceptance-evidence-exists-coresystemusecase002) | `core/system.md` |
| CORE.SYSTEM.WORKFLOW.001 | [Specify autonomous progress as a workflow](../core/system.md#specify-autonomous-progress-as-a-workflow-coresystemworkflow001) | `core/system.md` |

## EXT

| ID | Provision | Page |
|:---|:---|:---|
| EXT.AUDIT.ACCESS.001 | [Give the trail a read path](../ext/audit.md#give-the-trail-a-read-path-extauditaccess001) | `ext/audit.md` |
| EXT.AUDIT.ACCESS.002 | [Audit reads of the trail](../ext/audit.md#audit-reads-of-the-trail-extauditaccess002) | `ext/audit.md` |
| EXT.AUDIT.ACTOR.001 | [Use a closed actor set](../ext/audit.md#use-a-closed-actor-set-extauditactor001) | `ext/audit.md` |
| EXT.AUDIT.ACTOR.002 | [Record delegated administrative access](../ext/audit.md#record-delegated-administrative-access-extauditactor002) | `ext/audit.md` |
| EXT.AUDIT.ADOPT.001 | [Record the audit adoption decision](../ext/audit.md#record-the-audit-adoption-decision-extauditadopt001) | `ext/audit.md` |
| EXT.AUDIT.ADOPT.002 | [Declare audit selection on every Command](../ext/audit.md#declare-audit-selection-on-every-command-extauditadopt002) | `ext/audit.md` |
| EXT.AUDIT.ATOMIC.001 | [Commit a success record with its business change](../ext/audit.md#commit-a-success-record-with-its-business-change-extauditatomic001) | `ext/audit.md` |
| EXT.AUDIT.ATOMIC.002 | [Write an unsuccessful record outside the failed transaction](../ext/audit.md#write-an-unsuccessful-record-outside-the-failed-transaction-extauditatomic002) | `ext/audit.md` |
| EXT.AUDIT.ATOMIC.003 | [Stage the audit write before the business commit](../ext/audit.md#stage-the-audit-write-before-the-business-commit-extauditatomic003) | `ext/audit.md` |
| EXT.AUDIT.ATOMIC.004 | [Publish unsuccessful write failures](../ext/audit.md#publish-unsuccessful-write-failures-extauditatomic004) | `ext/audit.md` |
| EXT.AUDIT.BOUNDARY.001 | [Emit audit records at the mediation boundary](../ext/audit.md#emit-audit-records-at-the-mediation-boundary-extauditboundary001) | `ext/audit.md` |
| EXT.AUDIT.BOUNDARY.002 | [Restrict handler contribution to determined values](../ext/audit.md#restrict-handler-contribution-to-determined-values-extauditboundary002) | `ext/audit.md` |
| EXT.AUDIT.BOUNDARY.003 | [Exclude derived audit trails](../ext/audit.md#exclude-derived-audit-trails-extauditboundary003) | `ext/audit.md` |
| EXT.AUDIT.CLASSIFICATION.001 | [Exclude secrets and payment data](../ext/audit.md#exclude-secrets-and-payment-data-extauditclassification001) | `ext/audit.md` |
| EXT.AUDIT.CLASSIFICATION.002 | [Exclude personal data beyond actor identity](../ext/audit.md#exclude-personal-data-beyond-actor-identity-extauditclassification002) | `ext/audit.md` |
| EXT.AUDIT.CLASSIFICATION.003 | [Exclude state snapshots](../ext/audit.md#exclude-state-snapshots-extauditclassification003) | `ext/audit.md` |
| EXT.AUDIT.CONTEXT.001 | [Record the request origin](../ext/audit.md#record-the-request-origin-extauditcontext001) | `ext/audit.md` |
| EXT.AUDIT.CONTEXT.002 | [Record the operation trace identity](../ext/audit.md#record-the-operation-trace-identity-extauditcontext002) | `ext/audit.md` |
| EXT.AUDIT.CONVENTION.001 | [Keep audit infrastructure in one location](../ext/audit.md#keep-audit-infrastructure-in-one-location-extauditconvention001) | `ext/audit.md` |
| EXT.AUDIT.CONVENTION.002 | [Declare audit selection beside the Command](../ext/audit.md#declare-audit-selection-beside-the-command-extauditconvention002) | `ext/audit.md` |
| EXT.AUDIT.CONVENTION.003 | [Use a fixed category vocabulary](../ext/audit.md#use-a-fixed-category-vocabulary-extauditconvention003) | `ext/audit.md` |
| EXT.AUDIT.CONVENTION.004 | [Store the trail beside the business data](../ext/audit.md#store-the-trail-beside-the-business-data-extauditconvention004) | `ext/audit.md` |
| EXT.AUDIT.CONVENTION.005 | [Publish a copy to the security platform](../ext/audit.md#publish-a-copy-to-the-security-platform-extauditconvention005) | `ext/audit.md` |
| EXT.AUDIT.COVERAGE.001 | [Cover the required audit categories](../ext/audit.md#cover-the-required-audit-categories-extauditcoverage001) | `ext/audit.md` |
| EXT.AUDIT.COVERAGE.002 | [Exclude indiscriminate auditing](../ext/audit.md#exclude-indiscriminate-auditing-extauditcoverage002) | `ext/audit.md` |
| EXT.AUDIT.ENFORCEMENT.001 | [Reject an undeclared Command](../ext/audit.md#reject-an-undeclared-command-extauditenforcement001) | `ext/audit.md` |
| EXT.AUDIT.EXPORT.001 | [Record bulk export](../ext/audit.md#record-bulk-export-extauditexport001) | `ext/audit.md` |
| EXT.AUDIT.ISOLATION.001 | [Scope every record to its tenant](../ext/audit.md#scope-every-record-to-its-tenant-extauditisolation001) | `ext/audit.md` |
| EXT.AUDIT.PROTECTION.001 | [Enforce append-only through storage privilege](../ext/audit.md#enforce-append-only-through-storage-privilege-extauditprotection001) | `ext/audit.md` |
| EXT.AUDIT.PROTECTION.002 | [Provide tamper evidence](../ext/audit.md#provide-tamper-evidence-extauditprotection002) | `ext/audit.md` |
| EXT.AUDIT.PROTECTION.003 | [Verify the integrity chain on a schedule](../ext/audit.md#verify-the-integrity-chain-on-a-schedule-extauditprotection003) | `ext/audit.md` |
| EXT.AUDIT.PROTECTION.004 | [Add a correcting record](../ext/audit.md#add-a-correcting-record-extauditprotection004) | `ext/audit.md` |
| EXT.AUDIT.PURGE.001 | [Retain each category for its declared period](../ext/audit.md#retain-each-category-for-its-declared-period-extauditpurge001) | `ext/audit.md` |
| EXT.AUDIT.PURGE.002 | [Remove the identity mapping on erasure](../ext/audit.md#remove-the-identity-mapping-on-erasure-extauditpurge002) | `ext/audit.md` |
| EXT.AUDIT.READ.001 | [Record personal-data reads](../ext/audit.md#record-personal-data-reads-extauditread001) | `ext/audit.md` |
| EXT.AUDIT.RECORD.001 | [Record the required audit fields](../ext/audit.md#record-the-required-audit-fields-extauditrecord001) | `ext/audit.md` |
| EXT.AUDIT.RECORD.002 | [State the action as use-case identity](../ext/audit.md#state-the-action-as-use-case-identity-extauditrecord002) | `ext/audit.md` |
| EXT.AUDIT.RECORD.003 | [Record the failure code on an unsuccessful attempt](../ext/audit.md#record-the-failure-code-on-an-unsuccessful-attempt-extauditrecord003) | `ext/audit.md` |
| EXT.AUDIT.SCHEMA.001 | [Version the audit record shape](../ext/audit.md#version-the-audit-record-shape-extauditschema001) | `ext/audit.md` |
| EXT.AUDIT.STATUS.001 | [Record every attempt outcome](../ext/audit.md#record-every-attempt-outcome-extauditstatus001) | `ext/audit.md` |
| EXT.AUDIT.STATUS.002 | [Record refused authorization](../ext/audit.md#record-refused-authorization-extauditstatus002) | `ext/audit.md` |
| EXT.AUDIT.STATUS.003 | [Record failed audited attempts](../ext/audit.md#record-failed-audited-attempts-extauditstatus003) | `ext/audit.md` |
| EXT.AUTHJS.ADOPT.001 | [Keep Auth.js frontend-specific](../ext/authjs.md#keep-authjs-frontend-specific-extauthjsadopt001) | `ext/authjs.md` |
| EXT.AUTHJS.ADOPT.002 | [Keep WebApi provider-neutral](../ext/authjs.md#keep-webapi-provider-neutral-extauthjsadopt002) | `ext/authjs.md` |
| EXT.AUTHJS.API.001 | [Use a server API boundary](../ext/authjs.md#use-a-server-api-boundary-extauthjsapi001) | `ext/authjs.md` |
| EXT.AUTHJS.API.002 | [Keep browser token access absent](../ext/authjs.md#keep-browser-token-access-absent-extauthjsapi002) | `ext/authjs.md` |
| EXT.AUTHJS.AUTHZ.001 | [Keep frontend guards advisory](../ext/authjs.md#keep-frontend-guards-advisory-extauthjsauthz001) | `ext/authjs.md` |
| EXT.AUTHJS.AUTHZ.002 | [Authorize protected resources in WebApi](../ext/authjs.md#authorize-protected-resources-in-webapi-extauthjsauthz002) | `ext/authjs.md` |
| EXT.AUTHJS.CALLBACK.001 | [Validate provider callback values](../ext/authjs.md#validate-provider-callback-values-extauthjscallback001) | `ext/authjs.md` |
| EXT.AUTHJS.CALLBACK.002 | [Reject unsafe return targets](../ext/authjs.md#reject-unsafe-return-targets-extauthjscallback002) | `ext/authjs.md` |
| EXT.AUTHJS.CONVENTION.001 | [Keep Auth.js configuration server-owned](../ext/authjs.md#keep-authjs-configuration-server-owned-extauthjsconvention001) | `ext/authjs.md` |
| EXT.AUTHJS.CONVENTION.002 | [Keep provider claims nearby](../ext/authjs.md#keep-provider-claims-nearby-extauthjsconvention002) | `ext/authjs.md` |
| EXT.AUTHJS.CONVENTION.003 | [Expose a project-owned session view](../ext/authjs.md#expose-a-project-owned-session-view-extauthjsconvention003) | `ext/authjs.md` |
| EXT.AUTHJS.CONVENTION.004 | [Keep authentication handlers thin](../ext/authjs.md#keep-authentication-handlers-thin-extauthjsconvention004) | `ext/authjs.md` |
| EXT.AUTHJS.CSRF.001 | [Verify Auth.js authentication requests](../ext/authjs.md#verify-authjs-authentication-requests-extauthjscsrf001) | `ext/authjs.md` |
| EXT.AUTHJS.CSRF.002 | [Verify state-changing browser requests](../ext/authjs.md#verify-state-changing-browser-requests-extauthjscsrf002) | `ext/authjs.md` |
| EXT.AUTHJS.CSRF.003 | [Use POST for browser state changes](../ext/authjs.md#use-post-for-browser-state-changes-extauthjscsrf003) | `ext/authjs.md` |
| EXT.AUTHJS.FAILURE.001 | [Handle invalid sessions explicitly](../ext/authjs.md#handle-invalid-sessions-explicitly-extauthjsfailure001) | `ext/authjs.md` |
| EXT.AUTHJS.FAILURE.002 | [Separate authentication from authorization failure](../ext/authjs.md#separate-authentication-from-authorization-failure-extauthjsfailure002) | `ext/authjs.md` |
| EXT.AUTHJS.FAILURE.003 | [Avoid endless access retries](../ext/authjs.md#avoid-endless-access-retries-extauthjsfailure003) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.001 | [Protect session cookies](../ext/authjs.md#protect-session-cookies-extauthjssession001) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.002 | [Keep provider tokens server-side](../ext/authjs.md#keep-provider-tokens-server-side-extauthjssession002) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.003 | [Select a session strategy](../ext/authjs.md#select-a-session-strategy-extauthjssession003) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.004 | [Record session secret ownership](../ext/authjs.md#record-session-secret-ownership-extauthjssession004) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.005 | [Minimize session content](../ext/authjs.md#minimize-session-content-extauthjssession005) | `ext/authjs.md` |
| EXT.AUTHJS.SESSION.006 | [Separate sessions from API bearer tokens](../ext/authjs.md#separate-sessions-from-api-bearer-tokens-extauthjssession006) | `ext/authjs.md` |
| EXT.BDD.ADOPT.001 | [Select shared critical examples](../ext/bdd.md#select-shared-critical-examples-extbddadopt001) | `ext/bdd.md` |
| EXT.BDD.ADOPT.002 | [Avoid routine Gherkin duplication](../ext/bdd.md#avoid-routine-gherkin-duplication-extbddadopt002) | `ext/bdd.md` |
| EXT.BDD.BOUNDARY.001 | [Drive public behavior](../ext/bdd.md#drive-public-behavior-extbddboundary001) | `ext/bdd.md` |
| EXT.BDD.BOUNDARY.002 | [Assert observable outcomes](../ext/bdd.md#assert-observable-outcomes-extbddboundary002) | `ext/bdd.md` |
| EXT.BDD.BOUNDARY.003 | [Limit database assertions](../ext/bdd.md#limit-database-assertions-extbddboundary003) | `ext/bdd.md` |
| EXT.BDD.CONVENTION.001 | [Group feature files by module](../ext/bdd.md#group-feature-files-by-module-extbddconvention001) | `ext/bdd.md` |
| EXT.BDD.CONVENTION.002 | [Keep steps vocabulary-scoped](../ext/bdd.md#keep-steps-vocabulary-scoped-extbddconvention002) | `ext/bdd.md` |
| EXT.BDD.CONVENTION.003 | [Limit scenario context](../ext/bdd.md#limit-scenario-context-extbddconvention003) | `ext/bdd.md` |
| EXT.BDD.CONVENTION.004 | [Mark pull-request scenarios](../ext/bdd.md#mark-pull-request-scenarios-extbddconvention004) | `ext/bdd.md` |
| EXT.BDD.STATE.001 | [Own scenario data](../ext/bdd.md#own-scenario-data-extbddstate001) | `ext/bdd.md` |
| EXT.BDD.STATE.002 | [Isolate scenario execution](../ext/bdd.md#isolate-scenario-execution-extbddstate002) | `ext/bdd.md` |
| EXT.BDD.STEPS.001 | [Translate business phrases](../ext/bdd.md#translate-business-phrases-extbddsteps001) | `ext/bdd.md` |
| EXT.BDD.STEPS.002 | [Exclude production internals](../ext/bdd.md#exclude-production-internals-extbddsteps002) | `ext/bdd.md` |
| EXT.BDD.STEPS.003 | [Preserve scenario failures](../ext/bdd.md#preserve-scenario-failures-extbddsteps003) | `ext/bdd.md` |
| EXT.BDD.TRACE.001 | [Tag scenarios with acceptance criteria](../ext/bdd.md#tag-scenarios-with-acceptance-criteria-extbddtrace001) | `ext/bdd.md` |
| EXT.CACHE.ADOPT.001 | [Record measured cache need](../ext/cache.md#record-measured-cache-need-extcacheadopt001) | `ext/cache.md` |
| EXT.CACHE.ADOPT.002 | [Remove unjustified caches](../ext/cache.md#remove-unjustified-caches-extcacheadopt002) | `ext/cache.md` |
| EXT.CACHE.CONVENTION.001 | [Place cache access at an outer boundary](../ext/cache.md#place-cache-access-at-an-outer-boundary-extcacheconvention001) | `ext/cache.md` |
| EXT.CACHE.FAILURE.001 | [Keep source data authoritative](../ext/cache.md#keep-source-data-authoritative-extcachefailure001) | `ext/cache.md` |
| EXT.CACHE.FAILURE.002 | [Define cache outage behavior](../ext/cache.md#define-cache-outage-behavior-extcachefailure002) | `ext/cache.md` |
| EXT.CACHE.INVALIDATE.001 | [Define cache invalidation](../ext/cache.md#define-cache-invalidation-extcacheinvalidate001) | `ext/cache.md` |
| EXT.CACHE.INVALIDATE.002 | [Prefer bounded staleness](../ext/cache.md#prefer-bounded-staleness-extcacheinvalidate002) | `ext/cache.md` |
| EXT.CACHE.KEY.001 | [Compose cache keys from result inputs](../ext/cache.md#compose-cache-keys-from-result-inputs-extcachekey001) | `ext/cache.md` |
| EXT.CACHE.KEY.002 | [Exclude unsafe cache key material](../ext/cache.md#exclude-unsafe-cache-key-material-extcachekey002) | `ext/cache.md` |
| EXT.CACHE.REFRESH.001 | [Bound cache refresh work](../ext/cache.md#bound-cache-refresh-work-extcacherefresh001) | `ext/cache.md` |
| EXT.CACHE.REFRESH.002 | [Avoid unbounded key locks](../ext/cache.md#avoid-unbounded-key-locks-extcacherefresh002) | `ext/cache.md` |
| EXT.COMPAT.COMPATIBILITY.001 | [Classify independent-consumer changes](../ext/compat.md#classify-independent-consumer-changes-extcompatcompatibility001) | `ext/compat.md` |
| EXT.COMPAT.COMPATIBILITY.002 | [Classify breaking contract changes](../ext/compat.md#classify-breaking-contract-changes-extcompatcompatibility002) | `ext/compat.md` |
| EXT.COMPAT.COMPATIBILITY.003 | [Classify compatible additions](../ext/compat.md#classify-compatible-additions-extcompatcompatibility003) | `ext/compat.md` |
| EXT.COMPAT.COMPATIBILITY.004 | [Review exhaustive consumer changes](../ext/compat.md#review-exhaustive-consumer-changes-extcompatcompatibility004) | `ext/compat.md` |
| EXT.COMPAT.COMPATIBILITY.005 | [Preserve stable error codes](../ext/compat.md#preserve-stable-error-codes-extcompatcompatibility005) | `ext/compat.md` |
| EXT.COMPAT.COMPATIBILITY.006 | [Resolve uncertain classifications safely](../ext/compat.md#resolve-uncertain-classifications-safely-extcompatcompatibility006) | `ext/compat.md` |
| EXT.COMPAT.CONVENTION.001 | [Store current OpenAPI source](../ext/compat.md#store-current-openapi-source-extcompatconvention001) | `ext/compat.md` |
| EXT.COMPAT.CONVENTION.002 | [Keep baseline references immutable](../ext/compat.md#keep-baseline-references-immutable-extcompatconvention002) | `ext/compat.md` |
| EXT.COMPAT.CONVENTION.003 | [Use one diff tool](../ext/compat.md#use-one-diff-tool-extcompatconvention003) | `ext/compat.md` |
| EXT.COMPAT.CONVENTION.004 | [Keep Problem Details codes stable](../ext/compat.md#keep-problem-details-codes-stable-extcompatconvention004) | `ext/compat.md` |
| EXT.COMPAT.DEPRECATION.001 | [Signal planned public removal](../ext/compat.md#signal-planned-public-removal-extcompatdeprecation001) | `ext/compat.md` |
| EXT.COMPAT.DEPRECATION.002 | [Publish deprecation context](../ext/compat.md#publish-deprecation-context-extcompatdeprecation002) | `ext/compat.md` |
| EXT.COMPAT.DEPRECATION.003 | [Record deprecation conditions](../ext/compat.md#record-deprecation-conditions-extcompatdeprecation003) | `ext/compat.md` |
| EXT.COMPAT.DIFF.001 | [Retain release baselines](../ext/compat.md#retain-release-baselines-extcompatdiff001) | `ext/compat.md` |
| EXT.COMPAT.DIFF.002 | [Diff release contracts](../ext/compat.md#diff-release-contracts-extcompatdiff002) | `ext/compat.md` |
| EXT.COMPAT.DIFF.003 | [Reject unapproved breaking diffs](../ext/compat.md#reject-unapproved-breaking-diffs-extcompatdiff003) | `ext/compat.md` |
| EXT.COMPAT.ERROR.001 | [Treat errors as contracts](../ext/compat.md#treat-errors-as-contracts-extcompaterror001) | `ext/compat.md` |
| EXT.COMPAT.ERROR.002 | [Gate new error outcomes](../ext/compat.md#gate-new-error-outcomes-extcompaterror002) | `ext/compat.md` |
| EXT.COMPAT.ERROR.003 | [Exercise generated consumers](../ext/compat.md#exercise-generated-consumers-extcompaterror003) | `ext/compat.md` |
| EXT.COMPAT.OPERATION.001 | [Assign operation IDs](../ext/compat.md#assign-operation-ids-extcompatoperation001) | `ext/compat.md` |
| EXT.COMPAT.OPERATION.002 | [Retain compatible operation IDs](../ext/compat.md#retain-compatible-operation-ids-extcompatoperation002) | `ext/compat.md` |
| EXT.COMPAT.OPERATION.003 | [Assign versioned operation IDs](../ext/compat.md#assign-versioned-operation-ids-extcompatoperation003) | `ext/compat.md` |
| EXT.COMPAT.VERSION.001 | [Version breaking contracts](../ext/compat.md#version-breaking-contracts-extcompatversion001) | `ext/compat.md` |
| EXT.COMPAT.VERSION.002 | [Retain supported versions](../ext/compat.md#retain-supported-versions-extcompatversion002) | `ext/compat.md` |
| EXT.COMPAT.VERSION.003 | [Record version retirement](../ext/compat.md#record-version-retirement-extcompatversion003) | `ext/compat.md` |
| EXT.CONCURRENCY.ADOPT.001 | [Document write conflict behavior](../ext/concurrency.md#document-write-conflict-behavior-extconcurrencyadopt001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.ADOPT.002 | [Limit version checks](../ext/concurrency.md#limit-version-checks-extconcurrencyadopt002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.CONVENTION.001 | [Use the standard idempotency header](../ext/concurrency.md#use-the-standard-idempotency-header-extconcurrencyconvention001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.CONVENTION.002 | [Keep idempotency persistence in Infrastructure](../ext/concurrency.md#keep-idempotency-persistence-in-infrastructure-extconcurrencyconvention002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.CONVENTION.003 | [Map replay responses at the API boundary](../ext/concurrency.md#map-replay-responses-at-the-api-boundary-extconcurrencyconvention003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.CONVENTION.004 | [Declare applicable headers](../ext/concurrency.md#declare-applicable-headers-extconcurrencyconvention004) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.001 | [Scope client keys](../ext/concurrency.md#scope-client-keys-extconcurrencyidempotentkey001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.002 | [Store idempotency state atomically](../ext/concurrency.md#store-idempotency-state-atomically-extconcurrencyidempotentkey002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.003 | [Reject conflicting key reuse](../ext/concurrency.md#reject-conflicting-key-reuse-extconcurrencyidempotentkey003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.004 | [Enforce key uniqueness](../ext/concurrency.md#enforce-key-uniqueness-extconcurrencyidempotentkey004) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.005 | [Canonicalize request fingerprints](../ext/concurrency.md#canonicalize-request-fingerprints-extconcurrencyidempotentkey005) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTKEY.006 | [Protect fingerprint source data](../ext/concurrency.md#protect-fingerprint-source-data-extconcurrencyidempotentkey006) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.001 | [Declare replayed transport outcomes](../ext/concurrency.md#declare-replayed-transport-outcomes-extconcurrencyidempotentout001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.002 | [Restrict replay data](../ext/concurrency.md#restrict-replay-data-extconcurrencyidempotentout002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTOUT.003 | [Exclude unsafe replay outcomes](../ext/concurrency.md#exclude-unsafe-replay-outcomes-extconcurrencyidempotentout003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.001 | [Replay completed results](../ext/concurrency.md#replay-completed-results-extconcurrencyidempotentrep001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.002 | [Define concurrent retry behavior](../ext/concurrency.md#define-concurrent-retry-behavior-extconcurrencyidempotentrep002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.003 | [Commit replay records with changes](../ext/concurrency.md#commit-replay-records-with-changes-extconcurrencyidempotentrep003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.004 | [Reload concurrent winners](../ext/concurrency.md#reload-concurrent-winners-extconcurrencyidempotentrep004) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.005 | [Discard failed replay state](../ext/concurrency.md#discard-failed-replay-state-extconcurrencyidempotentrep005) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.006 | [Delay irreversible provider calls](../ext/concurrency.md#delay-irreversible-provider-calls-extconcurrencyidempotentrep006) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTREP.007 | [Route required external effects durably](../ext/concurrency.md#route-required-external-effects-durably-extconcurrencyidempotentrep007) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.001 | [Set key retention](../ext/concurrency.md#set-key-retention-extconcurrencyidempotentret001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.002 | [Bound expired-record cleanup](../ext/concurrency.md#bound-expired-record-cleanup-extconcurrencyidempotentret002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.IDEMPOTENTRET.003 | [Retain safe retry keys](../ext/concurrency.md#retain-safe-retry-keys-extconcurrencyidempotentret003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.001 | [Compare expected aggregate versions](../ext/concurrency.md#compare-expected-aggregate-versions-extconcurrencyversion001) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.002 | [Map failed expected versions](../ext/concurrency.md#map-failed-expected-versions-extconcurrencyversion002) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.003 | [Reject silent overwrites](../ext/concurrency.md#reject-silent-overwrites-extconcurrencyversion003) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.004 | [Apply HTTP version preconditions](../ext/concurrency.md#apply-http-version-preconditions-extconcurrencyversion004) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.005 | [Return precondition outcomes](../ext/concurrency.md#return-precondition-outcomes-extconcurrencyversion005) | `ext/concurrency.md` |
| EXT.CONCURRENCY.VERSION.006 | [Hide provider version values](../ext/concurrency.md#hide-provider-version-values-extconcurrencyversion006) | `ext/concurrency.md` |
| EXT.CONTAINERS.CONFIG.001 | [Supply runtime configuration externally](../ext/containers.md#supply-runtime-configuration-externally-extcontainersconfig001) | `ext/containers.md` |
| EXT.CONTAINERS.CONFIG.002 | [Exclude environment configuration from images](../ext/containers.md#exclude-environment-configuration-from-images-extcontainersconfig002) | `ext/containers.md` |
| EXT.CONTAINERS.CONVENTION.001 | [Place Dockerfiles beside deployables](../ext/containers.md#place-dockerfiles-beside-deployables-extcontainersconvention001) | `ext/containers.md` |
| EXT.CONTAINERS.CONVENTION.002 | [Build from the workspace root](../ext/containers.md#build-from-the-workspace-root-extcontainersconvention002) | `ext/containers.md` |
| EXT.CONTAINERS.IMAGE.001 | [Build release images in stages](../ext/containers.md#build-release-images-in-stages-extcontainersimage001) | `ext/containers.md` |
| EXT.CONTAINERS.IMAGE.002 | [Run images as non-root](../ext/containers.md#run-images-as-non-root-extcontainersimage002) | `ext/containers.md` |
| EXT.CONTAINERS.IMAGE.003 | [Copy only runtime files](../ext/containers.md#copy-only-runtime-files-extcontainersimage003) | `ext/containers.md` |
| EXT.CONTAINERS.IMAGE.004 | [Exclude build and secret material](../ext/containers.md#exclude-build-and-secret-material-extcontainersimage004) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.001 | [Apply OCI release labels](../ext/containers.md#apply-oci-release-labels-extcontainersmetadata001) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.002 | [Record image digests](../ext/containers.md#record-image-digests-extcontainersmetadata002) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.003 | [Exclude build timestamps from contracts](../ext/containers.md#exclude-build-timestamps-from-contracts-extcontainersmetadata003) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.004 | [Separate frontend configuration classes](../ext/containers.md#separate-frontend-configuration-classes-extcontainersmetadata004) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.005 | [Use protected frontend secret delivery](../ext/containers.md#use-protected-frontend-secret-delivery-extcontainersmetadata005) | `ext/containers.md` |
| EXT.CONTAINERS.METADATA.006 | [Exclude insecure frontend secret carriers](../ext/containers.md#exclude-insecure-frontend-secret-carriers-extcontainersmetadata006) | `ext/containers.md` |
| EXT.CONTAINERS.PROCESS.001 | [Run the application as PID 1](../ext/containers.md#run-the-application-as-pid-1-extcontainersprocess001) | `ext/containers.md` |
| EXT.CONTAINERS.PROCESS.002 | [Set sufficient shutdown time](../ext/containers.md#set-sufficient-shutdown-time-extcontainersprocess002) | `ext/containers.md` |
| EXT.CONTAINERS.PROCESS.003 | [Write runtime logs to streams](../ext/containers.md#write-runtime-logs-to-streams-extcontainersprocess003) | `ext/containers.md` |
| EXT.CONTAINERS.PROCESS.004 | [Keep mutable data external](../ext/containers.md#keep-mutable-data-external-extcontainersprocess004) | `ext/containers.md` |
| EXT.CONTAINERS.ROLLBACK.001 | [Retain rollback material](../ext/containers.md#retain-rollback-material-extcontainersrollback001) | `ext/containers.md` |
| EXT.CONTAINERS.ROLLBACK.002 | [Check rollback compatibility](../ext/containers.md#check-rollback-compatibility-extcontainersrollback002) | `ext/containers.md` |
| EXT.CONTAINERS.SCHEMA.001 | [Apply schema work before traffic](../ext/containers.md#apply-schema-work-before-traffic-extcontainersschema001) | `ext/containers.md` |
| EXT.CONTAINERS.SCHEMA.002 | [Keep schema work out of startup](../ext/containers.md#keep-schema-work-out-of-startup-extcontainersschema002) | `ext/containers.md` |
| EXT.CONTAINERS.SECURITY.001 | [Limit container privileges](../ext/containers.md#limit-container-privileges-extcontainerssecurity001) | `ext/containers.md` |
| EXT.CONTAINERS.SECURITY.002 | [Declare writable paths and limits](../ext/containers.md#declare-writable-paths-and-limits-extcontainerssecurity002) | `ext/containers.md` |
| EXT.CONTAINERS.TRAFFIC.001 | [Wait for replica readiness](../ext/containers.md#wait-for-replica-readiness-extcontainerstraffic001) | `ext/containers.md` |
| EXT.CONTAINERS.TRAFFIC.003 | [Test released traffic](../ext/containers.md#test-released-traffic-extcontainerstraffic003) | `ext/containers.md` |
| EXT.EFCORE.ADOPT.001 | [Record EF Core replacement scope](../ext/efcore.md#record-ef-core-replacement-scope-extefcoreadopt001) | `ext/efcore.md` |
| EXT.EFCORE.ADOPT.002 | [Retain unaffected baseline persistence](../ext/efcore.md#retain-unaffected-baseline-persistence-extefcoreadopt002) | `ext/efcore.md` |
| EXT.EFCORE.COMMIT.001 | [Commit EF Core Command work once](../ext/efcore.md#commit-ef-core-command-work-once-extefcorecommit001) | `ext/efcore.md` |
| EXT.EFCORE.COMMIT.002 | [Process changed aggregate events](../ext/efcore.md#process-changed-aggregate-events-extefcorecommit002) | `ext/efcore.md` |
| EXT.EFCORE.COMMIT.003 | [Use durable outbox delivery](../ext/efcore.md#use-durable-outbox-delivery-extefcorecommit003) | `ext/efcore.md` |
| EXT.EFCORE.CONCURRENCY.001 | [Configure optimistic tokens](../ext/efcore.md#configure-optimistic-tokens-extefcoreconcurrency001) | `ext/efcore.md` |
| EXT.EFCORE.CONCURRENCY.002 | [Map EF Core concurrency conflict](../ext/efcore.md#map-ef-core-concurrency-conflict-extefcoreconcurrency002) | `ext/efcore.md` |
| EXT.EFCORE.CONCURRENCY.003 | [Reject automatic command retry](../ext/efcore.md#reject-automatic-command-retry-extefcoreconcurrency003) | `ext/efcore.md` |
| EXT.EFCORE.CONVENTION.001 | [Use the EF Core Infrastructure layout](../ext/efcore.md#use-the-ef-core-infrastructure-layout-extefcoreconvention001) | `ext/efcore.md` |
| EXT.EFCORE.CONVENTION.002 | [Use snake-case relational names](../ext/efcore.md#use-snake-case-relational-names-extefcoreconvention002) | `ext/efcore.md` |
| EXT.EFCORE.MAPPING.001 | [Configure EF Core mappings in Infrastructure](../ext/efcore.md#configure-ef-core-mappings-in-infrastructure-extefcoremapping001) | `ext/efcore.md` |
| EXT.EFCORE.MAPPING.002 | [Configure relational details explicitly](../ext/efcore.md#configure-relational-details-explicitly-extefcoremapping002) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.001 | [Generate migrations for schema changes](../ext/efcore.md#generate-migrations-for-schema-changes-extefcoremigration001) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.002 | [Review migration effects](../ext/efcore.md#review-migration-effects-extefcoremigration002) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.003 | [Apply migrations as release work](../ext/efcore.md#apply-migrations-as-release-work-extefcoremigration003) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.004 | [Keep migration files together](../ext/efcore.md#keep-migration-files-together-extefcoremigration004) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.005 | [Test migration starting states](../ext/efcore.md#test-migration-starting-states-extefcoremigration005) | `ext/efcore.md` |
| EXT.EFCORE.MIGRATION.006 | [Reject startup schema mutation](../ext/efcore.md#reject-startup-schema-mutation-extefcoremigration006) | `ext/efcore.md` |
| EXT.EFCORE.OUTBOX.001 | [Stage EF Core outbox records together](../ext/efcore.md#stage-ef-core-outbox-records-together-extefcoreoutbox001) | `ext/efcore.md` |
| EXT.EFCORE.OUTBOX.002 | [Commit EF Core outbox records once](../ext/efcore.md#commit-ef-core-outbox-records-once-extefcoreoutbox002) | `ext/efcore.md` |
| EXT.EFCORE.OUTBOX.003 | [Reject cross-provider outbox storage](../ext/efcore.md#reject-cross-provider-outbox-storage-extefcoreoutbox003) | `ext/efcore.md` |
| EXT.EFCORE.READ.001 | [Define EF Core query roots](../ext/efcore.md#define-ef-core-query-roots-extefcoreread001) | `ext/efcore.md` |
| EXT.EFCORE.READ.002 | [Implement query roots in Infrastructure](../ext/efcore.md#implement-query-roots-in-infrastructure-extefcoreread002) | `ext/efcore.md` |
| EXT.EFCORE.READ.003 | [Retain Marten query boundary](../ext/efcore.md#retain-marten-query-boundary-extefcoreread003) | `ext/efcore.md` |
| EXT.EFCORE.READ.004 | [Project EF Core queries directly](../ext/efcore.md#project-ef-core-queries-directly-extefcoreread004) | `ext/efcore.md` |
| EXT.EFCORE.READ.005 | [Avoid per-aggregate read stores](../ext/efcore.md#avoid-per-aggregate-read-stores-extefcoreread005) | `ext/efcore.md` |
| EXT.EFCORE.STATE.001 | [Retain Domain state values](../ext/efcore.md#retain-domain-state-values-extefcorestate001) | `ext/efcore.md` |
| EXT.EFCORE.STATE.002 | [Map stable relational state shape](../ext/efcore.md#map-stable-relational-state-shape-extefcorestate002) | `ext/efcore.md` |
| EXT.EFCORE.STATE.003 | [Use direct state mapping only when supported](../ext/efcore.md#use-direct-state-mapping-only-when-supported-extefcorestate003) | `ext/efcore.md` |
| EXT.EFCORE.STATE.004 | [Map unsupported state shapes in Infrastructure](../ext/efcore.md#map-unsupported-state-shapes-in-infrastructure-extefcorestate004) | `ext/efcore.md` |
| EXT.EFCORE.STATE.005 | [Review new persisted states](../ext/efcore.md#review-new-persisted-states-extefcorestate005) | `ext/efcore.md` |
| EXT.EFCORE.TRANSACTION.001 | [Use one write provider](../ext/efcore.md#use-one-write-provider-extefcoretransaction001) | `ext/efcore.md` |
| EXT.EFCORE.TRANSACTION.002 | [Reject mixed provider writes](../ext/efcore.md#reject-mixed-provider-writes-extefcoretransaction002) | `ext/efcore.md` |
| EXT.EFCORE.TRANSACTION.003 | [Record provider selection](../ext/efcore.md#record-provider-selection-extefcoretransaction003) | `ext/efcore.md` |
| EXT.EFCORE.TRANSACTION.004 | [Register one Command post-handler](../ext/efcore.md#register-one-command-post-handler-extefcoretransaction004) | `ext/efcore.md` |
| EXT.EFCORE.TRANSACTION.005 | [Resolve cross-provider invariants](../ext/efcore.md#resolve-cross-provider-invariants-extefcoretransaction005) | `ext/efcore.md` |
| EXT.EFCORE.WRITE.001 | [Stage aggregate writes in repositories](../ext/efcore.md#stage-aggregate-writes-in-repositories-extefcorewrite001) | `ext/efcore.md` |
| EXT.EFCORE.WRITE.002 | [Exclude direct handler commits](../ext/efcore.md#exclude-direct-handler-commits-extefcorewrite002) | `ext/efcore.md` |
| EXT.INTEGRATIONS.CLIENT.001 | [Bind client configuration](../ext/integrations.md#bind-client-configuration-extintegrationsclient001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.CLIENT.002 | [Use managed HTTP clients](../ext/integrations.md#use-managed-http-clients-extintegrationsclient002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.CLIENT.003 | [Reject per-request HTTP clients](../ext/integrations.md#reject-per-request-http-clients-extintegrationsclient003) | `ext/integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.001 | [Group provider code](../ext/integrations.md#group-provider-code-extintegrationsconvention001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.002 | [Keep provider components together](../ext/integrations.md#keep-provider-components-together-extintegrationsconvention002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.CONVENTION.003 | [Keep ports near use cases](../ext/integrations.md#keep-ports-near-use-cases-extintegrationsconvention003) | `ext/integrations.md` |
| EXT.INTEGRATIONS.FAILURE.001 | [Translate provider failure outcomes](../ext/integrations.md#translate-provider-failure-outcomes-extintegrationsfailure001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.FAILURE.002 | [Exclude provider internals](../ext/integrations.md#exclude-provider-internals-extintegrationsfailure002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.INBOUND.001 | [Verify inbound provider messages](../ext/integrations.md#verify-inbound-provider-messages-extintegrationsinbound001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.INBOUND.002 | [Process duplicate messages safely](../ext/integrations.md#process-duplicate-messages-safely-extintegrationsinbound002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.PORT.001 | [Define business-action ports](../ext/integrations.md#define-business-action-ports-extintegrationsport001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.PORT.002 | [Isolate provider implementations](../ext/integrations.md#isolate-provider-implementations-extintegrationsport002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.RETRY.001 | [Bound transient retries](../ext/integrations.md#bound-transient-retries-extintegrationsretry001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.RETRY.002 | [Protect non-idempotent calls](../ext/integrations.md#protect-non-idempotent-calls-extintegrationsretry002) | `ext/integrations.md` |
| EXT.INTEGRATIONS.TEST.001 | [Simulate integration boundaries](../ext/integrations.md#simulate-integration-boundaries-extintegrationstest001) | `ext/integrations.md` |
| EXT.INTEGRATIONS.TEST.002 | [Cover provider failure modes](../ext/integrations.md#cover-provider-failure-modes-extintegrationstest002) | `ext/integrations.md` |
| EXT.JOBS.ADOPT.001 | [Record schedule behavior](../ext/jobs.md#record-schedule-behavior-extjobsadopt001) | `ext/jobs.md` |
| EXT.JOBS.COMMAND.001 | [Dispatch Application behavior](../ext/jobs.md#dispatch-application-behavior-extjobscommand001) | `ext/jobs.md` |
| EXT.JOBS.COMMAND.002 | [Exclude direct storage and HTTP execution](../ext/jobs.md#exclude-direct-storage-and-http-execution-extjobscommand002) | `ext/jobs.md` |
| EXT.JOBS.CONVENTION.001 | [Place handlers with owned behavior](../ext/jobs.md#place-handlers-with-owned-behavior-extjobsconvention001) | `ext/jobs.md` |
| EXT.JOBS.CONVENTION.002 | [Use execution scopes](../ext/jobs.md#use-execution-scopes-extjobsconvention002) | `ext/jobs.md` |
| EXT.JOBS.CONVENTION.003 | [Separate schedule definitions](../ext/jobs.md#separate-schedule-definitions-extjobsconvention003) | `ext/jobs.md` |
| EXT.JOBS.LEASE.001 | [Store execution leases](../ext/jobs.md#store-execution-leases-extjobslease001) | `ext/jobs.md` |
| EXT.JOBS.LEASE.002 | [Renew only owned leases](../ext/jobs.md#renew-only-owned-leases-extjobslease002) | `ext/jobs.md` |
| EXT.JOBS.LEASE.003 | [Prevent duplicate completion](../ext/jobs.md#prevent-duplicate-completion-extjobslease003) | `ext/jobs.md` |
| EXT.JOBS.OCCURRENCE.001 | [Derive stable occurrence identity](../ext/jobs.md#derive-stable-occurrence-identity-extjobsoccurrence001) | `ext/jobs.md` |
| EXT.JOBS.OCCURRENCE.002 | [Persist occurrence state](../ext/jobs.md#persist-occurrence-state-extjobsoccurrence002) | `ext/jobs.md` |
| EXT.JOBS.OCCURRENCE.003 | [Scope command idempotency by occurrence](../ext/jobs.md#scope-command-idempotency-by-occurrence-extjobsoccurrence003) | `ext/jobs.md` |
| EXT.JOBS.OCCURRENCE.004 | [Restrict completion by fencing value](../ext/jobs.md#restrict-completion-by-fencing-value-extjobsoccurrence004) | `ext/jobs.md` |
| EXT.JOBS.OCCURRENCE.005 | [Audit manual replay](../ext/jobs.md#audit-manual-replay-extjobsoccurrence005) | `ext/jobs.md` |
| EXT.JOBS.RECOVERY.001 | [Persist occurrence recovery points](../ext/jobs.md#persist-occurrence-recovery-points-extjobsrecovery001) | `ext/jobs.md` |
| EXT.JOBS.RECOVERY.002 | [Define misfire recovery](../ext/jobs.md#define-misfire-recovery-extjobsrecovery002) | `ext/jobs.md` |
| EXT.JOBS.RECOVERY.003 | [Provide operational recovery procedures](../ext/jobs.md#provide-operational-recovery-procedures-extjobsrecovery003) | `ext/jobs.md` |
| EXT.JOBS.RETRY.001 | [Bound job retries](../ext/jobs.md#bound-job-retries-extjobsretry001) | `ext/jobs.md` |
| EXT.JOBS.RETRY.002 | [Tolerate duplicate execution](../ext/jobs.md#tolerate-duplicate-execution-extjobsretry002) | `ext/jobs.md` |
| EXT.JOBS.RETRY.003 | [Treat unavailable schedule stores as outages](../ext/jobs.md#treat-unavailable-schedule-stores-as-outages-extjobsretry003) | `ext/jobs.md` |
| EXT.JOBS.TIME.001 | [Prefer UTC schedules](../ext/jobs.md#prefer-utc-schedules-extjobstime001) | `ext/jobs.md` |
| EXT.JOBS.TIME.002 | [Define business-local clock behavior](../ext/jobs.md#define-business-local-clock-behavior-extjobstime002) | `ext/jobs.md` |
| EXT.JOBS.TIME.003 | [Test time transitions](../ext/jobs.md#test-time-transitions-extjobstime003) | `ext/jobs.md` |
| EXT.JOBS.TIME.004 | [Exclude machine-local time](../ext/jobs.md#exclude-machine-local-time-extjobstime004) | `ext/jobs.md` |
| EXT.JOBS.WORKER.001 | [Run jobs in Worker](../ext/jobs.md#run-jobs-in-worker-extjobsworker001) | `ext/jobs.md` |
| EXT.JOBS.WORKER.002 | [Bound job execution](../ext/jobs.md#bound-job-execution-extjobsworker002) | `ext/jobs.md` |
| EXT.LIFECYCLE.ADOPT.001 | [Record lifecycle scope](../ext/lifecycle.md#record-lifecycle-scope-extlifecycleadopt001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.001 | [Model lifecycle operations in Domain](../ext/lifecycle.md#model-lifecycle-operations-in-domain-extlifecyclebehavior001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.002 | [Authorize and audit lifecycle changes](../ext/lifecycle.md#authorize-and-audit-lifecycle-changes-extlifecyclebehavior002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.BEHAVIOR.003 | [Exclude persistence-only lifecycle behavior](../ext/lifecycle.md#exclude-persistence-only-lifecycle-behavior-extlifecyclebehavior003) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.001 | [Name soft-delete timestamps](../ext/lifecycle.md#name-soft-delete-timestamps-extlifecycleconvention001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.002 | [Keep archive records module-owned](../ext/lifecycle.md#keep-archive-records-module-owned-extlifecycleconvention002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.CONVENTION.003 | [Separate query-shaped history](../ext/lifecycle.md#separate-query-shaped-history-extlifecycleconvention003) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.DELETE.001 | [Default to hard delete](../ext/lifecycle.md#default-to-hard-delete-extlifecycledelete001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.DELETE.002 | [Model retained lifecycle states](../ext/lifecycle.md#model-retained-lifecycle-states-extlifecycledelete002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.DELETE.003 | [Reject hidden lifecycle flags](../ext/lifecycle.md#reject-hidden-lifecycle-flags-extlifecycledelete003) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.PURGE.001 | [Bound purge and archive work](../ext/lifecycle.md#bound-purge-and-archive-work-extlifecyclepurge001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.PURGE.002 | [Preserve legal-hold data](../ext/lifecycle.md#preserve-legal-hold-data-extlifecyclepurge002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.PURGE.003 | [Align backup deletion behavior](../ext/lifecycle.md#align-backup-deletion-behavior-extlifecyclepurge003) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.READ.001 | [Exclude inactive records from normal reads](../ext/lifecycle.md#exclude-inactive-records-from-normal-reads-extlifecycleread001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.READ.002 | [Authorize lifecycle access paths](../ext/lifecycle.md#authorize-lifecycle-access-paths-extlifecycleread002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.READ.003 | [Define post-deletion references](../ext/lifecycle.md#define-post-deletion-references-extlifecycleread003) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.001 | [Define storage lifecycle behavior](../ext/lifecycle.md#define-storage-lifecycle-behavior-extlifecyclestorage001) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.002 | [Define relational lifecycle behavior](../ext/lifecycle.md#define-relational-lifecycle-behavior-extlifecyclestorage002) | `ext/lifecycle.md` |
| EXT.LIFECYCLE.STORAGE.003 | [Test provider lifecycle paths](../ext/lifecycle.md#test-provider-lifecycle-paths-extlifecyclestorage003) | `ext/lifecycle.md` |
| EXT.LOCALE.ADOPT.001 | [Record supported locale behavior](../ext/locale.md#record-supported-locale-behavior-extlocaleadopt001) | `ext/locale.md` |
| EXT.LOCALE.ADOPT.002 | [Avoid catalog-only locale claims](../ext/locale.md#avoid-catalog-only-locale-claims-extlocaleadopt002) | `ext/locale.md` |
| EXT.LOCALE.CONTENT.001 | [Localize public presentation content](../ext/locale.md#localize-public-presentation-content-extlocalecontent001) | `ext/locale.md` |
| EXT.LOCALE.CONTENT.002 | [Keep stable error codes locale-neutral](../ext/locale.md#keep-stable-error-codes-locale-neutral-extlocalecontent002) | `ext/locale.md` |
| EXT.LOCALE.CONVENTION.001 | [Use one catalog root](../ext/locale.md#use-one-catalog-root-extlocaleconvention001) | `ext/locale.md` |
| EXT.LOCALE.CONVENTION.002 | [Split catalogs by module when needed](../ext/locale.md#split-catalogs-by-module-when-needed-extlocaleconvention002) | `ext/locale.md` |
| EXT.LOCALE.CONVENTION.003 | [Use BCP 47 identifiers](../ext/locale.md#use-bcp-47-identifiers-extlocaleconvention003) | `ext/locale.md` |
| EXT.LOCALE.CONVENTION.004 | [Keep locale selection explicit](../ext/locale.md#keep-locale-selection-explicit-extlocaleconvention004) | `ext/locale.md` |
| EXT.LOCALE.FORMAT.001 | [Format values with active locale](../ext/locale.md#format-values-with-active-locale-extlocaleformat001) | `ext/locale.md` |
| EXT.LOCALE.FORMAT.002 | [Preserve locale-neutral business data](../ext/locale.md#preserve-locale-neutral-business-data-extlocaleformat002) | `ext/locale.md` |
| EXT.LOCALE.MESSAGES.001 | [Store user-facing copy in catalogs](../ext/locale.md#store-user-facing-copy-in-catalogs-extlocalemessages001) | `ext/locale.md` |
| EXT.LOCALE.MESSAGES.002 | [Name messages by meaning](../ext/locale.md#name-messages-by-meaning-extlocalemessages002) | `ext/locale.md` |
| EXT.LOCALE.MESSAGES.003 | [Complete or fall back catalog values](../ext/locale.md#complete-or-fall-back-catalog-values-extlocalemessages003) | `ext/locale.md` |
| EXT.LOCALE.ROUTES.001 | [Define one locale route shape](../ext/locale.md#define-one-locale-route-shape-extlocaleroutes001) | `ext/locale.md` |
| EXT.LOCALE.ROUTES.002 | [Handle unavailable locale segments](../ext/locale.md#handle-unavailable-locale-segments-extlocaleroutes002) | `ext/locale.md` |
| EXT.LOCALE.ROUTES.003 | [Avoid duplicate localized URLs](../ext/locale.md#avoid-duplicate-localized-urls-extlocaleroutes003) | `ext/locale.md` |
| EXT.OUTBOX.ADOPT.001 | [Record durable delivery behavior](../ext/outbox.md#record-durable-delivery-behavior-extoutboxadopt001) | `ext/outbox.md` |
| EXT.OUTBOX.ADOPT.002 | [Exclude manually repeatable reactions](../ext/outbox.md#exclude-manually-repeatable-reactions-extoutboxadopt002) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.001 | [Stage messages with business work](../ext/outbox.md#stage-messages-with-business-work-extoutboxatomic001) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.002 | [Serialize durable messages](../ext/outbox.md#serialize-durable-messages-extoutboxatomic002) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.003 | [Commit staged work once](../ext/outbox.md#commit-staged-work-once-extoutboxatomic003) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.004 | [Store required message fields](../ext/outbox.md#store-required-message-fields-extoutboxatomic004) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.005 | [Store failure and completion evidence](../ext/outbox.md#store-failure-and-completion-evidence-extoutboxatomic005) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.006 | [Classify message kinds](../ext/outbox.md#classify-message-kinds-extoutboxatomic006) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.007 | [Use the scoped business session](../ext/outbox.md#use-the-scoped-business-session-extoutboxatomic007) | `ext/outbox.md` |
| EXT.OUTBOX.ATOMIC.008 | [Reject independent outbox commits](../ext/outbox.md#reject-independent-outbox-commits-extoutboxatomic008) | `ext/outbox.md` |
| EXT.OUTBOX.CONVENTION.001 | [Group outbox infrastructure](../ext/outbox.md#group-outbox-infrastructure-extoutboxconvention001) | `ext/outbox.md` |
| EXT.OUTBOX.CONVENTION.002 | [Isolate the Worker host](../ext/outbox.md#isolate-the-worker-host-extoutboxconvention002) | `ext/outbox.md` |
| EXT.OUTBOX.CONVENTION.003 | [Keep provider mapping with integration](../ext/outbox.md#keep-provider-mapping-with-integration-extoutboxconvention003) | `ext/outbox.md` |
| EXT.OUTBOX.CONVENTION.004 | [Dispatch Workflow Commands in a new scope](../ext/outbox.md#dispatch-workflow-commands-in-a-new-scope-extoutboxconvention004) | `ext/outbox.md` |
| EXT.OUTBOX.CONVENTION.005 | [Avoid automatic durable-bus adoption](../ext/outbox.md#avoid-automatic-durable-bus-adoption-extoutboxconvention005) | `ext/outbox.md` |
| EXT.OUTBOX.IDEMPOTENCY.001 | [Accept repeated delivery](../ext/outbox.md#accept-repeated-delivery-extoutboxidempotency001) | `ext/outbox.md` |
| EXT.OUTBOX.IDEMPOTENCY.002 | [Identify repeated delivery](../ext/outbox.md#identify-repeated-delivery-extoutboxidempotency002) | `ext/outbox.md` |
| EXT.OUTBOX.IDEMPOTENCY.003 | [Await target acceptance](../ext/outbox.md#await-target-acceptance-extoutboxidempotency003) | `ext/outbox.md` |
| EXT.OUTBOX.OBSERVABILITY.001 | [Publish backlog indicators](../ext/outbox.md#publish-backlog-indicators-extoutboxobservability001) | `ext/outbox.md` |
| EXT.OUTBOX.OBSERVABILITY.002 | [Set delivery alerts](../ext/outbox.md#set-delivery-alerts-extoutboxobservability002) | `ext/outbox.md` |
| EXT.OUTBOX.READINESS.001 | [Distinguish dependency outage](../ext/outbox.md#distinguish-dependency-outage-extoutboxreadiness001) | `ext/outbox.md` |
| EXT.OUTBOX.READINESS.002 | [Back off unavailable-store polling](../ext/outbox.md#back-off-unavailable-store-polling-extoutboxreadiness002) | `ext/outbox.md` |
| EXT.OUTBOX.READINESS.003 | [Restrict message retry to claimed records](../ext/outbox.md#restrict-message-retry-to-claimed-records-extoutboxreadiness003) | `ext/outbox.md` |
| EXT.OUTBOX.READINESS.004 | [Gate dispatch on readiness](../ext/outbox.md#gate-dispatch-on-readiness-extoutboxreadiness004) | `ext/outbox.md` |
| EXT.OUTBOX.RETRY.001 | [Bound delivery retries](../ext/outbox.md#bound-delivery-retries-extoutboxretry001) | `ext/outbox.md` |
| EXT.OUTBOX.RETRY.002 | [Classify permanent delivery failure](../ext/outbox.md#classify-permanent-delivery-failure-extoutboxretry002) | `ext/outbox.md` |
| EXT.OUTBOX.ROLLOUT.001 | [Protect active Worker compatibility](../ext/outbox.md#protect-active-worker-compatibility-extoutboxrollout001) | `ext/outbox.md` |
| EXT.OUTBOX.ROLLOUT.002 | [Deploy readers before writers](../ext/outbox.md#deploy-readers-before-writers-extoutboxrollout002) | `ext/outbox.md` |
| EXT.OUTBOX.ROLLOUT.003 | [Plan undispatched rollback records](../ext/outbox.md#plan-undispatched-rollback-records-extoutboxrollout003) | `ext/outbox.md` |
| EXT.OUTBOX.SCHEMA.001 | [Version message types](../ext/outbox.md#version-message-types-extoutboxschema001) | `ext/outbox.md` |
| EXT.OUTBOX.SCHEMA.002 | [Support coexisting message producers](../ext/outbox.md#support-coexisting-message-producers-extoutboxschema002) | `ext/outbox.md` |
| EXT.OUTBOX.STATE.001 | [Model outbox lifecycle states](../ext/outbox.md#model-outbox-lifecycle-states-extoutboxstate001) | `ext/outbox.md` |
| EXT.OUTBOX.STATE.002 | [Preserve message identity during retry](../ext/outbox.md#preserve-message-identity-during-retry-extoutboxstate002) | `ext/outbox.md` |
| EXT.OUTBOX.STATE.003 | [Audit outbox replay](../ext/outbox.md#audit-outbox-replay-extoutboxstate003) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.001 | [Dispatch claimed records in Worker](../ext/outbox.md#dispatch-claimed-records-in-worker-extoutboxworker001) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.002 | [Exclude request-transaction dispatch](../ext/outbox.md#exclude-request-transaction-dispatch-extoutboxworker002) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.003 | [Define claim ownership](../ext/outbox.md#define-claim-ownership-extoutboxworker003) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.004 | [Release claim transactions before calls](../ext/outbox.md#release-claim-transactions-before-calls-extoutboxworker004) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.005 | [Restrict completion to current lease owners](../ext/outbox.md#restrict-completion-to-current-lease-owners-extoutboxworker005) | `ext/outbox.md` |
| EXT.OUTBOX.WORKER.006 | [Requeue expired claims](../ext/outbox.md#requeue-expired-claims-extoutboxworker006) | `ext/outbox.md` |
| EXT.REALTIME.ACCESS.001 | [Authenticate and authorize subscriptions](../ext/realtime.md#authenticate-and-authorize-subscriptions-extrealtimeaccess001) | `ext/realtime.md` |
| EXT.REALTIME.ACCESS.002 | [Revalidate long-lived access](../ext/realtime.md#revalidate-long-lived-access-extrealtimeaccess002) | `ext/realtime.md` |
| EXT.REALTIME.ADOPT.001 | [Record realtime need](../ext/realtime.md#record-realtime-need-extrealtimeadopt001) | `ext/realtime.md` |
| EXT.REALTIME.ADOPT.002 | [Reject cosmetic realtime adoption](../ext/realtime.md#reject-cosmetic-realtime-adoption-extrealtimeadopt002) | `ext/realtime.md` |
| EXT.REALTIME.CAPACITY.001 | [Bound realtime resources](../ext/realtime.md#bound-realtime-resources-extrealtimecapacity001) | `ext/realtime.md` |
| EXT.REALTIME.CAPACITY.002 | [Reject unbounded slow-client buffering](../ext/realtime.md#reject-unbounded-slow-client-buffering-extrealtimecapacity002) | `ext/realtime.md` |
| EXT.REALTIME.CONVENTION.001 | [Place realtime code at outer boundaries](../ext/realtime.md#place-realtime-code-at-outer-boundaries-extrealtimeconvention001) | `ext/realtime.md` |
| EXT.REALTIME.CONVENTION.002 | [Subscribe through narrow functions](../ext/realtime.md#subscribe-through-narrow-functions-extrealtimeconvention002) | `ext/realtime.md` |
| EXT.REALTIME.RECOVERY.001 | [Reconnect and refresh authoritative state](../ext/realtime.md#reconnect-and-refresh-authoritative-state-extrealtimerecovery001) | `ext/realtime.md` |
| EXT.REALTIME.RECOVERY.002 | [Tolerate notification ordering differences](../ext/realtime.md#tolerate-notification-ordering-differences-extrealtimerecovery002) | `ext/realtime.md` |
| EXT.REALTIME.TRANSPORT.001 | [Use server-sent events for notifications](../ext/realtime.md#use-server-sent-events-for-notifications-extrealtimetransport001) | `ext/realtime.md` |
| EXT.REALTIME.TRANSPORT.002 | [Use SignalR for interactive messaging](../ext/realtime.md#use-signalr-for-interactive-messaging-extrealtimetransport002) | `ext/realtime.md` |
| EXT.REALTIME.TRANSPORT.003 | [Record transport support](../ext/realtime.md#record-transport-support-extrealtimetransport003) | `ext/realtime.md` |
| EXT.REPORT.ADOPT.001 | [Record reporting need](../ext/report.md#record-reporting-need-extreportadopt001) | `ext/report.md` |
| EXT.REPORT.ADOPT.002 | [Avoid speculative reporting systems](../ext/report.md#avoid-speculative-reporting-systems-extreportadopt002) | `ext/report.md` |
| EXT.REPORT.AUTHZ.001 | [Apply item-read authorization](../ext/report.md#apply-item-read-authorization-extreportauthz001) | `ext/report.md` |
| EXT.REPORT.CONTENT.001 | [Escape formula-leading export values](../ext/report.md#escape-formula-leading-export-values-extreportcontent001) | `ext/report.md` |
| EXT.REPORT.CONTENT.002 | [Define export encoding and columns](../ext/report.md#define-export-encoding-and-columns-extreportcontent002) | `ext/report.md` |
| EXT.REPORT.CONVENTION.001 | [Keep report definitions in Application](../ext/report.md#keep-report-definitions-in-application-extreportconvention001) | `ext/report.md` |
| EXT.REPORT.CONVENTION.002 | [Keep report providers in Infrastructure](../ext/report.md#keep-report-providers-in-infrastructure-extreportconvention002) | `ext/report.md` |
| EXT.REPORT.CONVENTION.003 | [Separate Worker orchestration](../ext/report.md#separate-worker-orchestration-extreportconvention003) | `ext/report.md` |
| EXT.REPORT.EXPORT.001 | [Run budget-exceeding exports in Worker](../ext/report.md#run-budget-exceeding-exports-in-worker-extreportexport001) | `ext/report.md` |
| EXT.REPORT.EXPORT.002 | [Protect export output](../ext/report.md#protect-export-output-extreportexport002) | `ext/report.md` |
| EXT.REPORT.LIMITS.001 | [Define report limits](../ext/report.md#define-report-limits-extreportlimits001) | `ext/report.md` |
| EXT.REPORT.LIMITS.002 | [Support report cancellation](../ext/report.md#support-report-cancellation-extreportlimits002) | `ext/report.md` |
| EXT.REPORT.SQL.001 | [Parameterize report SQL](../ext/report.md#parameterize-report-sql-extreportsql001) | `ext/report.md` |
| EXT.REPORT.SQL.002 | [Keep raw SQL in Infrastructure](../ext/report.md#keep-raw-sql-in-infrastructure-extreportsql002) | `ext/report.md` |
| EXT.REPORT.SQL.003 | [Review report plans](../ext/report.md#review-report-plans-extreportsql003) | `ext/report.md` |
| EXT.TENANCY.ADOPT.001 | [Define tenant isolation](../ext/tenancy.md#define-tenant-isolation-exttenancyadopt001) | `ext/tenancy.md` |
| EXT.TENANCY.ADOPT.002 | [Avoid unplanned isolation models](../ext/tenancy.md#avoid-unplanned-isolation-models-exttenancyadopt002) | `ext/tenancy.md` |
| EXT.TENANCY.AUTHZ.001 | [Verify actor and target tenancy](../ext/tenancy.md#verify-actor-and-target-tenancy-exttenancyauthz001) | `ext/tenancy.md` |
| EXT.TENANCY.AUTHZ.002 | [Isolate administrative cross-tenant access](../ext/tenancy.md#isolate-administrative-cross-tenant-access-exttenancyauthz002) | `ext/tenancy.md` |
| EXT.TENANCY.CONVENTION.001 | [Use typed tenant identities](../ext/tenancy.md#use-typed-tenant-identities-exttenancyconvention001) | `ext/tenancy.md` |
| EXT.TENANCY.CONVENTION.002 | [Use one tenant accessor](../ext/tenancy.md#use-one-tenant-accessor-exttenancyconvention002) | `ext/tenancy.md` |
| EXT.TENANCY.CONVENTION.003 | [Pass tenant scope explicitly](../ext/tenancy.md#pass-tenant-scope-explicitly-exttenancyconvention003) | `ext/tenancy.md` |
| EXT.TENANCY.DISCLOSURE.001 | [Apply cross-tenant disclosure policy](../ext/tenancy.md#apply-cross-tenant-disclosure-policy-exttenancydisclosure001) | `ext/tenancy.md` |
| EXT.TENANCY.DISCLOSURE.002 | [Protect tenant diagnostics](../ext/tenancy.md#protect-tenant-diagnostics-exttenancydisclosure002) | `ext/tenancy.md` |
| EXT.TENANCY.OPERATION.001 | [Scope tenant operations](../ext/tenancy.md#scope-tenant-operations-exttenancyoperation001) | `ext/tenancy.md` |
| EXT.TENANCY.RESOLVE.001 | [Resolve tenant identity from trusted context](../ext/tenancy.md#resolve-tenant-identity-from-trusted-context-exttenancyresolve001) | `ext/tenancy.md` |
| EXT.TENANCY.RESOLVE.002 | [Reject unrestricted tenant input](../ext/tenancy.md#reject-unrestricted-tenant-input-exttenancyresolve002) | `ext/tenancy.md` |
| EXT.TENANCY.STORAGE.001 | [Use selected tenant storage support](../ext/tenancy.md#use-selected-tenant-storage-support-exttenancystorage001) | `ext/tenancy.md` |
| EXT.TENANCY.STORAGE.002 | [Scope tenant-owned records](../ext/tenancy.md#scope-tenant-owned-records-exttenancystorage002) | `ext/tenancy.md` |

## FRONTEND

| ID | Provision | Page |
|:---|:---|:---|
| FRONTEND.COMPONENTS.ACCESSIBILITY.001 | [Meet accessibility requirements](../frontend/components.md#meet-accessibility-requirements-frontendcomponentsaccessibility001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONTENT.001 | [Protect rich content boundaries](../frontend/components.md#protect-rich-content-boundaries-frontendcomponentscontent001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.001 | [Name components for their role](../frontend/components.md#name-components-for-their-role-frontendcomponentsconvention001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.002 | [Give card and section titles heading semantics](../frontend/components.md#give-card-and-section-titles-heading-semantics-frontendcomponentsconvention002) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.003 | [Keep domain values typed until display](../frontend/components.md#keep-domain-values-typed-until-display-frontendcomponentsconvention003) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.004 | [Use `cn` for class composition](../frontend/components.md#use-cn-for-class-composition-frontendcomponentsconvention004) | `frontend/components.md` |
| FRONTEND.COMPONENTS.CONVENTION.005 | [Keep error boundaries scoped](../frontend/components.md#keep-error-boundaries-scoped-frontendcomponentsconvention005) | `frontend/components.md` |
| FRONTEND.COMPONENTS.IMAGE.001 | [Use the framework image component for content images](../frontend/components.md#use-the-framework-image-component-for-content-images-frontendcomponentsimage001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.OWNERSHIP.001 | [Use the component ownership levels](../frontend/components.md#use-the-component-ownership-levels-frontendcomponentsownership001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.PROPS.001 | [Keep props narrow](../frontend/components.md#keep-props-narrow-frontendcomponentsprops001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.STATE.001 | [Render complete states](../frontend/components.md#render-complete-states-frontendcomponentsstate001) | `frontend/components.md` |
| FRONTEND.COMPONENTS.VARIANTS.001 | [Use declared visual variants](../frontend/components.md#use-declared-visual-variants-frontendcomponentsvariants001) | `frontend/components.md` |
| FRONTEND.DATA.CLIENT.001 | [Use one typed API client](../frontend/data.md#use-one-typed-api-client-frontenddataclient001) | `frontend/data.md` |
| FRONTEND.DATA.CONVENTION.001 | [Use this API layout for one frontend](../frontend/data.md#use-this-api-layout-for-one-frontend-frontenddataconvention001) | `frontend/data.md` |
| FRONTEND.DATA.CONVENTION.002 | [Keep schemas operation-specific](../frontend/data.md#keep-schemas-operation-specific-frontenddataconvention002) | `frontend/data.md` |
| FRONTEND.DATA.CONVENTION.003 | [Use native and framework form support first](../frontend/data.md#use-native-and-framework-form-support-first-frontenddataconvention003) | `frontend/data.md` |
| FRONTEND.DATA.CONVENTION.004 | [Keep cache invalidation close to mutations](../frontend/data.md#keep-cache-invalidation-close-to-mutations-frontenddataconvention004) | `frontend/data.md` |
| FRONTEND.DATA.ERROR.001 | [Parse errors consistently](../frontend/data.md#parse-errors-consistently-frontenddataerror001) | `frontend/data.md` |
| FRONTEND.DATA.FORM.001 | [Keep forms aligned with use cases](../frontend/data.md#keep-forms-aligned-with-use-cases-frontenddataform001) | `frontend/data.md` |
| FRONTEND.DATA.MUTATIONS.001 | [Keep mutations at a declared boundary](../frontend/data.md#keep-mutations-at-a-declared-boundary-frontenddatamutations001) | `frontend/data.md` |
| FRONTEND.DATA.OPTIMISTIC.001 | [Make optimistic behavior recoverable](../frontend/data.md#make-optimistic-behavior-recoverable-frontenddataoptimistic001) | `frontend/data.md` |
| FRONTEND.DATA.OWNERSHIP.001 | [Assign state to the narrowest owner](../frontend/data.md#assign-state-to-the-narrowest-owner-frontenddataownership001) | `frontend/data.md` |
| FRONTEND.DATA.READ.001 | [Read initial data on the server](../frontend/data.md#read-initial-data-on-the-server-frontenddataread001) | `frontend/data.md` |
| FRONTEND.DATA.SECRETS.001 | [Keep secrets out of browser storage](../frontend/data.md#keep-secrets-out-of-browser-storage-frontenddatasecrets001) | `frontend/data.md` |
| FRONTEND.DATA.TYPES.001 | [Generate transport types](../frontend/data.md#generate-transport-types-frontenddatatypes001) | `frontend/data.md` |
| FRONTEND.RENDERING.ASYNC.001 | [Await Next.js request APIs](../frontend/rendering.md#await-nextjs-request-apis-frontendrenderingasync001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.CACHE.001 | [Keep authenticated caching explicit](../frontend/rendering.md#keep-authenticated-caching-explicit-frontendrenderingcache001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.CLIENT.001 | [Document client boundaries](../frontend/rendering.md#document-client-boundaries-frontendrenderingclient001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.001 | [Use route groups for shells](../frontend/rendering.md#use-route-groups-for-shells-frontendrenderingconvention001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.002 | [Keep layouts stable](../frontend/rendering.md#keep-layouts-stable-frontendrenderingconvention002) | `frontend/rendering.md` |
| FRONTEND.RENDERING.CONVENTION.003 | [Keep server-only code identifiable](../frontend/rendering.md#keep-server-only-code-identifiable-frontendrenderingconvention003) | `frontend/rendering.md` |
| FRONTEND.RENDERING.METADATA.001 | [Define route metadata deliberately](../frontend/rendering.md#define-route-metadata-deliberately-frontendrenderingmetadata001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.PROXY.001 | [Keep proxy behavior at the edge](../frontend/rendering.md#keep-proxy-behavior-at-the-edge-frontendrenderingproxy001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.ROUTES.001 | [Keep route files as composition boundaries](../frontend/rendering.md#keep-route-files-as-composition-boundaries-frontendrenderingroutes001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.SERVER.001 | [Prefer server execution](../frontend/rendering.md#prefer-server-execution-frontendrenderingserver001) | `frontend/rendering.md` |
| FRONTEND.RENDERING.STATE.001 | [Represent route states](../frontend/rendering.md#represent-route-states-frontendrenderingstate001) | `frontend/rendering.md` |
| FRONTEND.STRUCTURE.APPS.001 | [Keep applications independent](../frontend/structure.md#keep-applications-independent-frontendstructureapps001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.BOUNDARY.001 | [Isolate module internals](../frontend/structure.md#isolate-module-internals-frontendstructureboundary001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.001 | [Use this feature layout](../frontend/structure.md#use-this-feature-layout-frontendstructureconvention001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.002 | [Use explicit public entry points for workspace packages](../frontend/structure.md#use-explicit-public-entry-points-for-workspace-packages-frontendstructureconvention002) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.CONVENTION.003 | [Keep tests near their ownership boundary](../frontend/structure.md#keep-tests-near-their-ownership-boundary-frontendstructureconvention003) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.FEATURES.001 | [Organize features by module and use case](../frontend/structure.md#organize-features-by-module-and-use-case-frontendstructurefeatures001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.IMPORTS.001 | [Keep imports directional](../frontend/structure.md#keep-imports-directional-frontendstructureimports001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.PACKAGES.001 | [Keep shared packages non-application-specific](../frontend/structure.md#keep-shared-packages-non-application-specific-frontendstructurepackages001) | `frontend/structure.md` |
| FRONTEND.STRUCTURE.TREE.001 | [Use the frontend application tree](../frontend/structure.md#use-the-frontend-application-tree-frontendstructuretree001) | `frontend/structure.md` |
| FRONTEND.TESTING.CONVENTION.001 | [Keep focused tests beside source](../frontend/testing.md#keep-focused-tests-beside-source-frontendtestingconvention001) | `frontend/testing.md` |
| FRONTEND.TESTING.CONVENTION.002 | [Query by accessible behavior](../frontend/testing.md#query-by-accessible-behavior-frontendtestingconvention002) | `frontend/testing.md` |
| FRONTEND.TESTING.CONVENTION.003 | [Keep test support narrow](../frontend/testing.md#keep-test-support-narrow-frontendtestingconvention003) | `frontend/testing.md` |
| FRONTEND.TESTING.GATES.001 | [Run the changed application gates](../frontend/testing.md#run-the-changed-application-gates-frontendtestinggates001) | `frontend/testing.md` |
| FRONTEND.TESTING.ISOLATION.001 | [Isolate browser tests](../frontend/testing.md#isolate-browser-tests-frontendtestingisolation001) | `frontend/testing.md` |
| FRONTEND.TESTING.LEVEL.001 | [Match test level to risk](../frontend/testing.md#match-test-level-to-risk-frontendtestinglevel001) | `frontend/testing.md` |
| FRONTEND.TESTING.MOCKS.001 | [Keep mocks at owned boundaries](../frontend/testing.md#keep-mocks-at-owned-boundaries-frontendtestingmocks001) | `frontend/testing.md` |
| FRONTEND.TESTING.STATE.001 | [Test observable states](../frontend/testing.md#test-observable-states-frontendtestingstate001) | `frontend/testing.md` |
| FRONTEND.TESTING.TRACE.001 | [Trace acceptance behavior](../frontend/testing.md#trace-acceptance-behavior-frontendtestingtrace001) | `frontend/testing.md` |
| FRONTEND.TESTING.UI.001 | [Prove controlled UI changes](../frontend/testing.md#prove-controlled-ui-changes-frontendtestingui001) | `frontend/testing.md` |
| FRONTEND.UI.COMPANION.001 | [Govern behavior companions and specialist controls](../frontend/ui.md#govern-behavior-companions-and-specialist-controls-frontenduicompanion001) | `frontend/ui.md` |
| FRONTEND.UI.CONVENTION.001 | [Use the product profiles](../frontend/ui.md#use-the-product-profiles-frontenduiconvention001) | `frontend/ui.md` |
| FRONTEND.UI.CONVENTION.002 | [Use the source update procedure](../frontend/ui.md#use-the-source-update-procedure-frontenduiconvention002) | `frontend/ui.md` |
| FRONTEND.UI.EVIDENCE.001 | [Prove UI behavior and appearance](../frontend/ui.md#prove-ui-behavior-and-appearance-frontenduievidence001) | `frontend/ui.md` |
| FRONTEND.UI.FORKS.001 | [Track source changes](../frontend/ui.md#track-source-changes-frontenduiforks001) | `frontend/ui.md` |
| FRONTEND.UI.GOVERNANCE.001 | [Select one visual authority](../frontend/ui.md#select-one-visual-authority-frontenduigovernance001) | `frontend/ui.md` |
| FRONTEND.UI.PAGE.001 | [Specify pages before composition](../frontend/ui.md#specify-pages-before-composition-frontenduipage001) | `frontend/ui.md` |
| FRONTEND.UI.PROTOCOL.001 | [Follow the agent UI protocol](../frontend/ui.md#follow-the-agent-ui-protocol-frontenduiprotocol001) | `frontend/ui.md` |
| FRONTEND.UI.SHADCN.001 | [Use the pinned shadcn/ui baseline](../frontend/ui.md#use-the-pinned-shadcnui-baseline-frontenduishadcn001) | `frontend/ui.md` |
| FRONTEND.UI.TAILWIND.001 | [Restrict CSS decisions](../frontend/ui.md#restrict-css-decisions-frontenduitailwind001) | `frontend/ui.md` |
| FRONTEND.UI.VOCABULARY.001 | [Declare the UI vocabulary](../frontend/ui.md#declare-the-ui-vocabulary-frontenduivocabulary001) | `frontend/ui.md` |

## PROFILE

| ID | Provision | Page |
|:---|:---|:---|
| PROFILE.BLAZOR.COMPOSITION.001 | [Apply the complete profile](../profile/blazor.md#apply-the-complete-profile-profileblazorcomposition001) | `profile/blazor.md` |
| PROFILE.BLAZOR.CONVENTION.001 | [Keep the platform profile visible](../profile/blazor.md#keep-the-platform-profile-visible-profileblazorconvention001) | `profile/blazor.md` |
| PROFILE.BLAZOR.CONVENTION.002 | [Verify with the .NET toolchain](../profile/blazor.md#verify-with-the-net-toolchain-profileblazorconvention002) | `profile/blazor.md` |
| PROFILE.BLAZOR.CONVENTION.003 | [Record a first-load budget](../profile/blazor.md#record-a-first-load-budget-profileblazorconvention003) | `profile/blazor.md` |
| PROFILE.BLAZOR.RENDERING.001 | [Publish static WebAssembly output](../profile/blazor.md#publish-static-webassembly-output-profileblazorrendering001) | `profile/blazor.md` |
| PROFILE.BLAZOR.REPLACEMENT.001 | [Declare replacements](../profile/blazor.md#declare-replacements-profileblazorreplacement001) | `profile/blazor.md` |
| PROFILE.BLAZOR.SCOPE.001 | [List excluded baselines](../profile/blazor.md#list-excluded-baselines-profileblazorscope001) | `profile/blazor.md` |
| PROFILE.BLAZOR.VERSION.001 | [Use manifest version pins](../profile/blazor.md#use-manifest-version-pins-profileblazorversion001) | `profile/blazor.md` |
| PROFILE.NEXTJS.COMPOSITION.001 | [Apply the complete profile](../profile/nextjs.md#apply-the-complete-profile-profilenextjscomposition001) | `profile/nextjs.md` |
| PROFILE.NEXTJS.CONVENTION.001 | [Keep the platform profile visible](../profile/nextjs.md#keep-the-platform-profile-visible-profilenextjsconvention001) | `profile/nextjs.md` |
| PROFILE.NEXTJS.REPLACEMENT.001 | [Declare replacements](../profile/nextjs.md#declare-replacements-profilenextjsreplacement001) | `profile/nextjs.md` |
| PROFILE.NEXTJS.VERSION.001 | [Use manifest version pins](../profile/nextjs.md#use-manifest-version-pins-profilenextjsversion001) | `profile/nextjs.md` |

## QUALITY

| ID | Provision | Page |
|:---|:---|:---|
| QUALITY.CI.CONTRACTS.001 | [Keep generated contracts fresh](../quality/ci.md#keep-generated-contracts-fresh-qualitycicontracts001) | `quality/ci.md` |
| QUALITY.CI.CONVENTION.001 | [Apply the documented defaults](../quality/ci.md#apply-the-documented-defaults-qualityciconvention001) | `quality/ci.md` |
| QUALITY.CI.DOCS.001 | [Check code and documentation consistency](../quality/ci.md#check-code-and-documentation-consistency-qualitycidocs001) | `quality/ci.md` |
| QUALITY.CI.GATES.001 | [Run applicable gates on every pull request](../quality/ci.md#run-applicable-gates-on-every-pull-request-qualitycigates001) | `quality/ci.md` |
| QUALITY.CI.JOBS.001 | [Keep a canonical job graph](../quality/ci.md#keep-a-canonical-job-graph-qualitycijobs001) | `quality/ci.md` |
| QUALITY.CI.PROTECTION.001 | [Protect the default branch](../quality/ci.md#protect-the-default-branch-qualityciprotection001) | `quality/ci.md` |
| QUALITY.CI.RELEASE.001 | [Promote verified artifacts](../quality/ci.md#promote-verified-artifacts-qualitycirelease001) | `quality/ci.md` |
| QUALITY.CI.SCHEMA.001 | [Review schema artifacts](../quality/ci.md#review-schema-artifacts-qualitycischema001) | `quality/ci.md` |
| QUALITY.CI.SUPPLY.001 | [Scan dependencies and release artifacts](../quality/ci.md#scan-dependencies-and-release-artifacts-qualitycisupply001) | `quality/ci.md` |
| QUALITY.OPERATIONS.ALERTS.001 | [Define actionable baseline alerts](../quality/operations.md#define-actionable-baseline-alerts-qualityoperationsalerts001) | `quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.001 | [Use one local start command](../quality/operations.md#use-one-local-start-command-qualityoperationsconvention001) | `quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.002 | [Use stable service names](../quality/operations.md#use-stable-service-names-qualityoperationsconvention002) | `quality/operations.md` |
| QUALITY.OPERATIONS.CONVENTION.003 | [Keep runbooks near project documentation](../quality/operations.md#keep-runbooks-near-project-documentation-qualityoperationsconvention003) | `quality/operations.md` |
| QUALITY.OPERATIONS.DATA.001 | [Define backup and restore behavior](../quality/operations.md#define-backup-and-restore-behavior-qualityoperationsdata001) | `quality/operations.md` |
| QUALITY.OPERATIONS.DEPENDENCIES.001 | [Bound external calls](../quality/operations.md#bound-external-calls-qualityoperationsdependencies001) | `quality/operations.md` |
| QUALITY.OPERATIONS.DEPLOY.001 | [Use a repeatable deployment](../quality/operations.md#use-a-repeatable-deployment-qualityoperationsdeploy001) | `quality/operations.md` |
| QUALITY.OPERATIONS.HEALTH.001 | [Separate liveness and readiness](../quality/operations.md#separate-liveness-and-readiness-qualityoperationshealth001) | `quality/operations.md` |
| QUALITY.OPERATIONS.LOCAL.001 | [Use Aspire for local orchestration](../quality/operations.md#use-aspire-for-local-orchestration-qualityoperationslocal001) | `quality/operations.md` |
| QUALITY.OPERATIONS.OBSERVABILITY.001 | [Emit correlated diagnostics](../quality/operations.md#emit-correlated-diagnostics-qualityoperationsobservability001) | `quality/operations.md` |
| QUALITY.OPERATIONS.ROLLBACK.001 | [Keep rollback executable](../quality/operations.md#keep-rollback-executable-qualityoperationsrollback001) | `quality/operations.md` |
| QUALITY.OPERATIONS.SCHEMA.001 | [Apply schema changes outside request startup](../quality/operations.md#apply-schema-changes-outside-request-startup-qualityoperationsschema001) | `quality/operations.md` |
| QUALITY.OPERATIONS.WORKER.001 | [Operate background work independently](../quality/operations.md#operate-background-work-independently-qualityoperationsworker001) | `quality/operations.md` |
| QUALITY.SECURITY.ABUSE.001 | [Bound abuse at exposed endpoints](../quality/security.md#bound-abuse-at-exposed-endpoints-qualitysecurityabuse001) | `quality/security.md` |
| QUALITY.SECURITY.ACTOR.001 | [Derive the actor from claims](../quality/security.md#derive-the-actor-from-claims-qualitysecurityactor001) | `quality/security.md` |
| QUALITY.SECURITY.AUDIT.001 | [Record security audit events](../quality/security.md#record-security-audit-events-qualitysecurityaudit001) | `quality/security.md` |
| QUALITY.SECURITY.AUTHN.001 | [Keep backend authentication provider-neutral](../quality/security.md#keep-backend-authentication-provider-neutral-qualitysecurityauthn001) | `quality/security.md` |
| QUALITY.SECURITY.AUTHZ.001 | [Authorize each target resource](../quality/security.md#authorize-each-target-resource-qualitysecurityauthz001) | `quality/security.md` |
| QUALITY.SECURITY.CONVENTION.001 | [Use one current actor abstraction](../quality/security.md#use-one-current-actor-abstraction-qualitysecurityconvention001) | `quality/security.md` |
| QUALITY.SECURITY.CONVENTION.002 | [Keep secure headers in host configuration](../quality/security.md#keep-secure-headers-in-host-configuration-qualitysecurityconvention002) | `quality/security.md` |
| QUALITY.SECURITY.CONVENTION.003 | [Use deny-by-default policies](../quality/security.md#use-deny-by-default-policies-qualitysecurityconvention003) | `quality/security.md` |
| QUALITY.SECURITY.CONVENTION.004 | [Test the resource authorization matrix](../quality/security.md#test-the-resource-authorization-matrix-qualitysecurityconvention004) | `quality/security.md` |
| QUALITY.SECURITY.CORS.001 | [Restrict cross-origin access](../quality/security.md#restrict-cross-origin-access-qualitysecuritycors001) | `quality/security.md` |
| QUALITY.SECURITY.DATA.001 | [Minimize sensitive data](../quality/security.md#minimize-sensitive-data-qualitysecuritydata001) | `quality/security.md` |
| QUALITY.SECURITY.ERROR.001 | [Limit public error detail](../quality/security.md#limit-public-error-detail-qualitysecurityerror001) | `quality/security.md` |
| QUALITY.SECURITY.FRONTEND.001 | [Protect browser boundaries](../quality/security.md#protect-browser-boundaries-qualitysecurityfrontend001) | `quality/security.md` |
| QUALITY.SECURITY.INPUT.001 | [Validate at trust boundaries](../quality/security.md#validate-at-trust-boundaries-qualitysecurityinput001) | `quality/security.md` |
| QUALITY.SECURITY.ROTATION.001 | [Rotate production secrets](../quality/security.md#rotate-production-secrets-qualitysecurityrotation001) | `quality/security.md` |
| QUALITY.SECURITY.SECRETS.001 | [Keep secrets out of tracked and observable data](../quality/security.md#keep-secrets-out-of-tracked-and-observable-data-qualitysecuritysecrets001) | `quality/security.md` |
| QUALITY.SECURITY.SQL.001 | [Parameterize database input](../quality/security.md#parameterize-database-input-qualitysecuritysql001) | `quality/security.md` |
| QUALITY.SECURITY.SUPPLY.001 | [Pin and review dependencies](../quality/security.md#pin-and-review-dependencies-qualitysecuritysupply001) | `quality/security.md` |
| QUALITY.SECURITY.SUPPLY.002 | [Enforce supply-chain gates in CI](../quality/security.md#enforce-supply-chain-gates-in-ci-qualitysecuritysupply002) | `quality/security.md` |

## WORKSPACE

| ID | Provision | Page |
|:---|:---|:---|
| WORKSPACE.CONFIG.BUILD.001 | [Centralize .NET build settings](../workspace/config.md#centralize-net-build-settings-workspaceconfigbuild001) | `workspace/config.md` |
| WORKSPACE.CONFIG.CONVENTION.001 | [Keep environment examples beside applications](../workspace/config.md#keep-environment-examples-beside-applications-workspaceconfigconvention001) | `workspace/config.md` |
| WORKSPACE.CONFIG.CONVENTION.002 | [Keep local overrides untracked](../workspace/config.md#keep-local-overrides-untracked-workspaceconfigconvention002) | `workspace/config.md` |
| WORKSPACE.CONFIG.CONVENTION.003 | [Keep logging configuration provider-neutral](../workspace/config.md#keep-logging-configuration-provider-neutral-workspaceconfigconvention003) | `workspace/config.md` |
| WORKSPACE.CONFIG.CONVENTION.004 | [Keep documentation directories out of build-artifact ignore rules](../workspace/config.md#keep-documentation-directories-out-of-build-artifact-ignore-rules-workspaceconfigconvention004) | `workspace/config.md` |
| WORKSPACE.CONFIG.ESLINT.001 | [Pin the React version in the ESLint flat config](../workspace/config.md#pin-the-react-version-in-the-eslint-flat-config-workspaceconfigeslint001) | `workspace/config.md` |
| WORKSPACE.CONFIG.FRONTEND.001 | [Validate frontend environment access](../workspace/config.md#validate-frontend-environment-access-workspaceconfigfrontend001) | `workspace/config.md` |
| WORKSPACE.CONFIG.NODE.001 | [Pin the JavaScript toolchain](../workspace/config.md#pin-the-javascript-toolchain-workspaceconfignode001) | `workspace/config.md` |
| WORKSPACE.CONFIG.NUGET.001 | [Centralize NuGet versions](../workspace/config.md#centralize-nuget-versions-workspaceconfignuget001) | `workspace/config.md` |
| WORKSPACE.CONFIG.OPTIONS.001 | [Validate backend options at startup](../workspace/config.md#validate-backend-options-at-startup-workspaceconfigoptions001) | `workspace/config.md` |
| WORKSPACE.CONFIG.PNPM.001 | [Use one frontend dependency graph](../workspace/config.md#use-one-frontend-dependency-graph-workspaceconfigpnpm001) | `workspace/config.md` |
| WORKSPACE.CONFIG.SDK.001 | [Pin the SDK at the workspace root](../workspace/config.md#pin-the-sdk-at-the-workspace-root-workspaceconfigsdk001) | `workspace/config.md` |
| WORKSPACE.CONFIG.SECRETS.001 | [Keep secrets outside source control](../workspace/config.md#keep-secrets-outside-source-control-workspaceconfigsecrets001) | `workspace/config.md` |
| WORKSPACE.CONFIG.TOOLS.001 | [Commit the tool manifest](../workspace/config.md#commit-the-tool-manifest-workspaceconfigtools001) | `workspace/config.md` |
| WORKSPACE.DEPENDENCIES.APPLICATION.001 | [Keep Application dependencies narrow](../workspace/dependencies.md#keep-application-dependencies-narrow-workspacedependenciesapplication001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.APPROVAL.001 | [Approve new packages explicitly](../workspace/dependencies.md#approve-new-packages-explicitly-workspacedependenciesapproval001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.001 | [Reference only the LiteBus module required](../workspace/dependencies.md#reference-only-the-litebus-module-required-workspacedependenciesconvention001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.002 | [Keep generated packages dependency-light](../workspace/dependencies.md#keep-generated-packages-dependency-light-workspacedependenciesconvention002) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.003 | [Keep test dependencies in test projects](../workspace/dependencies.md#keep-test-dependencies-in-test-projects-workspacedependenciesconvention003) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.CONVENTION.004 | [Use this baseline package ownership](../workspace/dependencies.md#use-this-baseline-package-ownership-workspacedependenciesconvention004) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.DOMAIN.001 | [Keep Domain package-free](../workspace/dependencies.md#keep-domain-package-free-workspacedependenciesdomain001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.FRONTEND.001 | [Keep frontend applications isolated](../workspace/dependencies.md#keep-frontend-applications-isolated-workspacedependenciesfrontend001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.INFRASTRUCTURE.001 | [Keep providers in Infrastructure](../workspace/dependencies.md#keep-providers-in-infrastructure-workspacedependenciesinfrastructure001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.PINS.001 | [Pin every dependency centrally](../workspace/dependencies.md#pin-every-dependency-centrally-workspacedependenciespins001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.PROJECTS.001 | [Use the project reference graph](../workspace/dependencies.md#use-the-project-reference-graph-workspacedependenciesprojects001) | `workspace/dependencies.md` |
| WORKSPACE.DEPENDENCIES.UI.001 | [Keep the approved web UI dependency boundary](../workspace/dependencies.md#keep-the-approved-web-ui-dependency-boundary-workspacedependenciesui001) | `workspace/dependencies.md` |
| WORKSPACE.NAMING.AGGREGATE.001 | [Anchor aggregate-owned types on the aggregate root](../workspace/naming.md#anchor-aggregate-owned-types-on-the-aggregate-root-workspacenamingaggregate001) | `workspace/naming.md` |
| WORKSPACE.NAMING.ASYNC.001 | [Name asynchronous methods completely](../workspace/naming.md#name-asynchronous-methods-completely-workspacenamingasync001) | `workspace/naming.md` |
| WORKSPACE.NAMING.BOOLEAN.001 | [Use intent-revealing boolean names](../workspace/naming.md#use-intent-revealing-boolean-names-workspacenamingboolean001) | `workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.001 | [Align business names across layers](../workspace/naming.md#align-business-names-across-layers-workspacenamingconvention001) | `workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.002 | [Keep namespaces aligned with folders](../workspace/naming.md#keep-namespaces-aligned-with-folders-workspacenamingconvention002) | `workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.003 | [Avoid generic type names](../workspace/naming.md#avoid-generic-type-names-workspacenamingconvention003) | `workspace/naming.md` |
| WORKSPACE.NAMING.CONVENTION.004 | [Derive boundary names from the ubiquitous term](../workspace/naming.md#derive-boundary-names-from-the-ubiquitous-term-workspacenamingconvention004) | `workspace/naming.md` |
| WORKSPACE.NAMING.CSHARP.001 | [Keep implementation style consistent](../workspace/naming.md#keep-implementation-style-consistent-workspacenamingcsharp001) | `workspace/naming.md` |
| WORKSPACE.NAMING.CSHARP.002 | [Use current language features](../workspace/naming.md#use-current-language-features-workspacenamingcsharp002) | `workspace/naming.md` |
| WORKSPACE.NAMING.EXCEPTION.001 | [Name exceptions by failed rule](../workspace/naming.md#name-exceptions-by-failed-rule-workspacenamingexception001) | `workspace/naming.md` |
| WORKSPACE.NAMING.FILE.001 | [Match C# files and primary types](../workspace/naming.md#match-c-files-and-primary-types-workspacenamingfile001) | `workspace/naming.md` |
| WORKSPACE.NAMING.FRONTEND.001 | [Use predictable frontend names](../workspace/naming.md#use-predictable-frontend-names-workspacenamingfrontend001) | `workspace/naming.md` |
| WORKSPACE.NAMING.SUFFIX.001 | [Use architectural suffixes](../workspace/naming.md#use-architectural-suffixes-workspacenamingsuffix001) | `workspace/naming.md` |
| WORKSPACE.STRUCTURE.APPS.001 | [Keep runnable applications under apps](../workspace/structure.md#keep-runnable-applications-under-apps-workspacestructureapps001) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.001 | [Name frontends by audience](../workspace/structure.md#name-frontends-by-audience-workspacestructureconvention001) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.002 | [Keep scripts at the root](../workspace/structure.md#keep-scripts-at-the-root-workspacestructureconvention002) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.CONVENTION.003 | [Keep generated API contracts in packages](../workspace/structure.md#keep-generated-api-contracts-in-packages-workspacestructureconvention003) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOCS.001 | [Keep consumer documentation at the root](../workspace/structure.md#keep-consumer-documentation-at-the-root-workspacestructuredocs001) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOCS.002 | [Keep orientation documents separate from canonical records](../workspace/structure.md#keep-orientation-documents-separate-from-canonical-records-workspacestructuredocs002) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.DOTNET.001 | [Keep .NET production and test projects separate](../workspace/structure.md#keep-net-production-and-test-projects-separate-workspacestructuredotnet001) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.PACKAGES.001 | [Limit shared TypeScript packages](../workspace/structure.md#limit-shared-typescript-packages-workspacestructurepackages001) | `workspace/structure.md` |
| WORKSPACE.STRUCTURE.TREE.001 | [Use the canonical root tree](../workspace/structure.md#use-the-canonical-root-tree-workspacestructuretree001) | `workspace/structure.md` |

