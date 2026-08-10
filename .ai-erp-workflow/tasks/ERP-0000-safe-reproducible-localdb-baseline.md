# ERP-0000 — Safe Reproducible LocalDB Baseline

## 1. Metadata và state history

| Field | Value |
|---|---|
| Task ID | ERP-0000 |
| Provenance | `REPO_EXISTING` + baseline-enabling |
| Active state | `TASK_PASSED` |
| Human effort | 6–8 giờ |
| Risk | Medium; destructive recovery được cô lập và double-confirmed |
| Produced capability | `LocalDatabaseBaseline/v1` |
| Consumed capability | Legacy Debug build hiện pass với package cache cục bộ |
| Guide revision | `r01`, 2026-08-09 |

State history:

1. `BOOTSTRAPPING` — checkout/source/reference discovery.
2. `ROADMAP_READY` — inventory, pattern catalog, capability map và roadmap hợp nhất.
3. `TASK_PLANNED` — scope/AC/write-set được Task Planner khóa.
4. `GUIDE_READY` — guide r01 được Implementation Guide Engineer soạn và Adversarial Reviewer review một vòng; corrections được hợp nhất.
5. `HUMAN_IMPLEMENTING` — human tự triển khai production theo guide.
6. `READY_FOR_TEST` — human gửi PROMPT 2 cho active task duy nhất.
7. `TESTING` — tester khóa fingerprint, thêm test-only harness và chạy static/build/DB/API gates.
8. `TEST_FAIL` — implementation không đạt mandatory AC; không chuyển task.
9. `HUMAN_FIXING` — human explicitly authorized the agent to apply the corrective production delta.
10. `READY_FOR_TEST` → `TESTING` — corrected source was tested without weakening assertions.
11. `TEST_PASS` — report r02 records all ACs passing for fingerprint `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`.
12. `TASK_PASSED` — LocalDatabaseBaseline/v1 is available; ERP-0001 may be planned.

Tested source: branch `TEST`, HEAD `5a708fc2fb8c326abfe1077b454ae81c5e78e0f6`, implementation-diff fingerprint `6250581eaedef60edf3a0a7f7419a58004d805d44039a3082cc719a649384033`. Tester không sửa production source.

## 2. Baseline SHA

- Branch: `TEST`.
- Commit: `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`.
- Planning fingerprint: `f1d0404ea974c349e91fb4690caa16f214a89bf2f0c81d2a1eb1b7844b4cc8f8`.
- Reference hashes: `web.md` = `69D7F80023C6A1227B42AF464D74CAE7AE364192EE5856101455DC610A924C44`; `db.md` = `8D513E518F8F6B21096FB8A2DD0B9F57E78A85ACFC61424E1EA0B44A701F741E`.

Nếu branch/SHA hoặc source file anchors đã đổi, không áp dụng guide máy móc; regenerate guide từ source mới.

## 3. Business context và user journey

Solution compile nhưng clone mới không có cách dựng `EmployeeManagementCoreDb`. EDMX ánh xạ năm table, active user-list API gọi `dbo.GetListUser`, trong khi repository không chứa DDL/SP tương ứng. Developer vì vậy gặp lỗi database/object/procedure trước khi có thể kiểm thử một ERP journey.

Journey baseline mục tiêu:

1. Developer checkout đúng baseline và có SQL Server LocalDB.
2. Human tự gõ bộ script versioned, review rồi chạy theo README.
3. Database/schema khớp EDMX, `dbo.GetListUser` có contract an toàn.
4. Verifier và transaction-only smoke test chứng minh metadata, filtering, paging và rollback.
5. Application vẫn build; API caller có persistence seam để ERP-0001/0002 tiếp tục.

## 4. Goal

Tạo một LocalDB baseline có thể bootstrap, verify, rollback exact objects và bootstrap lại; bám storage contract của EDMX; cung cấp duy nhất `dbo.GetListUser`; loại credential-bearing connection fragments khỏi current config/comment mà không sửa application logic, generated EF files hoặc test code trong run planning này.

## 5. Scope

- Thêm README và năm SQL files dưới `WISE_REPORT/Database/EmployeeManagementCoreDb`.
- Tạo database khi absent; tạo năm table, năm PK và đúng hai FK được EDMX chứng minh.
- Tạo/alter `dbo.GetListUser` theo active Dapper caller.
- Verify exact column/type/nullability, PK, FK, procedure parameters/result shape.
- Transaction-only smoke data; không để persistent seed.
- Guarded object-level rollback trên exact LocalDB/catalog; giữ database catalog.
- Sau human implementation: thay `Web.config` bằng một EntityClient LocalDB connection và xóa obsolete credential-bearing comment line trong `PushMessaging.cs`.

## 6. Out of scope

- Không sửa C#/JavaScript/Razor/EDMX/T4/generated entity/project/package trong task này, ngoại trừ xóa một **commented secret line** ở `PushMessaging.cs`.
- Không tạo `GetListEmployee`, `Proc_List_Departments01`, `Proc_List_Departments_Count` hoặc `Proc_Get_Report_Header`; semantics chưa đủ.
- Không sửa login/password hashing/authorization/API exception envelope.
- Không sửa Angular payload `SortDirection: "ASC"`, DTO `Password`, hoặc API `TotalData` page-count defect.
- Không thêm inferred EmployeeUnits FK/index hoặc cải thiện `nvarchar(max)` mà không refresh EDMX contract.
- Không dùng Code First migration cũ, không sửa unrelated `create_sample_data.sql`.
- Không chạy script trên remote/shared/staging/production SQL Server.

## 7. Dependencies và assumptions

- Windows user có `(localdb)\MSSQLLocalDB`, `sqllocaldb`, `sqlcmd`, VS/MSBuild compatible .NET Framework 4.8.
- Target catalog duy nhất: `EmployeeManagementCoreDb`; schema `dbo`; SQL Server 2012 compatibility.
- EDMX storage schema là compatibility contract hiện tại, không phải thiết kế tối ưu cuối cùng.
- `Employees.UserId` nullable; `Units.ParentUnitId` required; không cascade.
- Dapper bỏ qua extra `TotalCount` và để `User.Password = null` khi result không có `Password`.
- Removal khỏi current tree không thu hồi credential đã lộ; human phải rotate/revoke ngoài repo.
- Human tự gõ production/SQL; tester chỉ được tạo/sửa test-only code sau PROMPT 2.

## 8. Existing repository evidence

| Evidence | Meaning |
|---|---|
| `WISE_REPORT/Wise_Report/Wise_Report.csproj:2-20,52-60` | non-SDK ASP.NET Web App, .NET Framework 4.8, Dapper/EF references |
| `WISE_REPORT/Wise_Report/packages.config:6-7` | Dapper 1.60.1, EF 6.1.3; source version thắng reference |
| `WISE_REPORT/Wise_Report/Web.config:105-117` | remote credential fragments + LocalDB `TestEntities` mixed in one block |
| `WISE_REPORT/Wise_Report/Models/DataModel/Database.edmx:7-112` | exact tables/columns/nullability/PK/two FK, SQL 2012 provider token |
| `WISE_REPORT/Wise_Report/Models/DataModel/Database.Context.cs:16-32` | named context `TestEntities`, Database First guard, five DbSet |
| `WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs:34-75` | route, Dapper SP name, five parameters, password mapping and page-count debt |
| `WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs:5-12` | page/search/sort input fields |
| `WISE_REPORT/Wise_Report/Enum/SortDirectionEnum.cs:3-7` | caller strings become `ASCENDING`/`DESCENDING` |
| `WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js:1-27` | actual `ProjectsCtrl`, request payload, API binding |
| `WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml:42,55-77` | actual script/controller/user-list consumer; not EmployeeController.js |
| `WISE_REPORT/Wise_Report/PushMessaging.cs:29-35` | commented legacy notifier; physical line 32 contains credential-bearing assignment |
| `WISE_REPORT/create_sample_data.sql:1-2` | unrelated PATLITE insert, not this database baseline |

## 9. Target flow

`Views/Employee/Index.cshtml` → `Content/js/Projects/Projects.js` / `ProjectsCtrl` → `POST /api/Api_UserController/GetListUser` → `UserPageQuery` → Dapper on `TestEntities.Database.Connection` → `dbo.GetListUser` → `dbo.Users` → generated `User` → `UserPageItem` → JSON `Data` → Angular `listUser`.

Caller limitation: current UI string enum binding may fail and current API ignores `TotalCount`. ERP-0000 produces/validates the DB contract but does not claim full UI E2E PASS; ERP-0002 owns the API/UI contract repair.

## 10. Business rules và edge cases

- Fresh bootstrap và rerun đều succeed without duplicate object/data.
- Existing wrong-shaped object is not silently altered; verifier fails explicitly.
- Page number must be ≥1; page size 1–200; invalid values throw stable error numbers.
- Sort allowlist hiện chỉ có source-evidenced `USERNAME`; direction theo enum caller là `ASCENDING`/`DESCENDING`.
- Every ordering ends with `Id` tie-breaker; no dynamic SQL.
- Search trims input and escapes `~`, `%`, `_`, `[` for literal substring matching.
- Only `IsDeleted=0`; page beyond end returns zero rows.
- Result excludes password/audit/deletion fields and returns `TotalCount` before paging when a page has at least one row; empty/out-of-range page has no row carrying total until ERP-0002 adopts an explicit multi-result/output contract.
- Smoke fixtures use reserved GUIDs and always rollback.
- Rollback rejects non-LocalDB, wrong DB name/token, previews row/object state, drops only exact baseline objects in reverse dependency order, and keeps database catalog.

## 11. API contract

- Existing route/verb: `POST /api/Api_UserController/GetListUser`.
- Existing input: `UserPageQuery`; C# passes `Search`, `PageNumber`, `PageSize`, `SortColumn`, `SortDirection`.
- Test request should use numeric enum to avoid current UI binding debt:

```json
{
  "SearchKeyword": "",
  "PageIndex": 1,
  "PageSize": 20,
  "SortColumn": "USERNAME",
  "SortDirection": 1
}
```

- Existing response envelope remains `Data`, `TotalData`, `PageIndex`, `PageSize`.
- ERP-0000 guarantees no actual password value from SP. `Password: null` may still serialize; fix is ERP-0002.
- Existing API `TotalData` remains page row count; SP `TotalCount` is a forward-compatible DB result column not consumed yet.
- No authorization/input-model/error-envelope repair in this task.

## 12. DB contract

Tables and columns exactly match `Database.edmx:8-73`: `dbo.__EFMigrationsHistory`, `dbo.Users`, `dbo.Employees`, `dbo.EmployeeUnits`, `dbo.Units`. Each has its EDMX key. Only these associations exist: `FK_Employees_Users_UserId` and self-reference `FK_Units_Units_ParentUnitId`, both `NO ACTION`.

`dbo.GetListUser` parameters:

| Parameter | SQL type |
|---|---|
| `@Search` | `nvarchar(max)` |
| `@PageNumber` | `int` |
| `@PageSize` | `int` |
| `@SortColumn` | `nvarchar(50)` |
| `@SortDirection` | `varchar(10)` |

First result: `Id uniqueidentifier`, `UserName nvarchar(max)`, `CreatedAt datetime2(7)`, `ModerationStatus int`, `TotalCount bigint`. `Password` is forbidden.

## 13. UI behavior

Không sửa UI. Khi caller bind được, `response.data.Data` tiếp tục gán vào `listUser`, các column hiện hữu đủ cho current table. Loading/empty/error/pagination UI và enum payload repair thuộc ERP-0002.

## 14. Security/data-integrity constraints

- Không chép credential hiện hữu vào artifact, commit message, screenshot hoặc log.
- Integrated Security LocalDB only; no hard-coded reusable password/token.
- Parameterized search; allowlisted sort; no `NOLOCK`, raw dynamic SQL, cascade delete or direct correction DML.
- Không hand-edit generated EF files.
- Destructive recovery phải explicit, guarded, local-only, object-scoped và transaction-wrapped.
- Smoke data rollback ở success và catch path.

## 15. Acceptance criteria

| ID | Observable criterion | Evidence seam |
|---|---|---|
| AC-01 | Current `Web.config`/`PushMessaging.cs` không còn scoped credential fragments; config chỉ còn `TestEntities` LocalDB integrated security. | STATIC secret scan + XML parse + diff |
| AC-02 | Có đúng 6 added files (README + five ordered SQL files) và 2 modified files; không project include/generated edit. | STATIC file inventory |
| AC-03 | From absent catalog, 001→004 exit 0; second forward run exit 0. | DB-01 command/exit logs |
| AC-04 | Five tables, exact columns/type/length/scale/nullability và five one-column PKs khớp EDMX. | DB-02 metadata verifier |
| AC-05 | Exactly two trusted/enabled NO ACTION FKs match names/columns; nullable employee UserId accepted; bad referenced IDs rejected in rolled-back tests. | DB-03 |
| AC-06 | `GetListUser` has exact five params and safe five-column first result; no Password/dynamic SQL/NOLOCK. | DB-04 metadata/module scan |
| AC-07 | Null/blank/literal-wildcard/no-match search and soft-delete filter behave deterministically. | DB-05 smoke/test harness |
| AC-08 | Paging size/order/beyond-last đúng; non-empty page carries correct `TotalCount`; empty page carries no count row by documented limitation; invalid page/page size rejected. | DB-06 |
| AC-09 | `USERNAME` with `ASCENDING`/`DESCENDING` works; every other sort input is rejected; `Id` tie-break stable. | DB-07 |
| AC-10 | Transaction-only fixtures leave zero reserved IDs after success/failure. | DB-08 |
| AC-11 | Verifier passes correct baseline and fails nonzero on intentionally broken isolated contract in tester-owned cycle. | DB-09 |
| AC-12 | Wrong confirmation/non-LocalDB rollback changes nothing; confirmed exact rollback drops only named objects, retains DB, then rebootstrap passes. | DB-10 |
| AC-13 | Debug build exit 0; warnings captured; no tracked build artifacts. | BUILD-01 |
| AC-14 | When IIS Express is available, numeric-enum API request returns 200 and no actual password; otherwise status explicitly `BLOCKED_ENVIRONMENT`, not fake PASS. | IT-01 |
| AC-15 | Diff contains only allowed production/test/report write-set; no credential, generated model, package or unrelated change. | STATIC-04 |

## 16. Definition of Done

Human implementation is not DONE in this run. After PROMPT 2/3, every mandatory AC must have traceable command/exit evidence; forward/rerun/verify/rollback/rebootstrap pass on isolated LocalDB; build passes; no secret or out-of-scope diff; tester did not modify production; debt outside scope is not reported as fixed. Only then may state progress through `TEST_PASS` to `TASK_PASSED`.

## 17. Allowed production write-set

ADD:

- `WISE_REPORT/Database/EmployeeManagementCoreDb/README.md`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/001_CreateEmployeeManagementCoreDb.sql`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/004_TransactionalSmokeTest.sql`
- `WISE_REPORT/Database/EmployeeManagementCoreDb/999_RollbackBaselineObjects.sql`

MODIFY:

- `WISE_REPORT/Wise_Report/Web.config`
- `WISE_REPORT/Wise_Report/PushMessaging.cs` — delete the one credential-bearing commented assignment only.

DELETE/GENERATE: none. `Wise_Report.csproj`, EDMX/T4/generated C#, JS/view and existing SQL remain unchanged.

## 18. Allowed test write-set

Only after PROMPT 2, tester may add/modify:

- `WISE_REPORT/Tests/ERP-0000/Invoke-ERP0000DbContract.ps1`
- `WISE_REPORT/Tests/ERP-0000/ERP-0000.DbContract.sql`
- `.ai-erp-workflow/reports/ERP-0000-test-report-r01.md`
- Test matrix/report summary sections in this central task file.

Human authorization on 2026-08-10 additionally permits versioned workflow control-plane artifacts to be committed for cross-machine handoff. They remain separate from the eight-path production write-set. Human-supplied `docs/markdowns/*` and `prompts/*` remain local inputs, not production changes.

Tester must not edit production C#/config/SQL to make tests pass.

## 19. Implementation guide revisions

### Revision r01 — GUIDE_READY — 2026-08-09

Task chosen now because build is available but database/test foundation is not. It creates `LocalDatabaseBaseline/v1` and introduces WEB-002/006/020/028 plus DB-003/004/005/006/008/015/033/034 as `PLANNED`. Prerequisites are exact baseline SHA, LocalDB/sqlcmd and compatible MSBuild. Expected final flow is the target flow in section 9, with the documented UI/API debts still open.

Ordered operations:

1. ADD README.
2. ADD database/schema bootstrap.
3. ADD `dbo.GetListUser` deployment.
4. ADD metadata verifier.
5. ADD transaction-only smoke test.
6. ADD guarded exact-object rollback.
7. MODIFY `Web.config` safe connection block.
8. MODIFY `PushMessaging.cs` by deleting one secret line.
9. VERIFY fingerprint, diff, config, build and—only after human review—LocalDB lifecycle.

#### STEP 01 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/README.md`

**Purpose:** Đặt execution order, ownership và safety boundary ngay cạnh SQL.

**Repo evidence:** `WISE_REPORT/Database/EmployeeManagementCoreDb` chưa tồn tại; root SQL hiện hữu không liên quan EDMX.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Tạo directory và tự gõ full file sau.

**Exact code/SQL/config:**

~~~~markdown
# EmployeeManagementCoreDb LocalDB baseline

This directory recreates the SQL Server LocalDB contract represented by
`Wise_Report/Models/DataModel/Database.edmx` at repository baseline
`b06df0fdcb9f6997ad71c4eec421e385a233d2c8`.

## Safety boundary

Run these scripts only against `(localdb)\MSSQLLocalDB`.

The forward scripts do not drop tables, columns, constraints, or data. If an
existing object has an incompatible shape, `003_VerifyBaseline.sql` fails and
the mismatch must be reviewed instead of altered automatically.

`999_RollbackBaselineObjects.sql` keeps the database catalog and drops only the
objects named in this baseline. It is still destructive. Run it only for a
disposable LocalDB after reviewing the preview and supplying both exact SQLCMD
confirmation values.

## Forward order

From the repository root, run:

```powershell
sqllocaldb start MSSQLLocalDB

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\001_CreateEmployeeManagementCoreDb.sql"
if ($LASTEXITCODE -ne 0) { throw "001_CreateEmployeeManagementCoreDb.sql failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql"
if ($LASTEXITCODE -ne 0) { throw "002_UpsertGetListUser.sql failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql"
if ($LASTEXITCODE -ne 0) { throw "003_VerifyBaseline.sql failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
if ($LASTEXITCODE -ne 0) { throw "004_TransactionalSmokeTest.sql failed." }
```

Expected final messages:

```text
EmployeeManagementCoreDb schema bootstrap completed.
dbo.GetListUser deployment completed.
EmployeeManagementCoreDb baseline verification passed.
Transactional LocalDB smoke test passed; test data was rolled back.
```

Run all four forward scripts a second time to prove rerunnability.

## Recovery

If verification fails on a pre-existing database, preserve it and inspect the
mismatch. Do not use rollback as an automatic repair.

For a disposable baseline database, use the exact confirmed rollback command
from the ERP-0000 implementation guide. Recovery is to run all four forward
scripts again in order.
~~~~

**Why each non-trivial part exists:** Forward/verify/rollback are separate so cleanup cannot be an accidental bootstrap side effect; SHA pins the Database First contract.

**Compile/runtime impact:** None until SQL execution; supplies operator runbook.

**Manual IDE/SQL action:** Create directory/file only; do not execute yet.

**Checkpoint:** Full file has no credential, remote host or instruction to drop the database.

**Expected diff:** One new README; no project include.

**Rollback for this step:** Delete the unexecuted new file.

#### STEP 02 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/001_CreateEmployeeManagementCoreDb.sql`

**Purpose:** Create the catalog when absent and the exact five-table storage contract.

**Repo evidence:** `Database.edmx:7-112` defines SQL Server 2012 storage, exact columns, five keys and two associations.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Type the full script. Do not add defaults/indexes/FKs not shown.

**Exact code/SQL/config:**

```sql
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51000, 'Bootstrap is allowed only on SQL Server LocalDB.', 1;
END;

DECLARE @DatabaseWasCreated bit = 0;

IF DB_ID(N'EmployeeManagementCoreDb') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [EmployeeManagementCoreDb];');
    SET @DatabaseWasCreated = 1;
END;

IF @DatabaseWasCreated = 1
BEGIN
    EXEC(N'USE [EmployeeManagementCoreDb];
        EXEC [sys].[sp_addextendedproperty]
            @name = N''ERPBaselineOwner'',
            @value = N''employee-management-mvc/ERP-0000/v1'';');
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [EmployeeManagementCoreDb].[sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPBaselineOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 51005, 'Target database is not owned by ERP-0000 baseline.', 1;
END;
GO

USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[__EFMigrationsHistory]
        (
            [MigrationId] nvarchar(150) NOT NULL,
            [ProductVersion] nvarchar(32) NOT NULL,
            CONSTRAINT [PK_dbo.__EFMigrationsHistory]
                PRIMARY KEY CLUSTERED ([MigrationId] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Users]
        (
            [Id] uniqueidentifier NOT NULL,
            [UserName] nvarchar(max) NOT NULL,
            [Password] nvarchar(max) NOT NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Users]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Employees', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Employees]
        (
            [Id] uniqueidentifier NOT NULL,
            [EmployeeCode] nvarchar(max) NOT NULL,
            [FullName] nvarchar(max) NOT NULL,
            [Email] nvarchar(max) NOT NULL,
            [PhoneNumber] nvarchar(max) NOT NULL,
            [Address] nvarchar(max) NOT NULL,
            [Gender] int NOT NULL,
            [UserId] uniqueidentifier NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Employees]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[EmployeeUnits]
        (
            [Id] uniqueidentifier NOT NULL,
            [EmployeeId] uniqueidentifier NOT NULL,
            [UnitId] uniqueidentifier NOT NULL,
            CONSTRAINT [PK_dbo.EmployeeUnits]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Units', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Units]
        (
            [Id] uniqueidentifier NOT NULL,
            [UnitCode] nvarchar(max) NOT NULL,
            [UnitName] nvarchar(max) NOT NULL,
            [ParentUnitId] uniqueidentifier NOT NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Units]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F') IS NULL
    BEGIN
        ALTER TABLE [dbo].[Employees] WITH CHECK
        ADD CONSTRAINT [FK_Employees_Users_UserId]
            FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id]);

        ALTER TABLE [dbo].[Employees]
        CHECK CONSTRAINT [FK_Employees_Users_UserId];
    END;

    IF OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F') IS NULL
    BEGIN
        ALTER TABLE [dbo].[Units] WITH CHECK
        ADD CONSTRAINT [FK_Units_Units_ParentUnitId]
            FOREIGN KEY ([ParentUnitId])
            REFERENCES [dbo].[Units] ([Id]);

        ALTER TABLE [dbo].[Units]
        CHECK CONSTRAINT [FK_Units_Units_ParentUnitId];
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;
GO

PRINT N'EmployeeManagementCoreDb schema bootstrap completed.';
GO
```

**Why each non-trivial part exists:** LocalDB guard prevents accidental remote use; database creation has its own batch; table/FK DDL is transactional and rerunnable; absent EmployeeUnits FKs/indexes are deliberately not invented.

**Compile/runtime impact:** `TestEntities` can open its named catalog after execution; no generated EF changes.

**Manual IDE/SQL action:** Review only now. Execute in STEP 09.

**Checkpoint:** Search the file: no `DROP`, `DELETE`, `TRUNCATE`, `NOLOCK`, credential or remote address.

**Expected diff:** One SQL file; later objects are one DB, five tables/PKs, two FKs.

**Rollback for this step:** Before execution delete file; after execution use STEP 06 only on disposable LocalDB.

#### STEP 03 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql`

**Purpose:** Version only the first active Dapper/SP read contract.

**Repo evidence:** `Api_UserController.cs:34-49` passes five named values to `GetListUser`; `Projects.js:12-25` is the consumer; password is not a list-view need.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Type the full SQL Server 2012-compatible placeholder + ALTER script.

**Exact code/SQL/config:**

```sql
USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51000, 'Deployment is allowed only on SQL Server LocalDB.', 1;
END;
GO

IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetListUser] AS
    BEGIN
        SET NOCOUNT ON;
    END;');
END;
GO

ALTER PROCEDURE [dbo].[GetListUser]
    @Search nvarchar(max),
    @PageNumber int,
    @PageSize int,
    @SortColumn nvarchar(50),
    @SortDirection varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1
    BEGIN
        THROW 51001, 'PageNumber must be greater than or equal to 1.', 1;
    END;

    IF @PageSize IS NULL OR @PageSize < 1 OR @PageSize > 200
    BEGIN
        THROW 51002, 'PageSize must be between 1 and 200.', 1;
    END;

    SET @SortColumn =
        UPPER(LTRIM(RTRIM(COALESCE(@SortColumn, N''))));

    IF @SortColumn <> N'USERNAME'
    BEGIN
        THROW 51003, 'SortColumn is not allowed.', 1;
    END;

    SET @SortDirection =
        UPPER(LTRIM(RTRIM(COALESCE(@SortDirection, ''))));

    IF @SortDirection NOT IN ('ASCENDING', 'DESCENDING')
    BEGIN
        THROW 51004, 'SortDirection must be ASCENDING or DESCENDING.', 1;
    END;

    DECLARE @Offset bigint =
        (CONVERT(bigint, @PageNumber) - CONVERT(bigint, 1))
        * CONVERT(bigint, @PageSize);

    DECLARE @NormalizedSearch nvarchar(max) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');

    DECLARE @SearchPattern nvarchar(max) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(@NormalizedSearch, N'~', N'~~'),
                        N'%', N'~%'),
                    N'_', N'~_'),
                N'[', N'~[')
            + N'%';
    END;

    SELECT
        [U].[Id],
        [U].[UserName],
        [U].[CreatedAt],
        [U].[ModerationStatus],
        COUNT_BIG(1) OVER () AS [TotalCount]
    FROM [dbo].[Users] AS [U]
    WHERE
        [U].[IsDeleted] = CONVERT(bit, 0)
        AND
        (
            @SearchPattern IS NULL
            OR [U].[UserName] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY
        CASE WHEN @SortDirection = 'ASCENDING'
            THEN [U].[UserName] END ASC,
        CASE WHEN @SortDirection = 'DESCENDING'
            THEN [U].[UserName] END DESC,
        [U].[Id] ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

PRINT N'dbo.GetListUser deployment completed.';
GO
```

**Why each non-trivial part exists:** Placeholder + ALTER works on SQL 2012; strict validation exposes invalid caller state; the single source-evidenced sort key avoids identifier injection; bigint offset avoids multiplication overflow; escaped LIKE gives literal substring semantics; `Id` stabilizes pages; count is computed before offset; Password is absent.

**Compile/runtime impact:** Dapper maps known columns and ignores `TotalCount`; `User.Password` stays null. Current API still needs ERP-0002 to remove the DTO field and consume total.

**Manual IDE/SQL action:** Do not add EF Function Import; caller is Dapper. Execute in STEP 09.

**Checkpoint:** No `[U].[Password]`, `NOLOCK`, `EXEC(@` or concatenated ORDER BY. Exact caller strings `ASCENDING`/`DESCENDING` are accepted.

**Expected diff:** One SQL file and later one procedure.

**Rollback for this step:** Exact object rollback in STEP 06; do not overwrite a pre-existing shared SP without first preserving it—this guide is LocalDB-only.

#### STEP 04 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql`

**Purpose:** Fail the `sqlcmd` process if database ownership, compatibility, schema, keys, FKs or procedure contract differs from the pinned EDMX/source.

**Repo evidence:** `Database.edmx:7-112`; `Api_UserController.cs:41-49`; no repository DDL/SP definition exists.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Type this full read-only verifier.

**Exact code/SQL/config:**

```sql
USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51100, 'Verification is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51101, 'Verification is connected to the wrong database.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPBaselineOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 51102, 'ERP-0000 database ownership token is missing or wrong.', 1;
END;

IF
(
    SELECT [compatibility_level]
    FROM [sys].[databases]
    WHERE [name] = DB_NAME()
) < 110
BEGIN
    THROW 51103, 'Database compatibility level must be at least 110.', 1;
END;

DECLARE @ExpectedColumns TABLE
(
    [TableName] sysname NOT NULL,
    [ColumnName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NULL,
    [Scale] tinyint NULL,
    [IsNullable] bit NOT NULL,
    PRIMARY KEY ([TableName], [ColumnName])
);

INSERT INTO @ExpectedColumns
    ([TableName], [ColumnName], [TypeName], [MaxLength], [Scale], [IsNullable])
VALUES
    (N'__EFMigrationsHistory', N'MigrationId', N'nvarchar', 300, NULL, 0),
    (N'__EFMigrationsHistory', N'ProductVersion', N'nvarchar', 64, NULL, 0),
    (N'Employees', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'EmployeeCode', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'FullName', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Email', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'PhoneNumber', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Address', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Gender', N'int', NULL, NULL, 0),
    (N'Employees', N'UserId', N'uniqueidentifier', NULL, NULL, 1),
    (N'Employees', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Employees', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Employees', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Employees', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Employees', N'ModerationStatus', N'int', NULL, NULL, 0),
    (N'EmployeeUnits', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'EmployeeUnits', N'EmployeeId', N'uniqueidentifier', NULL, NULL, 0),
    (N'EmployeeUnits', N'UnitId', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'UnitCode', N'nvarchar', -1, NULL, 0),
    (N'Units', N'UnitName', N'nvarchar', -1, NULL, 0),
    (N'Units', N'ParentUnitId', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Units', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Units', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Units', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Units', N'ModerationStatus', N'int', NULL, NULL, 0),
    (N'Users', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'UserName', N'nvarchar', -1, NULL, 0),
    (N'Users', N'Password', N'nvarchar', -1, NULL, 0),
    (N'Users', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Users', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Users', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Users', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Users', N'ModerationStatus', N'int', NULL, NULL, 0);

IF (SELECT COUNT_BIG(1) FROM @ExpectedColumns) <> 41
BEGIN
    THROW 51104, 'Verifier expected-column inventory is incomplete.', 1;
END;

IF
(
    SELECT COUNT_BIG(1)
    FROM [sys].[tables]
    WHERE [object_id] IN
    (
        OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U'),
        OBJECT_ID(N'dbo.Employees', N'U'),
        OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
        OBJECT_ID(N'dbo.Units', N'U'),
        OBJECT_ID(N'dbo.Users', N'U')
    )
) <> 5
BEGIN
    THROW 51105, 'Exactly five required baseline tables must exist.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] =
            OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] IS NULL
        OR [TY].[name] <> [E].[TypeName]
        OR ([E].[MaxLength] IS NOT NULL AND [C].[max_length] <> [E].[MaxLength])
        OR ([E].[Scale] IS NOT NULL AND [C].[scale] <> [E].[Scale])
        OR [C].[is_nullable] <> [E].[IsNullable]
)
BEGIN
    SELECT
        [E].[TableName],
        [E].[ColumnName],
        [E].[TypeName] AS [ExpectedType],
        [TY].[name] AS [ActualType],
        [E].[MaxLength] AS [ExpectedMaxLength],
        [C].[max_length] AS [ActualMaxLength],
        [E].[Scale] AS [ExpectedScale],
        [C].[scale] AS [ActualScale],
        [E].[IsNullable] AS [ExpectedNullable],
        [C].[is_nullable] AS [ActualNullable]
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] =
            OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] IS NULL
        OR [TY].[name] <> [E].[TypeName]
        OR ([E].[MaxLength] IS NOT NULL AND [C].[max_length] <> [E].[MaxLength])
        OR ([E].[Scale] IS NOT NULL AND [C].[scale] <> [E].[Scale])
        OR [C].[is_nullable] <> [E].[IsNullable];

    THROW 51106, 'Baseline column metadata does not match Database.edmx.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM [sys].[columns] AS [C]
    INNER JOIN [sys].[tables] AS [T]
        ON [T].[object_id] = [C].[object_id]
    WHERE
        [T].[object_id] IN
        (
            OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U'),
            OBJECT_ID(N'dbo.Employees', N'U'),
            OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
            OBJECT_ID(N'dbo.Units', N'U'),
            OBJECT_ID(N'dbo.Users', N'U')
        )
        AND NOT EXISTS
        (
            SELECT 1
            FROM @ExpectedColumns AS [E]
            WHERE [E].[TableName] = [T].[name]
              AND [E].[ColumnName] = [C].[name]
        )
)
BEGIN
    THROW 51107, 'A baseline table has an unexpected column.', 1;
END;

DECLARE @ExpectedPrimaryKeys TABLE
(
    [TableName] sysname NOT NULL PRIMARY KEY,
    [ColumnName] sysname NOT NULL
);

INSERT INTO @ExpectedPrimaryKeys ([TableName], [ColumnName])
VALUES
    (N'__EFMigrationsHistory', N'MigrationId'),
    (N'Employees', N'Id'),
    (N'EmployeeUnits', N'Id'),
    (N'Units', N'Id'),
    (N'Users', N'Id');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedPrimaryKeys AS [E]
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM [sys].[key_constraints] AS [KC]
        INNER JOIN [sys].[index_columns] AS [IC]
            ON [IC].[object_id] = [KC].[parent_object_id]
            AND [IC].[index_id] = [KC].[unique_index_id]
        INNER JOIN [sys].[columns] AS [C]
            ON [C].[object_id] = [IC].[object_id]
            AND [C].[column_id] = [IC].[column_id]
        WHERE
            [KC].[type] = N'PK'
            AND [KC].[parent_object_id] =
                OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        GROUP BY [KC].[object_id]
        HAVING COUNT_BIG(1) = 1
           AND MAX([C].[name]) = [E].[ColumnName]
    )
)
BEGIN
    THROW 51108, 'A baseline primary key is missing or incompatible.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[foreign_keys] AS [FK]
    INNER JOIN [sys].[foreign_key_columns] AS [FKC]
        ON [FKC].[constraint_object_id] = [FK].[object_id]
    WHERE
        [FK].[name] = N'FK_Employees_Users_UserId'
        AND [FK].[parent_object_id] = OBJECT_ID(N'dbo.Employees', N'U')
        AND [FK].[referenced_object_id] = OBJECT_ID(N'dbo.Users', N'U')
        AND COL_NAME([FKC].[parent_object_id], [FKC].[parent_column_id]) = N'UserId'
        AND COL_NAME([FKC].[referenced_object_id], [FKC].[referenced_column_id]) = N'Id'
        AND [FK].[is_disabled] = 0
        AND [FK].[is_not_trusted] = 0
        AND [FK].[delete_referential_action] = 0
        AND [FK].[update_referential_action] = 0
)
BEGIN
    THROW 51109, 'FK_Employees_Users_UserId is missing or incompatible.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[foreign_keys] AS [FK]
    INNER JOIN [sys].[foreign_key_columns] AS [FKC]
        ON [FKC].[constraint_object_id] = [FK].[object_id]
    WHERE
        [FK].[name] = N'FK_Units_Units_ParentUnitId'
        AND [FK].[parent_object_id] = OBJECT_ID(N'dbo.Units', N'U')
        AND [FK].[referenced_object_id] = OBJECT_ID(N'dbo.Units', N'U')
        AND COL_NAME([FKC].[parent_object_id], [FKC].[parent_column_id]) = N'ParentUnitId'
        AND COL_NAME([FKC].[referenced_object_id], [FKC].[referenced_column_id]) = N'Id'
        AND [FK].[is_disabled] = 0
        AND [FK].[is_not_trusted] = 0
        AND [FK].[delete_referential_action] = 0
        AND [FK].[update_referential_action] = 0
)
BEGIN
    THROW 51110, 'FK_Units_Units_ParentUnitId is missing or incompatible.', 1;
END;

IF
(
    SELECT COUNT_BIG(1)
    FROM [sys].[foreign_keys]
    WHERE [parent_object_id] IN
    (
        OBJECT_ID(N'dbo.Employees', N'U'),
        OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
        OBJECT_ID(N'dbo.Units', N'U'),
        OBJECT_ID(N'dbo.Users', N'U')
    )
) <> 2
BEGIN
    THROW 51111, 'Baseline foreign-key count does not match Database.edmx.', 1;
END;

IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NULL
BEGIN
    THROW 51112, 'dbo.GetListUser is missing.', 1;
END;

DECLARE @ExpectedParameters TABLE
(
    [ParameterId] int NOT NULL PRIMARY KEY,
    [ParameterName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NOT NULL
);

INSERT INTO @ExpectedParameters
    ([ParameterId], [ParameterName], [TypeName], [MaxLength])
VALUES
    (1, N'@Search', N'nvarchar', -1),
    (2, N'@PageNumber', N'int', 4),
    (3, N'@PageSize', N'int', 4),
    (4, N'@SortColumn', N'nvarchar', 100),
    (5, N'@SortDirection', N'varchar', 10);

IF EXISTS
(
    SELECT 1
    FROM @ExpectedParameters AS [E]
    LEFT JOIN [sys].[parameters] AS [P]
        ON [P].[object_id] = OBJECT_ID(N'dbo.GetListUser', N'P')
        AND [P].[parameter_id] = [E].[ParameterId]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [P].[user_type_id]
    WHERE
        [P].[parameter_id] IS NULL
        OR [P].[name] <> [E].[ParameterName]
        OR [TY].[name] <> [E].[TypeName]
        OR [P].[max_length] <> [E].[MaxLength]
)
OR
(
    SELECT COUNT_BIG(1)
    FROM [sys].[parameters]
    WHERE [object_id] = OBJECT_ID(N'dbo.GetListUser', N'P')
) <> 5
BEGIN
    THROW 51113, 'dbo.GetListUser parameters are incompatible.', 1;
END;

DECLARE @ActualResult TABLE
(
    [ColumnOrdinal] int NULL,
    [ColumnName] sysname NULL,
    [SystemTypeName] nvarchar(256) NULL,
    [ErrorNumber] int NULL
);

INSERT INTO @ActualResult
    ([ColumnOrdinal], [ColumnName], [SystemTypeName], [ErrorNumber])
SELECT
    [column_ordinal],
    [name],
    [system_type_name],
    [error_number]
FROM [sys].[dm_exec_describe_first_result_set_for_object]
(
    OBJECT_ID(N'dbo.GetListUser', N'P'),
    0
);

IF EXISTS (SELECT 1 FROM @ActualResult WHERE [ErrorNumber] IS NOT NULL)
BEGIN
    THROW 51114, 'dbo.GetListUser result metadata cannot be described.', 1;
END;

DECLARE @ExpectedResult TABLE
(
    [ColumnOrdinal] int NOT NULL PRIMARY KEY,
    [ColumnName] sysname NOT NULL,
    [SystemTypeName] nvarchar(256) NOT NULL
);

INSERT INTO @ExpectedResult
    ([ColumnOrdinal], [ColumnName], [SystemTypeName])
VALUES
    (1, N'Id', N'uniqueidentifier'),
    (2, N'UserName', N'nvarchar(max)'),
    (3, N'CreatedAt', N'datetime2(7)'),
    (4, N'ModerationStatus', N'int'),
    (5, N'TotalCount', N'bigint');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedResult AS [E]
    LEFT JOIN @ActualResult AS [A]
        ON [A].[ColumnOrdinal] = [E].[ColumnOrdinal]
    WHERE
        [A].[ColumnOrdinal] IS NULL
        OR [A].[ColumnName] <> [E].[ColumnName]
        OR [A].[SystemTypeName] <> [E].[SystemTypeName]
)
OR EXISTS
(
    SELECT 1
    FROM @ActualResult AS [A]
    WHERE [A].[ColumnOrdinal] IS NOT NULL
      AND NOT EXISTS
      (
          SELECT 1
          FROM @ExpectedResult AS [E]
          WHERE [E].[ColumnOrdinal] = [A].[ColumnOrdinal]
      )
)
BEGIN
    SELECT [ColumnOrdinal], [ColumnName], [SystemTypeName]
    FROM @ActualResult
    ORDER BY [ColumnOrdinal];

    THROW 51115, 'dbo.GetListUser first-result contract is incompatible.', 1;
END;

DECLARE @ProcedureDefinition nvarchar(max) =
    UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetListUser', N'P')));

IF @ProcedureDefinition LIKE N'%NOLOCK%'
   OR @ProcedureDefinition LIKE N'%SP_EXECUTESQL%'
   OR @ProcedureDefinition LIKE N'%EXEC(%'
BEGIN
    THROW 51116, 'dbo.GetListUser contains a forbidden query pattern.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ActualResult
    WHERE UPPER([ColumnName]) = N'PASSWORD'
)
BEGIN
    THROW 51117, 'dbo.GetListUser must not return Password.', 1;
END;

PRINT N'EmployeeManagementCoreDb baseline verification passed.';
GO
```

**Why each non-trivial part exists:** `sys.columns.max_length` is bytes, so nvarchar(150/32/50) appears as 300/64/100; ownership and compatibility guard the execution boundary; exact unexpected-column/FK counts catch silent drift; the SQL-2012 DMF checks output without reading sensitive data; every failure is `THROW`, so `sqlcmd -b -V 16` returns nonzero.

**Compile/runtime impact:** Read-only catalog inspection; no EF refresh.

**Manual IDE/SQL action:** Execute only after STEP 02/03 in STEP 09.

**Checkpoint:** Script contains no INSERT/UPDATE/DELETE/DROP/ALTER/CREATE; expected column inventory count is 41.

**Expected diff:** One new SQL verifier.

**Rollback for this step:** None at runtime; it is read-only. Delete file only before implementation is accepted.

#### STEP 05 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/004_TransactionalSmokeTest.sql`

**Purpose:** Exercise negative validation, search escaping, soft-delete, deterministic two-page ordering and count without persistent seed.

**Repo evidence:** Users storage fields are all required except DeletedAt; no test project/database fixtures exist.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Type the full script; keep fixture IDs and both rollback paths exact.

**Exact code/SQL/config:**

```sql
USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51200, 'Smoke test is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51201, 'Smoke test is connected to the wrong database.', 1;
END;

DECLARE @ValidationWasRejected bit = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 0,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51001
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51202, 'PageNumber validation did not reject zero.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 201,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51002
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51203, 'PageSize validation did not reject 201.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'PASSWORD',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51003
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51204, 'SortColumn allowlist accepted PASSWORD.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASC';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51004
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51205, 'SortDirection validation accepted ASC instead of the enum contract.', 1;
END;

DECLARE @ActiveAlphaId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E001';
DECLARE @ActivePercentId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E002';
DECLARE @DeletedId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E003';
DECLARE @AuditId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E0FF';
DECLARE @Now datetime2(7) = SYSUTCDATETIME();

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@ActiveAlphaId, @ActivePercentId, @DeletedId)
)
BEGIN
    THROW 51206, 'Reserved smoke-test identifiers already exist.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO [dbo].[Users]
    (
        [Id],
        [UserName],
        [Password],
        [CreatedAt],
        [LastModifiedAt],
        [CreatedBy],
        [LastModifiedBy],
        [IsDeleted],
        [DeletedAt],
        [ModerationStatus]
    )
    VALUES
    (
        @ActiveAlphaId,
        N'baseline-smoke-alpha',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        @Now,
        @Now,
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    ),
    (
        @ActivePercentId,
        N'baseline-smoke-100%-literal',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        DATEADD(second, 1, @Now),
        DATEADD(second, 1, @Now),
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    ),
    (
        @DeletedId,
        N'baseline-smoke-deleted',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        DATEADD(second, 2, @Now),
        DATEADD(second, 2, @Now),
        @AuditId,
        @AuditId,
        1,
        DATEADD(second, 2, @Now),
        1
    );

    DECLARE @Page TABLE
    (
        [Id] uniqueidentifier NOT NULL,
        [UserName] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2(7) NOT NULL,
        [ModerationStatus] int NOT NULL,
        [TotalCount] bigint NOT NULL
    );

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 1,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF (SELECT COUNT_BIG(1) FROM @Page) <> 1
    BEGIN
        THROW 51207, 'First page did not return exactly one row.', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE
            [Id] = @ActivePercentId
            AND [UserName] = N'baseline-smoke-100%-literal'
            AND [TotalCount] = 2
    )
    BEGIN
        THROW 51208, 'Ascending first page or TotalCount is incorrect.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 2,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE [Id] = @ActiveAlphaId AND [TotalCount] = 2
    )
    BEGIN
        THROW 51209, 'Second page is missing, overlapping, or has wrong TotalCount.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 1,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'DESCENDING';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE [Id] = @ActiveAlphaId AND [TotalCount] = 2
    )
    BEGIN
        THROW 51210, 'Descending order is incorrect.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'%',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF (SELECT COUNT_BIG(1) FROM @Page) <> 1
       OR NOT EXISTS
       (
           SELECT 1
           FROM @Page
           WHERE [Id] = @ActivePercentId AND [TotalCount] = 1
       )
    BEGIN
        THROW 51211, 'Literal percent search escaping is incorrect.', 1;
    END;

    IF EXISTS (SELECT 1 FROM @Page WHERE [Id] = @DeletedId)
    BEGIN
        THROW 51212, 'A soft-deleted user was returned.', 1;
    END;

    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@ActiveAlphaId, @ActivePercentId, @DeletedId)
)
BEGIN
    THROW 51213, 'Smoke-test rows remained after rollback.', 1;
END;

PRINT N'Transactional LocalDB smoke test passed; test data was rolled back.';
GO
```

**Why each non-trivial part exists:** Negative calls run outside the fixture transaction; fixed GUIDs make residue detectable; three rows prove active/deleted behavior; page 1/page 2/descending prove stable order; literal `%` distinguishes escaped search; a non-authenticating marker satisfies the current NOT NULL column without creating a reusable credential.

**Compile/runtime impact:** No persistent data; procedure read contract is executed directly.

**Manual IDE/SQL action:** Execute only through `sqlcmd -b -V 16` in STEP 09.

**Checkpoint:** Both success and catch paths rollback; final residue assertion exists; no unit/employee data is inserted.

**Expected diff:** One new SQL smoke script; final database rows unchanged.

**Rollback for this step:** Self-rollback. If the connection terminates mid-transaction, SQL Server rolls back the open transaction.

#### STEP 06 — ADD `WISE_REPORT/Database/EmployeeManagementCoreDb/999_RollbackBaselineObjects.sql`

**Purpose:** Remove only ERP-0000-owned objects from the disposable LocalDB while preserving the catalog and ownership token for reapply.

**Repo evidence:** No prior versioned objects exist; DEC-009 forbids whole-database drop.

**Stable anchor:** New file.

**Current line range:** N/A.

**Operation:** Type full SQLCMD-mode script. Never change confirmation literals to permissive defaults.

**Exact code/SQL/config:**

```sql
USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51901, 'Rollback is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
   OR N'$(ConfirmedDatabase)' <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51902, 'Database identity confirmation failed.', 1;
END;

IF N'$(ConfirmRollback)' <> N'YES'
BEGIN
    THROW 51903, 'ConfirmRollback must be exactly YES.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPBaselineOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 51904, 'ERP-0000 database ownership token is missing or wrong.', 1;
END;

SELECT
    [S].[name] AS [SchemaName],
    [O].[name] AS [ObjectName],
    [O].[type_desc] AS [ObjectType]
FROM [sys].[objects] AS [O]
INNER JOIN [sys].[schemas] AS [S]
    ON [S].[schema_id] = [O].[schema_id]
WHERE [O].[object_id] IN
(
    OBJECT_ID(N'dbo.GetListUser', N'P'),
    OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F'),
    OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F'),
    OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
    OBJECT_ID(N'dbo.Employees', N'U'),
    OBJECT_ID(N'dbo.Units', N'U'),
    OBJECT_ID(N'dbo.Users', N'U'),
    OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U')
)
ORDER BY [O].[type_desc], [S].[name], [O].[name];

IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.EmployeeUnits' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[EmployeeUnits];
END;

IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Employees' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Employees];
END;

IF OBJECT_ID(N'dbo.Units', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Units' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Units];
END;

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Users' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Users];
END;

IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.__EFMigrationsHistory' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[__EFMigrationsHistory];
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NOT NULL
    BEGIN
        DROP PROCEDURE [dbo].[GetListUser];
    END;

    IF OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F') IS NOT NULL
    BEGIN
        ALTER TABLE [dbo].[Employees]
        DROP CONSTRAINT [FK_Employees_Users_UserId];
    END;

    IF OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F') IS NOT NULL
    BEGIN
        ALTER TABLE [dbo].[Units]
        DROP CONSTRAINT [FK_Units_Units_ParentUnitId];
    END;

    IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[EmployeeUnits];
    END;

    IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Employees];
    END;

    IF OBJECT_ID(N'dbo.Units', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Units];
    END;

    IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Users];
    END;

    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[__EFMigrationsHistory];
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;

PRINT N'ERP-0000 baseline objects were removed; database catalog was retained.';
GO
```

**Why each non-trivial part exists:** Two typed confirmations plus LocalDB/name/ownership guards bind destructive scope; preview makes data loss visible before mutation; dependency order prevents FK failures; one transaction restores all objects if a drop fails; catalog/token retention enables controlled reapply.

**Compile/runtime impact:** None until explicitly executed; destructive only to exact baseline objects.

**Manual IDE/SQL action:** Do not execute until STEP 09 optional rollback rehearsal and only after previewing a disposable DB.

**Checkpoint:** File has no `DROP DATABASE`, `SINGLE_USER`, wildcard dynamic SQL or token defaulting to YES.

**Expected diff:** One rollback script; confirmed execution leaves `EmployeeManagementCoreDb` and its ownership token but no listed table/procedure/FK.

**Rollback for this step:** Transaction handles execution failure. Recovery after successful execution is rerun STEP 02–05.

#### STEP 07 — MODIFY `WISE_REPORT/Wise_Report/Web.config`

**Purpose:** Remove current remote/reusable credential fragments and retain one named LocalDB EntityClient connection.

**Repo evidence:** Current `Web.config:105-117` mixes commented/active remote connections with `TestEntities`; generated context constructor requires `name=TestEntities`.

**Stable anchor:** Replace everything after `</system.codedom>` and before final `</configuration>` that belongs to the current `connectionStrings` blocks.

**Current line range:** 105–117 inclusive at baseline SHA.

**Operation:** Replace the entire range; do not copy old values into notes, screenshots or commit text.

**Exact code/SQL/config:**

```xml
  <connectionStrings>
    <add name="TestEntities"
         connectionString="metadata=res://*/Models.DataModel.Database.csdl|res://*/Models.DataModel.Database.ssdl|res://*/Models.DataModel.Database.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=(localdb)\MSSQLLocalDB;initial catalog=EmployeeManagementCoreDb;integrated security=True;MultipleActiveResultSets=True;App=EntityFramework&quot;"
         providerName="System.Data.EntityClient" />
  </connectionStrings>
```

The final `</configuration>` remains immediately after this block.

**Why each non-trivial part exists:** Connection name/resource paths match generated EF context; Windows integrated security removes reusable SQL credentials; MARS and EntityClient provider preserve current Database First behavior.

**Compile/runtime impact:** `TestEntities` uses local catalog. Any dormant code relying on removed `sqlConString` will fail if later reactivated and must receive protected configuration in its own task; the scoped active user flow uses `TestEntities`.

**Manual IDE/SQL action:** Edit as text; do not touch transform files.

**Checkpoint:** Parse XML with the command in STEP 09; exactly one `<add>` exists under `<connectionStrings>`.

**Expected diff:** One old block replaced by the safe five-line entry; no secret value reproduced.

**Rollback for this step:** Restore only from Git/secure local source; never paste a prior secret into workflow artifacts. Credential rotation remains external human work.

#### STEP 08 — MODIFY `WISE_REPORT/Wise_Report/PushMessaging.cs`

**Purpose:** Remove one credential-bearing commented assignment without changing compiled behavior.

**Repo evidence:** Baseline physical line 32 is the obsolete `_connString` assignment inside a fully commented constructor; the same file also contains live `ConnectionMapping<T>` and must not be deleted.

**Stable anchor:** Between the commented `_dispatcher = dispatcher;` assignment and the next commented `_selectQuery` assignment.

**Current line range:** Delete line 32 only.

**Operation:** Delete the secret-bearing commented line. Do not type its old contents anywhere.

**Exact code/SQL/config:**

```csharp
    //    private PushMessaging(Action<IEnumerable<NOTIFICATION>> dispatcher)
    //    {
    //        _dispatcher = dispatcher;
    //        _selectQuery = @"SELECT [ID],[NGAY_THONG_BAO],[NGUOI_DUNG],[NOI_DUNG_THONG_BAO] FROM [dbo].[NOTIFICATIONS]";
    //        _newMessageNotifier = new NewMessageNotifier(_connString, _selectQuery);
    //        _newMessageNotifier.NewMessage += NewMessageRecieved;
    //    }
```

**Why each non-trivial part exists:** Commenting does not protect a secret from Git history/scanners; keeping the rest avoids an unrelated refactor.

**Compile/runtime impact:** None; deleted text is commented.

**Manual IDE/SQL action:** Delete exactly one line, no formatting pass.

**Checkpoint:** Stable surrounding lines remain byte-for-byte except line-number shift; live `ConnectionMapping<T>` remains.

**Expected diff:** One deleted line.

**Rollback for this step:** Do not restore the secret. Future notification reactivation must load a protected connection in a separate authorized task.

#### STEP 09 — VERIFY repository, build and isolated LocalDB lifecycle

**Purpose:** Give human exact checkpoints; execution provides local confidence but independent tester evidence still comes from PROMPT 2.

**Repo evidence:** Baseline build passed with VS2022 MSBuild/package cache; standalone `nuget.exe` is absent; restore/test remain unproven.

**Stable anchor:** Repository root `D:\Hay cho toi rac\C Shark\Development\OpenERP`.

**Current line range:** N/A; execute commands.

**Operation:** Run the following verification sequence after completing and reviewing STEP 01–08.

**Exact code/SQL/config:**

1. Before editing, verify baseline:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
```

Expected branch/SHA are `TEST` and `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`. Existing untracked input reference files may remain; any new source drift requires guide regeneration.

2. After typing all files, parse config and run the scoped credential-pattern scan:

```powershell
[xml](Get-Content -Raw "WISE_REPORT\Wise_Report\Web.config") | Out-Null

rg -n -i "password=|user id=" `
  "WISE_REPORT\Wise_Report\Web.config" `
  "WISE_REPORT\Wise_Report\PushMessaging.cs"

if ($LASTEXITCODE -eq 0) {
    throw "A credential-bearing connection fragment remains."
}

if ($LASTEXITCODE -ne 1) {
    throw "Credential scan failed to run."
}
```

Expected `rg` result is no output and exit code 1.

3. Resolve full-framework MSBuild, attempt packages.config restore, then build with artifacts outside tracked source:

```powershell
$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"

if (-not (Test-Path -LiteralPath $vsWhere)) {
    throw "Visual Studio Installer vswhere.exe was not found."
}

$msbuild = & $vsWhere `
    -latest `
    -products * `
    -requires Microsoft.Component.MSBuild `
    -find "MSBuild\**\Bin\MSBuild.exe" |
    Select-Object -First 1

if (-not $msbuild) {
    throw "A compatible MSBuild installation was not found."
}

& $msbuild `
    "WISE_REPORT\Wise_Report.sln" `
    /t:Restore `
    /p:RestorePackagesConfig=true `
    /m `
    /nologo `
    /v:minimal

if ($LASTEXITCODE -ne 0) {
    throw "packages.config restore failed."
}

& $msbuild `
    "WISE_REPORT\Wise_Report.sln" `
    /t:Build `
    /p:Configuration=Debug `
    /p:OutputPath=..\..\.ai-erp-workflow\build-probe\bin\ `
    /p:BaseIntermediateOutputPath=..\..\.ai-erp-workflow\build-probe\obj\ `
    /m `
    /nologo `
    /v:minimal

if ($LASTEXITCODE -ne 0) {
    throw "Solution build failed."
}
```

If restore fails, record `BLOCKED_ENVIRONMENT`; do not silently reuse build success as restore proof. Current known build warnings are duplicate using directives and one unused exception variable.

4. Start LocalDB and run forward/verify/smoke in order:

```powershell
sqllocaldb start MSSQLLocalDB

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\001_CreateEmployeeManagementCoreDb.sql"
if ($LASTEXITCODE -ne 0) { throw "Schema bootstrap failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql"
if ($LASTEXITCODE -ne 0) { throw "GetListUser deployment failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql"
if ($LASTEXITCODE -ne 0) { throw "Metadata verification failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
if ($LASTEXITCODE -ne 0) { throw "Transactional smoke test failed." }
```

5. Prove deployment idempotency by rerunning 001, 002 and 003 with the same commands and requiring exit 0. The smoke test is already residue-free and may also be rerun.

6. Optional manual API probe when IIS Express works:

- POST the numeric-enum payload in section 11.
- Record HTTP status/envelope and verify no actual password material.
- Do not report UI E2E PASS if current string-enum payload fails; that is known ERP-0002 debt.
- `Password: null` and page-count `TotalData` are known debt, not ERP-0000 success claims.

7. Optional destructive rehearsal, disposable DB only. First inspect STEP 06 preview logic, then type both confirmations:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -v ConfirmedDatabase="EmployeeManagementCoreDb" ConfirmRollback="YES" `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\999_RollbackBaselineObjects.sql"

if ($LASTEXITCODE -ne 0) {
    throw "Confirmed LocalDB object rollback failed."
}

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 16 `
  -d "EmployeeManagementCoreDb" `
  -Q "SET NOCOUNT ON; IF DB_NAME() <> N'EmployeeManagementCoreDb' THROW 51905, 'Database catalog was not retained.', 1; IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL OR OBJECT_ID(N'dbo.GetListUser', N'P') IS NOT NULL THROW 51906, 'Baseline objects remain after rollback.', 1;"

if ($LASTEXITCODE -ne 0) {
    throw "Post-rollback verification failed."
}
```

Recovery: rerun 001, 002, 003 and 004 and require all exit 0.

8. Review exact diff:

```powershell
git diff --check
git status --short
git diff --name-status
```

**Why each non-trivial part exists:** `-b -V 16` turns THROW into a process failure; restore/build use legacy MSBuild rather than `dotnet`; output redirection prevents tracked bin/obj noise; lifecycle ordering proves bootstrap, idempotency, validation, reversible cleanup and recovery.

**Compile/runtime impact:** Build creates only local probe outputs; SQL commands create/inspect/remove only the owned LocalDB objects.

**Manual IDE/SQL action:** All SQL execution is human-controlled after code review; never enable rollback automatically.

**Checkpoint:** Capture every command, exit code and concise output for PROMPT 2 comparison. A missing LocalDB/sqlcmd is `BLOCKED_ENVIRONMENT`, never PASS.

**Expected diff:** Exactly the eight production operations in section 17; no test/generated/package/project/JS/view diff.

**Rollback for this step:** Build outputs are local workflow artifacts. DB recovery uses STEP 06 then forward sequence. Source edits can be manually reverted only by the human; do not restore credential-bearing old text.

### Expected final diff and objects

Added: the six files under `WISE_REPORT/Database/EmployeeManagementCoreDb`. Modified: `Web.config` and one deleted comment line in `PushMessaging.cs`. Generated files: none. SQL objects: catalog ownership token, five tables/PKs, two FKs and `dbo.GetListUser`; no persistent fixture rows.

### Learning explanation

- Database First means EDMX and DB must agree; generated C# is not a migration engine. This baseline changes DB first while intentionally leaving EDMX untouched because the schema is made identical.
- Dapper maps by result-column name and ignores extra columns, which lets the DB stop returning password material now; it does **not** repair the unsafe DTO/API shape or total-count consumption.
- Legacy Web API enum serialization means the controller sends `ASCENDING`/`DESCENDING`, even though copied Angular code says `ASC`; tracing every layer prevents a seemingly convenient but false contract.
- SQL 2012 lacks `CREATE OR ALTER`, so a placeholder batch plus `ALTER PROCEDURE` preserves compatibility.
- Ownership token + exact object rollback makes recovery bounded. LocalDB alone is not enough protection against destroying an unrelated local catalog.

### Human self-review checklist

- [ ] Branch/SHA match section 2 before typing.
- [ ] Exactly 6 files added and 2 files modified.
- [ ] Actual caller anchors are `Projects.js` / `ProjectsCtrl`; no guide step uses orphan `EmployeeController.js`.
- [ ] No `.csproj`, package, JS/view, EDMX/T4/generated C# or test edit.
- [ ] 001 guards LocalDB, owns the new catalog with the exact extended property, creates exact EDMX schema and has no destructive DDL/DML.
- [ ] Only the two EDMX-evidenced FKs exist; no invented EmployeeUnits FK/index/default.
- [ ] 002 uses placeholder + ALTER, strict page size 1–200, only USERNAME, only ASCENDING/DESCENDING, escaped search and Id tie-break.
- [ ] Procedure first result excludes Password; empty-page TotalCount limitation is recorded.
- [ ] 003 uses THROW for every failure and checks ownership, compatibility, 41 columns, 5 PKs, 2 FKs, 5 params and 5 result columns.
- [ ] 004 rolls back both paths and leaves no reserved GUID.
- [ ] 999 has two confirmations, preview, ownership guard, transaction, exact dependency order and no DROP DATABASE.
- [ ] `Web.config` parses and contains only safe `TestEntities` LocalDB connection.
- [ ] Obsolete commented credential line is removed without restoring it elsewhere.
- [ ] Restore/build/forward/rerun/verify/smoke commands and exit codes are captured.
- [ ] Optional rollback is only on disposable owned LocalDB; reapply passes.
- [ ] Secret scan and `git diff --check` pass; diff matches allowed write-set.
- [ ] Known critical auth/password/API/UI debts are not described as fixed.
- [ ] After typing and self-review, send PROMPT 2; tester may edit only section 18 test write-set.

## 20. Test matrix và test report summaries

Latest report: `.ai-erp-workflow/reports/ERP-0000-test-report-r02.md` — `TEST_GATE: PASS`.

Prompt 2 result on 2026-08-10: `TEST_GATE: FAIL_IMPLEMENTATION`. Restore and Full Framework Debug build exit 0, but AC-01 through AC-12 and AC-14 through AC-15 fail; AC-13 also fails as a whole because tracked generated/build artifacts violate its second clause even though compilation passes. Static harness: `PASS=1 FAIL=8 SKIP=0`; clean isolated DB forward fails at 001 with exit 16; verifier/smoke exit 16; numeric-enum API E2E returns HTTP 500. Unit/vstest is `SKIP_ABSENT` because the repository has no test project/assembly. Exact commands, exit codes, sanitized errors, diff inventory and AC-to-test mapping are in report r01.

Root-cause candidates are recorded only as test findings: inverted Users create guard and singular history table in 001; invalid/mismatched procedure contract in 002; nested/unsafe connection configuration; two wrong/missing file paths; and large out-of-scope generated/unrelated diff. No corrective guide is generated in this run.

Corrective execution superseded the failing r01 evidence without deleting it. Final evidence: static + isolated DB lifecycle `PASS=33 FAIL=0 SKIP=0`, restore exit 0, Debug/Release build exit 0, numeric-enum API E2E HTTP 200, generated delta 0, scoped credential-fragment count 0. The tested executable-source fingerprint is `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`.

## 21. Final closure / retrospective

Closed on 2026-08-10 as `TASK_PASSED`.

- Capability delivered: `LocalDatabaseBaseline/v1` with repeatable forward, verifier, transaction-only smoke, guarded exact-object rollback and rebootstrap.
- Patterns practiced and tested: EF Database First storage contract, View→JS→API→Dapper→SP trace, deterministic server paging, metadata/FK verification, LocalDB ownership guard, rollback/recovery and secretless local configuration.
- Regression anchors: `Invoke-ERP0000DbContract.ps1 -Phase All`, Full Framework Debug/Release build and numeric-enum IIS Express API E2E.
- Remaining debt: UI enum binding, API password field/total count/exception leakage, missing authentication/password verification, hard delete, three Setting SP definitions, marketing SP, Employee API project registration/wiring, EmployeeUnits relationships, credential rotation and legacy vulnerable packages.

Next workflow task: ERP-0001 secure session identity, planned only after this closure.
