# PROJECT STATE

| Field | Current value |
|---|---|
| Repository URL | `https://github.com/VuongDuc-blip-blop/employee-management-mvc` |
| Branch | `TEST` |
| Baseline SHA | ERP-0001 production-source baseline `09482ed60642ab3f6a3ff4a1956b421ecfb278df`; latest `TEST` additionally carries guide/state artifacts only |
| Working-tree fingerprint | Production tree equals the committed ERP-0000 PASS baseline; tested ERP-0000 executable-source fingerprint `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569` |
| Source working tree | At guide publication, `WISE_REPORT` has no ERP-0001 delta from source baseline; guide/state artifacts are versioned, while human `docs/` and `prompts/` inputs remain local/untracked |
| Active task | `ERP-0001 — Secure Session Identity and Legacy Password Upgrade` |
| Active task state | `GUIDE_READY` |
| Latest test report | `.ai-erp-workflow/reports/ERP-0000-test-report-r02.md` — `PASS` |
| Roadmap version | `1.1` — 2026-08-10 |
| Pattern catalog version | `1.2` — ERP-0001 identity patterns classified `PLANNED` |
| Task guide revision | ERP-0001 `r01` — full line-by-line guide on exact commit baseline |
| Next required human action | Pull branch `TEST` on the company machine, implement ERP-0001 guide r01 exactly, then send PROMPT 2 |

## State history

`BOOTSTRAPPING → ROADMAP_READY → TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → HUMAN_FIXING → READY_FOR_TEST → TESTING → TEST_PASS → TASK_PASSED`

ERP-0000 report r02 is PASS for exact fingerprint `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`: static + DB lifecycle `33/0/0`, restore/Debug/Release exit 0, IIS Express API HTTP 200, generated delta 0 and scoped secret count 0. Corrective commit `09482ed60642ab3f6a3ff4a1956b421ecfb278df` closes ERP-0000. ERP-0001 is now the single active task at `GUIDE_READY`; no ERP-0001 production code has been typed in this workflow run.

## Baseline gates

| Gate | Status | Evidence |
|---|---|---|
| Fetch/checkout | PASS | `TEST`, exact SHA, origin tracking 0/0 at discovery |
| Source diff | PASS | No tracked source modification |
| Restore | PASS_WITH_WARNINGS | Full Framework MSBuild restore exit 0; 18 NU1902/NU1903 vulnerability warnings captured |
| Debug build | PASS_WITH_WARNINGS | MSBuild exit 0; 4 duplicate-usings + 1 unused-variable warning |
| Application tests | ABSENT | No application-owned test project/runner |
| LocalDB engine | AVAILABLE | MSSQLLocalDB exists/runs |
| Target database | PASS | Forward/rerun/verify/smoke/negative rollback/confirmed rollback/rebootstrap pass on isolated LocalDB; cleanup residue 0 |

## Release gate audit

Task Planner, Implementation Guide Engineer and Adversarial Reviewer completed. Reviewer initially held release for wrong JS anchor, database-level rollback, SQL/version/path inconsistency and validation ambiguity. Guide r01 now uses `Projects.js`, SQL 2012 placeholder + ALTER, DB-specific path, ownership token, strict source-derived sort, and transaction-wrapped exact-object rollback. Known API/UI/auth debts remain explicitly deferred.

ERP-0001 guide r01 was source-reviewed for the orphan `[HttpPost]` attribute before `ChangePassword`, duplicate usernames, classic csproj registration, Razor form nesting, anti-forgery coverage, session data, legacy-hash boundary and PowerShell command compatibility. Its standalone form/helper/controller snippets compile in an in-memory Full Framework compatibility check; actual application build and runtime evidence remain mandatory after human implementation.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull branch TEST, tự triển khai ERP-0001 guide r01, sau đó gửi PROMPT 2.
