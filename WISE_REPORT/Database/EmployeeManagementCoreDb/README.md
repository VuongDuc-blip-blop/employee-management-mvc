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
