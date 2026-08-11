# ERP-0001 — Secure Session Identity and Legacy Password Upgrade

## 1. Metadata và state history

| Field | Value |
|---|---|
| Task ID | `ERP-0001` |
| Provenance | `REPO_EXISTING repair` |
| Active state | `TASK_PASSED` |
| Human effort | 6–8 giờ |
| Risk | High — authentication and credential migration |
| Produced capability | `SessionIdentity/v1` |
| Consumed capability | `LocalDatabaseBaseline/v1` from ERP-0000 |
| Guide revision | `r01`, 2026-08-10 |

State history:

1. `TASK_PLANNED` — selected after ERP-0000 report r02 passed.
2. `GUIDE_READY` — source-first guide prepared against commit `09482ed60642ab3f6a3ff4a1956b421ecfb278df` and self-reviewed against the adversarial checklist.
3. `HUMAN_IMPLEMENTING → READY_FOR_TEST` — human implementation pushed as `1777fd4174381900a0a153575a0e6d02f2c2dc0e`.
4. `TESTING → TEST_FAIL` — exact-diff/static review found credential-upgrade, logout, validation, Razor, hidden-password and generated-noise defects.
5. `AGENT_FIXING → TESTING → TEST_PASS → TASK_PASSED` — corrections retained all assertions; final gate `39/0`, report r01.

## 2. Baseline SHA

- Branch: `TEST`.
- Exact production-source baseline commit: `09482ed60642ab3f6a3ff4a1956b421ecfb278df`.
- ERP-0000 tested executable-source fingerprint: `b3d428c179b3f3594da31394700766a0d2e8de08809725fc4bf909b5592fa569`.
- The guide/state delivery commit is intentionally newer than that source baseline. After pulling latest `TEST`, human must run `git diff --exit-code 09482ed60642ab3f6a3ff4a1956b421ecfb278df -- WISE_REPORT` and stop if it reports any production-tree drift before typing.

## 3. Business context và user journey

The current login calculates an MD5 value but never compares it; any existing username is accepted. Password change writes unsalted MD5. Logout is a GET link, login/change-password forms have no anti-forgery token, and `_Layout.cshtml` renders a hidden `Session["password"]` field. The repository already references `Microsoft.AspNet.Identity.Core 2.2.2`, so the next dependency-ready repair is a typed, anti-forgery-protected session login using the existing Identity PBKDF2 hasher, with one-time upgrade for legacy MD5 rows.

Target user journey:

`GET /Home/Login` → typed `LoginForm` → `POST /Home/Login` + anti-forgery → active/approved `dbo.Users` row → `PasswordSecurity.VerifyPassword` → optional MD5-to-PBKDF2 upgrade transaction → session contains only user ID/name → `HomeLayout` → POST logout or authenticated password change.

## 4. Goal

Create `SessionIdentity/v1`: login must actually verify credentials, reject deleted/non-approved accounts with a generic response, upgrade a valid legacy MD5 hash to PBKDF2 once, never place a password in session or HTML, protect login/change/logout writes with anti-forgery, and store only PBKDF2 for password changes.

## 5. Scope

- Add typed login and change-password forms.
- Add a focused password security helper based on the already referenced ASP.NET Identity `PasswordHasher`.
- Preserve compatibility with exactly 32-character hexadecimal legacy MD5 values only for verification-and-upgrade.
- Replace HomeController login, logout and change-password actions.
- Add anti-forgery tokens, validation binding and appropriate browser autocomplete hints.
- Remove the hidden password session field and convert both logout links to POST forms.
- Register all new C# files in the non-SDK project.

## 6. Out of scope

- Full role/permission enforcement, global authorization filters and API 401/403 behavior; ERP-0006 owns those capabilities.
- User directory response/password DTO cleanup, API total-count and Angular enum binding; ERP-0002 owns them.
- Repairing anonymous `AddUser`/`UpdateUser` API semantics; do not claim those endpoints are secure after this task.
- Registration, password reset email, lockout, MFA, OWIN cookie identity or external providers.
- Schema/EDMX changes. `Users.Password` is already `nvarchar(max)`, sufficient for Identity PBKDF2 output; changing Database First metadata would add risk without a contract need.
- Removing `Commons.MD5Hash`; it remains only as a legacy verification dependency until all rows are upgraded.

## 7. Dependencies và assumptions

- ERP-0000 is `TASK_PASSED` and LocalDB baseline scripts pass.
- `Microsoft.AspNet.Identity.Core 2.2.2` remains referenced at `Wise_Report.csproj:100-103`.
- SQL comparison follows the database collation already in use; this task trims user input but does not invent username normalization rules.
- Existing session keys `username` and `userid` remain compatibility contracts for legacy views.
- `ModerationStatus.Approved` is integer `1`; deleted, pending and rejected users cannot log in.
- Previously exposed credentials still require external rotation; this task cannot rewrite Git history.

## 8. Existing repository evidence

| Evidence | Meaning |
|---|---|
| `Controllers/HomeController.cs:31-56` | Login hashes input with MD5 but accepts any matching username without comparing the password. |
| `Controllers/HomeController.cs:57-65` | Logout is a state-changing GET and clears individual session values. |
| `Controllers/HomeController.cs:103-153` | Password change binds raw strings, dereferences session unsafely and persists MD5. |
| `Models/BusinessModel/Commons.cs:12-20` | Legacy unsalted MD5 implementation exists. |
| `Models/DataModel/Database.edmx:65,192,297` | Password storage is `nvarchar(max)` and requires no schema expansion for PBKDF2. |
| `Wise_Report.csproj:100-103` | Identity Core 2.2.2 is already available; no package change is required. |
| `Views/Home/Login.cshtml:93-117` | Raw form has no model, anti-forgery token or validation summary. |
| `Views/Home/ChangePassword.cshtml:6,45-79` | Nested forms and raw password field names create ambiguous binding. |
| `Views/Shared/_Layout.cshtml:113-116` | Hidden `Session["password"]` output must be removed. |
| `Views/Shared/_Layout.cshtml:149-155,200-203` | Both logout controls navigate with GET. |

## 9. Target flow

```text
Login.cshtml
  -> LoginForm
  -> HomeController.Login POST
  -> Users active/approved lookup
  -> PasswordSecurity
       -> Identity PBKDF2 verification
       -> or legacy MD5 verification + transactional PBKDF2 upgrade
  -> Session[userid, username]
  -> HomeLayout

ChangePassword.cshtml
  -> ChangePasswordForm
  -> current session user lookup
  -> current-password verification
  -> PBKDF2 write in EF transaction
  -> clear session
  -> Login
```

Callers are the two Home views and two layout logout forms. Consumers are `HomeController`, `dbo.Users.Password`, and legacy views reading `Session["userid"]`/`Session["username"]`.

## 10. Business rules và edge cases

1. Username is required, trimmed, and limited to 256 characters at the form boundary.
2. Login password is required and limited to 128 characters; login does not impose the new-password minimum on legacy accounts.
3. New passwords are 12–128 characters and confirmation must match.
4. Deleted, pending and rejected users receive the same generic response as an unknown username or wrong password.
5. Malformed stored password data fails closed; it must not throw a client-visible exception.
6. A valid 32-hex legacy MD5 value is upgraded inside a transaction before session establishment.
7. A PBKDF2 hash is salted; hashing the same password twice must produce different strings that both verify.
8. New password must differ from the current password.
9. Successful password change clears/abandons the session and requires a fresh login.
10. Logout is POST-only with anti-forgery and clears/abandons the session.
11. No raw password, hash or exception text is placed in session, view data, TempData or client error output.

## 11. HTTP/MVC contract

| Route | Verb | Input | Success | Failure |
|---|---|---|---|---|
| `/Home/Login` | GET | none | Login view, or redirect authenticated session to HomeLayout | none |
| `/Home/Login` | POST | `LoginForm` + anti-forgery | PBKDF2/legacy verification, session, redirect HomeLayout | Same generic model error; HTTP 200 view |
| `/Home/ChangePassword` | GET | current session | Typed view | redirect Login if session missing |
| `/Home/ChangePassword` | POST | `ChangePasswordForm` + anti-forgery | PBKDF2 write, session clear, redirect Login | Field/generic model error |
| `/Home/Logout` | POST | anti-forgery | session clear, redirect Login | MVC anti-forgery rejection |

## 12. DB contract

No schema, stored procedure, seed or EDMX operation is allowed. The only write is an EF update to the existing `Users.Password`, `LastModifiedAt`, and `LastModifiedBy` columns. Login lookup also requires `IsDeleted = 0` and `ModerationStatus = Approved`.

Legacy migration is per-row and transactional. There is no bulk password rewrite because plaintext is unavailable and destructive credential resets require separate human policy.

## 13. UI behavior

- Login retains the entered username on validation failure but never repopulates the password.
- Login shows field validation for malformed form input and one generic message for every credential/account-state failure.
- Change-password view does not render or accept a username field; identity comes only from session user ID.
- Password fields use `autocomplete="current-password"` or `autocomplete="new-password"`.
- Logout controls remain visually compatible but submit POST forms.

## 14. Security/data-integrity constraints

- No new plaintext or MD5 password writes.
- MD5 is accepted only when stored data is exactly 32 hexadecimal characters, and only to upgrade after successful verification.
- Comparison of legacy fixed-length hashes uses a constant-work loop.
- No password/session password hidden field.
- No `ex.Message`, stack trace or database detail reaches the view.
- Anti-forgery is required on all three state-changing MVC actions.
- EF transaction surrounds password upgrades and password changes.
- Do not edit generated `User.cs`, EDMX, T4 output or packages.

## 15. Acceptance criteria

| ID | Observable criterion | Evidence seam |
|---|---|---|
| AC-01 | Two hashes of one password differ and both verify; wrong/malformed values fail closed. | UT-01 PasswordSecurity |
| AC-02 | Valid legacy MD5 login succeeds once and replaces stored value with PBKDF2; wrong legacy password does not mutate. | IT-01/DB-01 |
| AC-03 | Login uses typed validation + anti-forgery; malformed form input gets field validation, while deleted, pending, rejected, unknown and wrong-password cases share one generic credential message. | MVC/IT-02 |
| AC-04 | Successful login creates only `userid` and `username` identity keys; no password key/value appears in session-rendered HTML. | E2E-01/security scan |
| AC-05 | Change password requires a session, validates current/different/12–128/confirmation, persists PBKDF2 transactionally and clears session. | IT-03/E2E-02 |
| AC-06 | Logout GET is unavailable; POST without token is rejected; valid POST clears session. | IT-04/E2E-03 |
| AC-07 | Login/change views contain one form each, anti-forgery, validation summary and correct autocomplete; layout has no hidden password. | STATIC-UI |
| AC-08 | New C# files are included exactly once in `Wise_Report.csproj`; no package/EDMX/generated diff. | STATIC-PROJECT |
| AC-09 | Full Framework restore, Debug and Release builds exit 0; warnings captured. | BUILD-01 |
| AC-10 | IIS Express login critical journey returns redirect/session for PBKDF2 and upgraded legacy fixture; wrong password remains on login. | E2E-01 |
| AC-11 | Scoped production code contains no password assignment using raw form text or `Commons.MD5Hash` outside the helper legacy branch. | STATIC-SECURITY |
| AC-12 | Diff is limited to the exact production/test/report write-set and contains no secret/generated noise. | STATIC-DIFF |

## 16. Definition of Done

All ACs must pass against one exact source fingerprint. No required MVC/DB/E2E test may be skipped. Build output must stay outside the repository. ERP-0002 cannot start until ERP-0001 is `TASK_PASSED`.

## 17. Allowed production write-set

ADD:

- `WISE_REPORT/Wise_Report/Models/BusinessModel/PasswordSecurity.cs`
- `WISE_REPORT/Wise_Report/Shared/Forms/LoginForm.cs`
- `WISE_REPORT/Wise_Report/Shared/Forms/ChangePasswordForm.cs`

MODIFY:

- `WISE_REPORT/Wise_Report/Wise_Report.csproj`
- `WISE_REPORT/Wise_Report/Controllers/HomeController.cs`
- `WISE_REPORT/Wise_Report/Views/Home/Login.cshtml`
- `WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml`
- `WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml`

DELETE/GENERATE/SQL/PACKAGE: none.

## 18. Allowed test write-set

After human implementation, tester may add/update only:

- `WISE_REPORT/Tests/ERP-0001/PasswordSecurity.Tests.ps1`
- `WISE_REPORT/Tests/ERP-0001/Invoke-ERP0001IdentityGate.ps1`
- `WISE_REPORT/Tests/ERP-0001/ERP-0001.IdentityFixture.sql`
- `.ai-erp-workflow/reports/ERP-0001-test-report-r01.md`
- test summary sections in this task/state artifact.

## 19. Implementation guide revisions

### Revision r01 — GUIDE_READY — 2026-08-10

#### Guide header

- Why now: ERP-0000 made the actual `Users` storage and LocalDB/API runtime reproducible; the current login bypass is the highest-risk dependency before directories and authorization.
- Capability: `SessionIdentity/v1`.
- Patterns: typed MVC forms, server validation, anti-forgery, PBKDF2 hashing, legacy credential upgrade, EF transaction and session lifecycle.
- Prerequisite: latest `TEST` guide delivery commit with `WISE_REPORT` still byte-equivalent to source baseline `09482ed60642ab3f6a3ff4a1956b421ecfb278df`; clean tracked tree before typing.
- Expected flow: Login view → typed POST → active user → hash verify/upgrade → minimal session → HomeLayout; password change logs the user out.
- Ordered operations: ADD three C# files; MODIFY project/controller/two views/layout; VERIFY static/build/LocalDB/IIS; no SQL/EDMX/package operation.

Preflight — run this before STEP 01. The latest `TEST` HEAD contains the guide itself, so production equivalence—not HEAD equality—is the invariant:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff --exit-code 09482ed60642ab3f6a3ff4a1956b421ecfb278df -- WISE_REPORT
if ($LASTEXITCODE -ne 0) {
    throw "WISE_REPORT has drifted from the ERP-0001 production-source baseline."
}
```

Expected: branch `TEST`, clean tracked tree, and production-baseline comparison exit 0. Stop before typing if any condition fails.

#### STEP 01 — ADD `WISE_REPORT/Wise_Report/Shared/Forms/LoginForm.cs`

Purpose: Replace raw string binding with an explicit, testable login boundary.

Repo evidence: `HomeController.cs:40` currently binds `username` and `password` directly.

Stable anchor/current range: new file.

Operation: create the full file:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Wise_Report.Shared.Forms
{
    public class LoginForm
    {
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập.")]
        [StringLength(256, ErrorMessage = "Tên đăng nhập không được vượt quá 256 ký tự.")]
        [Display(Name = "Tên đăng nhập")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        [StringLength(128, ErrorMessage = "Mật khẩu không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu")]
        public string Password { get; set; }
    }
}
```

Why: input limits prevent unbounded binding; login intentionally does not require 12 characters because existing credentials may be shorter.

Impact/checkpoint: no compile until csproj registration in STEP 04. Confirm the file contains no persistence logic.

Expected diff/rollback: one added C# file; delete it before later steps to roll back.

#### STEP 02 — ADD `WISE_REPORT/Wise_Report/Shared/Forms/ChangePasswordForm.cs`

Purpose: Centralize current/new/confirmation validation without accepting username from the browser.

Repo evidence: `ChangePassword.cshtml:48` currently posts an editable username and `HomeController.cs:103` accepts it.

Stable anchor/current range: new file.

Operation: create the full file:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Wise_Report.Shared.Forms
{
    public class ChangePasswordForm
    {
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
        [StringLength(128, ErrorMessage = "Mật khẩu hiện tại không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu hiện tại")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
        [StringLength(128, MinimumLength = 12, ErrorMessage = "Mật khẩu mới phải có từ 12 đến 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu mới")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
        [StringLength(128, ErrorMessage = "Xác nhận mật khẩu mới không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Xác nhận mật khẩu mới không khớp.")]
        [Display(Name = "Xác nhận mật khẩu mới")]
        public string ConfirmNewPassword { get; set; }
    }
}
```

Why: identity is read from session, not a mutable form field; `Compare` and the minimum are independently unit-testable.

Impact/checkpoint: no compile until STEP 04; confirm there is no `UserName` property.

Expected diff/rollback: one added C# file; delete it before dependent steps to roll back.

#### STEP 03 — ADD `WISE_REPORT/Wise_Report/Models/BusinessModel/PasswordSecurity.cs`

Purpose: Use the existing ASP.NET Identity PBKDF2 implementation and isolate legacy MD5 compatibility.

Repo evidence: Identity Core is referenced at `Wise_Report.csproj:100-103`; `Commons.MD5Hash` is the legacy implementation at `Commons.cs:12-20`.

Stable anchor/current range: new file.

Operation: create the full file:

```csharp
using Microsoft.AspNet.Identity;
using System;

namespace Wise_Report.Models.BusinessModel
{
    public sealed class PasswordCheckResult
    {
        public PasswordCheckResult(bool succeeded, bool requiresUpgrade)
        {
            Succeeded = succeeded;
            RequiresUpgrade = requiresUpgrade;
        }

        public bool Succeeded { get; private set; }
        public bool RequiresUpgrade { get; private set; }
    }

    public static class PasswordSecurity
    {
        public static string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password is required.", "password");
            }

            return new PasswordHasher().HashPassword(password);
        }

        public static PasswordCheckResult VerifyPassword(
            string storedPassword,
            string providedPassword)
        {
            if (string.IsNullOrEmpty(storedPassword)
                || string.IsNullOrEmpty(providedPassword))
            {
                return new PasswordCheckResult(false, false);
            }

            if (IsLegacyMd5(storedPassword))
            {
                var legacyCandidate = Commons.MD5Hash(providedPassword);
                var legacySucceeded = FixedTimeEquals(
                    storedPassword.ToUpperInvariant(),
                    legacyCandidate.ToUpperInvariant());

                return new PasswordCheckResult(
                    legacySucceeded,
                    legacySucceeded);
            }

            try
            {
                var result = new PasswordHasher().VerifyHashedPassword(
                    storedPassword,
                    providedPassword);

                return new PasswordCheckResult(
                    result != PasswordVerificationResult.Failed,
                    result == PasswordVerificationResult.SuccessRehashNeeded);
            }
            catch (FormatException)
            {
                return new PasswordCheckResult(false, false);
            }
            catch (ArgumentException)
            {
                return new PasswordCheckResult(false, false);
            }
        }

        private static bool IsLegacyMd5(string value)
        {
            if (value.Length != 32)
            {
                return false;
            }

            for (var index = 0; index < value.Length; index++)
            {
                var character = value[index];
                var isDigit = character >= '0' && character <= '9';
                var isUpperHex = character >= 'A' && character <= 'F';
                var isLowerHex = character >= 'a' && character <= 'f';

                if (!isDigit && !isUpperHex && !isLowerHex)
                {
                    return false;
                }
            }

            return true;
        }

        private static bool FixedTimeEquals(string left, string right)
        {
            var difference = left.Length ^ right.Length;
            var length = Math.Min(left.Length, right.Length);

            for (var index = 0; index < length; index++)
            {
                difference |= left[index] ^ right[index];
            }

            return difference == 0;
        }
    }
}
```

Why: Identity Core owns the PBKDF2 format/salt; strict legacy detection prevents arbitrary malformed values from entering the MD5 branch; successful legacy verification explicitly requests upgrade; malformed PBKDF2 fails closed.

Impact/checkpoint: no package or database change. Search this file: `MD5Hash` occurs exactly once, in the legacy branch.

Expected diff/rollback: one added helper; rollback by deleting it and dependent references.

#### STEP 04 — MODIFY `WISE_REPORT/Wise_Report/Wise_Report.csproj`

Purpose: Include all three hand-created C# files in the non-SDK project.

Repo evidence: compile items are explicit; current anchors are `Models\BusinessModel\Commons.cs` at line 326 and form items at lines 369-372.

Stable anchors/current ranges: `Models\BusinessModel\Commons.cs` and `Shared\Forms\CreateEmployeeForm.cs`.

Operation 1 — replace:

```xml
    <Compile Include="Models\BusinessModel\Commons.cs" />
    <Compile Include="Models\BusinessModel\ProjectManagements.cs" />
```

with:

```xml
    <Compile Include="Models\BusinessModel\Commons.cs" />
    <Compile Include="Models\BusinessModel\PasswordSecurity.cs" />
    <Compile Include="Models\BusinessModel\ProjectManagements.cs" />
```

Operation 2 — replace:

```xml
    <Compile Include="Shared\Forms\CreateEmployeeForm.cs" />
    <Compile Include="Shared\Forms\CreateUserForm.cs" />
    <Compile Include="Shared\Forms\UpdateEmployeeForm.cs" />
    <Compile Include="Shared\Forms\UpdateUserForm.cs" />
```

with:

```xml
    <Compile Include="Shared\Forms\ChangePasswordForm.cs" />
    <Compile Include="Shared\Forms\CreateEmployeeForm.cs" />
    <Compile Include="Shared\Forms\CreateUserForm.cs" />
    <Compile Include="Shared\Forms\LoginForm.cs" />
    <Compile Include="Shared\Forms\UpdateEmployeeForm.cs" />
    <Compile Include="Shared\Forms\UpdateUserForm.cs" />
```

Why: classic csproj does not glob C# files. Each new include must occur exactly once.

Impact/checkpoint: run a Debug build after STEP 05. Expected csproj diff is exactly three added Compile elements; no Reference/Package/Content changes.

Rollback: restore the two old XML blocks after deleting the three files.

#### STEP 05 — MODIFY `WISE_REPORT/Wise_Report/Controllers/HomeController.cs`

Purpose: Enforce credential verification, legacy upgrade, minimal session, POST logout and secure password change.

Repo evidence: vulnerable actions are lines 31-65 and 103-153 at baseline.

Operation 1 — insert after `using Wise_Report.Models.DataModel;`:

```csharp
using Wise_Report.Enum;
using Wise_Report.Shared.Forms;
```

Operation 2 — replace the exact block from the current parameterless `Login` action through `Logout`:

```csharp
        public ActionResult Login()
        {
            return View();
        }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Login(string username, string password)
        {
            string passwordMD5 = Commons.MD5Hash(password);
            var user = db.Users.SingleOrDefault(x => x.UserName == username );
            if (user != null)
            {

                Session["username"] = user.UserName;
                Session["userid"] = user.Id;


                return RedirectToAction("HomeLayout", "Home");
                //return RedirectToAction("Dashboard/Index");
            }
            ViewBag.error = "User and Password wrong!!!";
            return View();
        }
        public ActionResult Logout()
        {

            Session["userid"] = null;
            Session["username"] = null;
            Session["fullname"] = null;

            return RedirectToAction("Login");
        }
```

with:

```csharp
        [HttpGet]
        public ActionResult Login()
        {
            if (Session["userid"] != null)
            {
                return RedirectToAction("HomeLayout", "Home");
            }

            return View(new LoginForm());
        }

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginForm form)
        {
            if (!ModelState.IsValid)
            {
                return View(form);
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
                ModelState.AddModelError(
                    string.Empty,
                    "Tên đăng nhập hoặc mật khẩu không đúng.");
                return View(form);
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
                        ModelState.AddModelError(
                            string.Empty,
                            "Không thể hoàn tất đăng nhập. Vui lòng thử lại.");
                        return View(form);
                    }
                }
            }

            Session.Clear();
            Session["username"] = user.UserName;
            Session["userid"] = user.Id;

            return RedirectToAction("HomeLayout", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
        }
```

Operation 3 — delete the orphan `[HttpPost]` at current line 72 immediately after `Register()`. Although many commented lines follow it, C# currently applies that attribute to `ChangePassword`; leaving it would conflict with the new GET action.

Operation 4 — replace the entire current `ChangePassword(string username, string password_old, string password_new, string password_new_confirm)` action at lines 103-153 with:

```csharp
        [HttpGet]
        public ActionResult ChangePassword()
        {
            if (Session["userid"] == null)
            {
                return RedirectToAction("Login");
            }

            return View(new ChangePasswordForm());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(ChangePasswordForm form)
        {
            Guid userId;
            if (Session["userid"] == null
                || !Guid.TryParse(Convert.ToString(Session["userid"]), out userId))
            {
                return RedirectToAction("Login");
            }

            if (!ModelState.IsValid)
            {
                return View(form);
            }

            var user = db.Users.SingleOrDefault(x =>
                x.Id == userId
                && !x.IsDeleted
                && x.ModerationStatus == (int)ModerationStatus.Approved);

            if (user == null)
            {
                Session.Clear();
                Session.Abandon();
                return RedirectToAction("Login");
            }

            var currentVerification = PasswordSecurity.VerifyPassword(
                user.Password,
                form.CurrentPassword);

            if (!currentVerification.Succeeded)
            {
                ModelState.AddModelError(
                    "CurrentPassword",
                    "Mật khẩu hiện tại không đúng.");
                return View(form);
            }

            var samePassword = PasswordSecurity.VerifyPassword(
                user.Password,
                form.NewPassword);

            if (samePassword.Succeeded)
            {
                ModelState.AddModelError(
                    "NewPassword",
                    "Mật khẩu mới phải khác mật khẩu hiện tại.");
                return View(form);
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
                    ModelState.AddModelError(
                        string.Empty,
                        "Không thể đổi mật khẩu. Vui lòng thử lại.");
                    return View(form);
                }
            }

            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
        }
```

Why: identity is looked up before verifying; all account-state failures share one login message; legacy upgrade completes before session creation; password change identifies by session GUID rather than posted username; persistence uses an explicit EF transaction; caught exceptions are not exposed.

Compile/runtime impact: three new types are consumed. Existing Upload actions and unrelated controller code remain untouched.

Checkpoint:

```powershell
$vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
$msbuild = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
& $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Debug /m /nologo /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Debug build failed after identity controller changes." }
```

Expected diff: only imports, login/logout actions, the orphan attribute removal and the change-password action pair. Rollback by restoring the exact old blocks/attribute and removing new imports.

#### STEP 06 — MODIFY `WISE_REPORT/Wise_Report/Views/Home/Login.cshtml`

Purpose: Bind `LoginForm`, enforce anti-forgery and prevent password replay in HTML.

Repo evidence/current ranges: file has 883 lines; model/layout header is lines 1-3, form is lines 93-117, jQuery include is line 296.

Operation 1 — replace the opening block:

```cshtml
@{
    Layout = null;
}
```

with:

```cshtml
@model Wise_Report.Shared.Forms.LoginForm
@{
    Layout = null;
}
```

Operation 2 — replace the exact form at lines 93-117 with:

```cshtml
                @using (Html.BeginForm("Login", "Home", FormMethod.Post, new { autocomplete = "on" }))
                {
                    @Html.AntiForgeryToken()

                    @Html.ValidationSummary(false, string.Empty, new { @class = "text-danger" })

                    <div class="form-group has-feedback">
                        @Html.TextBoxFor(
                            model => model.UserName,
                            new
                            {
                                @class = "form-control",
                                placeholder = "Username",
                                autocomplete = "username"
                            })
                        <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
                    </div>
                    <div class="form-group has-feedback">
                        @Html.PasswordFor(
                            model => model.Password,
                            new
                            {
                                @class = "form-control",
                                placeholder = "Password",
                                autocomplete = "current-password"
                            })
                        <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                    </div>
                    <div class="row">
                        <div class="col-xs-8"></div>
                        <div class="col-xs-4">
                            <button type="submit" class="btn btn-primary btn-block btn-flat">Login</button>
                        </div>
                    </div>
                }
```

Operation 3 — immediately after:

```html
    <script src="~/Content/bower_components/jquery/dist/jquery.min.js"></script>
```

insert:

```html
    <script src="~/Scripts/jquery.validate.min.js"></script>
    <script src="~/Scripts/jquery.validate.unobtrusive.min.js"></script>
```

Why: `PasswordFor` never repopulates the posted secret; anti-forgery validates origin; validation summary keeps the generic authentication message; explicit autocomplete uses browser credential semantics.

Checkpoint: view contains exactly one `BeginForm`, one anti-forgery token, no `ViewBag.error`, and no input named lowercase `password` outside generated `PasswordFor`.

Expected diff/rollback: only header/form/two validation script lines; restore the old blocks to roll back.

#### STEP 07 — MODIFY `WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml`

Purpose: Remove nested forms/editable username and bind the secure change form.

Repo evidence: current 106-line view wraps the document in `BeginForm` and contains another raw `<form>`.

Stable anchor/current range: replace the full file.

Operation: replace the file with:

```cshtml
@model Wise_Report.Shared.Forms.ChangePasswordForm
@{
    Layout = null;
}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Wise Management | Change Password</title>
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link rel="stylesheet" href="~/Content/bower_components/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="~/Content/bower_components/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="~/Content/bower_components/Ionicons/css/ionicons.min.css">
    <link rel="stylesheet" href="~/Content/dist/css/AdminLTE.min.css">
    <link rel="stylesheet" href="~/Content/plugins/iCheck/square/blue.css">
    <link href="~/Content/css/HomeCSS.css" rel="stylesheet" />
</head>
<body class="hold-transition login-page" style="background-color:black">
    <div class="login-box">
        <div class="login-logo">
            <a href="/Home/HomeLayout" style="color:white"><b>CHANGE PASSWORD</b></a>
        </div>
        <div class="login-box-body">
            <p class="login-box-msg">Đổi mật khẩu</p>

            @using (Html.BeginForm("ChangePassword", "Home", FormMethod.Post, new { autocomplete = "off" }))
            {
                @Html.AntiForgeryToken()
                @Html.ValidationSummary(false, string.Empty, new { @class = "text-danger" })

                <div class="form-group has-feedback">
                    @Html.PasswordFor(
                        model => model.CurrentPassword,
                        new
                        {
                            @class = "form-control",
                            placeholder = "Nhập mật khẩu hiện tại",
                            autocomplete = "current-password"
                        })
                    <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                </div>
                <div class="form-group has-feedback">
                    @Html.PasswordFor(
                        model => model.NewPassword,
                        new
                        {
                            @class = "form-control",
                            placeholder = "Nhập mật khẩu mới",
                            autocomplete = "new-password"
                        })
                    <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                </div>
                <div class="form-group has-feedback">
                    @Html.PasswordFor(
                        model => model.ConfirmNewPassword,
                        new
                        {
                            @class = "form-control",
                            placeholder = "Xác nhận mật khẩu mới",
                            autocomplete = "new-password"
                        })
                    <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                </div>
                <div class="row">
                    <div class="col-xs-8"></div>
                    <div class="col-xs-4">
                        <button type="submit" class="btn btn-primary btn-block btn-flat">Đổi mật khẩu</button>
                    </div>
                </div>
            }
        </div>
    </div>

    <script src="~/Content/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="~/Scripts/jquery.validate.min.js"></script>
    <script src="~/Scripts/jquery.validate.unobtrusive.min.js"></script>
    <script src="~/Content/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="~/Content/plugins/iCheck/icheck.min.js"></script>
    <script>
        $(function () {
            $('input').iCheck({
                checkboxClass: 'icheckbox_square-blue',
                radioClass: 'iradio_square-blue',
                increaseArea: '20%'
            });
        });
    </script>
</body>
</html>
```

Why: one form means one anti-forgery/binding boundary; no username is accepted; passwords are never echoed; successful change redirects rather than rendering a secret-bearing response.

Checkpoint: exactly one `<form` generated by `BeginForm`, one anti-forgery call, zero username/password_old/password_new raw names, zero `$scope` references.

Expected diff/rollback: one full view replacement; restore baseline file to roll back.

#### STEP 08 — MODIFY `WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml`

Purpose: Remove client-visible password session state and make logout POST-only.

Repo evidence/current anchors: hidden session fields are lines 113-116; profile logout lines 153-155; power logout lines 200-203.

Operation 1 — replace:

```cshtml
        <input type="hidden" value="@Session["fullname"]" id="fullname" />
        <input type="hidden" value="@Session["username"]" id="username" />
        <input type="hidden" value="@Session["password"]" id="password" />
        <input type="hidden" value="@Session["userid"]" id="userid" />
```

with:

```cshtml
        <input type="hidden" value="@Session["fullname"]" id="fullname" />
        <input type="hidden" value="@Session["username"]" id="username" />
        <input type="hidden" value="@Session["userid"]" id="userid" />
```

Operation 2 — replace:

```cshtml
                            <a class="dropdown-item" href="/Home/Login">
                                <i class="mdi mdi-logout mr-2 text-primary"></i> Signout
                            </a>
```

with:

```cshtml
                            @using (Html.BeginForm("Logout", "Home", FormMethod.Post, new { @class = "m-0" }))
                            {
                                @Html.AntiForgeryToken()
                                <button type="submit" class="dropdown-item border-0 bg-transparent">
                                    <i class="mdi mdi-logout mr-2 text-primary"></i> Signout
                                </button>
                            }
```

Operation 3 — replace:

```cshtml
                    <li class="nav-item nav-logout d-none d-lg-block">
                        <a class="nav-link" href="/Home/Login">
                            <i class="mdi mdi-power"></i>
                        </a>
                    </li>
```

with:

```cshtml
                    <li class="nav-item nav-logout d-none d-lg-block">
                        @using (Html.BeginForm("Logout", "Home", FormMethod.Post, new { @class = "m-0" }))
                        {
                            @Html.AntiForgeryToken()
                            <button type="submit" class="nav-link border-0 bg-transparent">
                                <i class="mdi mdi-power"></i>
                            </button>
                        }
                    </li>
```

Why: logout changes server state and must not be link-prefetched or CSRF-triggered; session password output is forbidden even when currently null.

Checkpoint: `rg -n 'Session\["password"\]|href="/Home/Login"' Views/Shared/_Layout.cshtml` must return no match for logout/password leakage. The ChangePassword link remains GET.

Expected diff/rollback: remove one hidden input and replace two links; restore old blocks to roll back.

#### STEP 09 — VERIFY exact diff, build and local runtime

Purpose: Catch project include, Razor compile, hash, anti-forgery, session and generated-noise defects before PROMPT 2.

Repo evidence: non-SDK Full Framework build requires MSBuild; ERP-0000 supplies safe LocalDB scripts.

Stable anchor/current range: repository root at baseline commit.

Operation:

1. Inventory:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff --check
git diff --name-only 09482ed60642ab3f6a3ff4a1956b421ecfb278df -- WISE_REPORT
```

Expected branch is `TEST`; after implementation, the production diff against the source baseline contains exactly the eight paths in section 17.

2. Security/static checks:

```powershell
rg -n 'Commons\.MD5Hash|Session\["password"\]|ViewBag\.error|passwordMD5' `
  "WISE_REPORT\Wise_Report\Controllers\HomeController.cs" `
  "WISE_REPORT\Wise_Report\Models\BusinessModel\PasswordSecurity.cs" `
  "WISE_REPORT\Wise_Report\Views\Home\Login.cshtml" `
  "WISE_REPORT\Wise_Report\Views\Home\ChangePassword.cshtml" `
  "WISE_REPORT\Wise_Report\Views\Shared\_Layout.cshtml"

rg -n 'ValidateAntiForgeryToken|AntiForgeryToken' `
  "WISE_REPORT\Wise_Report\Controllers\HomeController.cs" `
  "WISE_REPORT\Wise_Report\Views\Home\Login.cshtml" `
  "WISE_REPORT\Wise_Report\Views\Home\ChangePassword.cshtml" `
  "WISE_REPORT\Wise_Report\Views\Shared\_Layout.cshtml"
```

Expected: `Commons.MD5Hash` occurs only in `PasswordSecurity.cs`; no session password/ViewBag/passwordMD5 match; each new Login/Logout/ChangePassword POST action has a validation attribute; views/layout contain tokens for every POST form.

3. Restore/build outside repository:

```powershell
$vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
$msbuild = & $vswhere `
  -latest `
  -products * `
  -requires Microsoft.Component.MSBuild `
  -find "MSBuild\**\Bin\MSBuild.exe" |
  Select-Object -First 1

if (-not $msbuild) { throw "Full Framework MSBuild was not found." }

& $msbuild `
  "WISE_REPORT\Wise_Report.sln" `
  /t:Restore `
  /p:RestorePackagesConfig=true `
  /m `
  /nologo `
  /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Package restore failed." }

$probeRoot = Join-Path $env:TEMP "OpenERP-ERP0001-build"
New-Item -ItemType Directory -Force -Path `
  (Join-Path $probeRoot "Debug\bin"), `
  (Join-Path $probeRoot "Debug\obj"), `
  (Join-Path $probeRoot "Release\bin"), `
  (Join-Path $probeRoot "Release\obj") | Out-Null

& $msbuild `
  "WISE_REPORT\Wise_Report.sln" `
  /t:Build `
  /p:Configuration=Debug `
  "/p:OutputPath=$probeRoot\Debug\bin\" `
  "/p:BaseIntermediateOutputPath=$probeRoot\Debug\obj\" `
  /m `
  /nologo `
  /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Debug build failed." }

& $msbuild `
  "WISE_REPORT\Wise_Report.sln" `
  /t:Build `
  /p:Configuration=Release `
  "/p:OutputPath=$probeRoot\Release\bin\" `
  "/p:BaseIntermediateOutputPath=$probeRoot\Release\obj\" `
  /m `
  /nologo `
  /v:minimal
if ($LASTEXITCODE -ne 0) { throw "Release build failed." }
```

4. Manual smoke only after build:

- Bootstrap ERP-0000 LocalDB using scripts 001→004.
- Insert only a disposable approved user in an isolated tester database; generate its PBKDF2 hash through `PasswordSecurity.HashPassword`, never store a reusable personal password.
- Start IIS Express, open `/Home/Login`, confirm wrong password stays on login with the generic message.
- Confirm correct password redirects to HomeLayout; rendered HTML contains no password/hash.
- Change to a new 12+ character disposable password; confirm redirect to Login, old password fails, new password succeeds.
- Confirm both logout controls POST and return to Login.
- Roll back/delete only the token-owned disposable database after evidence capture.

Manual smoke does not replace PROMPT 2 automated tests.

Checkpoint: build exits 0, no generated diff, and every AC has a planned automated seam.

Expected final diff:

```text
ADD    WISE_REPORT/Wise_Report/Models/BusinessModel/PasswordSecurity.cs
ADD    WISE_REPORT/Wise_Report/Shared/Forms/LoginForm.cs
ADD    WISE_REPORT/Wise_Report/Shared/Forms/ChangePasswordForm.cs
MODIFY WISE_REPORT/Wise_Report/Wise_Report.csproj
MODIFY WISE_REPORT/Wise_Report/Controllers/HomeController.cs
MODIFY WISE_REPORT/Wise_Report/Views/Home/Login.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml
MODIFY WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml
```

Expected generated files and SQL objects: none.

Rollback: revert only the eight listed production paths. No database rollback is required because the implementation introduces no schema/data deployment; disposable test rows are removed by tester-owned transaction/cleanup.

### Learning explanation

- This legacy codebase already carries Identity Core even though its active flow is session-based. Reusing `PasswordHasher` respects package compatibility without introducing a new auth framework in one task.
- Password migration is opportunistic because a secure hash cannot be derived from an old hash alone. A verified plaintext exists only during successful login; that is the safe moment to replace MD5 transactionally.
- Typed MVC forms and anti-forgery protect the request boundary, while authorization remains a separate system capability. A successful login does not imply the anonymous Web API endpoints are fixed.
- Database First generated entities remain storage mappings. Security behavior belongs in hand-written helpers/controllers, not generated `User.cs`.

### Human self-review checklist

- [ ] Before typing, `git diff --exit-code 09482ed60642ab3f6a3ff4a1956b421ecfb278df -- WISE_REPORT` exited 0 on latest `TEST`.
- [ ] Exactly three C# files were added and included once in csproj.
- [ ] No package, Web.config, SQL, EDMX, T4 or generated entity changed.
- [ ] Login compares a password and checks both `IsDeleted` and approved moderation status.
- [ ] MD5 is used only for strict legacy verification followed by PBKDF2 upgrade.
- [ ] All new password writes call `PasswordSecurity.HashPassword`.
- [ ] Login/change/logout POST actions and forms have anti-forgery.
- [ ] Change password reads identity only from session user ID.
- [ ] Session/HTML never contains password/hash.
- [ ] Logout has no GET action/link.
- [ ] Debug and Release builds exit 0 with output outside the repository.
- [ ] `git diff --check` exits 0 and the diff matches the eight-path write-set.
- [ ] Known anonymous user-admin API and UI enum/password DTO debts are not described as fixed.
- [ ] After self-review, send PROMPT 2 for independent ERP-0001 testing.

## 20. Test matrix và test report summaries

All AC-01…AC-12 passed at executable-source fingerprint `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499`.

- Latest report: `.ai-erp-workflow/reports/ERP-0001-test-report-r01.md`.
- Final gate: `PASS=39 FAIL=0`; helper unit sub-suite `PASS=9 FAIL=0`.
- Restore, Debug and Release exited 0; four pre-existing compiler warnings and 18 known-package vulnerability warnings remain recorded debt.
- DB bootstrap/rerun/verifier/smoke, IIS login/account-state/change/logout/anti-forgery journeys and cleanup all passed.
- Corrected cumulative production diff is exactly the eight allowed paths; generated delta and fixture residue are zero.

## 21. Final closure / retrospective

Closed as `TASK_PASSED`. Human implementation showed why classic C# build alone is insufficient: the broken Razor form compiled only at runtime, while a missing legacy-upgrade flag and GET logout were syntactically valid. Independent static/unit/DB/IIS seams caught all three classes of defect. ERP-0002 may now become the single active task; it must retain ERP-0001 login/logout regression coverage.
