# Initial Test Strategy

## Testing boundary

Run planning này không tạo/sửa test code và không thực thi SQL object changes. Sau khi human tự gõ production/SQL theo guide, PROMPT 2 trao cho tester quyền tạo/sửa **test-only code** nhưng cấm tester sửa production code. Tester phải báo defect thay vì chữa production.

## Test pyramid cho legacy stack

1. **STATIC:** source fingerprint, expected write-set, secret scan, no generated EF edit, SQL parse/catalog assertions.
2. **BUILD:** MSBuild Debug với output/intermediate tách khỏi tracked source; capture exit code và warnings.
3. **DB CONTRACT:** isolated `(localdb)\\MSSQLLocalDB/EmployeeManagementCoreDb`; forward twice, exact metadata/FK/procedure/result checks, transaction fixtures, rollback, reapply.
4. **INTEGRATION:** EF `TestEntities` connection smoke; Dapper execute `GetListUser`; validate ordering/paging/search/soft-delete/no-password.
5. **API/MVC:** bắt đầu ERP-0001/0002; status/shape/auth/session checks.
6. **E2E:** bắt đầu khi UI slice đã an toàn và database reset deterministically.

## ERP-0000 matrix

| ID | Check | Expected evidence |
|---|---|---|
| T00-01 | Baseline SHA/fingerprint | Exact match hoặc human dừng và regenerate guide |
| T00-02 | Forward script từ DB absent | Exit 0; 5 tables (4 domain + `__EFMigrationsHistory`), keys/FKs, `GetListUser` tạo thành công |
| T00-03 | Forward script chạy lần hai | Exit 0; không duplicate object, không data loss |
| T00-04 | Schema contract | Type/nullability/PK/FK khớp EDMX; no unexpected baseline drift |
| T00-05 | Procedure contract | Parameter validation, allowlisted sort, deterministic tie-break, paging/count/search |
| T00-06 | Sensitive output | Result metadata không có `Password`; config/artifact diff không có reusable secret |
| T00-07 | Soft-delete behavior | Row `IsDeleted=1` không xuất hiện |
| T00-08 | Invalid inputs | Invalid page/page size/sort column/direction fail explicitly |
| T00-09 | Transaction fixtures | Test rows tồn tại trong transaction, assertions chạy, transaction rollback; no residue |
| T00-10 | Controlled rollback | Preview/guard pass; exact objects removed; DB itself retained |
| T00-11 | Reapply after rollback | Forward + verify exit 0 |
| T00-12 | EF connection smoke | `TestEntities` mở LocalDB và metadata mapping không lỗi |
| T00-13 | Debug build | Exit 0; warnings recorded; no tracked build artifacts |
| T00-14 | Expected diff | 6 added files (README + 5 SQL), 2 modified files (`Web.config`, `PushMessaging.cs`); no generated/test edit |

## ERP-0001 matrix

| ID | Acceptance criteria / check | Required evidence |
|---|---|---|
| T01-01 | Password helper | PBKDF2 salt produces distinct hashes; valid verifies; wrong/malformed fails closed |
| T01-02 | Legacy upgrade | Correct 32-hex MD5 verifies once and is replaced by PBKDF2 in a transaction; wrong input does not mutate |
| T01-03 | Login boundary | Typed validation, trim/length limits, anti-forgery and one generic credential/account-state failure |
| T01-04 | Account state | Deleted, pending, rejected and unknown users cannot establish a session |
| T01-05 | Minimal session | Successful login exposes only `userid`/`username`; no password/hash in session or rendered HTML |
| T01-06 | Password change | Session-derived identity, current/different/12–128/confirmation rules, PBKDF2 transaction, forced re-login |
| T01-07 | Logout | GET unavailable, missing token rejected, valid POST clears and abandons session |
| T01-08 | UI/static contract | One form per view, correct anti-forgery/autocomplete, no nested form/hidden password, exact csproj includes |
| T01-09 | Build/regression | Full Framework restore + Debug/Release build; ERP-0000 isolated DB/API regression remains green |
| T01-10 | IIS Express journeys | PBKDF2 login, legacy upgrade, wrong password, change password and logout observed over HTTP with isolated fixture |
| T01-11 | Security scan | No raw/MD5 write, exception leakage, credential echo, reusable fixture secret or unrelated generated diff |
| T01-12 | Source fingerprint | Report binds PASS/FAIL to exact branch, HEAD, status/diff fingerprint and allowed write-set |

Result: report r01 `PASS=39 FAIL=0` at executable fingerprint `1a6cdfb3d3c1caa5d88d598f6813c2ab9fd4dedcbe669f9a2e1e911b4ac09499`; no skipped gate.

## Environment and commands policy

- Chỉ chạy destructive DB test trên exact isolated LocalDB database; kiểm tra `SERVERPROPERTY('ServerName')` và `DB_NAME()` trước.
- Mọi shell/SQL command phải lưu command, timestamp, exit code và concise output trong tester report.
- Không suy PASS từ compile đơn lẻ; `BLOCKED_ENVIRONMENT` nếu LocalDB/sqlcmd không khả dụng.
- Không dùng production/shared data, không log connection secret/PII, không seed reusable password.

## Regression focus cho các task kế tiếp

- ERP-0001: use T01-01 through T01-12; do not weaken malformed-hash, anti-forgery, account-state, session or legacy-upgrade assertions.
- ERP-0002/0003: sort allowlist, stable paging under equal keys, total independent of page, search/null, response casing, authorization.
- Mutation tasks: validation, unique constraints, optimistic conflict, transaction rollback, actor audit, soft-delete visibility.
- Export/import: authorization, selected columns, formula/HTML injection, size limits, malformed input.
- ERP transactions: state-transition matrix, idempotency, concurrency, accounting/inventory invariants and rollback.

## Exit rule

Task chỉ có thể chuyển `DONE` khi mọi mandatory check PASS, hoặc có waiver do human ghi rõ. Tester không được sửa production để làm test xanh.
