# ERP-0002 — Safe Paged User Directory Contract

## 1. Metadata và state history

| Field | Value |
|---|---|
| Task ID | `ERP-0002` |
| Provenance | `REPO_EXISTING repair` |
| Active state | `TASK_PASSED` |
| Human effort | 6–8 giờ |
| Risk | Medium — API/SQL paging contract and sensitive response shape |
| Produced capability | `UserDirectory/v1` |
| Consumed capabilities | `LocalDatabaseBaseline/v1`, `SessionIdentity/v1` |
| Guide revision | `r01`, 2026-08-11 |

State history:

1. `TASK_PLANNED` — dependency-ready after ERP-0001 report r01 passed.
2. `GUIDE_READY` — source-first API/SQL/Angular guide prepared against commit `347a41dff8e96b554d01650d4d7943425ec2b1ad`.
3. `HUMAN_IMPLEMENTING → READY_FOR_TEST → TESTING → TEST_FAIL` — human commit `d39b8ddd56c6c2fcfdb7f93bc442ae299ffb4c9a` had contract and generated-noise failures.
4. `AGENT_FIXING → TESTING → TEST_PASS → TASK_PASSED` — authorized correction commit `2a2c9981d9d15020bd272320511af16244052e2f` passed ERP-0002 `36/0` and ERP-0001 regression `39/0`.

## 2. Baseline SHA

- Branch: `TEST`.
- Exact production-source baseline: `347a41dff8e96b554d01650d4d7943425ec2b1ad`.
- ERP-0001 executable PASS fingerprint: `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499`.
- The guide delivery commit will be newer. Before STEP 01, latest `TEST` must satisfy:

```powershell
git diff --exit-code 347a41dff8e96b554d01650d4d7943425ec2b1ad -- WISE_REPORT
if ($LASTEXITCODE -ne 0) {
    throw "WISE_REPORT has drifted from the ERP-0002 production-source baseline."
}
```

## 3. Business context và user journey

The live user-directory route is `Projects.js → POST /api/Api_UserController/GetListUser → dbo.GetListUser`. The procedure already omits password material, but the API maps rows through generated `User`, creates a DTO that still has `Password`, computes `TotalData` as current-page row count, and returns raw exception details. The browser sends `"ASC"`, while the C# enum and procedure contract require `Ascending/ASCENDING`. Both `HomeLayout.cshtml` and `Employee/Index.cshtml` consume the same Angular controller and show the wrong `item.Status` property.

Target journey:

`directory search/page/sort controls → numeric enum query → validated Web API request → Dapper safe row → GetListUser page + output total → explicit PagedResult<UserPageItem> → UI page state`.

## 4. Goal

Create `UserDirectory/v1`: a validated, deterministic, server-paged read contract whose JSON item shape contains only `Id`, `UserName`, `CreatedAt`, and `ModerationStatus`; whose total count remains correct for every page including an empty/out-of-range page; and whose UI sends the real enum contract without exposing database exception details.

## 5. Scope

- Add explicit Dapper row and generic paged-response types.
- Remove `Password` from `UserPageItem`.
- Add API request validation for search/page/page-size/sort column/sort enum.
- Replace generated-entity Dapper mapping with `UserPageRow`.
- Return a typed page response and generic HTTP 500 on unexpected database failure.
- Add `@TotalCount bigint OUTPUT` to `dbo.GetListUser` without breaking its first result set.
- Update the DB verifier for the sixth output parameter.
- Send numeric `SortDirectionEnum` values from Angular.
- Remove the two stray backticks that currently make `Projects.js` invalid JavaScript.
- Add search, deterministic sort toggle, previous/next state, total display and error handling to both verified view consumers.
- Preserve ERP-0000 DB and ERP-0001 identity regression gates.

## 6. Out of scope

- Add/update/delete user security, password reset and password DTOs used by mutation forms. These endpoints remain critical debt and must not be described as secure.
- Authorization/roles/API 401/403; ERP-0006 owns authorization. Until then, the directory is not production-deployable on an untrusted network.
- Username uniqueness/index/schema/EDMX changes.
- Removing generated `User.Password`; generated Database First entities are storage mappings, not response contracts.
- Employee API/list repair; ERP-0003 owns `EmployeeDirectory/v1`.
- Replacing AngularJS, Dapper, EF6, MVC/Web API or SQL Server 2012 conventions.

## 7. Dependencies và assumptions

- ERP-0000 and ERP-0001 remain `TASK_PASSED`.
- `GetListUser` remains SQL Server 2012 compatible and LocalDB-owned.
- Only `USERNAME` is a proven sort column.
- `SortDirectionEnum.Ascending = 1`, `Descending = 2` remains source truth.
- Dapper 1.60.1 `DynamicParameters` output parameters are available.
- Current mutation controls remain visible but are not repaired by this task; tester scopes password-response assertions to the list route and records mutation debt.

## 8. Existing repository evidence

| Evidence | Meaning |
|---|---|
| `Api/Setting/Api_UserController.cs:34-77` | List maps `Query<User>`, copies `Password`, page-counts rows, leaks `ex`. |
| `Shared/Dtos/UserPageItem.cs:3-11` | Public list DTO contains `Password`. |
| `Shared/Queries/Base/BaseQuery.cs:5-12` | Query has defaults but no validation. |
| `Enum/SortDirectionEnum.cs:3-7` | Valid values are numeric `1/2`, names `Ascending/Descending`. |
| `002_UpsertGetListUser.sql:20-108` | Procedure validates/paginates and returns per-row total, but no empty-page total channel. |
| `003_VerifyBaseline.sql:298-338` | Verifier expects exactly five procedure parameters. |
| `Projects.js:12-27,72-84` | Browser sends invalid `"ASC"`, ignores total/error, and contains two stray backticks that break JavaScript parsing. |
| `HomeLayout.cshtml:59-92` | Verified consumer renders list and uses nonexistent `item.Status`. |
| `Employee/Index.cshtml:59-91` | Second verified consumer has the same status/paging issue. |
| `Wise_Report.csproj:368-369` | Classic project requires explicit DTO compile includes. |

## 9. Target flow

```text
HomeLayout.cshtml / Employee/Index.cshtml
  -> ProjectsCtrl.userQuery
  -> POST GetListUser(UserPageQuery)
  -> DataAnnotations + ModelState
  -> DynamicParameters
       Search, PageNumber, PageSize
       SortColumn, SortDirection
       TotalCount OUTPUT
  -> dbo.GetListUser
  -> UserPageRow
  -> UserPageItem
  -> PagedResult<UserPageItem>
  -> list + total + page controls
```

## 10. Business rules và edge cases

1. `PageIndex` is at least 1.
2. `PageSize` is 1–200.
3. Search is optional, trimmed by SQL, and limited to 256 characters at the API boundary.
4. Only exact `USERNAME` sort is allowed.
5. Only defined enum values 1 and 2 are accepted; invalid strings/numbers return HTTP 400.
6. Sort remains deterministic by username then `Id`.
7. Literal `%`, `_`, `[` and escape characters remain literal search input.
8. `TotalData` is database total after filter, independent of page size and available when page rows are empty.
9. Each JSON item has exactly four fields and no password/hash/count metadata.
10. Unexpected database errors return generic HTTP 500 without exception message/stack trace.
11. UI search resets page to 1; previous/next never moves outside valid bounds.
12. Empty results render an empty list, total 0, and page 1 of 1.

## 11. API contract

### Request

`POST /api/Api_UserController/GetListUser`

```json
{
  "SearchKeyword": "",
  "PageIndex": 1,
  "PageSize": 20,
  "SortColumn": "USERNAME",
  "SortDirection": 1
}
```

### Success — HTTP 200

```json
{
  "Data": [
    {
      "Id": "11111111-1111-1111-1111-111111111111",
      "UserName": "sample.user",
      "CreatedAt": "2026-08-11T00:00:00",
      "ModerationStatus": 1
    }
  ],
  "TotalData": 1,
  "PageIndex": 1,
  "PageSize": 20
}
```

Malformed request: HTTP 400 with ModelState validation. Unexpected server/database failure: generic HTTP 500; no exception object is passed to `InternalServerError`.

## 12. DB contract

- Existing five input parameters retain name/type/order.
- Sixth parameter is `@TotalCount bigint = NULL OUTPUT`.
- First result remains `Id, UserName, CreatedAt, ModerationStatus, TotalCount`; this preserves ERP-0000 compatibility.
- `@TotalCount` is calculated with the same soft-delete/search predicate before paging, so it is valid for empty pages.
- No password column, dynamic SQL, `NOLOCK`, destructive DDL or schema/EDMX change.

## 13. UI behavior

- Search button/Enter resets to page 1.
- Username header toggles ascending/descending numeric enum.
- Previous/Next buttons use `TotalData` and disable at bounds.
- Total and current page are visible.
- API failure clears the list and shows one generic message.
- Status uses `item.ModerationStatus`.
- Add/edit/delete behavior is unchanged and explicitly remains debt.

## 14. Security/data-integrity constraints

- Never map a list row through generated `User`.
- `UserPageItem` and serialized list JSON have no password property.
- Do not return `InternalServerError(ex)`.
- Do not log response bodies or credential material.
- Do not weaken SQL validation or literal-search escaping.
- Do not edit EDMX/generated entities or tracked `bin/obj`.
- Do not claim authorization or safe user mutation.

## 15. Acceptance criteria

| ID | Observable criterion | Evidence seam |
|---|---|---|
| AC-01 | Valid numeric enum query returns typed HTTP 200 page contract. | API-01 |
| AC-02 | Data items contain exactly Id/UserName/CreatedAt/ModerationStatus and never Password/hash/TotalCount. | API-02/security scan |
| AC-03 | TotalData is filtered database total for page 1, later page and empty/out-of-range page. | DB/API-03 |
| AC-04 | Null/invalid page, size, sort column, enum and oversized search return HTTP 400. | API-04 |
| AC-05 | Unexpected DB failure does not serialize exception text/stack. | STATIC/API-05 |
| AC-06 | SQL parameters/result metadata/soft-delete/search/sort/paging remain compatible; output total is bigint. | DB-01 |
| AC-07 | Angular sends numeric 1/2, handles error and uses database total for page controls. | STATIC/E2E-06 |
| AC-08 | Both views render `ModerationStatus`, search, sort, total and bounded paging. | STATIC/E2E-07 |
| AC-09 | Dapper maps `UserPageRow`, response maps `UserPageItem`, and generated `User` is not the list type. | STATIC-08 |
| AC-10 | Full Framework restore, Debug/Release builds and Razor/IIS journey exit successfully. | BUILD/E2E-09 |
| AC-11 | ERP-0000 DB regression and ERP-0001 identity `39/0` regression remain green. | REG-10 |
| AC-12 | Diff matches exact write-set with no secret, EDMX, package or generated noise. | STATIC-11 |

No performance AC is introduced; count/page query performance tuning requires workload/index evidence and a separate schema task.

## 16. Definition of Done

All ACs pass on one executable fingerprint. No DB/API/IIS/regression gate may be skipped. ERP-0003 cannot start until ERP-0002 is `TASK_PASSED`.

## 17. Allowed production write-set

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

DELETE/EDMX/PACKAGE/GENERATED: none.

## 18. Allowed test write-set

After human implementation, tester may add/update only:

- `WISE_REPORT/Tests/ERP-0002/Invoke-ERP0002UserDirectoryGate.ps1`
- `WISE_REPORT/Tests/ERP-0002/ERP-0002.UserDirectoryContract.sql`
- `.ai-erp-workflow/reports/ERP-0002-test-report-r01.md`
- test summary sections in this task/state artifact.

ERP-0000 and ERP-0001 test files may be executed but not weakened.

## 19. Implementation guide revisions

### Revision r01 — GUIDE_READY — 2026-08-11

#### Guide header and preflight

Why now: the reproducible DB and session identity are proven; removing password-shaped list output and repairing total/paging is the next dependency-ready read slice before employee directory work.

Run before STEP 01:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff --exit-code 347a41dff8e96b554d01650d4d7943425ec2b1ad -- WISE_REPORT
if ($LASTEXITCODE -ne 0) {
    throw "WISE_REPORT differs from the ERP-0002 source baseline."
}
```

Expected: branch `TEST`, clean tracked tree, production comparison exit 0.

#### STEP 01 — ADD `WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs`

Purpose: make the page envelope an explicit reusable response contract.

Create the complete file:

```csharp
using System.Collections.Generic;

namespace Wise_Report.Shared.Dtos
{
    public class PagedResult<T>
    {
        public List<T> Data { get; set; }
        public long TotalData { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
```

Expected diff: one hand-written DTO; no package/entity reference.

#### STEP 02 — ADD `WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs`

Purpose: isolate Dapper result metadata from generated EF entities and public JSON DTOs.

Create the complete file:

```csharp
using System;

namespace Wise_Report.Shared.Dtos
{
    internal sealed class UserPageRow
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ModerationStatus { get; set; }
        public long TotalCount { get; set; }
    }
}
```

Why: the compatibility `TotalCount` column remains a DB-row concern and is not serialized per item.

#### STEP 03 — MODIFY `WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs`

Current file has 12 lines. Replace the entire file with:

```csharp
using System;

namespace Wise_Report.Shared.Dtos
{
    public class UserPageItem
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ModerationStatus { get; set; }
    }
}
```

Checkpoint: `rg -n "Password" WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs` returns no match.

#### STEP 04 — MODIFY `WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs`

Current file has 13 lines. Replace the entire file with:

```csharp
using System.ComponentModel.DataAnnotations;
using Wise_Report.Enum;

namespace Wise_Report.Shared.Queries.Base
{
    public class BaseQuery
    {
        [StringLength(256, ErrorMessage = "SearchKeyword cannot exceed 256 characters.")]
        public string SearchKeyword { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PageIndex must be at least 1.")]
        public int PageIndex { get; set; } = 1;

        [Range(1, 200, ErrorMessage = "PageSize must be between 1 and 200.")]
        public int PageSize { get; set; } = 20;

        [Required(ErrorMessage = "SortColumn is required.")]
        [RegularExpression("^USERNAME$", ErrorMessage = "SortColumn is not allowed.")]
        public string SortColumn { get; set; }

        [EnumDataType(typeof(SortDirectionEnum), ErrorMessage = "SortDirection is invalid.")]
        public SortDirectionEnum SortDirection { get; set; }
    }
}
```

Why: Web API rejects invalid contracts before executing SQL; SQL retains defense in depth.

#### STEP 05 — MODIFY `WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql`

Current file has 108 lines. Replace the entire file with this SQL Server 2012-compatible script:

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
    @SortDirection varchar(10),
    @TotalCount bigint = NULL OUTPUT
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

    SELECT @TotalCount = COUNT_BIG(1)
    FROM [dbo].[Users] AS [U]
    WHERE
        [U].[IsDeleted] = CONVERT(bit, 0)
        AND
        (
            @SearchPattern IS NULL
            OR [U].[UserName] LIKE @SearchPattern ESCAPE N'~'
        );

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

Impact: compatible first result plus a reliable output channel for empty pages. No table/schema mutation.

#### STEP 06 — MODIFY `WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql`

Repo anchor: parameter contract is current lines 298-338. Replace that entire `@ExpectedParameters` block through its incompatibility `THROW` with:

```sql
DECLARE @ExpectedParameters TABLE
(
    [ParameterId] int NOT NULL PRIMARY KEY,
    [ParameterName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NOT NULL,
    [IsOutput] bit NOT NULL
);

INSERT INTO @ExpectedParameters
    ([ParameterId], [ParameterName], [TypeName], [MaxLength], [IsOutput])
VALUES
    (1, N'@Search', N'nvarchar', -1, 0),
    (2, N'@PageNumber', N'int', 4, 0),
    (3, N'@PageSize', N'int', 4, 0),
    (4, N'@SortColumn', N'nvarchar', 100, 0),
    (5, N'@SortDirection', N'varchar', 10, 0),
    (6, N'@TotalCount', N'bigint', 8, 1);

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
        OR [P].[is_output] <> [E].[IsOutput]
)
OR
(
    SELECT COUNT_BIG(1)
    FROM [sys].[parameters]
    WHERE [object_id] = OBJECT_ID(N'dbo.GetListUser', N'P')
) <> 6
BEGIN
    THROW 51113, 'dbo.GetListUser parameters are incompatible.', 1;
END;
```

Do not alter the five-column first-result verification at lines 340-430.

Checkpoint after STEP 06:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql"
if ($LASTEXITCODE -ne 0) { throw "002 failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql"
if ($LASTEXITCODE -ne 0) { throw "003 failed." }

sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 `
  -i "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
if ($LASTEXITCODE -ne 0) { throw "004 regression failed." }
```

#### STEP 07 — MODIFY `WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs`

Repo anchor/current range: replace only `GetListUser(UserPageQuery query)` at lines 34-77. Keep mutation methods unchanged and explicitly unsafe/deferred.

Replace the complete action with:

```csharp
        [HttpPost]
        [Route("api/Api_UserController/GetListUser")]
        public IHttpActionResult GetListUser(UserPageQuery query)
        {
            if (query == null)
            {
                return BadRequest("Request body is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add(
                    "Search",
                    string.IsNullOrWhiteSpace(query.SearchKeyword)
                        ? null
                        : query.SearchKeyword.Trim(),
                    DbType.String);
                parameters.Add("PageNumber", query.PageIndex, DbType.Int32);
                parameters.Add("PageSize", query.PageSize, DbType.Int32);
                parameters.Add("SortColumn", query.SortColumn, DbType.String);
                parameters.Add(
                    "SortDirection",
                    query.SortDirection == SortDirectionEnum.Ascending
                        ? "ASCENDING"
                        : "DESCENDING",
                    DbType.AnsiString);
                parameters.Add(
                    "TotalCount",
                    dbType: DbType.Int64,
                    direction: ParameterDirection.Output);

                var rows = db.Database.Connection
                    .Query<UserPageRow>(
                        "GetListUser",
                        parameters,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 20)
                    .ToList();

                var data = rows.Select(row => new UserPageItem
                {
                    Id = row.Id,
                    UserName = row.UserName,
                    CreatedAt = row.CreatedAt,
                    ModerationStatus = row.ModerationStatus
                }).ToList();

                return Ok(new PagedResult<UserPageItem>
                {
                    Data = data,
                    TotalData = parameters.Get<long>("TotalCount"),
                    PageIndex = query.PageIndex,
                    PageSize = query.PageSize
                });
            }
            catch (Exception)
            {
                return InternalServerError();
            }
        }
```

Why: request faults become 400; row/public/envelope types are explicit; exception content is not serialized.

#### STEP 08 — MODIFY `WISE_REPORT/Wise_Report/Wise_Report.csproj`

At current lines 368-369 replace:

```xml
    <Compile Include="Shared\Dtos\EmployeePageItem.cs" />
    <Compile Include="Shared\Dtos\UserPageItem.cs" />
```

with:

```xml
    <Compile Include="Shared\Dtos\EmployeePageItem.cs" />
    <Compile Include="Shared\Dtos\PagedResult.cs" />
    <Compile Include="Shared\Dtos\UserPageItem.cs" />
    <Compile Include="Shared\Dtos\UserPageRow.cs" />
```

Checkpoint: each new include occurs exactly once; no Reference/Package/Content change.

#### STEP 09 — MODIFY `WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js`

Repo anchor/current range: replace the current `GetListUser` block at lines 12-27, including its immediate invocation, with:

```javascript
    $scope.userQuery = {
        SearchKeyword: "",
        PageIndex: 1,
        PageSize: 20,
        SortColumn: "USERNAME",
        SortDirection: 1
    };
    $scope.userTotalData = 0;
    $scope.userListError = "";

    $scope.GetListUser = function () {
        $scope.userListError = "";

        return $http
            .post(
                origin + '/api/Api_UserController/GetListUser',
                angular.copy($scope.userQuery))
            .then(function (response) {
                var page = response.data || {};
                $scope.listUser = angular.isArray(page.Data)
                    ? page.Data
                    : [];
                $scope.userTotalData = page.TotalData || 0;
            }, function () {
                $scope.listUser = [];
                $scope.userTotalData = 0;
                $scope.userListError = "Không thể tải danh sách người dùng.";
            });
    };

    $scope.SearchUsers = function () {
        $scope.userQuery.PageIndex = 1;
        return $scope.GetListUser();
    };

    $scope.ToggleUserNameSort = function () {
        $scope.userQuery.SortDirection =
            $scope.userQuery.SortDirection === 1 ? 2 : 1;
        $scope.userQuery.PageIndex = 1;
        return $scope.GetListUser();
    };

    $scope.GetUserPageCount = function () {
        return Math.max(
            1,
            Math.ceil($scope.userTotalData / $scope.userQuery.PageSize));
    };

    $scope.PreviousUserPage = function () {
        if ($scope.userQuery.PageIndex > 1) {
            $scope.userQuery.PageIndex--;
            return $scope.GetListUser();
        }
    };

    $scope.NextUserPage = function () {
        if ($scope.userQuery.PageIndex < $scope.GetUserPageCount()) {
            $scope.userQuery.PageIndex++;
            return $scope.GetListUser();
        }
    };

$scope.GetListUser();
```

In the same file, current line 77 contains two stray backticks. Replace this exact line:

```javascript
                return "Đã duyệt";``
```

with:

```javascript
                return "Đã duyệt";
```

Checkpoint: `node --check WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js` exits 0 when Node.js is available. PROMPT 2 must execute this syntax gate, resolving Node.js from the bundled workspace runtime when it is not on `PATH`.

Do not change AddUser/UpdateUser/DeleteUser in this task. Record them as debt; do not reuse list DTO password data.

#### STEP 10 — MODIFY `WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml`

Repo anchor/current range: replace from `<h3>Danh sách người dùng</h3>` through the closing `</div>` of the current table-responsive block at lines 59-92 with:

```cshtml
        <h3>Danh sách người dùng</h3>
        <button class="btn btn-success" ng-click="OpenAdd()">Thêm</button>
        <button type="button" class="btn btn-info" ng-click="XuatExcel()">Xuất Excel</button>

        <div class="row" style="margin-top:15px;margin-bottom:15px">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text"
                           class="form-control"
                           ng-model="userQuery.SearchKeyword"
                           ng-keyup="$event.keyCode === 13 && SearchUsers()"
                           placeholder="Tìm theo tên người dùng" />
                    <span class="input-group-btn">
                        <button type="button" class="btn btn-primary" ng-click="SearchUsers()">
                            Tìm kiếm
                        </button>
                    </span>
                </div>
            </div>
        </div>

        <div class="alert alert-danger" ng-if="userListError">
            {{userListError}}
        </div>

        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>
                            <button type="button" class="btn btn-link" ng-click="ToggleUserNameSort()">
                                Tên người dùng
                                <span ng-if="userQuery.SortDirection === 1">▲</span>
                                <span ng-if="userQuery.SortDirection === 2">▼</span>
                            </button>
                        </th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="item in listUser track by item.Id">
                        <td>{{item.UserName}}</td>
                        <td>{{item.CreatedAt | date:'dd/MM/yyyy'}}</td>
                        <td>{{GetStatusText(item.ModerationStatus)}}</td>
                        <td>
                            <button class="btn btn-warning" ng-click="OpenEdit(item)">Sửa</button>
                            <button class="btn btn-danger" ng-click="DeleteUser(item)">Xóa</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="clearfix">
            <div class="pull-left">
                Tổng số: {{userTotalData}} — Trang {{userQuery.PageIndex}} / {{GetUserPageCount()}}
            </div>
            <div class="pull-right">
                <button type="button"
                        class="btn btn-default"
                        ng-disabled="userQuery.PageIndex <= 1"
                        ng-click="PreviousUserPage()">
                    Trước
                </button>
                <button type="button"
                        class="btn btn-default"
                        ng-disabled="userQuery.PageIndex >= GetUserPageCount()"
                        ng-click="NextUserPage()">
                    Sau
                </button>
            </div>
        </div>
```

#### STEP 11 — MODIFY `WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml`

Repo anchor/current range: replace from `<h3>Danh sách người dùng</h3>` through the closing `</div>` of the current table-responsive block at lines 59-91 with:

```cshtml
        <h3>Danh sách người dùng</h3>
        <button class="btn btn-success" ng-click="OpenAdd()">Thêm</button>

        <div class="row" style="margin-top:15px;margin-bottom:15px">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text"
                           class="form-control"
                           ng-model="userQuery.SearchKeyword"
                           ng-keyup="$event.keyCode === 13 && SearchUsers()"
                           placeholder="Tìm theo tên người dùng" />
                    <span class="input-group-btn">
                        <button type="button" class="btn btn-primary" ng-click="SearchUsers()">
                            Tìm kiếm
                        </button>
                    </span>
                </div>
            </div>
        </div>

        <div class="alert alert-danger" ng-if="userListError">
            {{userListError}}
        </div>

        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>
                            <button type="button" class="btn btn-link" ng-click="ToggleUserNameSort()">
                                Tên người dùng
                                <span ng-if="userQuery.SortDirection === 1">▲</span>
                                <span ng-if="userQuery.SortDirection === 2">▼</span>
                            </button>
                        </th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="item in listUser track by item.Id">
                        <td>{{item.UserName}}</td>
                        <td>{{item.CreatedAt | date:'dd/MM/yyyy'}}</td>
                        <td>{{GetStatusText(item.ModerationStatus)}}</td>
                        <td>
                            <button class="btn btn-warning" ng-click="OpenEdit(item)">Sửa</button>
                            <button class="btn btn-danger" ng-click="DeleteUser(item)">Xóa</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="clearfix">
            <div class="pull-left">
                Tổng số: {{userTotalData}} — Trang {{userQuery.PageIndex}} / {{GetUserPageCount()}}
            </div>
            <div class="pull-right">
                <button type="button"
                        class="btn btn-default"
                        ng-disabled="userQuery.PageIndex <= 1"
                        ng-click="PreviousUserPage()">
                    Trước
                </button>
                <button type="button"
                        class="btn btn-default"
                        ng-disabled="userQuery.PageIndex >= GetUserPageCount()"
                        ng-click="NextUserPage()">
                    Sau
                </button>
            </div>
        </div>
```

Why both: both views load `Projects.js` and `ProjectsCtrl`; leaving one consumer on `item.Status` would preserve a live contract defect.

#### STEP 12 — VERIFY exact diff, build, DB and local runtime

Inventory:

```powershell
git diff --check
git diff --name-status 347a41dff8e96b554d01650d4d7943425ec2b1ad -- WISE_REPORT
```

Expected production diff is exactly the 11 paths in section 17.

Static/security checks:

```powershell
rg -n 'Query<User>|Password\s*=\s*x\.Password|InternalServerError\(ex\)|SortDirection:\s*"ASC"' `
  'WISE_REPORT\Wise_Report\Api\Setting\Api_UserController.cs' `
  'WISE_REPORT\Wise_Report\Shared\Dtos\UserPageItem.cs' `
  'WISE_REPORT\Wise_Report\Content\js\Projects\Projects.js'

rg -n 'UserPageRow|PagedResult<UserPageItem>|ParameterDirection.Output|SortDirection:\s*1' `
  'WISE_REPORT\Wise_Report\Api\Setting\Api_UserController.cs' `
  'WISE_REPORT\Wise_Report\Content\js\Projects\Projects.js'

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    & $node.Source --check 'WISE_REPORT\Wise_Report\Content\js\Projects\Projects.js'
    if ($LASTEXITCODE -ne 0) { throw "Projects.js syntax check failed." }
} else {
    Write-Warning "Node.js is not on PATH; PROMPT 2 must run this mandatory syntax gate."
}
```

Expected: first command has no match; second shows all required safe contract anchors.

DB execution order:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql"
if ($LASTEXITCODE -ne 0) { throw "002 failed." }
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql"
if ($LASTEXITCODE -ne 0) { throw "003 failed." }
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 -i "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
if ($LASTEXITCODE -ne 0) { throw "004 failed." }
```

Restore/build outside repository:

```powershell
$vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
$msbuild = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild `
  -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
if (-not $msbuild) { throw "Full Framework MSBuild was not found." }

& $msbuild "WISE_REPORT\Wise_Report.sln" /t:Restore `
  /p:RestorePackagesConfig=true /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Restore failed." }

$probe = Join-Path $env:TEMP "OpenERP-ERP0002-build"
New-Item -ItemType Directory -Force -Path `
  (Join-Path $probe "Debug\bin"), (Join-Path $probe "Debug\obj"), `
  (Join-Path $probe "Release\bin"), (Join-Path $probe "Release\obj") | Out-Null

& $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Debug `
  "/p:OutputPath=$probe\Debug\bin\" `
  "/p:BaseIntermediateOutputPath=$probe\Debug\obj\" /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Debug build failed." }

& $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Release `
  "/p:OutputPath=$probe\Release\bin\" `
  "/p:BaseIntermediateOutputPath=$probe\Release\obj\" /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Release build failed." }
```

Manual smoke after build:

1. Start IIS Express and open HomeLayout using a disposable approved ERP-0001 user.
2. Confirm network request sends `SortDirection: 1` or `2`, not `ASC`.
3. Search a literal `%` username and verify only the literal match.
4. Move to page 2 and an empty last page through a direct API call; verify `TotalData` is unchanged.
5. Inspect JSON and confirm no `Password`, hash or per-row `TotalCount`.
6. Run `WISE_REPORT/Tests/ERP-0001/Invoke-ERP0001IdentityGate.ps1 -Phase All`; it must remain `39/0`.

Expected final diff:

```text
ADD    WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs
ADD    WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs
MODIFY WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql
MODIFY WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql
MODIFY WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs
MODIFY WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs
MODIFY WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs
MODIFY WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js
MODIFY WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml
MODIFY WISE_REPORT/Wise_Report/Wise_Report.csproj
```

Rollback: restore these 11 paths only, then rerun baseline `002 → 003 → 004`. No table/data rollback is required; procedure deployment is rerunnable.

### Learning explanation

- A generated EF entity is a persistence mapping, not an API DTO. Mapping Dapper directly to `User` allowed a password-shaped property to cross the response boundary even when SQL returned null.
- Per-row window count disappears when a page has no rows. An output parameter carries filtered total independently while preserving the existing first result for compatibility.
- JSON enum strings, C# enum names and stored-procedure strings are different boundaries. Numeric 1/2 is the stable browser-to-C# contract; the controller explicitly maps it to DB strings.
- C# build does not prove Razor/Angular behavior. PROMPT 2 must exercise IIS and inspect actual JSON/DOM/network payloads.

### Human self-review checklist

- [ ] Latest `TEST` production tree matched baseline `347a41d` before typing.
- [ ] Exactly two DTO files were added and included once.
- [ ] `UserPageItem` has no `Password`.
- [ ] Dapper maps `UserPageRow`, never generated `User`, in GetListUser.
- [ ] API validates null/model state and never returns `InternalServerError(ex)`.
- [ ] `@TotalCount` is bigint OUTPUT and verifier expects six parameters.
- [ ] First SQL result still has five compatible columns and no password.
- [ ] Angular sends numeric sort enum, has error/search/sort/page functions, and `Projects.js` passes `node --check`.
- [ ] Both views use `ModerationStatus` and bounded paging controls.
- [ ] Add/update/delete/authz debt is not claimed fixed.
- [ ] SQL verifier/smoke, Debug/Release and ERP-0001 regression pass.
- [ ] Diff has only 11 production paths and no EDMX/package/bin/obj noise.
- [ ] Send PROMPT 2 after implementation; do not begin ERP-0003.

## 20. Test matrix và test report summaries

Initial matrix is AC-01 through AC-12. All criteria passed in `.ai-erp-workflow/reports/ERP-0002-test-report-r01.md` on correction commit `2a2c9981d9d15020bd272320511af16244052e2f`, production fingerprint `9d209c3fd1344986ad1055ec2dab1c0e3a56804a3237379882b3c9f882dca548`. ERP-0002 gate: `36/0`; ERP-0001 identity regression: `39/0`.

## 21. Final closure / retrospective

Closed as `TASK_PASSED`. The correction separated persistence rows from public DTOs, preserved SQL Server 2012 compatibility, made the empty-page total explicit, removed generated noise, and proved the two live Angular consumers through IIS. Anonymous user mutations and authorization remain explicit debt for later tasks.
