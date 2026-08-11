# PROJECT STATE

| Field | Current value |
|---|---|
| Repository | `https://github.com/VuongDuc-blip-blop/employee-management-mvc` |
| Branch | `TEST` |
| Production-source baseline | ERP-0002 correction commit `2a2c9981d9d15020bd272320511af16244052e2f` |
| Tested executable fingerprint | ERP-0002 `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548` |
| Tracked source working tree | Clean at final test; workflow artifacts now changed for report/guide delivery |
| Preserved local inputs | Untracked `docs/markdowns/` and `prompts/`; never staged |
| Latest closed task | `ERP-0002 — Safe Paged User Directory Contract`, `TASK_PASSED` |
| Latest test report | `.ai-erp-workflow/reports/ERP-0002-test-report-r01.md` — PASS `36/0`; ERP-0001 regression `39/0` |
| Active task | `ERP-0003 — Angular Identity UX and User Excel Showcase` |
| Active task state | `GUIDE_READY` |
| Active guide | `.ai-erp-workflow/tasks/ERP-0003-angular-identity-excel-showcase.md`, revision `r01` |
| Roadmap version | `1.3` — human priority inserted before employee directory |
| Pattern catalog version | `1.5` — ERP-0002 mastered; Angular identity/Excel modes planned |
| Next human action | Pull `TEST`, type ERP-0003 guide r01 on company machine, push implementation, then send PROMPT 2. |

## State history

- ERP-0000: `BOOTSTRAPPING → ROADMAP_READY → TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → HUMAN_FIXING → READY_FOR_TEST → TESTING → TEST_PASS → TASK_PASSED`.
- ERP-0001: `TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → AGENT_FIXING → TESTING → TEST_PASS → TASK_PASSED`.
- ERP-0002: `TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → AGENT_FIXING → TESTING → TEST_PASS → TASK_PASSED`.
- ERP-0003: `TASK_PLANNED → GUIDE_READY`.

## Proven baseline gates

| Gate | Status | Evidence |
|---|---|---|
| Fetch/branch | PASS | Human ERP-0002 commit `d39b8dd` fetched on `TEST`; correction is based on that exact source. |
| ERP-0002 static/write-set | PASS | Exact 11-path production contract; secret/generated residue 0. |
| Restore | PASS_WITH_WARNINGS | Full Framework MSBuild exit 0; 18 known NU1902/NU1903 advisories remain debt. |
| Debug/Release build | PASS_WITH_WARNINGS | Both exit 0; four pre-existing `EmployeeController.cs` duplicate-using warnings. |
| DB contract | PASS | `001 → 004` twice plus ERP-0002 paging/output/search/rollback contract. |
| User directory IIS/API | PASS | Valid pages, empty-page total, exact item shape, six invalid cases and two rendered views. |
| ERP-0002 final gate | PASS | `36/0`, fixture/process/generated residue 0. |
| ERP-0001 regression | PASS | `39/0`, including password-helper `9/0`, identity/anti-forgery/legacy-upgrade journeys. |

## Active-task boundary

ERP-0003 changes identity interaction from Razor-submitted forms to AngularJS while retaining MVC anti-forgery, server session and ERP-0001 credential rules. It also adds five honestly labelled Excel techniques over the ERP-0002 safe user projection. EPPlus 6.0.3 is license-gated and disabled by default; the stale EPPlus 4.1 reference does not authorize a downgrade or commercial use.

Employee directory/lifecycle, roles/authorization, audit, Excel import, anonymous user mutations, historic credential rotation and dependency upgrades remain deferred.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull branch TEST, tự triển khai ERP-0003 guide r01, push code, sau đó gửi PROMPT 2.
