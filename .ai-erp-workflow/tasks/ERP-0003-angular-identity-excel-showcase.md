# ERP-0003 — Angular Identity UX and User Excel Showcase

## 1. Metadata and state

| Field | Value |
|---|---|
| Task ID | `ERP-0003` |
| State | `GUIDE_READY` |
| Provenance | `HUMAN_PRIORITY` + `REPO_EXISTING repair` |
| Human effort | 8–12 hours; one user-requested combined showcase slice |
| Risk | High — authentication UX contract, anti-forgery, binary exports and spreadsheet injection |
| Consumes | `LocalDatabaseBaseline/v1`, `SessionIdentity/v1`, `UserDirectory/v1` |
| Produces | `AngularSessionIdentity/v2`, `UserExcelShowcase/v1` |
| Production baseline | `2a2c9981d9d15020bd272320511af16244052e2f` |
| Guide revision | `r01`, 2026-08-11 |

State history:

1. `TASK_PLANNED` — selected immediately after ERP-0002 exact-fingerprint PASS because the human explicitly reprioritized identity UX and Excel showcase work.
2. `GUIDE_READY` — source-first contract and complete typing guide prepared against ERP-0002 correction HEAD.

## 2. Why this task is next

ERP-0002 made the user-directory read contract safe and deterministic. That gives the Excel feature a password-free projection, literal search behavior and a stable total count. ERP-0001 already proved the credential and session rules, so its Razor-submitted forms can now be changed to AngularJS interaction without changing password storage or inventing JWT/local-storage authentication.

The user explicitly requested both outcomes in the next task. They form one portfolio/showcase journey:

`Angular login → authenticated shell → safe user directory → choose an Excel technique → Angular logout/change password`.

The task is intentionally at the upper edge of normal task size. Do not add employee CRUD, roles, audit, import, package upgrades or schema work.

## 3. Source evidence and conflict adjudication

| Evidence | Classification | Decision |
|---|---|---|
| `docs/markdowns/web.md:13` says EPPlus 4.1.0 | `SOURCE_EXPLICIT`, stale | Repository `packages.config` and project references prove EPPlus 6.0.3. Do not downgrade. |
| `web.md:489-580` describes Excel import through pasted HTML/CKEditor | `REFERENCE_ONLY`, unsafe for this goal | Export only; do not add trusted HTML/import. |
| `Projects.js:149-176` uses AlaSQL `XLSXML` | `REPO_EXISTING`, `ADAPT_WITH_GUARD` | Keep as a current-page technique, but export only normalized/formula-neutralized DTO values. |
| `Projects.js:231-286` builds `.xls` from raw DOM and IE `execCommand` | `REPO_EXISTING`, `LEGACY_COMPAT` | Replace with a fixed-column encoded HTML workbook; remove raw DOM and IE branch. |
| `Mark_daily_report.js:562-661` builds multi-sheet MIME `.xls` from raw table HTML | `REPO_EXISTING`, `LEGACY_COMPAT` | Demonstrate the technique using generated fixed-column sheets, never arbitrary DOM HTML. |
| `MarkettingReportController.cs:30-45` and commented `HomeController.cs:125-153` emit GridView/HTML as `.xls` | `REPO_EXISTING`, `ADAPT_WITH_GUARD` | Add an authenticated server HTML compatibility export using encoded values and bounded rows; do not reuse GridView or `Response.End`. |
| EPPlus 6.0.3 is installed | `REPO_EXISTING`, `LICENSE_GATED` | Add genuine `.xlsx`, disabled by default until a commercial EPPlus license is confirmed. Never set `NonCommercial` on a company machine. |
| ERP-0001 Razor POST actions and anti-forgery are proven | `MASTERED` | Preserve server validation/session/PBKDF2; change only the browser interaction and response shape. |

## 4. Goal and journeys

### Identity journey

1. GET login/change-password remains an MVC view shell.
2. Forms use AngularJS `ng-submit`, `ng-model`, busy state and explicit error rendering; no `Html.BeginForm`, `TextBoxFor`, `PasswordFor` or Razor validation summary.
3. Angular posts URL-encoded fields plus the hidden MVC anti-forgery token.
4. MVC returns a small JSON envelope and never returns credential fields or exception details.
5. Session remains server-side. No JWT, bearer token or password/local-storage state is introduced.
6. Logout is an Angular-triggered anti-forgery POST; GET logout remains unavailable.

### Excel showcase journey

The two verified user-list views expose five named techniques:

1. AlaSQL/XLSXML — current page.
2. Client HTML `.xls` — current page, compatibility format.
3. Client multi-sheet MIME `.xls` — current page plus criteria sheet, compatibility format.
4. Server HTML `.xls` — all filtered rows, authenticated, maximum 5,000 rows.
5. Server EPPlus `.xlsx` — all filtered rows, authenticated, maximum 5,000 rows, commercial-license gate.

Every mode uses only `Id`, `UserName`, `CreatedAt`, and human-readable `ModerationStatus`. Text beginning with `=`, `+`, `-`, `@`, tab or carriage return is prefixed with an apostrophe before it reaches a spreadsheet.

## 5. In scope

- AngularJS login, logout and change-password interaction.
- JSON response envelope for the three existing MVC POST operations.
- Existing server-side credential verification, PBKDF2 upgrade, change-password transaction and session invalidation.
- Five clearly labelled user-directory export techniques.
- Authentication, row cap, fixed projection, formula-neutralization and generic error boundaries for server exports.
- Both live user-list views and explicit classic-project registration.
- Full Framework build, LocalDB regression, IIS identity/export E2E and binary-content checks.

## 6. Out of scope

- Changing password hashing, password policy, session store, lockout, MFA, password reset or authorization roles.
- Repairing anonymous Add/Update/Delete user endpoints; their controls remain critical debt and should not be promoted as safe.
- Excel import, CKEditor trusted HTML, employee export or employee directory.
- Downgrading EPPlus, claiming an EPPlus commercial license, or enabling EPPlus by default.
- CDN/package modernization, global layout cleanup, EDMX/schema/stored-procedure changes.
- Replacing AngularJS or MVC/Razor as the server-side view engine. Razor remains the thin HTML/token host; interaction moves to AngularJS.

## 7. Contracts

### Identity JSON envelope

Success:

```json
{
  "Success": true,
  "RedirectUrl": "/Home/HomeLayout",
  "Errors": []
}
```

Validation/authentication failure uses HTTP 400 and a generic or DataAnnotations-derived error list. Expired session during change-password uses HTTP 401 with a server-generated login redirect. Unexpected failure uses HTTP 500 and only a generic Vietnamese message.

### Server export query

```text
GET /UserExport/HtmlXls?search=&sortDirection=1
GET /UserExport/Xlsx?search=&sortDirection=1
```

- `sortDirection`: exact numeric `1` ascending or `2` descending.
- `search`: optional, at most 256 characters.
- unauthenticated: HTTP 401.
- over 5,000 filtered rows: HTTP 413.
- EPPlus gate false: HTTP 409.
- success: attachment with safe filename and exact content type.

## 8. Business and safety rules

1. Anti-forgery remains mandatory for login, logout and password change.
2. Angular sends URL-encoded forms so MVC's standard anti-forgery validator can read `__RequestVerificationToken` without a custom security filter.
3. Password values are never copied to scope outside their form model, logged, returned or persisted client-side.
4. Identity errors do not distinguish unknown, deleted, pending, rejected, duplicate or wrong-password accounts.
5. Successful password change clears/abandons the session and redirects to login.
6. Export endpoints require a valid `userid` session before querying.
7. Export query is server-validated, bounded to 5,000 rows and deterministic by username then Id.
8. All export modes use fixed columns; no DOM `innerHTML`, `unsafe`, `Response.End`, `GridView`, IE `execCommand` or dynamic SQL.
9. Formula-like text is neutralized in client HTML, multi-sheet, AlaSQL and server HTML/EPPlus modes.
10. EPPlus 6 runs only when `ExcelShowcase:EpplusCommercialLicenseConfirmed=true`; default remains `false`.
11. The flag is a human compliance assertion, not a license. Do not enable it unless the company has a valid commercial EPPlus license.
12. No password/hash, generated `User` object or per-row `TotalCount` appears in any workbook.

## 9. Acceptance criteria

| ID | Observable criterion | Evidence seam |
|---|---|---|
| AC-01 | Login view uses Angular form binding/submission and no Razor form/input/validation helpers. | STATIC/VIEW-01 |
| AC-02 | Valid login returns JSON success, establishes session and redirects through Angular. | MVC/E2E-02 |
| AC-03 | Invalid login remains generic; invalid/missing anti-forgery is rejected; no credential is echoed. | MVC/SEC-03 |
| AC-04 | Change-password Angular journey preserves validation, transaction, re-login and old-password rejection. | MVC/E2E-04 |
| AC-05 | Both logout controls call the same Angular anti-forgery POST; GET logout is blocked and session is cleared. | STATIC/E2E-05 |
| AC-06 | AlaSQL current-page export has the exact four safe columns and neutralizes formula-like username text. | JS/E2E-06 |
| AC-07 | Client HTML `.xls` is generated from fixed encoded values, not DOM HTML or IE APIs. | STATIC/BINARY-07 |
| AC-08 | Client multi-sheet `.xls` contains Users and Criteria sheets using fixed encoded values. | JS/BINARY-08 |
| AC-09 | Server HTML `.xls` requires session, applies current filter/sort, caps 5,000 and contains no password. | MVC/BINARY-09 |
| AC-10 | EPPlus `.xlsx` is disabled with 409 by default; when a licensed test flag is explicitly supplied, workbook metadata/rows/formula defenses pass. | CONFIG/BINARY-10 |
| AC-11 | Both user-list views show all five labelled modes, busy/error state and the service is loaded before `Projects.js`. | STATIC/E2E-11 |
| AC-12 | Server query returns 400 for oversized search/invalid sort, 401 without session and 413 above cap. | MVC-12 |
| AC-13 | Identity/export server failures are generic; no password/hash/stack/connection text is returned. | SEC-13 |
| AC-14 | Full Framework restore, Debug/Release build, Node syntax, LocalDB baseline and IIS journeys pass. | BUILD/DB/E2E-14 |
| AC-15 | ERP-0002 paging and ERP-0001 credential rules regress green after their response-contract tests are versioned for Angular JSON. | REG-15 |
| AC-16 | Diff matches the exact 12-path production write-set with no SQL/EDMX/package/generated/secret noise. | STATIC-16 |

## 10. Definition of Done

All ACs pass on one source fingerprint. The report must distinguish mandatory default-license tests from the optional licensed EPPlus test. A missing commercial license cannot be bypassed with `LicenseContext.NonCommercial`; the default 409 behavior is the correct mandatory result. ERP-0004 is not selected until this task passes.

## 11. Allowed production write-set

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

No SQL, EDMX, package, generated, bin, obj or unrelated layout file is allowed.

## 12. Allowed test write-set

Tester may add/update only:

- `WISE_REPORT/Tests/ERP-0003/Invoke-ERP0003AngularExcelGate.ps1`
- `WISE_REPORT/Tests/ERP-0003/UserExcelShowcase.Tests.js`
- `WISE_REPORT/Tests/ERP-0003/Inspect-Xlsx.ps1`
- ERP-0001/ERP-0002 harness assertions needed to consume the new JSON identity contract, without removing or weakening any credential, anti-forgery, paging or residue assertion.
- `.ai-erp-workflow/reports/ERP-0003-test-report-r01.md` and task/state summary sections.

## 13. Implementation guide r01

### STEP 00 — Preflight

Run from repository root:

```powershell
git fetch origin TEST
if ($LASTEXITCODE -ne 0) { throw "Fetch failed." }
git branch --show-current
git rev-parse HEAD
git status --short
git diff --exit-code 2a2c9981d9d15020bd272320511af16244052e2f -- WISE_REPORT
if ($LASTEXITCODE -ne 0) {
    throw "WISE_REPORT differs from the ERP-0003 production baseline."
}
```

Expected: branch `TEST`; guide delivery commits may be newer, but `WISE_REPORT` must match production baseline `2a2c998`; only the known local `docs/markdowns/` and `prompts/` inputs may be untracked.

### STEP 01 — ADD `Content/js/Identity/Identity.js`

Create directory `WISE_REPORT/Wise_Report/Content/js/Identity` if needed, then create the complete file:

```javascript
(function (window, angular) {
    'use strict';

    function registerIdentity(module) {
        module.factory('identityClient', ['$http', '$q', '$window', function ($http, $q, $window) {
            function antiForgeryToken() {
                var input = window.document.querySelector(
                    'input[name="__RequestVerificationToken"]');
                return input ? input.value : '';
            }

            function formEncode(values) {
                return Object.keys(values).map(function (key) {
                    var value = values[key] === null || values[key] === undefined
                        ? ''
                        : values[key];
                    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }).join('&');
            }

            function post(url, model) {
                var payload = angular.extend({}, model, {
                    __RequestVerificationToken: antiForgeryToken()
                });

                return $http({
                    method: 'POST',
                    url: url,
                    data: formEncode(payload),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    transformRequest: angular.identity
                });
            }

            function errors(response, fallback) {
                var data = response && response.data ? response.data : {};
                if (angular.isArray(data.Errors) && data.Errors.length > 0) {
                    return data.Errors;
                }
                return [fallback];
            }

            function redirect(url) {
                $window.location.assign(url);
            }

            return {
                post: post,
                errors: errors,
                redirect: redirect,
                reject: $q.reject
            };
        }]);

        module.controller('LoginCtrl', ['identityClient', function (identityClient) {
            var vm = this;
            vm.form = { UserName: '', Password: '' };
            vm.errors = [];
            vm.busy = false;

            vm.submit = function () {
                if (vm.busy) {
                    return;
                }

                vm.busy = true;
                vm.errors = [];
                identityClient.post('/Home/Login', vm.form).then(function (response) {
                    identityClient.redirect(response.data.RedirectUrl || '/Home/HomeLayout');
                }, function (response) {
                    vm.errors = identityClient.errors(
                        response,
                        'Không thể đăng nhập. Vui lòng thử lại.');
                }).finally(function () {
                    vm.busy = false;
                    vm.form.Password = '';
                });
            };
        }]);

        module.controller('ChangePasswordCtrl', ['identityClient', function (identityClient) {
            var vm = this;
            vm.form = {
                CurrentPassword: '',
                NewPassword: '',
                ConfirmNewPassword: ''
            };
            vm.errors = [];
            vm.busy = false;

            vm.submit = function () {
                if (vm.busy) {
                    return;
                }

                vm.busy = true;
                vm.errors = [];
                identityClient.post('/Home/ChangePassword', vm.form).then(function (response) {
                    identityClient.redirect(response.data.RedirectUrl || '/Home/Login');
                }, function (response) {
                    if (response.status === 401 && response.data.RedirectUrl) {
                        identityClient.redirect(response.data.RedirectUrl);
                        return;
                    }
                    vm.errors = identityClient.errors(
                        response,
                        'Không thể đổi mật khẩu. Vui lòng thử lại.');
                }).finally(function () {
                    vm.busy = false;
                    vm.form.CurrentPassword = '';
                    vm.form.NewPassword = '';
                    vm.form.ConfirmNewPassword = '';
                });
            };
        }]);

        module.controller('SessionIdentityCtrl', ['identityClient', function (identityClient) {
            var vm = this;
            vm.busy = false;
            vm.error = '';

            vm.logout = function () {
                if (vm.busy) {
                    return;
                }

                vm.busy = true;
                vm.error = '';
                identityClient.post('/Home/Logout', {}).then(function (response) {
                    identityClient.redirect(response.data.RedirectUrl || '/Home/Login');
                }, function (response) {
                    vm.error = identityClient.errors(
                        response,
                        'Không thể đăng xuất. Vui lòng thử lại.')[0];
                }).finally(function () {
                    vm.busy = false;
                });
            };
        }]);
    }

    registerIdentity(angular.module('identityApp', []));
    if (window.app) {
        registerIdentity(window.app);
    }
})(window, window.angular);
```

Why: the standalone `identityApp` lets login/change-password load only local AngularJS. The same controllers are registered on the existing `myApp` for layout logout. No password is stored outside the controller form object.

### STEP 02 — MODIFY identity POST actions in `HomeController.cs`

Keep the current GET actions, database field, upload methods and unrelated controller code. Replace current lines 49–119, from the `[HttpPost]` immediately before `Login(LoginForm form)` through the closing brace of `Logout()`, with this complete block:

```csharp
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginForm form)
        {
            if (!ModelState.IsValid)
            {
                return IdentityJson(
                    false,
                    null,
                    GetModelStateErrors(),
                    400);
            }

            var normalizedUserName = form.UserName.Trim();
            var candidates = db.Users
                .Where(x =>
                    !x.IsDeleted
                    && x.ModerationStatus == (int)ModerationStatus.Approved
                    && x.UserName == normalizedUserName)
                .Take(2)
                .ToList();

            var user = candidates.Count == 1
                ? candidates[0]
                : null;
            var verification = user == null
                ? new PasswordCheckResult(false, false)
                : PasswordSecurity.VerifyPassword(user.Password, form.Password);

            if (user == null || !verification.Succeeded)
            {
                return IdentityJson(
                    false,
                    null,
                    new[] { "Tên đăng nhập hoặc mật khẩu không đúng." },
                    400);
            }

            if (verification.RequiresUpgrade)
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        user.Password = PasswordSecurity.HashPassword(form.Password);
                        user.LastModifiedAt = DateTime.UtcNow;
                        user.LastModifiedBy = user.Id;
                        db.SaveChanges();
                        transaction.Commit();
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        return IdentityJson(
                            false,
                            null,
                            new[] { "Không thể hoàn tất đăng nhập. Vui lòng thử lại." },
                            500);
                    }
                }
            }

            Session.Clear();
            Session["username"] = user.UserName;
            Session["userid"] = user.Id;

            return IdentityJson(
                true,
                Url.Action("HomeLayout", "Home"),
                Enumerable.Empty<string>(),
                200);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return IdentityJson(
                true,
                Url.Action("Login", "Home"),
                Enumerable.Empty<string>(),
                200);
        }
```

Replace current lines 165–236, the complete POST `ChangePassword(ChangePasswordForm form)` action, with:

```csharp
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(ChangePasswordForm form)
        {
            Guid userId;
            if (Session["userid"] == null
                || !Guid.TryParse(Convert.ToString(Session["userid"]), out userId))
            {
                Session.Clear();
                Session.Abandon();
                return IdentityJson(
                    false,
                    Url.Action("Login", "Home"),
                    new[] { "Phiên đăng nhập đã hết hạn." },
                    401);
            }

            if (!ModelState.IsValid)
            {
                return IdentityJson(
                    false,
                    null,
                    GetModelStateErrors(),
                    400);
            }

            var user = db.Users.SingleOrDefault(x =>
                x.Id == userId
                && !x.IsDeleted
                && x.ModerationStatus == (int)ModerationStatus.Approved);

            if (user == null)
            {
                Session.Clear();
                Session.Abandon();
                return IdentityJson(
                    false,
                    Url.Action("Login", "Home"),
                    new[] { "Phiên đăng nhập đã hết hạn." },
                    401);
            }

            var currentVerification = PasswordSecurity.VerifyPassword(
                user.Password,
                form.CurrentPassword);
            if (!currentVerification.Succeeded)
            {
                return IdentityJson(
                    false,
                    null,
                    new[] { "Mật khẩu hiện tại không đúng." },
                    400);
            }

            var samePassword = PasswordSecurity.VerifyPassword(
                user.Password,
                form.NewPassword);
            if (samePassword.Succeeded)
            {
                return IdentityJson(
                    false,
                    null,
                    new[] { "Mật khẩu mới phải khác mật khẩu hiện tại." },
                    400);
            }

            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    user.Password = PasswordSecurity.HashPassword(form.NewPassword);
                    user.LastModifiedAt = DateTime.UtcNow;
                    user.LastModifiedBy = user.Id;
                    db.SaveChanges();
                    transaction.Commit();
                }
                catch (Exception)
                {
                    transaction.Rollback();
                    return IdentityJson(
                        false,
                        null,
                        new[] { "Không thể đổi mật khẩu. Vui lòng thử lại." },
                        500);
                }
            }

            Session.Clear();
            Session.Abandon();
            return IdentityJson(
                true,
                Url.Action("Login", "Home"),
                Enumerable.Empty<string>(),
                200);
        }
```

Immediately before the `//Lưu ảnh` anchor, add these complete private helpers:

```csharp
        private IEnumerable<string> GetModelStateErrors()
        {
            return ModelState.Values
                .SelectMany(value => value.Errors)
                .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                    ? "Dữ liệu không hợp lệ."
                    : error.ErrorMessage)
                .ToList();
        }

        private JsonResult IdentityJson(
            bool success,
            string redirectUrl,
            IEnumerable<string> errors,
            int statusCode)
        {
            Response.StatusCode = statusCode;
            Response.TrySkipIisCustomErrors = true;
            return Json(new
            {
                Success = success,
                RedirectUrl = redirectUrl,
                Errors = errors ?? Enumerable.Empty<string>()
            });
        }

```

Checkpoint: there is still exactly one login POST, one logout POST and one change-password POST; all retain `[ValidateAntiForgeryToken]`. No action returns `View(form)` or a redirect after a POST.

### STEP 03 — REPLACE `Views/Home/Login.cshtml`

Replace all current 896 lines with this complete AngularJS view:

```cshtml
@{
    Layout = null;
}
<!DOCTYPE html>
<html lang="vi" ng-app="identityApp">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Wise Management | Đăng nhập</title>
    <link rel="stylesheet" href="~/Content/bower_components/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/Content/bower_components/font-awesome/css/font-awesome.min.css" />
    <style>
        body {
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #102a43 0%, #146eb5 55%, #18af8b 100%);
            font-family: "Segoe UI", Arial, sans-serif;
        }
        .identity-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .identity-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
            padding: 34px;
        }
        .identity-title { margin: 0 0 8px; color: #102a43; font-weight: 700; }
        .identity-subtitle { margin-bottom: 26px; color: #627d98; }
        .identity-error { margin-bottom: 18px; }
        .identity-submit { min-height: 44px; font-weight: 600; }
        .form-control { min-height: 44px; }
    </style>
</head>
<body ng-controller="LoginCtrl as vm">
    <main class="identity-shell">
        <section class="identity-card" aria-labelledby="login-title">
            <h1 id="login-title" class="identity-title">WISE Management</h1>
            <p class="identity-subtitle">Đăng nhập bằng tài khoản được phê duyệt.</p>

            <div class="alert alert-danger identity-error"
                 ng-if="vm.errors.length"
                 role="alert">
                <div ng-repeat="error in vm.errors track by $index" ng-bind="error"></div>
            </div>

            <form name="loginForm"
                  ng-submit="vm.submit()"
                  novalidate
                  autocomplete="on">
                @Html.AntiForgeryToken()

                <div class="form-group">
                    <label for="login-username">Tên đăng nhập</label>
                    <input id="login-username"
                           name="UserName"
                           class="form-control"
                           type="text"
                           ng-model="vm.form.UserName"
                           maxlength="256"
                           autocomplete="username"
                           required
                           autofocus />
                </div>

                <div class="form-group">
                    <label for="login-password">Mật khẩu</label>
                    <input id="login-password"
                           name="Password"
                           class="form-control"
                           type="password"
                           ng-model="vm.form.Password"
                           maxlength="128"
                           autocomplete="current-password"
                           required />
                </div>

                <button type="submit"
                        class="btn btn-primary btn-block identity-submit"
                        ng-disabled="loginForm.$invalid || vm.busy">
                    <span ng-if="!vm.busy">Đăng nhập</span>
                    <span ng-if="vm.busy"><i class="fa fa-spinner fa-spin"></i> Đang xác thực</span>
                </button>
            </form>
        </section>
    </main>

    <script src="~/Content/dist/js/angular.min.js"></script>
    <script src="~/Content/js/Identity/Identity.js?time=@DateTime.UtcNow.Ticks"></script>
</body>
</html>
```

### STEP 04 — REPLACE `Views/Home/ChangePassword.cshtml`

Replace the entire file with:

```cshtml
@{
    Layout = null;
}
<!DOCTYPE html>
<html lang="vi" ng-app="identityApp">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Wise Management | Đổi mật khẩu</title>
    <link rel="stylesheet" href="~/Content/bower_components/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/Content/bower_components/font-awesome/css/font-awesome.min.css" />
    <style>
        body {
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #102a43 0%, #334e68 55%, #18af8b 100%);
            font-family: "Segoe UI", Arial, sans-serif;
        }
        .identity-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .identity-card {
            width: 100%;
            max-width: 480px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
            padding: 34px;
        }
        .identity-title { margin: 0 0 8px; color: #102a43; font-weight: 700; }
        .identity-subtitle { margin-bottom: 26px; color: #627d98; }
        .identity-actions { display: flex; gap: 10px; align-items: center; }
        .identity-actions .btn { min-height: 44px; }
        .form-control { min-height: 44px; }
    </style>
</head>
<body ng-controller="ChangePasswordCtrl as vm">
    <main class="identity-shell">
        <section class="identity-card" aria-labelledby="change-password-title">
            <h1 id="change-password-title" class="identity-title">Đổi mật khẩu</h1>
            <p class="identity-subtitle">Mật khẩu mới phải có từ 12 đến 128 ký tự.</p>

            <div class="alert alert-danger"
                 ng-if="vm.errors.length"
                 role="alert">
                <div ng-repeat="error in vm.errors track by $index" ng-bind="error"></div>
            </div>

            <form name="changePasswordForm"
                  ng-submit="vm.submit()"
                  novalidate
                  autocomplete="off">
                @Html.AntiForgeryToken()

                <div class="form-group">
                    <label for="current-password">Mật khẩu hiện tại</label>
                    <input id="current-password"
                           name="CurrentPassword"
                           class="form-control"
                           type="password"
                           ng-model="vm.form.CurrentPassword"
                           maxlength="128"
                           autocomplete="current-password"
                           required />
                </div>

                <div class="form-group">
                    <label for="new-password">Mật khẩu mới</label>
                    <input id="new-password"
                           name="NewPassword"
                           class="form-control"
                           type="password"
                           ng-model="vm.form.NewPassword"
                           minlength="12"
                           maxlength="128"
                           autocomplete="new-password"
                           required />
                </div>

                <div class="form-group">
                    <label for="confirm-new-password">Xác nhận mật khẩu mới</label>
                    <input id="confirm-new-password"
                           name="ConfirmNewPassword"
                           class="form-control"
                           type="password"
                           ng-model="vm.form.ConfirmNewPassword"
                           minlength="12"
                           maxlength="128"
                           autocomplete="new-password"
                           required />
                </div>

                <div class="identity-actions">
                    <button type="submit"
                            class="btn btn-primary"
                            ng-disabled="changePasswordForm.$invalid || vm.busy">
                        <span ng-if="!vm.busy">Đổi mật khẩu</span>
                        <span ng-if="vm.busy"><i class="fa fa-spinner fa-spin"></i> Đang lưu</span>
                    </button>
                    <a class="btn btn-default" href="/Home/HomeLayout">Hủy</a>
                </div>
            </form>
        </section>
    </main>

    <script src="~/Content/dist/js/angular.min.js"></script>
    <script src="~/Content/js/Identity/Identity.js?time=@DateTime.UtcNow.Ticks"></script>
</body>
</html>
```

### STEP 05 — MODIFY Angular logout in `_Layout.cshtml`

Immediately after the existing `app.js` script line, add:

```cshtml
    <script src="~/Content/js/Identity/Identity.js?time=@DateTime.UtcNow.Ticks"></script>
```

Immediately inside `<div class="wrapper"`, before the session hidden inputs, add one token host:

```cshtml
        <div class="hidden" aria-hidden="true">@Html.AntiForgeryToken()</div>
```

Replace the first `@using (Html.BeginForm("Logout"` block in the profile dropdown with:

```cshtml
                            <div ng-controller="SessionIdentityCtrl as identity">
                                <button type="button"
                                        class="dropdown-item border-0 bg-transparent"
                                        ng-click="identity.logout()"
                                        ng-disabled="identity.busy">
                                    <i class="mdi mdi-logout mr-2 text-primary"></i> Sign out
                                </button>
                                <small class="text-danger" ng-if="identity.error" ng-bind="identity.error"></small>
                            </div>
```

Replace the second logout form inside `<li class="nav-item nav-logout` with:

```cshtml
                        <div ng-controller="SessionIdentityCtrl as identity">
                            <button type="button"
                                    class="nav-link border-0 bg-transparent"
                                    aria-label="Sign out"
                                    ng-click="identity.logout()"
                                    ng-disabled="identity.busy">
                                <i class="mdi mdi-power"></i>
                            </button>
                        </div>
```

Checkpoint:

```powershell
rg -n 'BeginForm\("Logout"|href="/Home/Logout"' 'WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml'
```

Expected: no match.

### STEP 06 — ADD `Controllers/UserExportController.cs`

Create the complete file:

```csharp
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Wise_Report.Models.DataModel;

namespace Wise_Report.Controllers
{
    public sealed class UserExportController : Controller
    {
        private const int MaxExportRows = 5000;
        private readonly TestEntities db = new TestEntities();

        [HttpGet]
        public ActionResult HtmlXls(string search, int sortDirection = 1)
        {
            List<UserExportRow> rows;
            ActionResult error;
            if (!TryLoadRows(search, sortDirection, out rows, out error))
            {
                return error;
            }

            try
            {
                var bytes = BuildHtmlWorkbook(rows);
                return File(
                    bytes,
                    "application/vnd.ms-excel",
                    BuildFileName("users-server-html", ".xls"));
            }
            catch (Exception)
            {
                return new HttpStatusCodeResult(500, "Unable to create the export.");
            }
        }

        [HttpGet]
        public ActionResult Xlsx(string search, int sortDirection = 1)
        {
            if (!string.Equals(
                ConfigurationManager.AppSettings[
                    "ExcelShowcase:EpplusCommercialLicenseConfirmed"],
                "true",
                StringComparison.OrdinalIgnoreCase))
            {
                return new HttpStatusCodeResult(
                    409,
                    "EPPlus export is disabled until a commercial license is confirmed.");
            }

            List<UserExportRow> rows;
            ActionResult error;
            if (!TryLoadRows(search, sortDirection, out rows, out error))
            {
                return error;
            }

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.Commercial;
                using (var package = new ExcelPackage())
                {
                    var sheet = package.Workbook.Worksheets.Add("Users");
                    sheet.Cells[1, 1].Value = "Id";
                    sheet.Cells[1, 2].Value = "UserName";
                    sheet.Cells[1, 3].Value = "CreatedAt";
                    sheet.Cells[1, 4].Value = "ModerationStatus";
                    sheet.Cells[1, 1, 1, 4].Style.Font.Bold = true;

                    for (var index = 0; index < rows.Count; index++)
                    {
                        var excelRow = index + 2;
                        sheet.Cells[excelRow, 1].Value = rows[index].Id.ToString("D");
                        sheet.Cells[excelRow, 2].Value = NeutralizeFormula(rows[index].UserName);
                        sheet.Cells[excelRow, 3].Value = rows[index].CreatedAt;
                        sheet.Cells[excelRow, 3].Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                        sheet.Cells[excelRow, 4].Value = rows[index].ModerationStatus;
                    }

                    sheet.View.FreezePanes(2, 1);
                    sheet.Cells[sheet.Dimension.Address].AutoFitColumns(12, 40);
                    return File(
                        package.GetAsByteArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        BuildFileName("users-epplus", ".xlsx"));
                }
            }
            catch (Exception)
            {
                return new HttpStatusCodeResult(500, "Unable to create the export.");
            }
        }

        private bool TryLoadRows(
            string search,
            int sortDirection,
            out List<UserExportRow> rows,
            out ActionResult error)
        {
            rows = null;
            error = null;

            Guid userId;
            if (Session["userid"] == null
                || !Guid.TryParse(Convert.ToString(Session["userid"]), out userId))
            {
                error = new HttpStatusCodeResult(401, "Authentication is required.");
                return false;
            }

            if (search != null && search.Length > 256)
            {
                error = new HttpStatusCodeResult(400, "Search cannot exceed 256 characters.");
                return false;
            }

            if (sortDirection != 1 && sortDirection != 2)
            {
                error = new HttpStatusCodeResult(400, "Sort direction is invalid.");
                return false;
            }

            try
            {
                var normalizedSearch = string.IsNullOrWhiteSpace(search)
                    ? null
                    : search.Trim();
                var users = db.Users.AsNoTracking().Where(user => !user.IsDeleted);
                if (normalizedSearch != null)
                {
                    users = users.Where(user => user.UserName.Contains(normalizedSearch));
                }

                var ordered = sortDirection == 1
                    ? users.OrderBy(user => user.UserName).ThenBy(user => user.Id)
                    : users.OrderByDescending(user => user.UserName).ThenBy(user => user.Id);

                var rawRows = ordered
                    .Select(user => new
                    {
                        user.Id,
                        user.UserName,
                        user.CreatedAt,
                        user.ModerationStatus
                    })
                    .Take(MaxExportRows + 1)
                    .ToList();

                if (rawRows.Count > MaxExportRows)
                {
                    error = new HttpStatusCodeResult(
                        413,
                        "The export exceeds the 5000-row limit.");
                    return false;
                }

                rows = rawRows.Select(user => new UserExportRow
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    CreatedAt = user.CreatedAt,
                    ModerationStatus = StatusText(user.ModerationStatus)
                }).ToList();
                return true;
            }
            catch (Exception)
            {
                error = new HttpStatusCodeResult(500, "Unable to load export data.");
                return false;
            }
        }

        private static byte[] BuildHtmlWorkbook(IEnumerable<UserExportRow> rows)
        {
            var html = new StringBuilder();
            html.Append("<html><head><meta charset=\"utf-8\"></head><body><table border=\"1\">");
            html.Append("<thead><tr><th>Id</th><th>UserName</th><th>CreatedAt</th><th>ModerationStatus</th></tr></thead><tbody>");
            foreach (var row in rows)
            {
                html.Append("<tr><td>")
                    .Append(HttpUtility.HtmlEncode(row.Id.ToString("D")))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(NeutralizeFormula(row.UserName)))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(row.CreatedAt.ToString(
                        "yyyy-MM-dd HH:mm:ss",
                        CultureInfo.InvariantCulture)))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(row.ModerationStatus))
                    .Append("</td></tr>");
            }
            html.Append("</tbody></table></body></html>");

            var body = Encoding.UTF8.GetBytes(html.ToString());
            var preamble = Encoding.UTF8.GetPreamble();
            return preamble.Concat(body).ToArray();
        }

        private static string NeutralizeFormula(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            var first = value[0];
            return first == '=' || first == '+' || first == '-'
                || first == '@' || first == '\t' || first == '\r'
                ? "'" + value
                : value;
        }

        private static string StatusText(int status)
        {
            switch (status)
            {
                case 0:
                    return "Đang chờ duyệt";
                case 1:
                    return "Đã duyệt";
                case 2:
                    return "Bị từ chối";
                default:
                    return "Không xác định";
            }
        }

        private static string BuildFileName(string prefix, string extension)
        {
            return prefix + "-" + DateTime.UtcNow.ToString(
                "yyyyMMdd-HHmmss",
                CultureInfo.InvariantCulture) + extension;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private sealed class UserExportRow
        {
            public Guid Id { get; set; }
            public string UserName { get; set; }
            public DateTime CreatedAt { get; set; }
            public string ModerationStatus { get; set; }
        }
    }
}
```

Learning note: the session gate is not role authorization. It is the strongest proven capability available now and must be replaced/augmented after `Authorization/v1` exists.

### STEP 07 — ADD `Content/js/Projects/UserExcelShowcase.js`

Create the complete file:

```javascript
(function (window, angular) {
    'use strict';

    app.factory('userExcelShowcase', ['$http', '$q', function ($http, $q) {
        function statusText(status) {
            switch (status) {
                case 0: return 'Đang chờ duyệt';
                case 1: return 'Đã duyệt';
                case 2: return 'Bị từ chối';
                default: return 'Không xác định';
            }
        }

        function formatDate(value) {
            if (!value) {
                return '';
            }
            var date = new Date(value);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.getFullYear()
                + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
                + '-' + ('0' + date.getDate()).slice(-2)
                + ' ' + ('0' + date.getHours()).slice(-2)
                + ':' + ('0' + date.getMinutes()).slice(-2)
                + ':' + ('0' + date.getSeconds()).slice(-2);
        }

        function neutralizeFormula(value) {
            var text = value === null || value === undefined ? '' : String(value);
            return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
        }

        function escapeHtml(value) {
            return neutralizeFormula(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function rows(items) {
            return (items || []).map(function (item) {
                return {
                    Id: String(item.Id || ''),
                    UserName: neutralizeFormula(item.UserName),
                    CreatedAt: formatDate(item.CreatedAt),
                    ModerationStatus: statusText(item.ModerationStatus)
                };
            });
        }

        function requireRows(items) {
            var result = rows(items);
            if (result.length === 0) {
                throw new Error('Không có dữ liệu trên trang hiện tại để xuất.');
            }
            return result;
        }

        function tableHtml(data) {
            var html = '<table border="1"><thead><tr>'
                + '<th>Id</th><th>UserName</th><th>CreatedAt</th><th>ModerationStatus</th>'
                + '</tr></thead><tbody>';
            data.forEach(function (row) {
                html += '<tr><td>' + escapeHtml(row.Id)
                    + '</td><td>' + escapeHtml(row.UserName)
                    + '</td><td>' + escapeHtml(row.CreatedAt)
                    + '</td><td>' + escapeHtml(row.ModerationStatus)
                    + '</td></tr>';
            });
            return html + '</tbody></table>';
        }

        function download(blob, fileName) {
            var url = window.URL.createObjectURL(blob);
            var link = window.document.createElement('a');
            link.href = url;
            link.download = fileName;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.setTimeout(function () {
                window.URL.revokeObjectURL(url);
            }, 0);
        }

        function timestamp() {
            var now = new Date();
            return now.getFullYear()
                + ('0' + (now.getMonth() + 1)).slice(-2)
                + ('0' + now.getDate()).slice(-2)
                + '-'
                + ('0' + now.getHours()).slice(-2)
                + ('0' + now.getMinutes()).slice(-2)
                + ('0' + now.getSeconds()).slice(-2);
        }

        function exportAlaSql(items) {
            var data = requireRows(items);
            var options = {
                headers: true,
                columns: [
                    { columnid: 'Id', title: 'Id', width: 42 },
                    { columnid: 'UserName', title: 'UserName', width: 32 },
                    { columnid: 'CreatedAt', title: 'CreatedAt', width: 22 },
                    { columnid: 'ModerationStatus', title: 'ModerationStatus', width: 22 }
                ]
            };
            window.alasql(
                'SELECT * INTO XLSXML("users-alasql-current.xls", ?) FROM ?',
                [options, data]);
        }

        function exportHtml(items) {
            var workbook = '<html><head><meta charset="utf-8"></head><body>'
                + tableHtml(requireRows(items))
                + '</body></html>';
            download(
                new Blob(['\ufeff', workbook], { type: 'application/vnd.ms-excel' }),
                'users-client-html-' + timestamp() + '.xls');
        }

        function exportMultiSheet(items, query) {
            var userSheet = tableHtml(requireRows(items));
            var criteriaSheet = '<table border="1"><tbody>'
                + '<tr><th>Search</th><td>' + escapeHtml(query.SearchKeyword || '') + '</td></tr>'
                + '<tr><th>Page</th><td>' + escapeHtml(query.PageIndex) + '</td></tr>'
                + '<tr><th>PageSize</th><td>' + escapeHtml(query.PageSize) + '</td></tr>'
                + '<tr><th>SortDirection</th><td>' + escapeHtml(query.SortDirection) + '</td></tr>'
                + '</tbody></table>';
            var boundary = '----=_WiseReport_UserExport';
            var workbookPart = '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
                + 'xmlns:x="urn:schemas-microsoft-com:office:excel" '
                + 'xmlns="http://www.w3.org/TR/REC-html40"><head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
                + '<link rel="File-List" href="filelist.xml">'
                + '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>'
                + '<x:ExcelWorksheet><x:Name>Users</x:Name>'
                + '<x:WorksheetSource HRef="Users.htm"/></x:ExcelWorksheet>'
                + '<x:ExcelWorksheet><x:Name>Criteria</x:Name>'
                + '<x:WorksheetSource HRef="Criteria.htm"/></x:ExcelWorksheet>'
                + '</x:ExcelWorksheets><x:ActiveSheet>0</x:ActiveSheet>'
                + '</x:ExcelWorkbook></xml><![endif]--></head>'
                + '<frameset><frame src="Users.htm" name="frSheet">'
                + '<noframes><body>Excel workbook</body></noframes>'
                + '</frameset></html>';
            var fileListPart = '<xml xmlns:o="urn:schemas-microsoft-com:office:office">'
                + '<o:MainFile HRef="../Workbook.htm"/>'
                + '<o:File HRef="Users.htm"/>'
                + '<o:File HRef="Criteria.htm"/>'
                + '<o:File HRef="filelist.xml"/>'
                + '</xml>';
            var workbook = 'MIME-Version: 1.0\r\n'
                + 'Content-Type: multipart/related; boundary="' + boundary + '"\r\n\r\n'
                + '--' + boundary + '\r\nContent-Location: Workbook.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + workbookPart + '\r\n'
                + '--' + boundary + '\r\nContent-Location: Users.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + '<html><body>' + userSheet + '</body></html>\r\n'
                + '--' + boundary + '\r\nContent-Location: Criteria.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + '<html><body>' + criteriaSheet + '</body></html>\r\n'
                + '--' + boundary + '\r\nContent-Location: filelist.xml\r\n'
                + 'Content-Type: text/xml; charset=utf-8\r\n\r\n'
                + fileListPart + '\r\n'
                + '--' + boundary + '--';
            download(
                new Blob(['\ufeff', workbook], { type: 'application/vnd.ms-excel' }),
                'users-client-multisheet-' + timestamp() + '.xls');
        }

        function serverExport(format, query) {
            var isXlsx = format === 'Xlsx';
            return $http.get('/UserExport/' + format, {
                params: {
                    search: query.SearchKeyword || '',
                    sortDirection: query.SortDirection
                },
                responseType: 'arraybuffer'
            }).then(function (response) {
                var contentType = response.headers('Content-Type') ||
                    (isXlsx
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'application/vnd.ms-excel');
                var extension = isXlsx ? '.xlsx' : '.xls';
                download(
                    new Blob([response.data], { type: contentType }),
                    'users-server-' + format.toLowerCase() + '-' + timestamp() + extension);
            }, function (response) {
                if (response.status === 409) {
                    return $q.reject('EPPlus đang tắt cho đến khi xác nhận license thương mại.');
                }
                if (response.status === 401) {
                    return $q.reject('Phiên đăng nhập đã hết hạn.');
                }
                if (response.status === 413) {
                    return $q.reject('Kết quả vượt giới hạn 5.000 dòng. Hãy thu hẹp tìm kiếm.');
                }
                return $q.reject('Không thể tạo file Excel.');
            });
        }

        return {
            alaSqlCurrentPage: exportAlaSql,
            htmlCurrentPage: exportHtml,
            multiSheetCurrentPage: exportMultiSheet,
            serverHtmlAllFiltered: function (query) {
                return serverExport('HtmlXls', query);
            },
            serverEpplusAllFiltered: function (query) {
                return serverExport('Xlsx', query);
            }
        };
    }]);
})(window, window.angular);
```

### STEP 08 — MODIFY `Projects.js`

Change line 1 controller injection from:

```javascript
app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {
```

to:

```javascript
app.controller('ProjectsCtrl', function (
    $scope,
    $http,
    $interval,
    ajaxService,
    userExcelShowcase) {
```

Replace current lines 149–176, the complete `$scope.XuatExcel` function, with:

```javascript
    $scope.exportBusy = false;
    $scope.exportError = '';

    $scope.ExportUsers = function (mode) {
        if ($scope.exportBusy) {
            return;
        }

        $scope.exportError = '';
        try {
            if (mode === 'alasql-current') {
                userExcelShowcase.alaSqlCurrentPage($scope.listUser);
                return;
            }
            if (mode === 'html-current') {
                userExcelShowcase.htmlCurrentPage($scope.listUser);
                return;
            }
            if (mode === 'multisheet-current') {
                userExcelShowcase.multiSheetCurrentPage(
                    $scope.listUser,
                    angular.copy($scope.userQuery));
                return;
            }

            $scope.exportBusy = true;
            var request = mode === 'server-html-all'
                ? userExcelShowcase.serverHtmlAllFiltered(
                    angular.copy($scope.userQuery))
                : userExcelShowcase.serverEpplusAllFiltered(
                    angular.copy($scope.userQuery));

            request.catch(function (message) {
                $scope.exportError = message;
            }).finally(function () {
                $scope.exportBusy = false;
            });
        }
        catch (error) {
            $scope.exportError = error.message || 'Không thể tạo file Excel.';
        }
    };
```

Delete current lines 231–286, the entire old `$scope.tableToExcel` function. Do not leave the raw DOM, `txtArea1`, `execCommand`, `sa`, or `innerHTML` export code.

Keep `formatDate` because other page behavior may consume it; do not edit Add/Update/Delete in this task.

### STEP 09 — MODIFY both user-list views

In both:

- `Views/Home/HomeLayout.cshtml`
- `Views/Employee/Index.cshtml`

insert the service immediately before the existing `Projects.js` script:

```cshtml
    <script src="~/Content/js/Projects/UserExcelShowcase.js?time=@DateTime.UtcNow.Ticks"></script>
```

Replace the single current `ng-click="XuatExcel()"` button with this complete showcase control:

```cshtml
        <div class="btn-group" role="group" aria-label="Excel export showcase">
            <button type="button"
                    class="btn btn-info dropdown-toggle"
                    data-toggle="dropdown"
                    ng-disabled="exportBusy">
                <i class="fa fa-file-excel-o"></i>
                Excel showcase <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
                <li><a href="" ng-click="ExportUsers('alasql-current')">1. AlaSQL/XLSXML — trang hiện tại</a></li>
                <li><a href="" ng-click="ExportUsers('html-current')">2. Client HTML .xls — trang hiện tại</a></li>
                <li><a href="" ng-click="ExportUsers('multisheet-current')">3. Multi-sheet MIME .xls — trang + bộ lọc</a></li>
                <li role="separator" class="divider"></li>
                <li><a href="" ng-click="ExportUsers('server-html-all')">4. Server HTML .xls — toàn bộ kết quả lọc</a></li>
                <li><a href="" ng-click="ExportUsers('server-epplus-all')">5. EPPlus .xlsx — cần license thương mại</a></li>
            </ul>
        </div>
        <span class="text-muted" ng-if="exportBusy">
            <i class="fa fa-spinner fa-spin"></i> Đang tạo file
        </span>
        <div class="alert alert-danger" ng-if="exportError" ng-bind="exportError"></div>
```

Do not copy hidden password columns into either view. The existing table remains the four-field ERP-0002 contract.

### STEP 10 — MODIFY `Web.config`

Inside `<appSettings>`, immediately after `owin:AutomaticAppStartup`, add exactly:

```xml
    <add key="ExcelShowcase:EpplusCommercialLicenseConfirmed" value="false" />
```

Do not set it to true in source control. On a licensed company environment, use a deployment transform or machine-specific secure configuration. Do not edit connection strings.

### STEP 11 — MODIFY `Wise_Report.csproj`

After the existing Home controller compile entry, add:

```xml
    <Compile Include="Controllers\UserExportController.cs" />
```

Near the existing Projects content entries, add exactly once:

```xml
    <Content Include="Content\js\Identity\Identity.js" />
    <Content Include="Content\js\Projects\UserExcelShowcase.js" />
```

Do not add any `obj/Release/Package/PackageTmp` copy of these files.

### STEP 12 — Static and build checkpoints

```powershell
git diff --check
if ($LASTEXITCODE -ne 0) { throw "Whitespace gate failed." }

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "Node.js is required for the JavaScript syntax gate." }
& $node --check 'WISE_REPORT/Wise_Report/Content/js/Identity/Identity.js'
if ($LASTEXITCODE -ne 0) { throw "Identity.js syntax failed." }
& $node --check 'WISE_REPORT/Wise_Report/Content/js/Projects/UserExcelShowcase.js'
if ($LASTEXITCODE -ne 0) { throw "UserExcelShowcase.js syntax failed." }
& $node --check 'WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js'
if ($LASTEXITCODE -ne 0) { throw "Projects.js syntax failed." }

rg -n 'Html.BeginForm|TextBoxFor|PasswordFor|ValidationSummary' `
  'WISE_REPORT/Wise_Report/Views/Home/Login.cshtml' `
  'WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml'
rg -n 'innerHTML|execCommand|txtArea1|Response.End|GridView' `
  'WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js' `
  'WISE_REPORT/Wise_Report/Content/js/Projects/UserExcelShowcase.js' `
  'WISE_REPORT/Wise_Report/Controllers/UserExportController.cs'
rg -n 'Password|PasswordHash|Query<User>' `
  'WISE_REPORT/Wise_Report/Controllers/UserExportController.cs' `
  'WISE_REPORT/Wise_Report/Content/js/Projects/UserExcelShowcase.js'
```

All three `rg` commands must return no match. The `CurrentPassword` and other legitimate identity form fields exist only in identity files and are deliberately not included in the export scan.

Restore/build with Full Framework MSBuild:

```powershell
$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$msbuild = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild `
  -find 'MSBuild\**\Bin\MSBuild.exe' | Select-Object -First 1
if (-not $msbuild) { throw 'Full Framework MSBuild was not found.' }

& $msbuild 'WISE_REPORT\Wise_Report.sln' /t:Restore `
  /p:RestorePackagesConfig=true /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw 'Restore failed.' }

$probe = Join-Path $env:TEMP 'OpenERP-ERP0003-build'
New-Item -ItemType Directory -Force -Path `
  (Join-Path $probe 'Debug\bin'), (Join-Path $probe 'Debug\obj'), `
  (Join-Path $probe 'Release\bin'), (Join-Path $probe 'Release\obj') | Out-Null

& $msbuild 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Debug `
  "/p:OutputPath=$probe\Debug\bin\" `
  "/p:BaseIntermediateOutputPath=$probe\Debug\obj\" /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw 'Debug build failed.' }

& $msbuild 'WISE_REPORT\Wise_Report.sln' /t:Build /p:Configuration=Release `
  "/p:OutputPath=$probe\Release\bin\" `
  "/p:BaseIntermediateOutputPath=$probe\Release\obj\" /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw 'Release build failed.' }
```

DB regression remains read/deploy only; this task has no SQL diff:

```powershell
$scripts = @(
  '001_CreateEmployeeManagementCoreDb.sql',
  '002_UpsertGetListUser.sql',
  '003_VerifyBaseline.sql',
  '004_TransactionalSmokeTest.sql'
)
foreach ($script in $scripts) {
  sqlcmd -S '(localdb)\MSSQLLocalDB' -E -b -V 11 `
    -i (Join-Path 'WISE_REPORT\Database\EmployeeManagementCoreDb' $script)
  if ($LASTEXITCODE -ne 0) { throw "DB gate failed: $script" }
}
```

### STEP 13 — Human smoke checklist before push

Use a disposable ERP-0001-approved LocalDB user.

1. Login page visibly uses the new card UI; browser Network shows URL-encoded POST with anti-forgery token and JSON response.
2. Unknown/wrong/deleted/pending/rejected account messages are identical; no response contains submitted password.
3. Change-password invalid, same-password, success, old/new re-login and expired-session flows behave as specified.
4. Both logout controls send POST; direct GET `/Home/Logout` is 404/blocked.
5. On both user-list views, run the three client exports and inspect with Excel/LibreOffice: exactly four columns, no HTML controls, no password.
6. Create a test-only username beginning with `=` inside a rollback/cleanup fixture; verify every generated workbook shows it as text, never as a formula.
7. Server HTML export without session is 401; with session includes all filtered rows, not only current page.
8. EPPlus endpoint returns 409 while the committed flag is false. Do not enable it merely to make the button green.
9. If and only if a valid commercial license is available, override the setting outside source control, export `.xlsx`, inspect ZIP workbook parts and reset the override.
10. Run ERP-0002 paging and updated ERP-0001 identity regression; no fixture/process/generated residue may remain.

## 14. Expected diff

```text
ADD    WISE_REPORT/Wise_Report/Controllers/UserExportController.cs
ADD    WISE_REPORT/Wise_Report/Content/js/Identity/Identity.js
ADD    WISE_REPORT/Wise_Report/Content/js/Projects/UserExcelShowcase.js
MODIFY WISE_REPORT/Wise_Report/Controllers/HomeController.cs
MODIFY WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js
MODIFY WISE_REPORT/Wise_Report/Views/Home/Login.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml
MODIFY WISE_REPORT/Wise_Report/Web.config
MODIFY WISE_REPORT/Wise_Report/Wise_Report.csproj
```

Rollback: restore only these 12 production paths to baseline `2a2c998`, rebuild outside the repository and rerun ERP-0001/0002 regression. There is no database rollback.

## 15. Learning explanation

- AngularJS does not replace MVC security. It owns interaction state while MVC model binding, DataAnnotations, anti-forgery, PBKDF2 and server session remain authoritative.
- Standard MVC anti-forgery expects its token in form data, so URL-encoded `$http` is a simple source-compatible boundary. A custom header validator would add security code without evidence-driven need.
- An `.xls` extension can contain HTML, XML or multipart HTML. These techniques are useful compatibility demonstrations but are not genuine modern XLSX files; the UI labels them honestly.
- Spreadsheet formula injection is a data-boundary issue, not only an Excel-library issue. Neutralization must happen in every path, including client exporters.
- EPPlus 6 licensing differs from the stale EPPlus 4.1 reference. A portfolio feature must show license awareness, not hide it with `NonCommercial` on a company machine.
- Client current-page exports are bounded by ERP-0002 page size. Server all-filtered exports need an explicit row cap and authentication even before full authorization exists.

## 16. Human self-review checklist

- [ ] `WISE_REPORT` matched baseline `2a2c998` before typing.
- [ ] Exactly 3 files added and 9 files modified; no generated/package/SQL/EDMX noise.
- [ ] Identity views have Angular `ng-submit`, hidden anti-forgery token and no Razor form/input/validation helpers.
- [ ] Identity POST actions return JSON and preserve generic credential errors, PBKDF2 upgrade, transaction and session rules.
- [ ] Logout is POST-only from both layout controls.
- [ ] Export service contains no raw DOM HTML/IE API and fixes four columns.
- [ ] All five export modes are labelled by technique and scope.
- [ ] Server exports require session, validate sort/search, cap 5,000 and return generic failures.
- [ ] Every export mode neutralizes formula-like text and excludes password/hash.
- [ ] EPPlus setting is committed as `false`; `NonCommercial` appears nowhere.
- [ ] Identity and export scripts are registered exactly once in the classic project and loaded in the correct order.
- [ ] Node, restore, Debug/Release, DB baseline, IIS identity/export and ERP-0001/0002 regression pass.
- [ ] No fixture, IIS, build or generated residue remains.
- [ ] Commit/push implementation, then send PROMPT 2; do not start ERP-0004.

## 17. Test plan summary

PROMPT 2 must create an AC-to-test matrix for AC-01 through AC-16. Mandatory levels: static diff/security, JavaScript unit/syntax, Full Framework restore/build, MVC/IIS identity integration, LocalDB regression, binary workbook inspection, content-type/disposition, formula injection and residue checks. EPPlus default-license 409 is mandatory; licensed workbook generation is conditional and must never be faked.

## 18. Closure

Not closed. Current workflow state is `GUIDE_READY`. Human implements this guide on the company machine and pushes the production diff; the next run tests/fixes ERP-0003 only.
