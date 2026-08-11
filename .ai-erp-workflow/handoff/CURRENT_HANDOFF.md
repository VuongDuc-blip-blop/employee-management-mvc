# Current Handoff

## State

- Workflow: `GUIDE_READY`.
- Latest closed task: ERP-0002, PASS `36/0` plus ERP-0001 regression `39/0`.
- Tested production baseline: correction commit `2a2c9981d9d15020bd272320511af16244052e2f`.
- Tested production fingerprint: `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548`.
- Active task: `ERP-0003 — Angular Identity UX and User Excel Showcase`.
- Guide: `.ai-erp-workflow/tasks/ERP-0003-angular-identity-excel-showcase.md`, revision `r01`.

## Read first

1. `.ai-erp-workflow/tasks/ERP-0003-angular-identity-excel-showcase.md` — authoritative contract and complete typing guide.
2. `.ai-erp-workflow/PROJECT_STATE.md` — single-active-task state.
3. `.ai-erp-workflow/reports/ERP-0002-test-report-r01.md` — baseline PASS evidence.
4. `.ai-erp-workflow/DECISIONS.md` — DEC-031 through DEC-036.
5. `.ai-erp-workflow/PATTERN_CATALOG.md` — Excel technique safety/mastery classification.
6. `.ai-erp-workflow/TEST_STRATEGY.md` — ERP-0003 AC-to-test strategy.

## Human action

Pull branch `TEST` on the company machine. Confirm `WISE_REPORT` still matches production baseline `2a2c998` using STEP 00. Type ERP-0003 guide r01 exactly, run its static/build/DB/manual checkpoints, commit and push the 12-path production diff, then send PROMPT 2. Do not begin ERP-0004.

## Expected production write-set

ADD:

- `WISE_REPORT/Wise_Report/Controllers/UserExportController.cs`
- `WISE_REPORT/Wise_Report/Content/js/Identity/Identity.js`
- `WISE_REPORT/Wise_Report/Content/js/Projects/UserExcelShowcase.js`

MODIFY:

- `WISE_REPORT/Wise_Report/Controllers/HomeController.cs`
- `WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js`
- `WISE_REPORT/Wise_Report/Views/Home/Login.cshtml`
- `WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml`
- `WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml`
- `WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml`
- `WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml`
- `WISE_REPORT/Wise_Report/Web.config`
- `WISE_REPORT/Wise_Report/Wise_Report.csproj`

## Non-negotiable notes

- EPPlus 6.0.3 remains disabled in committed config until a real commercial license is confirmed. Never use `LicenseContext.NonCommercial` for company work.
- AngularJS owns browser interaction only. MVC anti-forgery, PBKDF2, server session and generic identity errors remain authoritative.
- Compatibility `.xls` techniques must be labelled honestly and built from fixed encoded data; no raw DOM/IE/GridView copy.
- Anonymous Add/Update/Delete user endpoints, authorization, employee directory and Excel import remain out of scope.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull TEST, tự triển khai ERP-0003 guide r01, push code, sau đó gửi PROMPT 2.
