# Current Handoff

## State

- Workflow: `GUIDE_READY` for ERP-0001.
- Active: `ERP-0001 — Secure Session Identity and Legacy Password Upgrade`.
- Exact production-source baseline: commit `09482ed60642ab3f6a3ff4a1956b421ecfb278df`; latest branch `TEST` additionally carries this guide/state handoff only.
- Prerequisite closed: ERP-0000 report r02 PASS at fingerprint `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`.
- Guide: `.ai-erp-workflow/tasks/ERP-0001-secure-session-identity.md`, revision r01.

## Read first

1. `.ai-erp-workflow/tasks/ERP-0001-secure-session-identity.md` — full guide r01 and AC contract.
2. `.ai-erp-workflow/PROJECT_STATE.md` — authoritative single-active-task state.
3. `.ai-erp-workflow/DECISIONS.md` — especially DEC-022 through DEC-025.
4. `.ai-erp-workflow/TEST_STRATEGY.md` — ERP-0001 independent verification matrix.

## Human action

On the company machine, pull branch `TEST`, verify the baseline commit named in the guide, type ERP-0001 production code exactly, then send PROMPT 2. Do not start ERP-0002 in the same implementation run.

## Expected implementation write-set

- Add `PasswordSecurity.cs`, `LoginForm.cs`, and `ChangePasswordForm.cs`.
- Modify only `Wise_Report.csproj`, `HomeController.cs`, `Login.cshtml`, `ChangePassword.cshtml`, and `_Layout.cshtml`.
- No SQL, package, EDMX, T4/generated C# or Angular change.

## Known blockers/debt

Anonymous user create/update endpoints still have unsafe credential semantics; ERP-0001 does not claim global authorization, account lockout, MFA or password reset. The user-directory password DTO, total count and enum mismatch remain ERP-0002 debt. Historic credentials must still be rotated outside Git.

WORKFLOW_STATE: GUIDE_READY
NEXT_HUMAN_ACTION: pull branch TEST, tự triển khai ERP-0001 guide r01, sau đó gửi PROMPT 2.
