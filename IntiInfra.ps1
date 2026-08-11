$ErrorActionPreference = "Stop"

if (-not (Test-Path "WISE_REPORT\Wise_Report.sln")) {
    throw "Hãy chạy script tại thư mục gốc repository."
}

if (-not (Get-Command sqllocaldb -ErrorAction SilentlyContinue)) {
    throw "Chưa cài SQL Server Express LocalDB."
}

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    throw "Chưa cài sqlcmd."
}

$instances = @(sqllocaldb info) | ForEach-Object { $_.Trim() }

if ($instances -notcontains "MSSQLLocalDB") {
    sqllocaldb create MSSQLLocalDB
    if ($LASTEXITCODE -ne 0) {
        throw "Không thể tạo MSSQLLocalDB."
    }
}

sqllocaldb start MSSQLLocalDB
if ($LASTEXITCODE -ne 0) {
    throw "Không thể khởi động MSSQLLocalDB."
}

$scripts = @(
    "WISE_REPORT\Database\EmployeeManagementCoreDb\001_CreateEmployeeManagementCoreDb.sql",
    "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql",
    "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql",
    "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
)

foreach ($round in 1..2) {
    Write-Host "Database setup round $round" -ForegroundColor Cyan

    foreach ($script in $scripts) {
        Write-Host "Running $script" -ForegroundColor Yellow

        sqlcmd `
            -S "(localdb)\MSSQLLocalDB" `
            -E `
            -b `
            -V 11 `
            -i $script

        if ($LASTEXITCODE -ne 0) {
            throw "$script failed with exit code $LASTEXITCODE."
        }
    }
}

$vswhere = Join-Path `
    ${env:ProgramFiles(x86)} `
    "Microsoft Visual Studio\Installer\vswhere.exe"

if (-not (Test-Path $vswhere)) {
    throw "Không tìm thấy Visual Studio/vswhere."
}

$msbuild = & $vswhere `
    -latest `
    -products * `
    -requires Microsoft.Component.MSBuild `
    -find "MSBuild\**\Bin\MSBuild.exe" |
    Select-Object -First 1

if (-not $msbuild) {
    throw "Không tìm thấy Full Framework MSBuild."
}

& $msbuild `
    "WISE_REPORT\Wise_Report.sln" `
    /t:Restore `
    /p:RestorePackagesConfig=true `
    /m `
    /nologo `
    /v:minimal

if ($LASTEXITCODE -ne 0) {
    throw "Package restore failed."
}

$probeRoot = Join-Path $env:TEMP "OpenERP-Company-Debug"

New-Item -ItemType Directory -Force -Path `
    (Join-Path $probeRoot "bin"), `
    (Join-Path $probeRoot "obj") |
    Out-Null

& $msbuild `
    "WISE_REPORT\Wise_Report.sln" `
    /t:Build `
    /p:Configuration=Debug `
    "/p:OutputPath=$probeRoot\bin\" `
    "/p:BaseIntermediateOutputPath=$probeRoot\obj\" `
    /m `
    /nologo `
    /v:minimal

if ($LASTEXITCODE -ne 0) {
    throw "Debug build failed."
}

Write-Host "Database, restore và Debug build đã hoàn tất." -ForegroundColor Green