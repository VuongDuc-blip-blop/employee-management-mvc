# PROJECT STATE

| Field | Current value |
|---|---|
| Repository | `https://github.com/VuongDuc-blip-blop/employee-management-mvc` |
| Branch | `TEST` |
| Planning baseline | `ccccf464b8d6efdf76e1b809ee2286dadebb54f6`; `origin/TEST` matched at guide discovery |
| Production fingerprint | `b07b768dd253fcf3c42386fb26d9de301f7898b480524c58bcfc7a57371fc5c7` |
| Working tree at baseline | Pre-existing user-owned `M .gitignore`; preserved and outside ERP-0004 write-set |
| Latest proven closed task | `ERP-0002 — Safe Paged User Directory Contract`, `TASK_PASSED` |
| Latest valid test report | `.ai-erp-workflow/reports/ERP-0002-test-report-r01.md`; PASS is not transferable to current HEAD |
| Superseded/stale plan | `ERP-0003 — Angular Identity UX and User Excel Showcase`, `STALE_UNVERIFIED`; no PASS claim |
| Active task | `ERP-0004 — Sales Order Approval & Employee Sales Reporting` |
| Active task state | `GUIDE_READY` |
| Central task file | `.ai-erp-workflow/tasks/ERP-0004-sales-order-employee-sales-reporting.md` |
| Active guide revision | `r01`: `guides/ERP-0004-r01/00-overview-preflight.md`, `01-database.md`, `02-application-ui.md` |
| Roadmap | Existing roadmap intentionally not advanced; human-priority DEC-037 temporarily bypasses ordering |
| Pattern catalog | `1.7`: ERP-0004 WEB-042–048 and DB-036–042 are `PLANNED`, never `MASTERED` before test PASS |
| Next human action | Type all six ERP-0004 work packages on the exact baseline, push implementation, then send PROMPT 2. |

## State history

- ERP-0000: `TASK_PASSED` at its recorded tested fingerprint.
- ERP-0001: `TASK_PASSED` at its recorded tested fingerprint.
- ERP-0002: `TASK_PASSED` at fingerprint `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548`.
- ERP-0003: `TASK_PLANNED → GUIDE_READY → STALE_UNVERIFIED`; later source exists, but no current exact-fingerprint report proves PASS.
- ERP-0004: `HUMAN_PRIORITY_REQUESTED → TARGETED_DISCOVERY → TASK_PLANNED → GUIDE_REVIEW → GUIDE_READY`.

DEC-037 is the explicit workflow exception that activates ERP-0004 without inventing an ERP-0003 PASS transition. ERP-0004 remains the only active task until Prompt 2 produces a valid report. Do not choose a next task in the implementation or test run.

## Baseline evidence

| Gate | Status | Evidence |
|---|---|---|
| Fetch/branch/SHA | PASS | `TEST`, HEAD and `origin/TEST` all `ccccf464...` at discovery. |
| Dirty-tree inventory | PASS_WITH_PRESERVED_DIFF | Only pre-existing `.gitignore` was tracked-dirty; planning changes are ignored workflow artifacts. |
| Restore | PASS_WITH_WARNINGS | Full-framework MSBuild restore exit 0; 18 NU1902/NU1903 package advisories remain debt. |
| Debug baseline build | PASS_WITH_WARNINGS | Redirected full-framework build exit 0; 6 existing compiler warnings. |
| Baseline JavaScript syntax | PASS | Identity.js, EmployeeController.js and UserExcelShowcase.js Node probes exit 0. |
| Physical LocalDB read probe | PASS_WITH_CONFLICTS | Five baseline tables + only GetListUser; Users lacks source-required Profile; GetListEmployee absent. |
| ERP-0004 DB guide payload QA | PASS | 005/006/007/008/998 parse exit 0; isolated LocalDB 001–008, verifier, smoke, rerun and guarded 998 all exit 0 with cleanup complete. |
| ERP-0004 app guide payload QA | PASS | 31 C# syntax trees compile in-memory with 0 errors/0 warnings; four complete JavaScript payloads pass `node --check`. |
| ERP-0004 adversarial release review | PASS_WITH_KNOWN_DEBT | 0 blocker, 0 major; DB/app contracts and exact write-set are coherent; stale-token scan clean. |
| ERP-0004 implementation/test | NOT_RUN | Guide run did not modify production/test/SQL objects and cannot claim implementation PASS. |

## Active capability and fixed boundaries

ERP-0004 creates a minimal but server-enforced admin/employee session actor, dedicated Employee account bind/rebind, employee-owned Pending order creation, admin approval/rejection, ApprovedAt-based employee sales reports and bounded formula-safe client `.xlsx` export.

Fixed design decisions:

- Dapper/stored-procedure-only reads for every new principal/account/order/report/export path; no order EDMX mapping.
- Admin is the active approved SeededAdmin ID; employee is an active approved Employee.UserId binding; unassigned login fails closed.
- Account optimistic token is lossless SQL `binary(9)`/base64; order `rowversion` is `binary(8)`.
- Create uses ClientRequestId + canonical SHA-256 payload hash; review transitions are rowversion-guarded and same-decision retry-safe.
- Sales eligibility is Approved only, recognized at ApprovedAt UTC and grouped on Vietnam UTC+07 boundaries.
- Report offers arbitrary day, arbitrary month and custom range; export is four fixed sheets, formula-neutralized and capped at 10,000 rows.
- Existing anonymous legacy User/Employee Web API, full RBAC, product/customer master data, tax/payment/inventory/accounting and EPPlus licensing remain explicit debt/out of scope.

## Guide artifacts

1. `00-overview-preflight.md`: baseline fingerprint, exact operation order, checkpoints, expected objects/diff and human checklist.
2. `01-database.md`: exact modified 001/003/README blocks and full 005/006/007/008/998 SQL.
3. `02-application-ui.md`: exhaustive 43-operation manifest and full C#/AngularJS/Razor/CSS/csproj payloads.

All three files plus the central task are normative revision r01. If branch, SHA, modified-file hash or source anchor differs, stop and regenerate; do not improvise around drift.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: tự triển khai guide, sau đó gửi PROMPT 2.
