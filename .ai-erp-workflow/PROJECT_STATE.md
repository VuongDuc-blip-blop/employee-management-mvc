# PROJECT STATE

| Field | Current value |
|---|---|
| Repository URL | `https://github.com/VuongDuc-blip-blop/employee-management-mvc` |
| Branch | `TEST` |
| Baseline SHA | `b06df0fdcb9f6997ad71c4eec421e385a233d2c8` |
| Working-tree fingerprint | `f1d0404ea974c349e91fb4690caa16f214a89bf2f0c81d2a1eb1b7844b4cc8f8` |
| Source working tree | Tracked source clean; only human-supplied `docs/markdowns/` and `prompts/` remain untracked; workflow artifacts locally excluded |
| Active task | `ERP-0000 — Safe Reproducible LocalDB Baseline` |
| Active task state | `GUIDE_READY` |
| Latest test report | `NONE` — Prompt 2 not run |
| Roadmap version | `1.0` — 2026-08-09 |
| Pattern catalog version | `1.0` — 2026-08-09 |
| Task guide revision | `r01` — adversarial corrections incorporated |
| Next required human action | Tự gõ toàn bộ guide r01, self-review exact write-set, rồi gửi PROMPT 2 |

## State history

`BOOTSTRAPPING → ROADMAP_READY → TASK_PLANNED → GUIDE_READY`

No transition to `HUMAN_IMPLEMENTING` has been made because this run did not edit production/test/SQL objects. Only one task is active. Do not select ERP-0001 until ERP-0000 becomes `TASK_PASSED` after independent test evidence.

## Baseline gates

| Gate | Status | Evidence |
|---|---|---|
| Fetch/checkout | PASS | `TEST`, exact SHA, origin tracking 0/0 at discovery |
| Source diff | PASS | No tracked source modification |
| Restore | NOT_PROVEN | Package cache exists; standalone NuGet absent; Prompt 2 must capture MSBuild restore |
| Debug build | PASS_WITH_WARNINGS | MSBuild exit 0; 4 duplicate-usings + 1 unused-variable warning |
| Application tests | ABSENT | No application-owned test project/runner |
| LocalDB engine | AVAILABLE | MSSQLLocalDB exists/runs |
| Target database | BLOCKED_BASELINE | `EmployeeManagementCoreDb` absent; ERP-0000 supplies guide |

## Release gate audit

Task Planner, Implementation Guide Engineer and Adversarial Reviewer completed. Reviewer initially held release for wrong JS anchor, database-level rollback, SQL/version/path inconsistency and validation ambiguity. Guide r01 now uses `Projects.js`, SQL 2012 placeholder + ALTER, DB-specific path, ownership token, strict source-derived sort, and transaction-wrapped exact-object rollback. Known API/UI/auth debts remain explicitly deferred.
