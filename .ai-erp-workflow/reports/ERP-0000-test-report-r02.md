# ERP-0000 Test Report r02

- Run date: `2026-08-10` (`Asia/Saigon`).
- Branch: `TEST`.
- Pre-commit HEAD: `5a708fc2fb8c326abfe1077b454ae81c5e78e0f6`.
- Guide baseline: `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`.
- Tested source fingerprint: `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`.
- Final result: `TEST_GATE: PASS`.

The fingerprint is a SHA-256 manifest of the eight production paths and two ERP-0000 test-only paths. Workflow/report edits made after the test do not change this executable-source fingerprint. Secret values are not reproduced.

## Corrective implementation summary

- Replaced 001 with the guide-r01 SQL Server 2012-compatible five-table bootstrap, including the plural `__EFMigrationsHistory` object and correct `dbo.Users IS NULL` guard.
- Replaced 002 with the exact five-parameter procedure contract, strict page validation, literal wildcard escaping, deterministic order and password-free result metadata.
- Moved README and rollback scripts to their exact required paths.
- Replaced the active connection section with one `TestEntities` LocalDB integrated-security connection and removed credential-bearing fragments from current `Web.config`/`PushMessaging.cs`.
- Removed committed workflow build-probe output and restored legacy generated cache paths to their baseline content, so no generated-file delta remains.
- Expanded tester-only orchestration to cover rerun, negative rollback confirmation, confirmed rollback, negative verifier and rebootstrap without weakening assertions.

## AC-to-test matrix

| AC | Evidence | Result |
|---|---|---|
| AC-01 | STATIC-CONFIG-XML, STATIC-CONFIG-CONTRACT, STATIC-SECRET-SCAN | PASS |
| AC-02 | STATIC-EXPECTED-FILES, STATIC-WRITE-SET | PASS |
| AC-03 | DB-FORWARD-001..004, DB-RERUN-* | PASS |
| AC-04 | DB-VERIFY-003 metadata verifier | PASS |
| AC-05 | DB-VERIFY-003, DB-TEST-CONTRACT | PASS |
| AC-06 | STATIC-PROCEDURE-SCRIPT, DB-VERIFY-003 | PASS |
| AC-07 | DB-SMOKE-004 | PASS |
| AC-08 | DB-SMOKE-004 paging/validation assertions | PASS |
| AC-09 | DB-SMOKE-004 sort/tie-break assertions | PASS |
| AC-10 | DB-SMOKE-004, DB-TEST-CONTRACT and residue cleanup | PASS |
| AC-11 | DB-VERIFY-003 and DB-VERIFIER-REJECTS-ROLLED-BACK-CONTRACT | PASS |
| AC-12 | DB-ROLLBACK-WRONG-CONFIRMATION, DB-ROLLBACK-CONFIRMED, DB-REBOOTSTRAP-* | PASS |
| AC-13 | RESTORE-01, BUILD-DEBUG, BUILD-RELEASE, STATIC-GENERATED-NOISE | PASS |
| AC-14 | API-E2E-NUMERIC-ENUM | PASS |
| AC-15 | STATIC-WRITE-SET, STATIC-SECRET-SCAN, STATIC-DIFF-CHECK | PASS |

Application-owned unit tests remain absent (`0` discovered); no ERP-0000 AC requires an unavailable unit runner. The mandatory DB/API automated seams all ran and passed. No performance AC applies.

## Execution evidence

### Static + database lifecycle

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "WISE_REPORT\Tests\ERP-0000\Invoke-ERP0000DbContract.ps1" -Phase All
```

Exit `0`; `PASS=33 FAIL=0 SKIP=0`.

The run created a unique LocalDB instance, executed 001→004, independent DB integrity checks, a second forward cycle, rejected rollback with `ConfirmRollback=NO`, proved the baseline remained valid, executed confirmed rollback, proved the verifier rejected the missing contract, rebootstrapped 001→004, reran the independent contract, then removed only the exact token-owned test database and instance. Final test-instance residue: `0`.

### Restore and build

```powershell
& 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Restore /p:RestorePackagesConfig=true /m /nologo /v:minimal
```

Exit `0`; 18 NU1902/NU1903 legacy-package vulnerability warnings captured.

```powershell
& 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Debug /p:OutputPath=<TEMP>\Debug\bin\ /p:BaseIntermediateOutputPath=<TEMP>\Debug\obj\ /m /nologo /v:minimal
& 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Release /p:OutputPath=<TEMP>\Release\bin\ /p:BaseIntermediateOutputPath=<TEMP>\Release\obj\ /m /nologo /v:minimal
```

Debug exit `0`; Release exit `0`; each reports four CS0105 warnings and one CS0168 warning. Output was redirected outside the repository. Baseline-tracked cache files were restored byte-for-byte after build; generated delta count is `0`.

### IIS Express/API E2E

The test ownership-checked `(localdb)\MSSQLLocalDB`, executed 001→004, started IIS Express hidden on port 51249, and posted:

```json
{"SearchKeyword":"","PageIndex":1,"PageSize":20,"SortColumn":"USERNAME","SortDirection":1}
```

Result: HTTP `200`, data count `0`, non-null password count `0`, API E2E exit `0`. IIS process and the token-owned test database were removed; default test catalog state returned to `ABSENT`.

## Security and regression notes

- Current scoped credential-fragment count: `0`.
- Exactly one active top-level `TestEntities` connection exists and uses LocalDB integrated security.
- Previously committed credentials must still be rotated externally; source cleanup does not rotate history.
- Legacy package vulnerability warnings remain backlog debt and were not hidden.
- Current UI still sends `"ASC"`; numeric-enum API E2E is the documented ERP-0000 seam. UI/API contract repair remains ERP-0002.

## Decision

All mandatory ACs have executable evidence for the exact tested source fingerprint. No required test is skipped and no test assertion was weakened.

`TEST_GATE: PASS`
