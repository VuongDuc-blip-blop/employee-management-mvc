# Pattern Catalog

## Quy ước

- Classification dùng đúng vocabulary: `REQUIRED_COMPATIBILITY`, `PREFERRED_CONVENTION`, `CONTEXTUAL`, `LAB_ONLY`, `REJECTED_UNSAFE`.
- Application mode: `PRODUCTION`, `TEST_LAB`, `STUDY_ONLY`.
- Safety: `SAFE`, `CONDITIONAL`, `UNSAFE`. Mastery: `DISCOVERED`, `PLANNED`, `MASTERED`.
- `MASTERED` chỉ được ghi sau khi human implementation và tester có evidence PASS. Run này không có pattern nào mastered.

## Web/Application patterns

| ID | Pattern / purpose | Source section + repo evidence | Classification / application mode | Safety/data-integrity | Mastery | Planned task / prerequisite |
|---|---|---|---|---|---|---|
| WEB-001 | Legacy package compatibility: giữ version thật của MVC5/.NET Framework | `web.md` package/version; `packages.config`, `.csproj` | REQUIRED_COMPATIBILITY / PRODUCTION | CONDITIONAL | DISCOVERED | Mọi task; source version thắng tài liệu |
| WEB-002 | EF6 Database First: context/entity sinh từ EDMX | `web.md` EF Database First; `Models/DataModel/Database.edmx` | REQUIRED_COMPATIBILITY / PRODUCTION | CONDITIONAL | PLANNED | ERP-0000; không hand-edit generated code |
| WEB-003 | External REST client | `web.md` Jira/API; package không có trong repo | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | Chỉ sau integration contract |
| WEB-004 | Credential/token hard-code | `web.md` Jira/API chứa token-like value | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Không bao giờ dùng; phải rotate ngoài repo |
| WEB-005 | Mongo action logging | `web.md` Mongo logging; không có implementation/package xác nhận | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P9 sau audit contract |
| WEB-006 | End-to-end trace View → JS → API → SP → table | `web.md` Web trace; flow Projects/GetListUser trong repo | PREFERRED_CONVENTION / PRODUCTION | SAFE | PLANNED | ERP-0000/0002 |
| WEB-007 | Sửa object trực tiếp bằng SSMS | `web.md` DB workflow | LAB_ONLY / TEST_LAB | CONDITIONAL | DISCOVERED | Chỉ isolated DB; production dùng script versioned |
| WEB-008 | AngularJS module/controller wiring | `web.md` AngularJS; `Scripts/Angular/...` | REQUIRED_COMPATIBILITY / PRODUCTION | CONDITIONAL | DISCOVERED | ERP-0002+; kiểm tra đúng controller |
| WEB-009 | UI Router state mapping | `web.md` RouteCtrl/ui-router; Angular route code | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Khi route hiện hữu cần mở rộng |
| WEB-010 | EF transaction commit/rollback | `web.md` EF transaction | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | ERP-0004+; mutation đa bước |
| WEB-011 | CKEditor integration | `web.md` CKEditor; assets hiện có | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | Chỉ khi có rich-text requirement |
| WEB-012 | Render raw HTML bằng trust bypass | `web.md` AngularJS `$sce.trustAsHtml` | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Cần sanitize/allowlist trước khi cân nhắc |
| WEB-013 | CKFinder/file upload | `web.md` file upload; upload code trong repo | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Sau authz, MIME/size/name/path validation |
| WEB-014 | Deterministic DbContext disposal | `web.md` connection/disposal; controllers dùng context | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Mọi EF task |
| WEB-015 | Dynamic-column table rendering | `web.md` dynamic table | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Report task; output encoding bắt buộc |
| WEB-016 | Paste HTML/Excel import | `web.md` Excel import | LAB_ONLY / TEST_LAB | CONDITIONAL | DISCOVERED | Sau schema validation và formula-injection controls |
| WEB-017 | Client array find/splice | `web.md` JavaScript arrays | CONTEXTUAL / PRODUCTION | SAFE | DISCOVERED | UI state nhỏ, không thay server validation |
| WEB-018 | Thay ID bằng string replace | `web.md` JavaScript manipulation | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Dùng typed parsing/mapping |
| WEB-019 | Client-side dirPagination | `web.md` client pagination; Angular dependency | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Chỉ dataset nhỏ; không phải ERP list mặc định |
| WEB-020 | Server paging `OFFSET/FETCH` + total | `web.md` server pagination; `db.md` OFFSET/FETCH | PREFERRED_CONVENTION / PRODUCTION | SAFE | PLANNED | ERP-0000/0002; sort allowlist + tie-breaker |
| WEB-021 | `$http`/Ajax promise flow | `web.md` HTTP/promise; service/controller code | REQUIRED_COMPATIBILITY / PRODUCTION | SAFE | DISCOVERED | ERP-0002+; error path bắt buộc |
| WEB-022 | Previous/next sentinel paging | `web.md` pagination | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | Chỉ khi UX contract chọn kiểu này |
| WEB-023 | `ng-style`/filter presentation | `web.md` Angular filters/styles | CONTEXTUAL / PRODUCTION | SAFE | DISCOVERED | Presentation only |
| WEB-024 | Grouped row rendering | `web.md` grouped rows | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Reporting/workforce views |
| WEB-025 | Select/radio/check form binding | `web.md` form controls | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Server validation vẫn bắt buộc |
| WEB-026 | Employee autocomplete | `web.md` employee autocomplete | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | ERP-0005; debounced, paged, authorized lookup |
| WEB-027 | Excel export | `web.md` Excel export; EPPlus 6.0.3 trong source | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | ERP-0008; safe projection + formula sanitation |
| WEB-028 | Dapper stored-procedure mapping | `web.md` Dapper/SP; Setting controllers | REQUIRED_COMPATIBILITY / PRODUCTION | CONDITIONAL | PLANNED | ERP-0000/0002; parameterized + explicit contract |

## Database patterns

| ID | Pattern / purpose | Source section + repo evidence | Classification / application mode | Safety/data-integrity | Mastery | Planned task / prerequisite |
|---|---|---|---|---|---|---|
| DB-001 | Inventory server/database/session | `db.md` metadata queries | LAB_ONLY / TEST_LAB | SAFE | DISCOVERED | Baseline diagnostics |
| DB-002 | Inspect password/hash data | `db.md` authentication examples | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Không truy vấn/xuất credential data |
| DB-003 | Catalog tables/views/row counts | `db.md` data dictionary; EDMX mismatch check | LAB_ONLY / TEST_LAB | SAFE | PLANNED | ERP-0000 verify |
| DB-004 | Column dictionary: type, length, nullability | `db.md` data dictionary; EDMX SSDL | REQUIRED_COMPATIBILITY / PRODUCTION | SAFE | PLANNED | ERP-0000 contract |
| DB-005 | Index inventory | `db.md` index metadata | LAB_ONLY / TEST_LAB | SAFE | PLANNED | ERP-0000 verify; index tuning sau workload evidence |
| DB-006 | Foreign-key graph | `db.md` keys/FKs; EDMX associations | REQUIRED_COMPATIBILITY / PRODUCTION | SAFE | PLANNED | ERP-0000 contract |
| DB-007 | Object change tracking | `db.md` stored procedure metadata | LAB_ONLY / TEST_LAB | SAFE | DISCOVERED | Ops/runbook |
| DB-008 | Stored-procedure discovery/definition | `db.md` procedure discovery; missing called SPs | REQUIRED_COMPATIBILITY / PRODUCTION | SAFE | PLANNED | ERP-0000 defines only `GetListUser` |
| DB-009 | Temporary result mapping | `db.md` temp result/API mapping | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Complex reports after stable result contract |
| DB-010 | Temp-table staging | `db.md` temp tables | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Large multi-step query with measured need |
| DB-011 | CTE | `db.md` CTE | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Hierarchy/query readability; recursion guards |
| DB-012 | `CASE`/`COALESCE` mapping | `db.md` CASE/COALESCE | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Stable business semantics required |
| DB-013 | `UNION`/`NOT EXISTS` set logic | `db.md` UNION/NOT EXISTS | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Typed compatible sets; null semantics reviewed |
| DB-014 | Conditional aggregation | `db.md` conditional aggregation | CONTEXTUAL / PRODUCTION | SAFE | DISCOVERED | KPI/report after transaction contracts |
| DB-015 | Window ranking/count | `db.md` window functions | PREFERRED_CONVENTION / PRODUCTION | SAFE | PLANNED | ERP-0000 uses total count; deterministic ordering |
| DB-016 | Dynamic pivot | `db.md` dynamic PIVOT | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | P9; identifiers allowlisted/quoted |
| DB-017 | Global temp + dynamic SQL | `db.md` temp/dynamic SQL | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Prefer scoped temp/table-valued contract |
| DB-018 | Sargable date filtering | `db.md` date filtering | PREFERRED_CONVENTION / PRODUCTION | SAFE | DISCOVERED | Attendance/report queries |
| DB-019 | `LIKE` and authentication predicates | `db.md` LIKE/auth predicates | CONTEXTUAL / PRODUCTION | CONDITIONAL | DISCOVERED | Parameterize; never use LIKE for passwords |
| DB-020 | Sales-order domain clues | `db.md` sales reports | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P4; business confirmation required |
| DB-021 | Inventory domain clues | `db.md` inventory reports | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P6; business confirmation required |
| DB-022 | Procurement domain clues | `db.md` procurement reports | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P5; business confirmation required |
| DB-023 | Receivable domain clues | `db.md` receivable reports | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P7; business confirmation required |
| DB-024 | Warranty domain clues | `db.md` warranty reports | CONTEXTUAL / STUDY_ONLY | CONDITIONAL | DISCOVERED | P8; business confirmation required |
| DB-025 | Query performance DMV / logical reads | `db.md` performance diagnostics | LAB_ONLY / TEST_LAB | CONDITIONAL | DISCOVERED | Read-only diagnostic, least privilege |
| DB-026 | Statistics inspection | `db.md` statistics | LAB_ONLY / TEST_LAB | SAFE | DISCOVERED | Performance evidence only |
| DB-027 | Blanket `UPDATE STATISTICS` | `db.md` statistics operations | LAB_ONLY / TEST_LAB | CONDITIONAL | DISCOVERED | Không chạy mặc định/shared DB |
| DB-028 | Lock/block/deadlock diagnosis | `db.md` locking diagnostics | LAB_ONLY / TEST_LAB | CONDITIONAL | DISCOVERED | Read-only first, sanitized evidence |
| DB-029 | Arbitrary `KILL` session | `db.md` blocking operations | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Chỉ DBA-authorized incident procedure |
| DB-030 | Blanket `NOLOCK` | `db.md` query examples | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Không đổi tính đúng đắn để che blocking |
| DB-031 | Manual destructive `DELETE` | `db.md` data correction | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Versioned, isolated, preview + rollback only |
| DB-032 | Direct PII correction `UPDATE` | `db.md` data correction | REJECTED_UNSAFE / STUDY_ONLY | UNSAFE | DISCOVERED | Audited application workflow/data-fix protocol |
| DB-033 | Output sanitation/redaction | `db.md` output sanitation; current password exposure | PREFERRED_CONVENTION / PRODUCTION | SAFE | PLANNED | ERP-0000 omits password; ERP-0002 removes DTO field |
| DB-034 | Secretless local connection convention | `db.md` connection practice; current config conflict | REQUIRED_COMPATIBILITY / PRODUCTION | SAFE | PLANNED | ERP-0000; LocalDB integrated security |

## Coverage policy

ERP-0000 lập kế hoạch cho WEB-002/006/020/028 và DB-003/004/005/006/008/015/033/034. Những pattern này vẫn là `PLANNED`, không phải `MASTERED`, cho đến khi human tự gõ guide và tester cung cấp bằng chứng. Các pattern `STUDY_ONLY` trong reference chỉ là domain clue; source code thật và yêu cầu human tiếp tục quyết định requirement.
