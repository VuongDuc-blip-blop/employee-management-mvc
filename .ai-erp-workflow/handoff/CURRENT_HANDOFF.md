# Current Handoff

## State

- Workflow: `GUIDE_READY`.
- Active: `ERP-0002 — Safe Paged User Directory Contract`.
- Production-source baseline: `347a41dff8e96b554d01650d4d7943425ec2b1ad`.
- Latest closed task: ERP-0001, PASS `39/0` at executable fingerprint `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499`.
- Guide: `.ai-erp-workflow/tasks/ERP-0002-safe-user-directory.md`, revision `r01`.

## Read first

1. `.ai-erp-workflow/tasks/ERP-0002-safe-user-directory.md` — authoritative contract and full implementation guide.
2. `.ai-erp-workflow/PROJECT_STATE.md` — authoritative single-active-task state.
3. `.ai-erp-workflow/DECISIONS.md` — DEC-028 through DEC-030.
4. `.ai-erp-workflow/TEST_STRATEGY.md` — ERP-0002 AC-to-test plan.
5. `.ai-erp-workflow/reports/ERP-0001-test-report-r01.md` — required regression baseline.

## Human action

Pull branch `TEST`. Confirm the `WISE_REPORT` production tree matches commit `347a41d` as instructed in guide STEP 00. Type every ERP-0002 operation in order, run the documented checkpoints, commit/push the implementation, then send PROMPT 2. Do not begin ERP-0003.

## Expected production write-set

ADD:

- `WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs`
- `WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs`

MODIFY:

- `WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql`
- `WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs`
- `WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs`
- `WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs`
- `WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js`
- `WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml`
- `WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml`
- `WISE_REPORT/Wise_Report/Wise_Report.csproj`

## Known debt

Anonymous Add/Update/Delete user endpoints still have unsafe credential/authorization semantics and must not reuse list DTO data. Global authorization, lockout/MFA/reset, employee API repair, historic credential rotation and package vulnerability upgrades are not claimed by ERP-0002.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull branch TEST, tự triển khai ERP-0002 guide r01, sau đó gửi PROMPT 2.
