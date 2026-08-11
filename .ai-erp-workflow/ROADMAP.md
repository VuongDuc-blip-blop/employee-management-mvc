# Dependency-aware ERP Roadmap

## Nguyên tắc

Roadmap lấy repository làm source of truth. Các tên miền thương mại trong `db.md` chỉ là `SOURCE_EXPLICIT` clue, chưa phải requirement đã xác nhận. Mỗi task phải có một vertical contract, test seam, recovery path và giới hạn 2–8 giờ; task không được nhảy qua dependency về identity, authorization, audit hoặc master data.

## Capability map

| Capability family | Provenance | State | Evidence / next dependency |
|---|---|---|---|
| Build runtime MVC5/.NET Framework 4.8 | REPO_EXISTING | PROVEN | Restore, Debug/Release build and IIS Express gate pass in ERP-0000 |
| EF6 Database First | REPO_EXISTING | BASELINED | EDMX four-domain-entity contract and five physical tables verified |
| Local database/bootstrap | REPO_EXISTING | IMPLEMENTED | `LocalDatabaseBaseline/v1`; ERP-0000 TASK_PASSED |
| Stored-procedure contracts | REPO_EXISTING | PARTIAL | `GetListUser` proven; four other live procedures remain undefined |
| Automated tests | INFERRED_EXTENSION | PARTIAL | ERP-0000/0001 PowerShell, SQL and IIS gates are versioned; no application-owned test project yet |
| Configuration/secrets | REPO_EXISTING | PARTIAL | Current scoped config is secretless; historic credentials still require rotation |
| User/session identity | REPO_EXISTING | IMPLEMENTED | `SessionIdentity/v1`; ERP-0001 PASS `39/0`; Angular interaction v2 is ERP-0003 |
| Safe user directory | REPO_EXISTING | IMPLEMENTED | `UserDirectory/v1`; ERP-0002 PASS `36/0` at correction commit `2a2c998` |
| User Excel showcase | HUMAN_PRIORITY + REPO_EXISTING | PLANNED | Five classified export modes; EPPlus 6 commercial-license gate in ERP-0003 |
| Employee directory/lifecycle | REPO_EXISTING | BROKEN | Model/view skeleton, API employee chưa compile, JS wiring sai |
| Unit hierarchy/employee assignment | REPO_EXISTING | PARTIAL | Schema có nhưng thiếu FK assignment và workflow |
| Authorization/audit | INFERRED_EXTENSION | MISSING/PARTIAL | Bắt buộc trước transaction modules |
| Workforce: shift/attendance/leave | INFERRED_EXTENSION | MISSING | Sau HR core + authz + audit |
| Commercial master data | SOURCE_EXPLICIT | MISSING | Company/branch/customer/supplier/product/warehouse; cần xác nhận nghiệp vụ |
| Sales/procurement/inventory | SOURCE_EXPLICIT | MISSING | Phụ thuộc master data và security backbone |
| Receivable/warranty | SOURCE_EXPLICIT | MISSING | Phụ thuộc transaction/serial contracts |
| Reporting/integration/operations | REPO_EXISTING + SOURCE_EXPLICIT | PARTIAL | Thực hiện sau khi transaction contracts ổn định |

## Phases và dependency logic

1. **P0 — Reproducible Foundation:** database bootstrap, safe local config, schema/SP contract và test seam.
2. **P1 — Secure HR Core:** identity, safe user directory, employee, organization, authorization, audit, safe export.
3. **P2 — Workforce Operations:** shift, attendance, leave, timesheet, payroll.
4. **P3 — Commercial Master Data:** company/branch, customer, supplier, product/group, warehouse.
5. **P4 — CRM & Sales:** customer evaluation, quotation, sales order.
6. **P5 — Procurement:** request, purchase order, supplier receiving.
7. **P6 — Inventory:** receive, issue, transfer, reservation/held stock, serial and dated snapshot.
8. **P7 — Finance Operations:** receivable, collection, accounting document, reconciliation.
9. **P8 — Warranty & Technical Service:** activation, case, service workflow.
10. **P9 — Reporting, Integration & Operations:** KPI, reports, external API, notification, DB observability.

```text
ERP-0000 DB baseline
  -> ERP-0001 secure identity
     -> ERP-0002 safe user directory
        -> ERP-0003 Angular identity UX + user Excel showcase
     -> ERP-0004 employee directory
        -> ERP-0005 employee lifecycle
           -> ERP-0006 organization + assignment
              -> ERP-0007 authorization
                 -> ERP-0008 audit
                    -> ERP-0009 authorized employee export
                    -> ERP-0010 shift -> ERP-0011 attendance -> ERP-0012 leave

identity + authorization + audit
  -> commercial master data
     -> sales + procurement
        -> inventory
           -> receivable + warranty
              -> reporting + integration + operations
```

Không tạo transaction ERP trước authorization/audit; không tạo sales/procurement trước master data; không tạo inventory movement trước sales/PO contract; không tạo receivable trước customer/sales document; không tạo warranty trước product/serial/outbound movement. Report tiêu thụ transaction contract, không dẫn dắt schema.

## Learning sprint ưu tiên — ba ngày đầu

### Ngày 1 — Database First contract — completed

Trace `Web.config → TestEntities → Database.edmx`; đối chiếu type/nullability/key/FK; human tự gõ forward bootstrap, không sửa generated EF files. Outcome: hiểu model artifact không đồng nghĩa database thật tồn tại.

### Ngày 2 — Safety và reversibility — completed

Human tự gõ verify + transaction-only fixtures + rollback cho isolated LocalDB; thay connection bằng integrated security; xóa secret-bearing obsolete line. Outcome: hiểu rerunnable DDL, metadata assertions, secretless config và rollback boundary.

### Ngày 3 — Independent test evidence — completed

Tester đã tạo harness, chạy static/DB lifecycle `33/0/0`, restore/build và IIS Express E2E; ERP-0000 đạt PASS trên fingerprint chính xác. Outcome: ERP-0001 được mở với một baseline tái lập và có regression anchor độc lập.

## 13 task đầu tiên sau human-priority insertion

| ID / business outcome | Provenance | Dependencies; consumed → produced contract | Target Web/DB patterns | Expected files/layers | Test level | Effort / risk / status |
|---|---|---|---|---|---|---|
| ERP-0000 — clone mới có DB baseline tái lập | REPO_EXISTING / baseline enabling | Build runtime → `LocalDatabaseBaseline/v1` | EF DB First; catalog/FK; SP; paging; safe config | SQL/runbook/config | STATIC, BUILD, DB contract/rollback/API E2E | 6–8h / Medium / TASK_PASSED |
| ERP-0001 — đăng nhập xác minh credential an toàn | REPO_EXISTING repair | 0000 → `SessionIdentity/v1` | Typed form; anti-forgery; PBKDF2 + legacy upgrade; transaction/session | MVC helper/forms/controller/views/project include; no DB/EDMX | Unit, integration, MVC/E2E login | 6–8h / High / TASK_PASSED |
| ERP-0002 — user directory không lộ password | REPO_EXISTING repair | 0000, 0001 → `UserDirectory/v1` | DTO projection; Dapper/SP output total; validated paging; Angular error path | SQL/API/DTO/Angular/two live views/project include | DB/API/E2E + ERP-0001 regression | 6–8h / Medium / TASK_PASSED |
| ERP-0003 — Angular identity UX + user Excel showcase | HUMAN_PRIORITY + REPO_EXISTING repair | 0001, 0002 → `AngularSessionIdentity/v2`, `UserExcelShowcase/v1` | Angular forms + anti-forgery; AlaSQL; safe HTML/MIME; authenticated bounded export; license-gated EPPlus | MVC controller/views/layout, JS services, config/project include; no DB | JS/static, MVC/IIS, binary workbook/security, regression | 8–12h / High / GUIDE_READY |
| ERP-0004 — employee list end-to-end | REPO_EXISTING repair | 0000, 0001 → `EmployeeDirectory/v1` | View→JS→API→SP; paging | SQL/API/DTO/JS/view/project include | DB/API/E2E | 6–8h / Medium / PLANNED |
| ERP-0005 — employee create/edit/soft-delete | REPO_EXISTING extension | 0004 → `EmployeeLifecycle/v1` | Forms; EF transaction; validation | DB/index/API/form/JS/view | Unit/integration/E2E | 6–8h / High / PLANNED |
| ERP-0006 — org tree và assignment có integrity | REPO_EXISTING extension | 0005 → `Organization/v1` | Hierarchy CTE; autocomplete; FK | DB/EDMX/API/DTO/JS/view | DB/API/E2E | 6–8h / High / PLANNED |
| ERP-0007 — enforce role/permission | INFERRED_ERP_EXTENSION | 0001, 0006 → `Authorization/v1` | Auth filter; menu mapping; permission DTO | DB/EDMX/filter/API/menu/view | Unit/API 401-403/E2E | 6–8h / High / PLANNED |
| ERP-0008 — immutable sensitive-action audit | REPO_EXISTING extension | 0007 → `ActionAudit/v1` | Transaction correlation; sanitation | DB/EDMX/API helper | DB/integration/redaction | 5–7h / High / PLANNED |
| ERP-0009 — filtered authorized employee export | REPO_EXISTING repair | 0004, 0007, 0008 → `EmployeeExport/v1` | Authorized true-XLSX projection; output sanitation | API/service/DTO/JS/view | Content/auth/formula | 4–6h / Medium / PLANNED |
| ERP-0010 — shift master và effective assignment | INFERRED_ERP_EXTENSION | 0006–0008 → `ShiftAssignment/v1` | Date-range integrity; forms/transaction | DB/EDMX/API/form/JS/view | DB/API/E2E | 6–8h / High / PLANNED |
| ERP-0011 — idempotent daily attendance | INFERRED_ERP_EXTENSION | 0010 → `Attendance/v1` | Idempotent write; paging/date filter | DB/EDMX/API/JS/view | Unit/DB/API/E2E | 6–8h / High / PLANNED |
| ERP-0012 — auditable leave approval | INFERRED_ERP_EXTENSION | 0006–0008 → `LeaveWorkflow/v1` | State transition; authz; transaction | DB/EDMX/API/JS/view | Unit/DB/API/E2E | 6–8h / High / PLANNED |

## Backlog dài hạn sau ERP-0012

| Phase | Candidate tasks (sẽ tách thành 2–8h sau discovery) | Gate |
|---|---|---|
| P2 | Timesheet, overtime approval, payroll input/export | Attendance/leave contracts stable; payroll semantics confirmed |
| P3 | Company/branch, customer, supplier, product/group, warehouse | Business identifiers, ownership, lifecycle confirmed |
| P4 | Customer evaluation, quotation, sales order | P3 + authz/audit |
| P5 | Purchase request, PO approval, supplier receipt | Supplier/product + approval matrix |
| P6 | Receive/issue/transfer, reservation, serial/lot, dated stock snapshot | P4/P5 document contracts |
| P7 | Receivable ledger, collection, reconciliation | Sales/accounting rules confirmed |
| P8 | Warranty activation, service case, technical report | Product/serial/outbound evidence |
| P9 | KPI/reporting, safe dynamic pivot, notification, external connectors, operational runbook | Stable upstream contracts + privacy/security review |

## Pattern coverage strategy

- P0/P1 ưu tiên EF Database First, metadata/FK/index, Dapper/SP, DTO/query projection, deterministic paging, safe connection và transaction.
- HR/workforce dùng Angular `$http`, validated forms, autocomplete, hierarchy CTE, grouped/dynamic tables và explicit state transitions.
- Commercial/reporting chỉ dùng `CASE`, `COALESCE`, `NOT EXISTS`, conditional aggregation, windows, temp staging hoặc controlled pivot khi business contract và workload evidence tồn tại.
- Performance DMV, statistics và lock diagnosis ở `TEST_LAB`; phải read-only first và least privilege.
- Hard-coded credentials, plaintext/MD5 passwords, unparameterized dynamic SQL, raw trusted HTML, arbitrary `KILL`, blanket `NOLOCK`, destructive direct data edits đều bị từ chối.

## Success gates toàn roadmap

Một task chỉ được `DONE` khi build/test/database checks theo task đều có evidence, expected diff khớp write-set, không secret/PII, rollback được diễn tập khi có DB change, pattern catalog được cập nhật từ `PLANNED` sang `MASTERED`, và handoff ghi rõ task kế tiếp.
