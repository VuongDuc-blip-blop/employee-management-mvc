# ERP-0000 Test Report r01

- Run date: `2026-08-10` (`Asia/Saigon`).
- Final gate: `FAIL_IMPLEMENTATION`.
- Tested branch: `TEST`.
- Tested HEAD: `5a708fc2fb8c326abfe1077b454ae81c5e78e0f6`.
- Guide baseline: `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`.
- Initial tracked working tree: clean.
- Initial dirty-working-tree fingerprint: `55687c5c719d1f2581d22147bccf3103287c52fc25ec3570f1d537c2be12cd0f`.
- Baseline-to-HEAD implementation-diff fingerprint: `6250581eaedef60edf3a0a7f7419a58004d805d44039a3082cc719a649384033`.
- Tester production edits: none.

This FAIL is valid only for the branch/HEAD and implementation-diff fingerprint above. Secret values are deliberately redacted from this report.

## 1. Baseline and diff audit

The implementation is three commits beyond the guide baseline. `git diff --shortstat b06df0f..5a708fc` reports `124 files changed, 97157 insertions(+), 5 deletions(-)`.

Expected production write-set intersection: 6 of 8 paths. Missing exact paths:

- `WISE_REPORT/Database/EmployeeManagementCoreDb/README.md`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/999_RollbackBaselineObjects.sql`

Unexpected substitutes and source-adjacent changes:

- root `README.md` instead of the database-local README;
- `999_RollbackiBaselineObjects.sql` instead of `999_RollbackBaselineObjects.sql`;
- `.gitignore`;
- two tracked `WISE_REPORT/Wise_Report/obj/Debug/*.cache` files;
- workflow/prompt files and an entire tracked `.ai-erp-workflow/build-probe/bin|obj` tree.

There are 118 unexpected baseline-to-HEAD paths and 106 generated/build-output paths. No route, bundle, project, EDMX/generated model, JS or view registration diff exists; no such registration was required for this database/config-only task.

Relevant production numstat:

| Path | Added | Deleted |
|---|---:|---:|
| `.gitignore` | 3 | 1 |
| `README.md` | 58 | 0 |
| `001_CreateEmployeeManagementCoreDb.sql` | 168 | 0 |
| `002_UpsertGetListUser.sql` | 99 | 0 |
| `003_VerifyBaseline.sql` | 434 | 0 |
| `004_TransactionalSmokeTest.sql` | 314 | 0 |
| `999_RollbackiBaselineObjects.sql` | 146 | 0 |
| `PushMessaging.cs` | 1 | 1 |
| `Web.config` | 6 | 3 |

The full relevant content diff was reviewed with secrets suppressed. `003_VerifyBaseline.sql`, `004_TransactionalSmokeTest.sql`, and the body of the misspelled rollback file match the guide materially. The defects below are in the other required operations and path inventory.

## 2. Tester-only diff

Added under the allowed test write-set:

- `WISE_REPORT/Tests/ERP-0000/Invoke-ERP0000DbContract.ps1` — static contract checks plus isolated LocalDB orchestration and ownership-guarded cleanup.
- `WISE_REPORT/Tests/ERP-0000/ERP-0000.DbContract.sql` — transaction-only FK/nullability/residue assertions.
- this versioned report and test summaries in state/task artifacts.

Tester file hashes at the execution checkpoint:

- `ERP-0000.DbContract.sql`: `f654a610d70877139c81cddb7b561617feb378b4ba847eee0e13f064cba68c3d`.
- `Invoke-ERP0000DbContract.ps1`: `269d5e00971c38fa3b6c24a1dc3fb1669ef8f0d3a28c625e97e250c4cb69bd32`. The executed pre-cleanup-enhancement revision was `7f083d697e152b426b3e59de0629fafaf76d7bbc0e138dd4c716041c539d8eeb`; later changes add unique-instance ownership-guarded cleanup and detect severity 11–15 SQL errors even when `sqlcmd -V 16` returns process exit 0. No assertion was weakened.

## 3. AC-to-test matrix

| AC | Evidence ID | Level | Result | Evidence |
|---|---|---|---|---|
| AC-01 | STATIC-CONFIG-CONTRACT, STATIC-SECRET-SCAN | Static/security | FAIL | XML is well formed, but top-level `TestEntities` count is 0, one unsafe active top-level connection remains, and five scoped credential-bearing lines remain (values redacted). |
| AC-02 | STATIC-EXPECTED-FILES, STATIC-WRITE-SET, STATIC-GENERATED-NOISE | Static | FAIL | Two required paths missing; 118 unexpected paths; 106 generated/build paths. |
| AC-03 | DB-FORWARD-001/002, rerun gate | DB integration | FAIL | Fresh isolated forward cannot complete; 001 exits 16. A valid second forward run is impossible. |
| AC-04 | STATIC-SCHEMA-SCRIPT, DB-VERIFY-003 | DB metadata | FAIL | History table name is singular and Users create guard is inverted; verifier exits 16. |
| AC-05 | DB-03, DB-TEST-CONTRACT | DB integrity | FAIL | Required schema is absent after forward failure, so FK/nullability contract cannot pass. |
| AC-06 | STATIC-PROCEDURE-SCRIPT, DB-FORWARD-002 | DB metadata/security | FAIL | Procedure source has invalid result-list syntax, wrong parameter type, missing PageSize bound and wrong wildcard escape. |
| AC-07 | DB-SMOKE-004 | DB behavior | FAIL | Smoke test exits 16 before search/soft-delete assertions because the procedure contract is invalid. |
| AC-08 | STATIC-PROCEDURE-SCRIPT, DB-SMOKE-004 | DB behavior | FAIL | Required PageSize validation is absent and paging smoke cannot execute. |
| AC-09 | DB-SMOKE-004 | DB behavior | FAIL | Sort/tie-break assertions cannot execute against the invalid procedure. |
| AC-10 | DB-SMOKE-004, isolated-instance cleanup | DB integrity | FAIL | Test infrastructure cleanup passes, but the required application smoke fixture/residue contract never runs. |
| AC-11 | DB-VERIFY-003 | DB negative/positive | FAIL | Verifier correctly exits nonzero against the actual broken baseline, but there is no passing correct-baseline half. |
| AC-12 | DB-ROLLBACK-GUARD/CONFIRMED/REBOOTSTRAP | DB safety | FAIL | Wrong-confirmation guard preserves objects, but required rollback path is missing and rebootstrap cannot pass. |
| AC-13 | RESTORE-01, BUILD-01, STATIC-GENERATED-NOISE | Build/regression | FAIL | Restore/build exit 0, but the criterion also forbids tracked build artifacts; 106 are present. |
| AC-14 | IT-01 | API E2E | FAIL | IIS Express is available; numeric-enum POST returns HTTP 500, not 200. |
| AC-15 | STATIC-WRITE-SET, STATIC-SECRET-SCAN, STATIC-GENERATED-NOISE | Static/security | FAIL | Unexpected diff, active sensitive config and tracked generated output remain. |

No performance AC exists for ERP-0000. No application-owned unit test project or test assembly exists, so unit/vstest execution is `SKIP_ABSENT` with 0 tests discovered and does not override the failing script/integration gates.

## 4. Execution evidence

### 4.1 Static and inventory

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "WISE_REPORT\Tests\ERP-0000\Invoke-ERP0000DbContract.ps1" -Phase Static
```

Exit `1`; `PASS=1 FAIL=8 SKIP=0`.

- PASS: XML well-formedness only.
- FAIL: expected files, write-set, generated noise, config contract, secret scan, schema source, procedure source and diff check.
- `git diff --check ...` exits `2`, identifying trailing whitespace/new-EOF whitespace in 001/002.

Inventory commands and exits:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff --shortstat b06df0fdcb9f6997ad71c4eec421e385a233d2c8 HEAD
git diff --name-status b06df0fdcb9f6997ad71c4eec421e385a233d2c8 HEAD -- WISE_REPORT/Database/EmployeeManagementCoreDb WISE_REPORT/Wise_Report/Web.config WISE_REPORT/Wise_Report/PushMessaging.cs README.md .gitignore
```

All exit `0`. Branch/HEAD and counts are recorded above. Before tester artifacts, tracked status was clean. After tests, only allowed tester/report/state artifacts are dirty/untracked; production remains identical to tested HEAD.

Test discovery:

```powershell
Get-ChildItem -Recurse -Filter *.csproj | Where-Object { $_.FullName -match '(?i)(test|spec)' }
Get-ChildItem -Recurse -File -Include '*test*.dll','*tests*.dll'
```

Exit `0`; test projects `0`, test assemblies `0`.

### 4.2 Restore and build

```powershell
& 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Restore /p:RestorePackagesConfig=true /m /nologo /v:minimal
```

Exit `0`; 18 NU1902/NU1903 vulnerability warnings involving legacy packages.

```powershell
& 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Debug '/p:OutputPath=C:\Users\VUONGV~1\AppData\Local\Temp\OpenERP-ERP0000-build-r01\bin\' '/p:BaseIntermediateOutputPath=C:\Users\VUONGV~1\AppData\Local\Temp\OpenERP-ERP0000-build-r01\obj\' /m /nologo /v:minimal
```

Exit `0`; 5 compiler warnings: four CS0105 duplicate-usings and one CS0168 unused variable. Build output was redirected outside the repository.

### 4.3 Isolated LocalDB lifecycle

Primary isolated run used instance `ERP0000_Test_5a708fc2`:

```powershell
sqllocaldb create ERP0000_Test_5a708fc2
sqllocaldb start ERP0000_Test_5a708fc2
sqlcmd -S "(localdb)\ERP0000_Test_5a708fc2" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\001_CreateEmployeeManagementCoreDb.sql"
sqlcmd -S "(localdb)\ERP0000_Test_5a708fc2" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql"
sqlcmd -S "(localdb)\ERP0000_Test_5a708fc2" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql"
sqlcmd -S "(localdb)\ERP0000_Test_5a708fc2" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
sqllocaldb stop ERP0000_Test_5a708fc2 -k
sqllocaldb delete ERP0000_Test_5a708fc2
```

Results:

- create/start: exit `0`/`0`;
- 001: exit `16`, FK references invalid `dbo.Users`;
- 002: process exit `0` despite emitted severity-15 syntax errors near the malformed result list/FETCH; it leaves a zero-parameter placeholder procedure;
- 003: exit `16`, exactly five required tables are not present;
- 004: exit `16`, `GetListUser` has no parameters;
- stop/delete: exit `0`/`0`, no LocalDB instance residue.

Rollback probes:

- exact expected rollback path: exit `1` because the file is missing;
- misspelled actual file with wrong confirmation: exit `16`, object-preservation query exit `0`;
- misspelled actual file with explicit confirmations: exit `0`, catalog retained and partial procedure removed;
- rebootstrap: cannot pass because 001 remains defective.

A later harness reproducibility run created and removed `ERP0000_Test_842c88abd270` successfully, but 001 exited `16` earlier due to a stale default MDF path left by the prior isolated catalog. Downstream commands exited `16`; harness summary was `PASS=5 FAIL=5 SKIP=0`. This secondary condition does not change the implementation verdict: the primary clean isolated run already reached and proved the inverted Users guard failure. The final tester harness now drops only an exact token-owned database before deleting its unique instance, preventing such residue on future clean runs.

Final harness validation used `ERP0000_Test_f7204901ee75`: exit `1`, `PASS=6 FAIL=5 SKIP=0`. It independently reproduced 001 exit 16, detected the 002 severity-15 SQL errors despite process exit 0, reproduced verifier/smoke/contract exit 16, then dropped only the token-owned test database and removed the instance. A guarded cleanup also removed the earlier token-owned orphan MDF/LDF. Final residue checks: MDF absent, LDF absent, ERP0000 LocalDB instance count 0.

### 4.4 Configuration and API E2E

Semantic configuration access failed because the expected top-level `TestEntities` connection is absent; raw XML parsing alone passes. Static inspection shows a nested `connectionStrings` section plus one active remote credential-bearing top-level connection. Values are not reproduced.

IIS Express probe:

```powershell
Start-Process 'C:\Program Files (x86)\IIS Express\iisexpress.exe' -ArgumentList '/path:"<repository>\WISE_REPORT\Wise_Report" /port:51247 /systray:false'
# POST numeric-enum request to http://localhost:51247/api/Api_UserController/GetListUser
```

IIS Express was available and cleaned up. The API request returned HTTP `500`; E2E exit `1`. Therefore AC-14 is an implementation failure, not an environment block.

## 5. Review findings and root-cause candidates

### Blocking implementation findings

1. `001_CreateEmployeeManagementCoreDb.sql` creates `dbo.__EFMigrationHistory` (singular) and uses `IS NOT NULL` for the `dbo.Users` create guard. A clean catalog therefore lacks Users and FK creation fails.
2. `002_UpsertGetListUser.sql` omits a comma after `Username`, lacks the PageSize 1..200 rejection, declares the sort direction with the wrong SQL type and escapes `*` instead of the `_` LIKE wildcard. `sqlcmd -b -V 16` can return 0 for its severity-15 parse errors, so log inspection is mandatory.
3. `Web.config` nests a second `connectionStrings` section and leaves an active remote credential-bearing connection. `TestEntities` is not a valid top-level connection.
4. Required README/rollback filenames are wrong. This breaks documented execution and rollback commands.
5. The baseline-to-HEAD diff contains generated binaries/caches and unrelated workflow/prompt changes, violating the write-set and regression hygiene contract.

### Security/data-integrity and regression risks

- Current config still exposes active sensitive connection material; deletion from `PushMessaging.cs` succeeded, but config cleanup did not.
- Committed secret removal would not rotate historical credentials; rotation remains an external human action.
- The broken bootstrap prevents verification of exact schema/FKs and all behavioral DB assertions.
- The API still returns HTTP 500 under the required journey.
- Legacy package vulnerability warnings remain debt; they did not cause this gate failure.

## 6. Final decision

`TEST_GATE: FAIL_IMPLEMENTATION`

Exact failing evidence: `STATIC-EXPECTED-FILES`, `STATIC-WRITE-SET`, `STATIC-GENERATED-NOISE`, `STATIC-CONFIG-CONTRACT`, `STATIC-SECRET-SCAN`, `STATIC-SCHEMA-SCRIPT`, `STATIC-PROCEDURE-SCRIPT`, `STATIC-DIFF-CHECK`, `DB-FORWARD-001`, `DB-FORWARD-002` by SQL error log, `DB-VERIFY-003`, `DB-SMOKE-004`, `DB-TEST-CONTRACT`, rollback/rebootstrap lifecycle, and `IT-01`.

No corrective implementation guide is included; that belongs to PROMPT 3. ERP-0000 remains the only active task.
