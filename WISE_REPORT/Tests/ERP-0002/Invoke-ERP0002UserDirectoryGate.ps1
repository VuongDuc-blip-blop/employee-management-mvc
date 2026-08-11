param(
    [ValidateSet("Static", "All")]
    [string]$Phase = "All"
)

$ErrorActionPreference = "Stop"
$script:Passed = 0
$script:Failed = 0
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$sourceBaseline = "9395988369a747c9796c1843ca6e519ca052f70b"
$tempRoot = $null
$iis = $null
$connection = $null
$fixtureIds = @()
$deployedAssembly = $null
$assemblyBackup = $null
$webConfigPath = $null
$webConfigStamp = $null
$generatedPaths = @(
    "WISE_REPORT/Wise_Report/.vs/Wise_Report.csproj.dtbcache.json",
    "WISE_REPORT/Wise_Report/bin/Wise_Report.dll",
    "WISE_REPORT/Wise_Report/bin/Wise_Report.dll.config",
    "WISE_REPORT/Wise_Report/bin/Wise_Report.pdb",
    "WISE_REPORT/Wise_Report/obj/Debug/Wise_Report.csproj.AssemblyReference.cache",
    "WISE_REPORT/Wise_Report/obj/Debug/Wise_Report.csproj.CoreCompileInputs.cache",
    "WISE_REPORT/Wise_Report/obj/Debug/Wise_Report.csproj.FileListAbsolute.txt",
    "WISE_REPORT/Wise_Report/obj/Debug/Wise_Report.dll",
    "WISE_REPORT/Wise_Report/obj/Debug/Wise_Report.pdb"
)

function Add-Pass([string]$id) {
    $script:Passed++
    Write-Host "PASS $id" -ForegroundColor Green
}

function Add-Fail([string]$id, [string]$detail) {
    $script:Failed++
    Write-Host "FAIL $id - $detail" -ForegroundColor Red
}

function Assert-Gate([bool]$condition, [string]$id, [string]$detail) {
    if ($condition) { Add-Pass $id } else { Add-Fail $id $detail }
}

function Invoke-SqlFile([string]$path) {
    Write-Host "COMMAND sqlcmd -S (localdb)\MSSQLLocalDB -E -b -V 11 -i $path"
    & sqlcmd -S "(localdb)\MSSQLLocalDB" -E -b -V 11 -i $path
    $exitCode = $LASTEXITCODE
    Write-Host "EXIT $exitCode"
    if ($exitCode -ne 0) { throw "SQL script failed: $path" }
}

function Invoke-JsonRequest(
    [string]$method,
    [string]$url,
    [string]$json
) {
    $token = [Guid]::NewGuid().ToString("N")
    $bodyPath = Join-Path $tempRoot ("http-{0}.body" -f $token)
    $arguments = @(
        "-sS", "--max-time", "60", "--max-redirs", "0",
        "-o", $bodyPath, "-w", "%{http_code}",
        "-X", $method, "-H", "Accept: application/json"
    )
    $jsonPath = $null
    if ($null -ne $json) {
        $jsonPath = Join-Path $tempRoot ("http-{0}.json" -f $token)
        [IO.File]::WriteAllText($jsonPath, $json, [Text.Encoding]::UTF8)
        $arguments += @(
            "-H", "Content-Type: application/json; charset=utf-8",
            "--data-binary", ("@{0}" -f $jsonPath)
        )
    }
    $arguments += $url

    $statusText = (& curl.exe @arguments | Out-String).Trim()
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) { throw "curl failed with exit $exitCode for $method $url" }
    $content = if (Test-Path -LiteralPath $bodyPath) {
        [IO.File]::ReadAllText($bodyPath, [Text.Encoding]::UTF8)
    } else { "" }
    if (Test-Path -LiteralPath $bodyPath) { [IO.File]::Delete($bodyPath) }
    if ($jsonPath -and (Test-Path -LiteralPath $jsonPath)) { [IO.File]::Delete($jsonPath) }

    [pscustomobject]@{
        Status = [int]$statusText
        Body = $content
    }
}

function Invoke-FormRequest(
    [string]$method,
    [string]$url,
    [System.Net.CookieContainer]$cookies,
    [hashtable]$form
) {
    $request = [System.Net.HttpWebRequest]::Create($url)
    $request.Method = $method
    $request.AllowAutoRedirect = $false
    $request.CookieContainer = $cookies
    $request.Timeout = 60000

    if ($form) {
        Add-Type -AssemblyName System.Web
        $body = ($form.GetEnumerator() | Sort-Object Key | ForEach-Object {
            "{0}={1}" -f `
                [System.Web.HttpUtility]::UrlEncode([string]$_.Key), `
                [System.Web.HttpUtility]::UrlEncode([string]$_.Value)
        }) -join "&"
        $bytes = [Text.Encoding]::UTF8.GetBytes($body)
        $request.ContentType = "application/x-www-form-urlencoded"
        $request.ContentLength = $bytes.Length
        $stream = $request.GetRequestStream()
        try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
    }

    try {
        $response = [System.Net.HttpWebResponse]$request.GetResponse()
    }
    catch [System.Net.WebException] {
        if (-not $_.Exception.Response) { throw }
        $response = [System.Net.HttpWebResponse]$_.Exception.Response
    }
    try {
        $reader = New-Object IO.StreamReader($response.GetResponseStream())
        try { $content = $reader.ReadToEnd() } finally { $reader.Dispose() }
        [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $content }
    }
    finally { $response.Dispose() }
}

function Add-FixtureUser(
    [System.Data.SqlClient.SqlConnection]$dbConnection,
    [Guid]$id,
    [string]$userName,
    [string]$passwordValue,
    [bool]$isDeleted,
    [int]$moderationStatus
) {
    $command = $dbConnection.CreateCommand()
    $command.CommandText = @"
INSERT INTO [dbo].[Users]
(
    [Id], [UserName], [Password], [CreatedAt], [LastModifiedAt],
    [CreatedBy], [LastModifiedBy], [IsDeleted], [DeletedAt], [ModerationStatus]
)
VALUES
(
    @Id, @UserName, @Password, @Now, @Now,
    @Id, @Id, @IsDeleted, @DeletedAt, @ModerationStatus
);
"@
    [void]$command.Parameters.Add("@Id", [Data.SqlDbType]::UniqueIdentifier)
    [void]$command.Parameters.Add("@UserName", [Data.SqlDbType]::NVarChar, -1)
    [void]$command.Parameters.Add("@Password", [Data.SqlDbType]::NVarChar, -1)
    [void]$command.Parameters.Add("@Now", [Data.SqlDbType]::DateTime2)
    [void]$command.Parameters.Add("@IsDeleted", [Data.SqlDbType]::Bit)
    [void]$command.Parameters.Add("@DeletedAt", [Data.SqlDbType]::DateTime2)
    [void]$command.Parameters.Add("@ModerationStatus", [Data.SqlDbType]::Int)
    $command.Parameters["@Id"].Value = $id
    $command.Parameters["@UserName"].Value = $userName
    $command.Parameters["@Password"].Value = $passwordValue
    $command.Parameters["@Now"].Value = [DateTime]::UtcNow
    $command.Parameters["@IsDeleted"].Value = $isDeleted
    $command.Parameters["@DeletedAt"].Value = if ($isDeleted) { [DateTime]::UtcNow } else { [DBNull]::Value }
    $command.Parameters["@ModerationStatus"].Value = $moderationStatus
    [void]$command.ExecuteNonQuery()
}

function Remove-Fixtures([System.Data.SqlClient.SqlConnection]$dbConnection, [Guid[]]$ids) {
    foreach ($id in $ids) {
        $command = $dbConnection.CreateCommand()
        $command.CommandText = "DELETE FROM [dbo].[Users] WHERE [Id] = @Id;"
        [void]$command.Parameters.Add("@Id", [Data.SqlDbType]::UniqueIdentifier)
        $command.Parameters["@Id"].Value = $id
        [void]$command.ExecuteNonQuery()
    }
}

Push-Location $repoRoot
try {
    $expectedProduction = @(
        "WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql",
        "WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql",
        "WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs",
        "WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js",
        "WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs",
        "WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs",
        "WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs",
        "WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs",
        "WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml",
        "WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml",
        "WISE_REPORT/Wise_Report/Wise_Report.csproj"
    ) | Sort-Object
    $actualProduction = @(git diff --name-only $sourceBaseline -- "WISE_REPORT/Database" "WISE_REPORT/Wise_Report") |
        Where-Object { $_ -notmatch '^WISE_REPORT/Tests/' } |
        Sort-Object
    Assert-Gate `
        (($actualProduction -join "`n") -eq ($expectedProduction -join "`n")) `
        "STATIC-01-WRITE-SET" `
        "Production paths differ from the exact 11-path contract."

    $generated = @(git diff --name-only $sourceBaseline -- `
        "WISE_REPORT/Wise_Report/.vs" "WISE_REPORT/Wise_Report/bin" "WISE_REPORT/Wise_Report/obj")
    Assert-Gate ($generated.Count -eq 0) "STATIC-02-NO-GENERATED" "IDE/bin/obj files differ from baseline."

    git diff --check $sourceBaseline -- "WISE_REPORT"
    Assert-Gate ($LASTEXITCODE -eq 0) "STATIC-03-DIFF-CHECK" "Whitespace errors found."

    $paged = Get-Content "WISE_REPORT/Wise_Report/Shared/Dtos/PagedResult.cs" -Raw -Encoding utf8
    $row = Get-Content "WISE_REPORT/Wise_Report/Shared/Dtos/UserPageRow.cs" -Raw -Encoding utf8
    $item = Get-Content "WISE_REPORT/Wise_Report/Shared/Dtos/UserPageItem.cs" -Raw -Encoding utf8
    $query = Get-Content "WISE_REPORT/Wise_Report/Shared/Queries/Base/BaseQuery.cs" -Raw -Encoding utf8
    $controller = Get-Content "WISE_REPORT/Wise_Report/Api/Setting/Api_UserController.cs" -Raw -Encoding utf8
    $javascript = Get-Content "WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js" -Raw -Encoding utf8
    $homeView = Get-Content "WISE_REPORT/Wise_Report/Views/Home/HomeLayout.cshtml" -Raw -Encoding utf8
    $employee = Get-Content "WISE_REPORT/Wise_Report/Views/Employee/Index.cshtml" -Raw -Encoding utf8
    $project = Get-Content "WISE_REPORT/Wise_Report/Wise_Report.csproj" -Raw -Encoding utf8
    $procedure = Get-Content "WISE_REPORT/Database/EmployeeManagementCoreDb/002_UpsertGetListUser.sql" -Raw -Encoding utf8
    $verifier = Get-Content "WISE_REPORT/Database/EmployeeManagementCoreDb/003_VerifyBaseline.sql" -Raw -Encoding utf8

    $actionMatch = [regex]::Match(
        $controller,
        '(?s)public IHttpActionResult GetListUser\(UserPageQuery query\).*?(?=\s*\[HttpPost\]\s*\[Route\("api/Api_UserController/AddUser")')
    $action = if ($actionMatch.Success) { $actionMatch.Value } else { "" }

    Assert-Gate `
        ($paged -match 'List<T>\s+Data' -and $paged -notmatch 'List<T>\s+Items') `
        "STATIC-04-PAGE-ENVELOPE" `
        "PagedResult must expose Data, not Items."
    Assert-Gate `
        ($row -match 'internal sealed class UserPageRow' -and $row -match 'long TotalCount' -and $row -notmatch 'Password') `
        "STATIC-05-ROW-DTO" `
        "UserPageRow contract is incomplete or sensitive."
    Assert-Gate `
        ($item -notmatch 'Password|TotalCount' -and $item -match 'ModerationStatus') `
        "STATIC-06-PUBLIC-DTO" `
        "UserPageItem exposes forbidden data or lacks status."
    Assert-Gate `
        ($query -match 'StringLength\(256' -and $query -match 'Range\(1, 200' -and
         $query -match 'RegularExpression\("\^USERNAME\$"' -and $query -match 'EnumDataType') `
        "STATIC-07-QUERY-VALIDATION" `
        "BaseQuery validation contract is incomplete."
    Assert-Gate `
        ($action -match 'DynamicParameters' -and $action -match 'ParameterDirection\.Output' -and
         $action -match 'parameters\.Get<long>\("TotalCount"\)' -and
         $action -match 'Query<UserPageRow>' -and $action -notmatch 'Query<User>|Password|InternalServerError\(ex\)') `
        "STATIC-08-API-MAPPING" `
        "API does not consume output total through the explicit safe row DTO."
    Assert-Gate `
        ($procedure -match '@TotalCount bigint\s*=\s*NULL OUTPUT' -and
         $procedure -match 'SELECT @TotalCount = COUNT_BIG\(1\)' -and
         $verifier -match "\(6, N'@TotalCount', N'bigint', 8, 1\)" -and
         $verifier -match '\[P\]\.\[is_output\]') `
        "STATIC-09-SQL-OUTPUT" `
        "Procedure/verifier output parameter contract is incomplete."
    Assert-Gate `
        ($javascript -match 'SortDirection:\s*1' -and $javascript -match 'page\.Data' -and
         $javascript -match '\$scope\.SearchUsers' -and $javascript -notmatch 'page\.Items|error\.data|Error Data') `
        "STATIC-10-ANGULAR-CONTRACT" `
        "Angular payload/response/error contract differs from the guide."
    Assert-Gate `
        ($homeView -notmatch '</script>s' -and $employee -notmatch '</script>s' -and
         $homeView -match 'SearchUsers\(\)' -and $employee -match 'SearchUsers\(\)' -and
         $homeView -match 'item\.ModerationStatus' -and $employee -match 'item\.ModerationStatus') `
        "STATIC-11-TWO-VIEWS" `
        "One or both live views have syntax or binding drift."

    $includeContract = $true
    foreach ($include in @('Shared\Dtos\PagedResult.cs', 'Shared\Dtos\UserPageRow.cs')) {
        if (([regex]::Matches($project, [regex]::Escape($include))).Count -ne 1) { $includeContract = $false }
    }
    Assert-Gate $includeContract "STATIC-12-PROJECT-INCLUDES" "New DTO includes are not exact."

    $node = "C:\Users\Vuongvipp\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
    if (-not (Test-Path -LiteralPath $node)) { throw "Bundled Node.js is missing." }
    Write-Host "COMMAND $node --check WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js"
    & $node --check "WISE_REPORT/Wise_Report/Content/js/Projects/Projects.js"
    Write-Host "EXIT $LASTEXITCODE"
    Assert-Gate ($LASTEXITCODE -eq 0) "STATIC-13-JS-SYNTAX" "Projects.js does not parse."

    $diffText = git diff --no-ext-diff --unified=0 $sourceBaseline -- `
        "WISE_REPORT/Database" "WISE_REPORT/Wise_Report/Api" "WISE_REPORT/Wise_Report/Shared" `
        "WISE_REPORT/Wise_Report/Content/js/Projects" "WISE_REPORT/Wise_Report/Views"
    $addedSensitive = @($diffText | Where-Object {
        $_ -match '^\+' -and $_ -notmatch '^\+\+\+' -and
        $_ -match '(?i)(password\s*=\s*[^N]|data source\s*=\s*(?!\(localdb\))|user id\s*=|api[_-]?key\s*=)'
    })
    Assert-Gate ($addedSensitive.Count -eq 0) "STATIC-14-SECRET-SCAN" "Sensitive assignment found in task diff."

    if ($Phase -eq "Static") {
        Write-Host "SUMMARY PASS=$script:Passed FAIL=$script:Failed"
        if ($script:Failed -gt 0) { exit 1 }
        exit 0
    }

    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
    $msbuild = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild `
        -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
    if (-not $msbuild) { throw "Full Framework MSBuild not found." }

    Write-Host "COMMAND $msbuild WISE_REPORT\Wise_Report.sln /t:Restore /p:RestorePackagesConfig=true"
    & $msbuild "WISE_REPORT\Wise_Report.sln" /t:Restore `
        /p:RestorePackagesConfig=true /m /nologo /v:minimal
    Write-Host "EXIT $LASTEXITCODE"
    Assert-Gate ($LASTEXITCODE -eq 0) "BUILD-01-RESTORE" "Package restore failed."

    $tempRoot = Join-Path $env:TEMP ("OpenERP-ERP0002-{0}" -f [Guid]::NewGuid().ToString("N"))
    $debugBin = Join-Path $tempRoot "Debug\bin"
    $debugObj = Join-Path $tempRoot "Debug\obj"
    $releaseBin = Join-Path $tempRoot "Release\bin"
    $releaseObj = Join-Path $tempRoot "Release\obj"
    New-Item -ItemType Directory -Force -Path $debugBin, $debugObj, $releaseBin, $releaseObj | Out-Null

    foreach ($configuration in @("Debug", "Release")) {
        $out = if ($configuration -eq "Debug") { $debugBin } else { $releaseBin }
        $obj = if ($configuration -eq "Debug") { $debugObj } else { $releaseObj }
        Write-Host "COMMAND $msbuild WISE_REPORT\Wise_Report.sln /t:Build /p:Configuration=$configuration"
        & $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build "/p:Configuration=$configuration" `
            "/p:OutputPath=$out\" "/p:BaseIntermediateOutputPath=$obj\" /m /nologo /v:minimal
        Write-Host "EXIT $LASTEXITCODE"
        Assert-Gate ($LASTEXITCODE -eq 0) ("BUILD-02-{0}" -f $configuration.ToUpper()) "$configuration build failed."
    }

    if (-not (Get-Command sqllocaldb -ErrorAction SilentlyContinue)) { throw "sqllocaldb missing." }
    if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) { throw "sqlcmd missing." }
    $instances = @(sqllocaldb info) | ForEach-Object { $_.Trim() }
    if ($instances -notcontains "MSSQLLocalDB") { & sqllocaldb create MSSQLLocalDB | Out-Host }
    & sqllocaldb start MSSQLLocalDB | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "MSSQLLocalDB failed to start." }

    $dbScripts = @(
        "WISE_REPORT\Database\EmployeeManagementCoreDb\001_CreateEmployeeManagementCoreDb.sql",
        "WISE_REPORT\Database\EmployeeManagementCoreDb\002_UpsertGetListUser.sql",
        "WISE_REPORT\Database\EmployeeManagementCoreDb\003_VerifyBaseline.sql",
        "WISE_REPORT\Database\EmployeeManagementCoreDb\004_TransactionalSmokeTest.sql"
    )
    foreach ($round in 1..2) {
        foreach ($scriptPath in $dbScripts) { Invoke-SqlFile $scriptPath }
    }
    Add-Pass "DB-01-BASELINE-RERUN"
    Invoke-SqlFile "WISE_REPORT\Tests\ERP-0002\ERP-0002.UserDirectoryContract.sql"
    Add-Pass "DB-02-USER-DIRECTORY-CONTRACT"

    $connection = New-Object System.Data.SqlClient.SqlConnection(
        "Server=(localdb)\MSSQLLocalDB;Database=EmployeeManagementCoreDb;Integrated Security=True;MultipleActiveResultSets=True")
    $connection.Open()
    $suffix = [Guid]::NewGuid().ToString("N")
    $prefix = "erp2.api.$suffix"
    $loginPassword = "ERP2!" + $suffix.Substring(0, 18) + "aA1"
    $identityDll = Resolve-Path `
        "WISE_REPORT\packages\Microsoft.AspNet.Identity.Core.2.2.2\lib\net45\Microsoft.AspNet.Identity.Core.dll"
    [void][Reflection.Assembly]::LoadFrom($identityDll.Path)
    $hasher = New-Object Microsoft.AspNet.Identity.PasswordHasher
    $loginHash = $hasher.HashPassword($loginPassword)
    $fixtureIds = 1..6 | ForEach-Object { [Guid]::NewGuid() }
    foreach ($index in 0..4) {
        $fixturePassword = if ($index -eq 0) { $loginHash } else { "ERP0002_NON_AUTH_TEST_VALUE" }
        Add-FixtureUser $connection $fixtureIds[$index] ("$prefix.{0}" -f $index) $fixturePassword $false 1
    }
    Add-FixtureUser $connection $fixtureIds[5] "$prefix.deleted" "ERP0002_NON_AUTH_TEST_VALUE" $true 1
    Add-Pass "DB-03-API-FIXTURES"

    $webRoot = (Resolve-Path "WISE_REPORT\Wise_Report").Path
    $deployedAssembly = Join-Path $webRoot "bin\Wise_Report.dll"
    $assemblyBackup = Join-Path $tempRoot "Wise_Report.dll.baseline"
    Copy-Item -LiteralPath $deployedAssembly -Destination $assemblyBackup -Force
    Copy-Item -LiteralPath (Join-Path $debugBin "Wise_Report.dll") -Destination $deployedAssembly -Force
    $webConfigPath = Join-Path $webRoot "Web.config"
    $webConfigStamp = (Get-Item -LiteralPath $webConfigPath).LastWriteTimeUtc
    (Get-Item -LiteralPath $webConfigPath).LastWriteTimeUtc = [DateTime]::UtcNow
    Assert-Gate `
        ((Get-FileHash $deployedAssembly -Algorithm SHA256).Hash -eq
         (Get-FileHash (Join-Path $debugBin "Wise_Report.dll") -Algorithm SHA256).Hash) `
        "E2E-00-TEST-DEPLOY" `
        "Fresh assembly was not deployed for IIS testing."

    $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
    $listener.Stop()
    $baseUrl = "http://localhost:$port"
    $iisPath = Join-Path ${env:ProgramFiles(x86)} "IIS Express\iisexpress.exe"
    $stdout = Join-Path $tempRoot "iis.stdout.log"
    $stderr = Join-Path $tempRoot "iis.stderr.log"
    $iis = Start-Process $iisPath `
        -ArgumentList "/path:`"$webRoot`"", "/port:$port", "/systray:false" `
        -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru

    $ready = $false
    $lastProbe = $null
    foreach ($attempt in 1..10) {
        Start-Sleep -Milliseconds 500
        if ($iis.HasExited) { break }
        try {
            $lastProbe = Invoke-JsonRequest "GET" ($baseUrl + "/Home/Login") $null
            if ($lastProbe.Status -eq 200) { $ready = $true; break }
        }
        catch { }
    }
    Assert-Gate $ready "E2E-01-IIS-START" "IIS Express did not become ready."
    if (-not $ready) {
        if ($lastProbe) {
            Write-Host "LAST_PROBE_STATUS=$($lastProbe.Status)"
            Write-Host ($lastProbe.Body.Substring(0, [Math]::Min(1200, $lastProbe.Body.Length)))
        }
        throw "IIS Express startup failed."
    }

    $cookies = New-Object System.Net.CookieContainer
    $loginPage = Invoke-FormRequest "GET" ($baseUrl + "/Home/Login") $cookies $null
    $tokenMatch = [regex]::Match(
        $loginPage.Body,
        'name="__RequestVerificationToken"[^>]*value="([^"]+)"')
    if (-not $tokenMatch.Success) { throw "Login anti-forgery token is missing." }
    Add-Type -AssemblyName System.Web
    $antiForgeryToken = [System.Web.HttpUtility]::HtmlDecode($tokenMatch.Groups[1].Value)
    $login = Invoke-FormRequest "POST" ($baseUrl + "/Home/Login") $cookies @{
        __RequestVerificationToken = $antiForgeryToken
        UserName = "$prefix.0"
        Password = $loginPassword
    }
    Assert-Gate ($login.Status -eq 302) "E2E-02-LOGIN" "ERP-0001 login regression failed."

    $requestTemplate = @{
        SearchKeyword = $prefix
        PageIndex = 1
        PageSize = 2
        SortColumn = "USERNAME"
        SortDirection = 1
    }
    $responses = @()
    foreach ($pageIndex in @(1, 2, 4)) {
        $requestTemplate.PageIndex = $pageIndex
        $json = $requestTemplate | ConvertTo-Json -Compress
        Write-Host "COMMAND POST $baseUrl/api/Api_UserController/GetListUser PAGE=$pageIndex"
        $response = Invoke-JsonRequest "POST" ($baseUrl + "/api/Api_UserController/GetListUser") $json
        Write-Host "HTTP $($response.Status)"
        $responses += [pscustomobject]@{
            Status = $response.Status
            Json = if ($response.Body) { $response.Body | ConvertFrom-Json } else { $null }
            Body = $response.Body
        }
    }
    Assert-Gate `
        (($responses | Where-Object Status -ne 200).Count -eq 0) `
        "API-01-VALID-PAGES" `
        "A valid numeric-enum page request did not return HTTP 200."
    Assert-Gate `
        ($responses[0].Json.Data.Count -eq 2 -and $responses[1].Json.Data.Count -eq 2 -and
         @($responses[2].Json.Data).Count -eq 0) `
        "API-02-PAGE-ROWS" `
        "Data page sizes are incorrect."
    Assert-Gate `
        ($responses[0].Json.TotalData -eq 5 -and $responses[1].Json.TotalData -eq 5 -and
         $responses[2].Json.TotalData -eq 5) `
        "API-03-OUTPUT-TOTAL" `
        "TotalData is not the filtered database total on every page."

    $firstItem = @($responses[0].Json.Data)[0]
    $propertyNames = @($firstItem.PSObject.Properties.Name | Sort-Object)
    Assert-Gate `
        (($propertyNames -join ",") -eq "CreatedAt,Id,ModerationStatus,UserName") `
        "API-04-ITEM-SHAPE" `
        "Public item shape is not the exact four-field contract."

    foreach ($case in @(
        @{ Id = "NULL"; Json = "null" },
        @{ Id = "PAGE"; Json = '{"SearchKeyword":"","PageIndex":0,"PageSize":20,"SortColumn":"USERNAME","SortDirection":1}' },
        @{ Id = "SIZE"; Json = '{"SearchKeyword":"","PageIndex":1,"PageSize":201,"SortColumn":"USERNAME","SortDirection":1}' },
        @{ Id = "COLUMN"; Json = '{"SearchKeyword":"","PageIndex":1,"PageSize":20,"SortColumn":"PASSWORD","SortDirection":1}' },
        @{ Id = "ENUM"; Json = '{"SearchKeyword":"","PageIndex":1,"PageSize":20,"SortColumn":"USERNAME","SortDirection":0}' },
        @{ Id = "SEARCH"; Json = (@{ SearchKeyword = ("x" * 257); PageIndex = 1; PageSize = 20; SortColumn = "USERNAME"; SortDirection = 1 } | ConvertTo-Json -Compress) }
    )) {
        $invalid = Invoke-JsonRequest "POST" ($baseUrl + "/api/Api_UserController/GetListUser") $case.Json
        Write-Host "COMMAND INVALID $($case.Id) HTTP $($invalid.Status)"
        Assert-Gate ($invalid.Status -eq 400) ("API-05-{0}-400" -f $case.Id) "Invalid request was not HTTP 400."
    }

    $homeResponse = Invoke-FormRequest "GET" ($baseUrl + "/Home/HomeLayout") $cookies $null
    $employeeResponse = Invoke-FormRequest "GET" ($baseUrl + "/Employee/Index") $cookies $null
    Assert-Gate `
        ($homeResponse.Status -eq 200 -and $employeeResponse.Status -eq 200 -and
         $homeResponse.Body -notmatch '</script>s' -and $employeeResponse.Body -notmatch '</script>s' -and
         $homeResponse.Body -match 'item\.ModerationStatus' -and
         $employeeResponse.Body -match 'item\.ModerationStatus') `
        "E2E-03-TWO-RENDERED-VIEWS" `
        "Authenticated Home/Employee user-list views did not render the safe status contract."
}
catch {
    Add-Fail "INFRA-UNHANDLED" $_.Exception.Message
    if ($tempRoot -and (Test-Path (Join-Path $tempRoot "iis.stdout.log"))) {
        Get-Content (Join-Path $tempRoot "iis.stdout.log") -Head 20 -ErrorAction SilentlyContinue
        Get-Content (Join-Path $tempRoot "iis.stdout.log") -Tail 30 -ErrorAction SilentlyContinue
    }
    if ($tempRoot -and (Test-Path (Join-Path $tempRoot "iis.stderr.log"))) {
        Get-Content (Join-Path $tempRoot "iis.stderr.log") -Tail 30 -ErrorAction SilentlyContinue
    }
}
finally {
    if ($iis -and -not $iis.HasExited) {
        Stop-Process -Id $iis.Id -Force -ErrorAction SilentlyContinue
        $iis.WaitForExit(5000) | Out-Null
    }
    if ($deployedAssembly -and $assemblyBackup -and (Test-Path -LiteralPath $assemblyBackup)) {
        Copy-Item -LiteralPath $assemblyBackup -Destination $deployedAssembly -Force
    }
    if ($webConfigPath -and $null -ne $webConfigStamp -and (Test-Path -LiteralPath $webConfigPath)) {
        (Get-Item -LiteralPath $webConfigPath).LastWriteTimeUtc = $webConfigStamp
    }
    & git restore --source=$sourceBaseline -- $generatedPaths
    if ($LASTEXITCODE -ne 0) {
        Add-Fail "STATIC-15-RESTORE-GENERATED" "Could not restore build outputs to the task baseline."
    } else {
        $generatedResidue = @(git diff --name-only $sourceBaseline -- $generatedPaths)
        Assert-Gate `
            ($generatedResidue.Count -eq 0) `
            "STATIC-15-RESTORE-GENERATED" `
            "Tracked build output differs after test cleanup."
    }
    if ($connection) {
        try {
            if ($connection.State -ne [Data.ConnectionState]::Open) { $connection.Open() }
            Remove-Fixtures $connection $fixtureIds
            $residueCommand = $connection.CreateCommand()
            $residueCommand.CommandText = "SELECT COUNT_BIG(1) FROM [dbo].[Users] WHERE [UserName] LIKE N'erp2.api.%';"
            Assert-Gate `
                ([int64]$residueCommand.ExecuteScalar() -eq 0) `
                "DB-04-NO-RESIDUE" `
                "ERP-0002 API fixtures remain."
        }
        catch { Add-Fail "DB-04-NO-RESIDUE" $_.Exception.Message }
        finally { $connection.Dispose() }
    }
    if ($tempRoot) {
        $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
        $allowedTemp = [IO.Path]::GetFullPath($env:TEMP)
        if ($resolvedTemp.StartsWith($allowedTemp, [StringComparison]::OrdinalIgnoreCase) -and
            (Split-Path -Leaf $resolvedTemp) -like "OpenERP-ERP0002-*") {
            Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    Pop-Location
}

Write-Host "SUMMARY PASS=$script:Passed FAIL=$script:Failed"
if ($script:Failed -gt 0) { exit 1 }
exit 0
