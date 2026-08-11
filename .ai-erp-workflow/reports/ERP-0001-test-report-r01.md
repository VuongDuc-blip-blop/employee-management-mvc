# ERP-0001 Test Report r01

## A. Test baseline

| Field | Evidence |
|---|---|
| Task | `ERP-0001 — Secure Session Identity and Legacy Password Upgrade` |
| Branch / pulled HEAD | `TEST` / `1777fd4174381900a0a153575a0e6d02f2c2dc0e` |
| Guide source baseline | `8da86d39984eeead86a4fb36f11aa1478bb8eca8` |
| Initial working-tree fingerprint | `3b30f6ceef9c0eba2601d2a4a92acfd4102dd61df5da301a626bfce811d8efd9` |
| Final executable-source fingerprint | `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499` |
| Human production diff | 17 paths: eight expected paths, unexpected `IntiInfra.ps1`, and eight tracked `bin/obj` generated files |
| Corrected production diff | Exactly the eight guide paths relative to `8da86d3`; generated cumulative delta 0 |
| Test diff | Added `PasswordSecurity.Tests.ps1` and `Invoke-ERP0001IdentityGate.ps1`; this report/state summary is control-plane evidence |
| Local-only inputs | `docs/markdowns/` and `prompts/` remained untracked and untouched |

The PASS applies only to executable fingerprint `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499`.

## B. AC-to-test matrix

| AC | Evidence ID / level | Result |
|---|---|---|
| AC-01 salted PBKDF2, valid/wrong/malformed | UT-01…UT-05 / unit | PASS |
| AC-02 legacy MD5 verify-and-upgrade/no mutation on wrong | UT-06…UT-08, E2E-12/13, DB query / unit+E2E+DB | PASS |
| AC-03 typed login, anti-forgery, generic account-state failures | STATIC-05, E2E-02/03 / static+MVC E2E | PASS |
| AC-04 minimal session/no password HTML | STATIC-10/12, E2E-05 / static+E2E | PASS |
| AC-05 validated transactional change and forced fresh login | STATIC-07/09, E2E-09/10/11 / static+E2E+DB | PASS |
| AC-06 POST-only anti-forgery logout | STATIC-05, E2E-06/07/08 / static+E2E | PASS |
| AC-07 one form/token/autocomplete/no hidden password | STATIC-08/09/10, E2E-02/05 / static+Razor runtime | PASS |
| AC-08 exact project includes/no generated drift | STATIC-01/02/03/11 / static | PASS |
| AC-09 restore, Debug and Release | BUILD-01/02/03 / build | PASS_WITH_WARNINGS |
| AC-10 IIS critical journeys | E2E-01…13 / IIS Express E2E | PASS |
| AC-11 no raw/MD5 write outside legacy branch | STATIC-06/12, UT-07 / static+unit | PASS |
| AC-12 exact diff/no secret/generated noise | STATIC-01…04, final inventory / static | PASS |

No performance AC exists. No gate was waived or skipped.

## C. Execution evidence

### Initial evidence

1. `git diff --check 8da86d39984eeead86a4fb36f11aa1478bb8eca8..1777fd4174381900a0a153575a0e6d02f2c2dc0e`
   - Exit `2`.
   - Six trailing-whitespace findings in controller/login view.
2. Full Framework restore command below exited `0` with 18 NU1902/NU1903 vulnerability warnings.
3. Initial Debug build exited `0` with seven compiler warnings; build alone did not compile the broken Razor contract.
4. Static review failed legacy-upgrade, change validation, POST logout, view model/form, hidden-password and exact-write-set requirements.

### Final gate command

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "WISE_REPORT\Tests\ERP-0001\Invoke-ERP0001IdentityGate.ps1" -Phase All
```

Exit `0`; gate summary `PASS=39 FAIL=0`.

The gate executed these real commands/actions:

```powershell
& "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe" `
  "WISE_REPORT\Wise_Report.sln" /t:Restore /p:RestorePackagesConfig=true /m /nologo /v:minimal

& "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe" `
  "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Debug `
  "/p:OutputPath=<TEMP>\Debug\bin\" "/p:BaseIntermediateOutputPath=<TEMP>\Debug\obj\" `
  /m /nologo /v:minimal

& "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe" `
  "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Release `
  "/p:OutputPath=<TEMP>\Release\bin\" "/p:BaseIntermediateOutputPath=<TEMP>\Release\obj\" `
  /m /nologo /v:minimal
```

- Restore exit `0`; 18 known-package vulnerability warnings.
- Debug exit `0`; four pre-existing duplicate-using warnings in `EmployeeController.cs`.
- Release exit `0`; same four warnings.
- `PasswordSecurity.Tests.ps1`: exit `0`, `PASS=9 FAIL=0`.
- SQL order `001 → 002 → 003 → 004` executed twice using `sqlcmd -b -V 11`; all eight invocations exit `0`.
- Verifier and transaction smoke messages passed both rounds.
- IIS Express ran the freshly built assembly on a local random port; test deployment was restored byte-for-byte afterward.
- HTTP evidence: login GET `200`; invalid/account-state posts `200` with generic validation; valid PBKDF2/legacy posts `302`; HomeLayout `200`; missing-token logout rejected; valid logout `302`; GET logout `404`; valid password change `302`.
- Fixture cleanup query returned `0`; IIS process count returned `0`; generated cumulative diff count returned `0`.

## D. Review findings and corrections

| Severity | Finding at pulled commit | Correction |
|---|---|---|
| P0 | Legacy success returned `RequiresUpgrade=false`. | Return `legacySucceeded` as the upgrade flag; verified by unit and E2E DB mutation. |
| P0 | Logout had no `[HttpPost]`/anti-forgery and remained GET-callable. | Added both attributes; GET now 404 and missing token is rejected. |
| P0 | Change form omitted minimum 12 and confirmation comparison. | Added `MinimumLength=12` and `Compare("NewPassword")`. |
| P0 | Change view lacked typed model, nested two forms and referenced nonexistent `ConfirmPassword`. | Replaced with one complete typed Razor form using `ConfirmNewPassword`. |
| P0 | Layout still emitted `Session["password"]`. | Removed the hidden password field; runtime HTML scan passes. |
| P1 | Unexpected setup script and tracked build outputs violated write-set. | Removed `IntiInfra.ps1`; restored eight generated files to guide baseline bytes. |
| P1 | Six whitespace errors and duplicate/unused implementation usings. | Normalized scoped source; cumulative `git diff --check` passes. |
| Known debt | 18 vulnerable-package warnings; anonymous user-admin/password DTO/API issues remain. | Recorded for dependency-aware later tasks; no package scope expansion in ERP-0001. |

Tests were strengthened while correcting the implementation; no assertion was deleted or weakened.

## E. Final status

`TEST_GATE: PASS`

ERP-0001 may transition to `TASK_PASSED`. ERP-0002 may be planned only after the corrected ERP-0001 commit becomes its production-source baseline.
