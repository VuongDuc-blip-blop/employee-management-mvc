# PROJECT STATE

| Field | Current value |
|---|---|
| Repository URL | `https://github.com/VuongDuc-blip-blop/employee-management-mvc` |
| Branch | `TEST` |
| Production-source baseline | ERP-0001 correction commit `347a41dff8e96b554d01650d4d7943425ec2b1ad` |
| Tested executable fingerprint | ERP-0001 `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499` |
| Source working tree | No ERP-0002 production code; workflow artifacts only. Human `docs/` and `prompts/` inputs remain local/untracked. |
| Active task | `ERP-0002 — Safe Paged User Directory Contract` |
| Active task state | `GUIDE_READY` |
| Latest test report | `.ai-erp-workflow/reports/ERP-0001-test-report-r01.md` — PASS `39/0` |
| Roadmap version | `1.2` — ERP-0002 activated after ERP-0001 PASS |
| Pattern catalog version | `1.4` — ERP-0002 patterns classified `PLANNED` |
| Task guide revision | ERP-0002 `r01` |
| Next required human action | Pull `TEST`, type ERP-0002 guide r01, then send PROMPT 2. |

## State history

ERP-0000:

`BOOTSTRAPPING → ROADMAP_READY → TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → HUMAN_FIXING → READY_FOR_TEST → TESTING → TEST_PASS → TASK_PASSED`

ERP-0001:

`TASK_PLANNED → GUIDE_READY → HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL → AGENT_FIXING → TESTING → TEST_PASS → TASK_PASSED`

ERP-0002:

`TASK_PLANNED → GUIDE_READY`

## Proven baseline gates

| Gate | Status | Evidence |
|---|---|---|
| Fetch/checkout | PASS | Human commit `1777fd4` was fetched from `origin/TEST`; correction is based on that exact source. |
| ERP-0001 static/write-set | PASS | Corrected expected production set; unexpected setup/generated noise removed; cumulative generated delta 0. |
| Restore | PASS_WITH_WARNINGS | Full Framework MSBuild restore exit 0; 18 known NU1902/NU1903 warnings recorded. |
| Debug/Release build | PASS_WITH_WARNINGS | Both exit 0; four pre-existing duplicate-using warnings remain. |
| Password helper unit checks | PASS | `9/0`. |
| DB regression | PASS | ERP-0000 scripts `001 → 004` executed twice on isolated LocalDB. |
| IIS Express identity E2E | PASS | Login/account state/legacy upgrade/password change/logout/anti-forgery journeys passed. |
| Final ERP-0001 gate | PASS | `39/0`, fixture/process/generated residue 0. |

## Active-task boundary

ERP-0002 creates `UserDirectory/v1`. It changes only the 11 production paths listed in `.ai-erp-workflow/tasks/ERP-0002-safe-user-directory.md`. It repairs explicit response DTOs, query validation, Dapper mapping, output total count, Angular enum/paging/error behavior, both live views, and the existing JavaScript syntax defect.

Anonymous Add/Update/Delete user mutations, authorization, password reset/MFA/lockout, employee directory repair, historic credential rotation and dependency vulnerability upgrades remain deferred. ERP-0003 must not begin until ERP-0002 has exact-fingerprint PASS evidence.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull branch TEST, tự triển khai ERP-0002 guide r01, sau đó gửi PROMPT 2.
