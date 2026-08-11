# ERP-0002 Test Report r01

## A. Test baseline

| Field | Evidence |
|---|---|
| Task | `ERP-0002 — Safe Paged User Directory Contract` |
| Branch | `TEST` |
| Human implementation | `d39b8ddd56c6c2fcfdb7f93bc442ae299ffb4c9a` |
| Tested correction HEAD | `2a2c9981d9d15020bd272320511af16244052e2f` |
| Source baseline | `9395988369a747c9796c1843ca6e519ca052f70b` |
| Production fingerprint | `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548` — SHA-256 of the sorted 11-path manifest recorded below |
| Tracked worktree | Clean after each gate |
| Ignored local inputs | Untracked `docs/markdowns/` and `prompts/`; excluded from production/test fingerprints and commits |

The human diff initially contained missing API total-count handling, an incorrect `Items` envelope, JavaScript/view contract mismatches, unsafe error handling and generated-file noise. The authorized correction commit repaired only ERP-0002 production scope, added independent test code, and restored generated files to the source baseline.

Production manifest:

```text
WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql  890996451df9eddec4ae4b8bfe3944d23d73875f27e5e5cce8623b090ad6e773
WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql     2724d7d3c2b80b40a62337644ceff28865d88620800d94f05885163489c5a683
WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs               fcde7c1e5fb9efe8e1954f91139521cc10dd92a9d82c9fffbed9c85d7b5a6db1
WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js                 f54c0c4c5f867043fd8d578db219187b29d937805751cf00faf4aeb010a738d3
WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs                      6520efb3706fbdc78a627c399816590a245fc1583bdef3c9ea0d0533bd4592e3
WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs                     a32f1ca4fdd13f3f4aec82da683cdc21eade4b8d8ebadc8afc82ab81b9301028
WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs                      df8a174ed43b91e312fd8384131fde8dd4aead4a47626edf2a621ec5fb512282
WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs                1035e21a6f0c6082555841984b714b16eb7337938a7eaf84064072343e184392
WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml                    19775f5c8e72ad1f24e47f090f27e05835f14cf403667655eb210e0e01fbcffc
WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml                    80958cde18f5a0eaf77291201ce1b5bc72c3333ded04c1c0a0e779ea228018f4
WISE_REPORT/Wise_Report/Wise_Report.csproj                              406449a6e6f2c349fe3bcdc052f763707c927aa3d11f9cd7ee2223e0afc82d73
```

Test-only diff:

- Added `WISE_REPORT/Tests/ERP-0002/ERP-0002.UserDirectoryContract.sql`.
- Added `WISE_REPORT/Tests/ERP-0002/Invoke-ERP0002UserDirectoryGate.ps1`.
- Added the `Regression` phase to the ERP-0001 harness without weakening any identity assertion.

## B. AC-to-test matrix

| AC | Evidence ID | Level | Result |
|---|---|---|---|
| AC-01 typed HTTP 200 page | API-01, API-02 | API/E2E | PASS |
| AC-02 exact four-field safe item | STATIC-06, API-04 | Static/security/API | PASS |
| AC-03 database total on first/later/empty pages | DB-02, API-03 | DB/API | PASS |
| AC-04 malformed/null query returns 400 | API-05 NULL/PAGE/SIZE/COLUMN/ENUM/SEARCH | API | PASS, 6/6 |
| AC-05 generic unexpected-error boundary | STATIC-08 | Static/security | PASS |
| AC-06 SQL metadata/search/sort/paging/output contract | STATIC-09, DB-01, DB-02 | Static/DB | PASS |
| AC-07 Angular numeric enum/error/total behavior | STATIC-10, E2E rendered journey | Static/E2E | PASS |
| AC-08 both live views use the safe contract | STATIC-11, E2E-03 | Static/E2E | PASS |
| AC-09 Dapper row and public DTO are separated | STATIC-05, STATIC-06, STATIC-08 | Static | PASS |
| AC-10 legacy restore/build/IIS | BUILD-01/02, E2E-01 | Build/E2E | PASS_WITH_WARNINGS |
| AC-11 ERP-0000 DB and ERP-0001 identity regression | DB-01, ERP-0001 Regression | DB/unit/E2E | PASS, identity `39/0` |
| AC-12 exact write-set/no secrets/no generated noise | STATIC-01/02/03/14/15 | Static/security | PASS |

No performance AC exists for ERP-0002.

## C. Execution evidence

Final ERP-0002 command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'WISE_REPORT/Tests/ERP-0002/Invoke-ERP0002UserDirectoryGate.ps1' -Phase All
```

Exit `0`; `SUMMARY PASS=36 FAIL=0`.

The harness executed these real commands/actions:

- Node syntax: `node.exe --check WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js` — exit `0`.
- Restore: Full Framework MSBuild `/t:Restore /p:RestorePackagesConfig=true` — exit `0`, 18 known NU1902/NU1903 package advisories.
- Debug and Release: Full Framework MSBuild `/t:Build` with outputs redirected to a temporary directory — both exit `0`; four pre-existing duplicate-using warnings in `EmployeeController.cs`.
- DB: `sqlcmd -S (localdb)\MSSQLLocalDB -E -b -V 11` ran `001 → 002 → 003 → 004` twice — all exit `0`.
- DB contract: `ERP-0002.UserDirectoryContract.sql` — exit `0`; output total, empty page, literal `%`, `_`, `[` search, soft-delete and rollback assertions passed.
- IIS Express: fresh Debug assembly deployed for the test only; authenticated API pages 1, 2 and 4 returned HTTP `200`, row counts `2/2/0`, filtered total remained `5`.
- Invalid API cases returned HTTP `400`: null body, page, size, column, enum and oversized search.
- Both authenticated user-list views returned HTTP `200` and rendered the safe status/paging contract.
- Final cleanup: fixture residue `0`, generated residue `0`, IIS process stopped and original tracked assembly restored.

Regression command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'WISE_REPORT/Tests/ERP-0001/Invoke-ERP0001IdentityGate.ps1' -Phase Regression
```

Exit `0`; `SUMMARY PASS=39 FAIL=0`, including password-helper unit `9/0`, LocalDB rerun, login/logout/change-password, legacy credential upgrade, anti-forgery, no fixture residue and no generated residue.

One earlier rerun was interrupted by an intentionally too-short command timeout and temporarily overlapped a second DB fixture run. It is not PASS evidence. The uninterrupted rerun above completed cleanly and is the authoritative result.

## D. Review findings

- Unexpected human diff: `.vs`, `bin`, `obj`, `.gitignore`, and an unrelated controller import were rejected/restored.
- Contract mismatches corrected: `Items` versus `Data`, missing Dapper output parameter, page-count versus filtered total, missing command timeout, numeric enum/Angular binding, wrong search function name and stale view status property.
- Security corrections: list mapping no longer uses generated `User`; response items have no password/hash; unexpected exception text is not serialized; browser error handling does not log response bodies.
- Remaining known debt: anonymous Add/Update/Delete user endpoints, password-bearing mutation forms, global authorization, package vulnerabilities, historic secret rotation, employee directory defects and EPPlus licensing are not solved by ERP-0002.

## E. Final status

`TEST_GATE: PASS`

This PASS is valid only for correction commit `2a2c9981d9d15020bd272320511af16244052e2f` with production fingerprint `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548`.
