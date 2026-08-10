# Current Handoff

## State

- Workflow: `GUIDE_READY`.
- Active: `ERP-0000 — Safe Reproducible LocalDB Baseline`.
- Baseline: branch `TEST`, SHA `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`.
- Human mode: tự gõ production/SQL/config.
- Tester mode: only test-only code/report after PROMPT 2; never production edits.

## Read first

1. `.ai-erp-workflow/tasks/ERP-0000-safe-reproducible-localdb-baseline.md` — central task + complete guide r01.
2. `.ai-erp-workflow/PROJECT_STATE.md` — authoritative state.
3. `.ai-erp-workflow/DECISIONS.md` — especially DEC-015…018 review corrections.
4. `.ai-erp-workflow/TEST_STRATEGY.md` — independent verification matrix.

## Human action

Verify SHA/fingerprint; type steps 01–08 exactly; run step 09 only after reviewing local-only guards; capture results. Do not edit generated EF files or expand missing SP/auth/UI scope. Then send PROMPT 2.

## Expected implementation write-set

- Add six files under `WISE_REPORT/Database/EmployeeManagementCoreDb`.
- Modify only `WISE_REPORT/Wise_Report/Web.config` and one commented secret line in `WISE_REPORT/Wise_Report/PushMessaging.cs`.
- No project/package/EDMX/T4/generated C#/JS/view/test change.

## Known blockers/debt

Restore reproducibility and tests are not proven. Current UI sends an enum string inconsistent with the C# enum contract; API still has password-shaped DTO, page-count total and exception leakage; authentication/password storage/hard-delete remain critical; four other called procedures lack source definitions. These are not ERP-0000 completion claims.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: tự triển khai guide, sau đó gửi PROMPT 2.
