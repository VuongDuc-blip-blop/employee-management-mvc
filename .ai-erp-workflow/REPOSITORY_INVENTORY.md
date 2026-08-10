# REPOSITORY INVENTORY

- Version: `1.0`
- Baseline branch: `TEST`
- Baseline SHA: `b06df0fdcb9f6997ad71c4eec421e385a233d2c8`
- Repository: `https://github.com/VuongDuc-blip-blop/employee-management-mvc`
- Discovery date: `2026-08-09` (`Asia/Saigon`)
- Source working tree: tracked source clean; local reference inputs untracked under `docs/markdowns/` and `prompts/`.
- Working-tree fingerprint SHA-256: `f1d0404ea974c349e91fb4690caa16f214a89bf2f0c81d2a1eb1b7844b4cc8f8`

## 1. Checkout and repository shape

- The workspace began as an empty Git repository. `origin` was set to the requested URL and branch `TEST` was fetched as a blob-filtered shallow checkout.
- `TEST` tracks `origin/TEST`; ahead/behind is `0/0` at discovery time.
- Application root: `WISE_REPORT/`.
- One solution and one application project:
  - `WISE_REPORT/Wise_Report.sln` (`Project` entry lines 2–7).
  - `WISE_REPORT/Wise_Report/Wise_Report.csproj` (legacy non-SDK ASP.NET Web Application; `ProjectTypeGuids` line 13, target framework line 18).
- Repository contains approximately 7,103 files. A large portion is vendored frontend content and tracked generated/build output.

## 2. Runtime stack and dependency conventions

| Area | Source evidence | Effective convention |
|---|---|---|
| Runtime | `Wise_Report.csproj:18` | .NET Framework 4.8, non-SDK project |
| MVC | `Wise_Report.csproj:221-224`, `RouteConfig.cs:16-20` | ASP.NET MVC 5.2.3, convention route, default `Home/Login` |
| API | `Wise_Report.csproj:258-265`, `WebApiConfig.cs:15-20` | ASP.NET Web API 2, attribute routes plus `api/{controller}/{id}` |
| Persistence | `packages.config:7`, `Database.Context.cs:16-32` | EF 6.1.3 Database First, generated `TestEntities` context |
| Stored-procedure access | `packages.config:6`, `Api_UserController.cs:41-49` | Dapper 1.60.1 over `db.Database.Connection` |
| Authentication | `Startup.cs:9-12`, `Startup.Auth.cs:15-34`, `HomeController.cs:31-65` | Incomplete OWIN/Identity registration coexists with custom session login |
| Notifications | `Startup.cs:12`, `Hub/Notifications.cs` | SignalR 2.4.1 present |
| Client | `Content/js/app.js:2-3`, `_Layout.cshtml:43-103` | AngularJS module `myApp`, Razor, jQuery, Bootstrap/AdminLTE, direct `$http` and `ajaxService` |
| Excel | `packages.config` | EPPlus 6.0.3 installed; current user export uses client-side AlaSQL instead |

Dependency conflicts with the references are resolved in favor of source: Dapper 1.60.1 and AutoMapper 7.0.1 match; IdentityModel 6.11.1 supersedes the reference's 6.7.1; EPPlus 6.0.3 supersedes 4.1.0; RestSharp, MongoDB.Driver, and Redis are absent and must not be installed without a real capability.

## 3. Startup, routes, bundles, and client bootstrap

- `Global.asax.cs:19-30` registers Areas, Web API, filters, MVC routes, and bundles.
- `Startup.cs:4,9-12` is the OWIN startup and maps SignalR.
- MVC default route is `{controller}/{action}/{id}` with `Home/Login` at `RouteConfig.cs:16-20`.
- Web API supports attribute routing and the conventional route at `WebApiConfig.cs:15-20`.
- The standard bundle catalog is small (`BundleConfig.cs:9-28`), while `_Layout.cshtml` directly loads many local/CDN scripts.
- `_Layout.cshtml:43-103` mixes duplicate AngularJS/router/SignalR assets and includes insecure `http://` CDN URLs. This is compatibility debt, not a convention to expand.
- `Content/js/app.js:2` declares `myApp` with `ngRoute`, `ui.router`, `ngAnimate`, `ngFileUpload`, and other dependencies. No real `$stateProvider`, `.state`, `ui-sref`, or `ui-view` implementation was found.

## 4. MVC, API, views, and shared contracts

- Compiled MVC controllers: `HomeController`, `EmployeeController`, `MarkettingReportController`, `Wise_ReportController`.
- Existing source views: five under `Views/Home`, one under `Views/Employee`, one under `Views/MarkettingReport`, and two shared layouts.
- Several controller actions have no matching source view. The `.csproj` also references missing view/content artifacts.
- Compiled API controllers:
  - `Api/Setting/Api_UserController.cs` (`Wise_Report.csproj:302`).
  - `Api/Setting/Api_DepartmentsController.cs` (`Wise_Report.csproj:303`).
- `Api/Setting/Api_EmployeeController.cs` exists but is not in the project `<Compile>` items. As written it also lacks required Dapper/DataModel/DTO imports. The current green build therefore does not cover this file.
- Shared contract convention:
  - queries under `Shared/Queries/` with paging/sort base fields;
  - forms under `Shared/Forms/`;
  - response items under `Shared/Dtos/`;
  - enums under `Enum/`.
- Contract inconsistencies include response casing, field casing, enum values, page totals, and success/error semantics. Current write endpoints use HTTP 200 strings for both success and business failure.

## 5. Verified source flows

### Read/list flow (verified up to the missing stored-procedure body)

1. MVC route `RouteConfig.cs:16-20` selects `HomeController.HomeLayout` (`HomeController.cs:23-25`).
2. `Views/Home/HomeLayout.cshtml:42,55-57` loads `Projects.js` and boots `ProjectsCtrl`.
3. `Content/js/Projects/Projects.js:12-27` POSTs `/api/Api_UserController/GetListUser`.
4. `Api_UserController.cs:34-49` invokes Dapper stored procedure `GetListUser` with search/page/sort parameters.
5. `Api_UserController.cs:51-70` maps the result and returns `{Data, TotalData, PageIndex, PageSize}`.
6. `Database.edmx:186-200,287-302` maps `User` to `dbo.Users` (`Database.edmx:103`).

The final SP-to-table edge is not proven because no `GetListUser` definition exists in the repository.

### Complete EF write flow

1. `HomeLayout.cshtml:125-171` contains the add-user modal.
2. `Projects.js:29-41` POSTs to `/api/Api_UserController/AddUser`.
3. `Api_UserController.cs:80-105` creates a generated EF `User` and calls `SaveChanges()` inside a transaction.
4. EDMX maps this write to `dbo.Users`.

`Employee/Index.cshtml` currently loads `Projects.js` and `ProjectsCtrl`, so it is another copy of the user screen rather than a functioning employee directory.

## 6. Database model and SQL assets

- `Models/DataModel/Database.edmx` uses SQL Server provider manifest token 2012.
- Mapped tables: `dbo.Users`, `dbo.Employees`, `dbo.Units`, `dbo.EmployeeUnits`, and `dbo.__EFMigrationsHistory` (`Database.edmx:8-112`).
- Mapped foreign keys: `Employees.UserId -> Users.Id` and `Units.ParentUnitId -> Units.Id` (`Database.edmx:74-97`). No FK association is modeled for `EmployeeUnits.EmployeeId/UnitId`.
- Generated context throws `UnintentionalCodeFirstException` in `OnModelCreating` (`Database.Context.cs:23-25`); generated files must not be hand-edited.
- Setting API call sites require `GetListUser`, `GetListEmployee`, `Proc_List_Departments01`, and `Proc_List_Departments_Count`; `MarkettingReportController.cs:30-34` additionally calls `Proc_Get_Report_Header`. None has a checked-in definition.
- `WISE_REPORT/create_sample_data.sql` contains only one unrelated `PATLITE_STATE_CONTROL` insert and cannot bootstrap the mapped database.
- Legacy EF migration configuration targets unrelated/malformed `ProjectManagements` and creates obsolete Administrator/SmartOKRs objects, not the current EDMX schema.
- Active `TestEntities` configuration points to integrated-security LocalDB database `EmployeeManagementCoreDb`.
- The `MSSQLLocalDB` instance exists and is running, but `EmployeeManagementCoreDb` did not exist at baseline. Database-name discovery exited 0 with no row; opening the target database exited 1.

## 7. Build, restore, and test status

### Build probe

Command:

```powershell
& 'C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe' 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Debug '/p:OutputPath=..\..\.ai-erp-workflow\build-probe\bin\' '/p:BaseIntermediateOutputPath=..\..\.ai-erp-workflow\build-probe\obj\' /m /nologo /v:minimal
```

- Exit code: `0`.
- Output: `.ai-erp-workflow/build-probe/bin/Wise_Report.dll`.
- Warnings: four duplicate `using` directives in `EmployeeController.cs:7-11` and one unused exception variable in `HomeController.cs:140`.
- Build output was redirected outside source. Tracked source remained clean.

### Restore status

- `WISE_REPORT/packages/` exists on the current machine and contains the package cache, but it is ignored/untracked.
- No standalone `nuget.exe` is on `PATH`.
- A build from an empty clone with a clean package restore is therefore not proven reproducible.

### Test status

- No application test project, `.runsettings`, test assembly, or application-owned E2E suite exists.
- Vendor library tests under `Content/` are not tests of this application.
- Test status is `ABSENT`.

### Project-manifest integrity

- The project references many missing content/bin/view items and explicitly includes stale `obj/Release` package content.
- Tracked generated artifacts include hundreds of `bin`, `obj`, `.vs`, and DLL files despite current ignore rules.
- This is a future baseline-cleanup task; it is not silently repaired during discovery.

## 8. Security and data-integrity findings

- Source configuration and an obsolete commented notification class contain reusable-looking credentials. Values are intentionally omitted from all workflow artifacts. Rotation is required if they were ever valid.
- The Web reference contains a literal external API token. It is treated as exposed and is never copied or used.
- `HomeController.Login` computes a hash but queries only by username (`HomeController.cs:40-54`), so the password is not verified.
- `Api_UserController` stores the submitted password directly (`:90-102`). `Commons.MD5Hash` is unsalted MD5 and is unsuitable for new credentials.
- `UserPageItem.Password` and the list mapping expose password material (`UserPageItem.cs:6-10`, `Api_UserController.cs:51-58`).
- No effective `[Authorize]` protection was found on APIs; `Web.config` authentication mode is None, and layout session checks do not secure API routes.
- User delete hard-deletes despite `IsDeleted`/audit fields.
- Avatar upload preserves user filenames and lacks explicit extension/content/size/random-name/overwrite controls.
- Raw `$sce.trustAsHtml` is globally available and must not be used on unsanitized input.
- DB examples using `NOLOCK`, direct DELETE/UPDATE, `KILL`, global temp tables, and concatenated dynamic SQL are reference clues only and are not accepted as production conventions.

## 9. Baseline conclusion

The repository compiles on the current machine, but it is not a reproducible application baseline: clean restore is unproven, application tests are absent, the configured database is missing, required stored procedures are unversioned, the employee API is omitted from compilation, and critical secret/auth/password risks exist. The first dependency-ready task must establish a safe, versioned LocalDB database contract before an ERP vertical slice.
