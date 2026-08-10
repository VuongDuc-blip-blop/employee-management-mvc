[CmdletBinding()]
param(
    [ValidateSet('Static', 'Db', 'All')]
    [string]$Phase = 'All'
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$baselineSha = 'b06df0fdcb9f6997ad71c4eec421e385a233d2c8'
$databaseDirectory = Join-Path $repositoryRoot 'WISE_REPORT\Database\EmployeeManagementCoreDb'
$results = [System.Collections.Generic.List[object]]::new()
$testInstanceName = $null
$sqlLocalDbExecutable = $null
$sqlCmdExecutable = $null

function Add-TestResult {
    param(
        [string]$Id,
        [ValidateSet('PASS', 'FAIL', 'SKIP')]
        [string]$Result,
        [string]$Detail
    )

    $results.Add([pscustomobject]@{
        Id = $Id
        Result = $Result
        Detail = $Detail
    })

    Write-Host ("[{0}] {1}: {2}" -f $Result, $Id, $Detail)
}

function Invoke-RecordedNativeCommand {
    param(
        [string]$Id,
        [string]$Executable,
        [string[]]$Arguments
    )

    $displayCommand = $Executable + ' ' + ($Arguments -join ' ')
    Write-Host ("COMMAND {0}: {1}" -f $Id, $displayCommand)

    $output = & $Executable @Arguments 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    $sqlErrorDetected =
        [IO.Path]::GetFileName($Executable) -match '^sqlcmd(?:\.exe)?$' -and
        $output -match '(?im)^Msg\s+\d+,\s+Level\s+(?:1[1-5])\b'

    if ($output) {
        Write-Host $output.TrimEnd()
    }

    Write-Host ("EXIT {0}: {1}" -f $Id, $exitCode)

    if ($exitCode -eq 0 -and -not $sqlErrorDetected) {
        Add-TestResult -Id $Id -Result PASS -Detail 'Native command exited 0.'
    }
    else {
        $detail = "Native command exited {0}." -f $exitCode
        if ($sqlErrorDetected) {
            $detail += ' SQLCMD output contained a severity 11-15 SQL error.'
        }
        Add-TestResult -Id $Id -Result FAIL -Detail $detail
    }
}

function Invoke-RecordedExpectedFailureCommand {
    param(
        [string]$Id,
        [string]$Executable,
        [string[]]$Arguments
    )

    $displayCommand = $Executable + ' ' + ($Arguments -join ' ')
    Write-Host ("COMMAND {0}: {1}" -f $Id, $displayCommand)

    $output = & $Executable @Arguments 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    $sqlErrorDetected =
        [IO.Path]::GetFileName($Executable) -match '^sqlcmd(?:\.exe)?$' -and
        $output -match '(?im)^Msg\s+\d+,\s+Level\s+(?:1[1-9]|2[0-5])\b'

    if ($output) {
        Write-Host $output.TrimEnd()
    }

    Write-Host ("EXIT {0}: {1}" -f $Id, $exitCode)

    if ($exitCode -ne 0 -or $sqlErrorDetected) {
        Add-TestResult -Id $Id -Result PASS -Detail 'Command failed as required by the negative contract.'
    }
    else {
        Add-TestResult -Id $Id -Result FAIL -Detail 'Command unexpectedly succeeded.'
    }
}

Push-Location $repositoryRoot
try {
    if ($Phase -in @('Static', 'All')) {
        $expectedProductionPaths = @(
            'WISE_REPORT/Database/EmployeeManagementCoreDb/README.md',
            'WISE_REPORT/Database/EmployeeManagementCoreDb/001_CreateEmployeeManagementCoreDb.sql',
            'WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql',
            'WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql',
            'WISE_REPORT/Database/EmployeeManagementCoreDb/004_TransactionalSmokeTest.sql',
            'WISE_REPORT/Database/EmployeeManagementCoreDb/999_RollbackBaselineObjects.sql',
            'WISE_REPORT/Wise_Report/Web.config',
            'WISE_REPORT/Wise_Report/PushMessaging.cs'
        )

        $allowedControlPlanePaths = @(
            '.ai-erp-workflow/DECISIONS.md',
            '.ai-erp-workflow/PATTERN_CATALOG.md',
            '.ai-erp-workflow/PROJECT_STATE.md',
            '.ai-erp-workflow/REPOSITORY_INVENTORY.md',
            '.ai-erp-workflow/ROADMAP.md',
            '.ai-erp-workflow/TEST_STRATEGY.md',
            '.ai-erp-workflow/handoff/CURRENT_HANDOFF.md',
            '.ai-erp-workflow/tasks/ERP-0000-safe-reproducible-localdb-baseline.md',
            'docs/markdowns/db.md',
            'docs/markdowns/web.md',
            'prompts/ERP_LEGACY_SUPER_AGENT_PROMPT_SUITE.md',
            'WISE_REPORT/Tests/ERP-0000/Invoke-ERP0000DbContract.ps1',
            'WISE_REPORT/Tests/ERP-0000/ERP-0000.DbContract.sql'
        )

        $trackedChangedPaths = @(
            git diff --name-only $baselineSha -- |
                ForEach-Object { $_.Replace('\', '/') } |
                Where-Object { $_ }
        )
        $untrackedChangedPaths = @(
            git ls-files --others --exclude-standard -- |
                ForEach-Object { $_.Replace('\', '/') } |
                Where-Object { $_ }
        )
        $changedPaths = @(
            @($trackedChangedPaths) + @($untrackedChangedPaths) |
                Sort-Object -Unique
        )

        $missingPaths = @(
            $expectedProductionPaths |
                Where-Object { -not (Test-Path -LiteralPath (Join-Path $repositoryRoot $_)) }
        )

        if ($missingPaths.Count -eq 0) {
            Add-TestResult -Id 'STATIC-EXPECTED-FILES' -Result PASS -Detail 'All eight expected production paths exist.'
        }
        else {
            Add-TestResult -Id 'STATIC-EXPECTED-FILES' -Result FAIL -Detail ('Missing: ' + ($missingPaths -join ', '))
        }

        $unexpectedPaths = @(
            $changedPaths |
                Where-Object {
                    $_ -notin $expectedProductionPaths -and
                    $_ -notin $allowedControlPlanePaths
                }
        )

        if ($unexpectedPaths.Count -eq 0) {
            Add-TestResult -Id 'STATIC-WRITE-SET' -Result PASS -Detail 'Production and explicitly authorized workflow/test control-plane paths are within their separate write-sets.'
        }
        else {
            Add-TestResult -Id 'STATIC-WRITE-SET' -Result FAIL -Detail ("Unexpected path count: {0}." -f $unexpectedPaths.Count)
            $unexpectedPaths | ForEach-Object { Write-Host ("UNEXPECTED_PATH {0}" -f $_) }
        }

        $generatedNoise = @(
            $changedPaths |
                Where-Object {
                    $_ -match '(^|/)(bin|obj|\.vs)/' -or
                    $_ -match '\.(dll|pdb|cache)$'
                }
        )

        if ($generatedNoise.Count -eq 0) {
            Add-TestResult -Id 'STATIC-GENERATED-NOISE' -Result PASS -Detail 'No tracked generated/build output was introduced.'
        }
        else {
            Add-TestResult -Id 'STATIC-GENERATED-NOISE' -Result FAIL -Detail ("Tracked generated/build path count: {0}." -f $generatedNoise.Count)
        }

        $webConfigPath = Join-Path $repositoryRoot 'WISE_REPORT\Wise_Report\Web.config'
        try {
            $webConfigXml = [xml](Get-Content -Raw -LiteralPath $webConfigPath)
            Add-TestResult -Id 'STATIC-CONFIG-XML' -Result PASS -Detail 'Web.config is well-formed XML.'

            $connectionNodes = @($webConfigXml.SelectNodes('/configuration/connectionStrings/add'))
            $testEntitiesNodes = @($connectionNodes | Where-Object { $_.name -eq 'TestEntities' })
            $unsafeNodes = @(
                $connectionNodes |
                    Where-Object {
                        $_.connectionString -match '(?i)(password\s*=|user\s+id\s*=)' -or
                        $_.connectionString -notmatch '(?i)data source=\(localdb\)\\MSSQLLocalDB' -or
                        $_.connectionString -notmatch '(?i)integrated security=True'
                    }
            )

            if ($connectionNodes.Count -eq 1 -and
                $testEntitiesNodes.Count -eq 1 -and
                $unsafeNodes.Count -eq 0) {
                Add-TestResult -Id 'STATIC-CONFIG-CONTRACT' -Result PASS -Detail 'Exactly one safe TestEntities LocalDB connection exists.'
            }
            else {
                Add-TestResult -Id 'STATIC-CONFIG-CONTRACT' -Result FAIL -Detail ("Top-level connections={0}; TestEntities={1}; unsafe={2}." -f $connectionNodes.Count, $testEntitiesNodes.Count, $unsafeNodes.Count)
            }
        }
        catch {
            Add-TestResult -Id 'STATIC-CONFIG-XML' -Result FAIL -Detail $_.Exception.Message
            Add-TestResult -Id 'STATIC-CONFIG-CONTRACT' -Result SKIP -Detail 'Config contract not evaluated because XML parsing failed.'
        }

        $secretScanPaths = @(
            $webConfigPath,
            (Join-Path $repositoryRoot 'WISE_REPORT\Wise_Report\PushMessaging.cs')
        )
        $secretMatches = @(
            Select-String -LiteralPath $secretScanPaths -Pattern '(?i)(password\s*=|user\s+id\s*=)' -AllMatches
        )

        if ($secretMatches.Count -eq 0) {
            Add-TestResult -Id 'STATIC-SECRET-SCAN' -Result PASS -Detail 'No password/user-id connection fragments found in scoped files.'
        }
        else {
            Add-TestResult -Id 'STATIC-SECRET-SCAN' -Result FAIL -Detail ("Credential-bearing line count: {0}; values redacted." -f $secretMatches.Count)
        }

        $schemaPath = Join-Path $databaseDirectory '001_CreateEmployeeManagementCoreDb.sql'
        if (Test-Path -LiteralPath $schemaPath) {
            $schemaSql = Get-Content -Raw -LiteralPath $schemaPath
            $schemaChecks = [bool[]]@(
                ($schemaSql -match "OBJECT_ID\(N'dbo\.__EFMigrationsHistory',\s*N'U'\)\s+IS\s+NULL"),
                ($schemaSql -match "CREATE\s+TABLE\s+\[dbo\]\.\[__EFMigrationsHistory\]"),
                ($schemaSql -match "OBJECT_ID\(N'dbo\.Users',\s*N'U'\)\s+IS\s+NULL"),
                ($schemaSql -notmatch '(?i)DROP\s+DATABASE|TRUNCATE\s+TABLE|NOLOCK')
            )

            if ($schemaChecks -notcontains $false) {
                Add-TestResult -Id 'STATIC-SCHEMA-SCRIPT' -Result PASS -Detail 'Schema script contains required table names/guards and no forbidden destructive pattern.'
            }
            else {
                Add-TestResult -Id 'STATIC-SCHEMA-SCRIPT' -Result FAIL -Detail 'Schema script table names/create guards differ from the EDMX/guide contract.'
            }
        }
        else {
            Add-TestResult -Id 'STATIC-SCHEMA-SCRIPT' -Result FAIL -Detail '001 schema script is missing.'
        }

        $procedurePath = Join-Path $databaseDirectory '002_UpsertGetListUser.sql'
        if (Test-Path -LiteralPath $procedurePath) {
            $procedureSql = Get-Content -Raw -LiteralPath $procedurePath
            $procedureChecks = [bool[]]@(
                ($procedureSql -match '@PageSize\s+int'),
                ($procedureSql -match '@PageSize\s+IS\s+NULL\s+OR\s+@PageSize\s*<\s*1\s+OR\s+@PageSize\s*>\s*200'),
                ($procedureSql -match '@SortDirection\s+varchar\(10\)'),
                ($procedureSql -match "N'_',\s*N'~_'"),
                ($procedureSql -match '\[U\]\.\[UserName\]\s*,\s*\[U\]\.\[CreatedAt\]'),
                ($procedureSql -notmatch '(?i)NOLOCK|SP_EXECUTESQL')
            )

            if ($procedureChecks -notcontains $false) {
                Add-TestResult -Id 'STATIC-PROCEDURE-SCRIPT' -Result PASS -Detail 'Procedure source matches validation/type/search/result safety anchors.'
            }
            else {
                Add-TestResult -Id 'STATIC-PROCEDURE-SCRIPT' -Result FAIL -Detail 'Procedure source misses one or more required validation/type/search/result anchors.'
            }
        }
        else {
            Add-TestResult -Id 'STATIC-PROCEDURE-SCRIPT' -Result FAIL -Detail '002 procedure script is missing.'
        }

        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $diffCheckOutput = git diff --check $baselineSha -- `
            'WISE_REPORT/Database/EmployeeManagementCoreDb' `
            'WISE_REPORT/Wise_Report/Web.config' `
            'WISE_REPORT/Wise_Report/PushMessaging.cs' 2>&1 | Out-String
        $diffCheckExit = $LASTEXITCODE
        $ErrorActionPreference = $previousErrorActionPreference
        Write-Host 'COMMAND STATIC-DIFF-CHECK: git diff --check b06df0fdcb9f6997ad71c4eec421e385a233d2c8 -- WISE_REPORT/Database/EmployeeManagementCoreDb WISE_REPORT/Wise_Report/Web.config WISE_REPORT/Wise_Report/PushMessaging.cs'
        if ($diffCheckOutput) {
            Write-Host $diffCheckOutput.TrimEnd()
        }
        Write-Host ("EXIT STATIC-DIFF-CHECK: {0}" -f $diffCheckExit)
        if ($diffCheckExit -eq 0) {
            Add-TestResult -Id 'STATIC-DIFF-CHECK' -Result PASS -Detail 'git diff --check exited 0.'
        }
        else {
            Add-TestResult -Id 'STATIC-DIFF-CHECK' -Result FAIL -Detail ("git diff --check exited {0}." -f $diffCheckExit)
        }
    }

    if ($Phase -in @('Db', 'All')) {
        $sqlcmd = (Get-Command sqlcmd -ErrorAction SilentlyContinue).Source
        $sqllocaldb = (Get-Command sqllocaldb -ErrorAction SilentlyContinue).Source

        if (-not $sqlcmd -or -not $sqllocaldb) {
            Add-TestResult -Id 'DB-TOOLS' -Result FAIL -Detail 'sqlcmd and/or sqllocaldb is unavailable.'
        }
        else {
            Add-TestResult -Id 'DB-TOOLS' -Result PASS -Detail 'sqlcmd and sqllocaldb are available.'
            $sqlLocalDbExecutable = $sqllocaldb
            $sqlCmdExecutable = $sqlcmd
            $testInstanceName = 'ERP0000_Test_' + [Guid]::NewGuid().ToString('N').Substring(0, 12)
            $testServer = '(localdb)\' + $testInstanceName
            Invoke-RecordedNativeCommand -Id 'DB-CREATE-LOCALDB' -Executable $sqllocaldb -Arguments @('create', $testInstanceName)
            Invoke-RecordedNativeCommand -Id 'DB-START-LOCALDB' -Executable $sqllocaldb -Arguments @('start', $testInstanceName)

            $forwardScripts = @(
                @{ Id = 'DB-FORWARD-001'; Name = '001_CreateEmployeeManagementCoreDb.sql' },
                @{ Id = 'DB-FORWARD-002'; Name = '002_UpsertGetListUser.sql' },
                @{ Id = 'DB-VERIFY-003'; Name = '003_VerifyBaseline.sql' },
                @{ Id = 'DB-SMOKE-004'; Name = '004_TransactionalSmokeTest.sql' }
            )

            foreach ($script in $forwardScripts) {
                $scriptPath = Join-Path $databaseDirectory $script.Name
                if (Test-Path -LiteralPath $scriptPath) {
                    Invoke-RecordedNativeCommand -Id $script.Id -Executable $sqlcmd -Arguments @(
                        '-S', $testServer,
                        '-E',
                        '-b',
                        '-V', '16',
                        '-i', $scriptPath
                    )
                }
                else {
                    Add-TestResult -Id $script.Id -Result FAIL -Detail ("Missing script: {0}" -f $script.Name)
                }
            }

            $contractScript = Join-Path $PSScriptRoot 'ERP-0000.DbContract.sql'
            Invoke-RecordedNativeCommand -Id 'DB-TEST-CONTRACT' -Executable $sqlcmd -Arguments @(
                '-S', $testServer,
                '-E',
                '-b',
                '-V', '16',
                '-i', $contractScript
            )

            foreach ($script in $forwardScripts) {
                $scriptPath = Join-Path $databaseDirectory $script.Name
                if (Test-Path -LiteralPath $scriptPath) {
                    Invoke-RecordedNativeCommand -Id ($script.Id -replace '^DB-', 'DB-RERUN-') -Executable $sqlcmd -Arguments @(
                        '-S', $testServer,
                        '-E',
                        '-b',
                        '-V', '16',
                        '-i', $scriptPath
                    )
                }
            }

            $rollbackScript = Join-Path $databaseDirectory '999_RollbackBaselineObjects.sql'
            if (Test-Path -LiteralPath $rollbackScript) {
                Invoke-RecordedExpectedFailureCommand -Id 'DB-ROLLBACK-WRONG-CONFIRMATION' -Executable $sqlcmd -Arguments @(
                    '-S', $testServer,
                    '-E',
                    '-b',
                    '-V', '16',
                    '-v', 'ConfirmedDatabase=EmployeeManagementCoreDb', 'ConfirmRollback=NO',
                    '-i', $rollbackScript
                )

                Invoke-RecordedNativeCommand -Id 'DB-VERIFY-AFTER-REJECTED-ROLLBACK' -Executable $sqlcmd -Arguments @(
                    '-S', $testServer,
                    '-E',
                    '-b',
                    '-V', '16',
                    '-i', (Join-Path $databaseDirectory '003_VerifyBaseline.sql')
                )

                Invoke-RecordedNativeCommand -Id 'DB-ROLLBACK-CONFIRMED' -Executable $sqlcmd -Arguments @(
                    '-S', $testServer,
                    '-E',
                    '-b',
                    '-V', '16',
                    '-v', 'ConfirmedDatabase=EmployeeManagementCoreDb', 'ConfirmRollback=YES',
                    '-i', $rollbackScript
                )

                Invoke-RecordedExpectedFailureCommand -Id 'DB-VERIFIER-REJECTS-ROLLED-BACK-CONTRACT' -Executable $sqlcmd -Arguments @(
                    '-S', $testServer,
                    '-E',
                    '-b',
                    '-V', '16',
                    '-i', (Join-Path $databaseDirectory '003_VerifyBaseline.sql')
                )

                foreach ($script in $forwardScripts) {
                    $scriptPath = Join-Path $databaseDirectory $script.Name
                    Invoke-RecordedNativeCommand -Id ($script.Id -replace '^DB-', 'DB-REBOOTSTRAP-') -Executable $sqlcmd -Arguments @(
                        '-S', $testServer,
                        '-E',
                        '-b',
                        '-V', '16',
                        '-i', $scriptPath
                    )
                }

                Invoke-RecordedNativeCommand -Id 'DB-REBOOTSTRAP-CONTRACT' -Executable $sqlcmd -Arguments @(
                    '-S', $testServer,
                    '-E',
                    '-b',
                    '-V', '16',
                    '-i', $contractScript
                )
            }
            else {
                Add-TestResult -Id 'DB-ROLLBACK-SCRIPT' -Result FAIL -Detail 'Required rollback script is missing.'
            }
        }
    }
}
finally {
    Pop-Location

    if ($testInstanceName -and $sqlLocalDbExecutable) {
        if ($sqlCmdExecutable) {
            $dropOwnedDatabase = "IF DB_ID(N'EmployeeManagementCoreDb') IS NOT NULL AND EXISTS (SELECT 1 FROM [EmployeeManagementCoreDb].[sys].[extended_properties] WHERE [class] = 0 AND [major_id] = 0 AND [minor_id] = 0 AND [name] = N'ERPBaselineOwner' AND CONVERT(nvarchar(4000), [value]) = N'employee-management-mvc/ERP-0000/v1') BEGIN ALTER DATABASE [EmployeeManagementCoreDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [EmployeeManagementCoreDb]; PRINT N'Dropped tester-owned database.'; END ELSE PRINT N'No tester-owned database was dropped.';"
            Invoke-RecordedNativeCommand -Id 'DB-DROP-OWNED-DATABASE' -Executable $sqlCmdExecutable -Arguments @(
                '-S', ('(localdb)\' + $testInstanceName),
                '-E',
                '-b',
                '-V', '16',
                '-d', 'master',
                '-Q', $dropOwnedDatabase
            )
        }

        Invoke-RecordedNativeCommand -Id 'DB-STOP-LOCALDB' -Executable $sqlLocalDbExecutable -Arguments @('stop', $testInstanceName, '-k')
        Invoke-RecordedNativeCommand -Id 'DB-DELETE-LOCALDB' -Executable $sqlLocalDbExecutable -Arguments @('delete', $testInstanceName)
    }
}

$passed = @($results | Where-Object Result -eq PASS).Count
$failed = @($results | Where-Object Result -eq FAIL).Count
$skipped = @($results | Where-Object Result -eq SKIP).Count

Write-Host ("SUMMARY PASS={0} FAIL={1} SKIP={2}" -f $passed, $failed, $skipped)

if ($failed -gt 0) {
    exit 1
}

exit 0
