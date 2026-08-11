param(
    [ValidateSet("Static", "All")]
    [string]$Phase = "All"
)

$ErrorActionPreference = "Stop"
$script:Passed = 0
$script:Failed = 0
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$sourceBaseline = "8da86d39984eeead86a4fb36f11aa1478bb8eca8"

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

function Invoke-WebRequestRaw(
    [string]$method,
    [string]$url,
    [System.Net.CookieContainer]$cookies,
    [hashtable]$form
) {
    $request = [System.Net.HttpWebRequest]::Create($url)
    $request.Method = $method
    $request.AllowAutoRedirect = $false
    $request.CookieContainer = $cookies
    $request.Timeout = 15000

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
        [pscustomobject]@{
            Status = [int]$response.StatusCode
            Body = $content
            Location = [string]$response.Headers["Location"]
        }
    }
    finally {
        $response.Dispose()
    }
}

function Get-FormToken([string]$baseUrl, [string]$path, $cookies) {
    $response = Invoke-WebRequestRaw "GET" ($baseUrl + $path) $cookies $null
    if ($response.Status -ne 200) {
        throw "GET $path returned $($response.Status)."
    }

    $match = [regex]::Match(
        $response.Body,
        'name="__RequestVerificationToken"[^>]*value="([^"]+)"')
    if (-not $match.Success) { throw "Anti-forgery token missing at $path." }
    Add-Type -AssemblyName System.Web
    [pscustomobject]@{
        Token = [System.Web.HttpUtility]::HtmlDecode($match.Groups[1].Value)
        Response = $response
    }
}

function Invoke-Login([string]$baseUrl, [string]$userName, [string]$password) {
    $cookies = New-Object System.Net.CookieContainer
    $page = Get-FormToken $baseUrl "/Home/Login" $cookies
    $response = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/Login") $cookies @{
        __RequestVerificationToken = $page.Token
        UserName = $userName
        Password = $password
    }
    [pscustomobject]@{ Cookies = $cookies; Response = $response }
}

function Get-DatabasePassword([System.Data.SqlClient.SqlConnection]$connection, [string]$userName) {
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT [Password] FROM [dbo].[Users] WHERE [UserName] = @UserName;"
    [void]$command.Parameters.Add("@UserName", [Data.SqlDbType]::NVarChar, -1)
    $command.Parameters["@UserName"].Value = $userName
    [string]$command.ExecuteScalar()
}

function Remove-Fixtures([System.Data.SqlClient.SqlConnection]$connection, [Guid[]]$ids) {
    foreach ($id in $ids) {
        $command = $connection.CreateCommand()
        $command.CommandText = "DELETE FROM [dbo].[Users] WHERE [Id] = @Id;"
        [void]$command.Parameters.Add("@Id", [Data.SqlDbType]::UniqueIdentifier)
        $command.Parameters["@Id"].Value = $id
        [void]$command.ExecuteNonQuery()
    }
}

function Add-FixtureUser(
    [System.Data.SqlClient.SqlConnection]$connection,
    [Guid]$id,
    [string]$userName,
    [string]$passwordHash,
    [bool]$isDeleted,
    [int]$moderationStatus
) {
    $command = $connection.CreateCommand()
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
    $command.Parameters["@Password"].Value = $passwordHash
    $command.Parameters["@Now"].Value = [DateTime]::UtcNow
    $command.Parameters["@IsDeleted"].Value = $isDeleted
    $command.Parameters["@DeletedAt"].Value = if ($isDeleted) { [DateTime]::UtcNow } else { [DBNull]::Value }
    $command.Parameters["@ModerationStatus"].Value = $moderationStatus
    [void]$command.ExecuteNonQuery()
}

Push-Location $repoRoot
$tempRoot = $null
$iis = $null
$connection = $null
$fixtureIds = @()
$deployedAssembly = $null
$assemblyBackup = $null

try {
    $expectedProduction = @(
        "WISE_REPORT/Wise_Report/Controllers/HomeController.cs",
        "WISE_REPORT/Wise_Report/Models/BusinessModel/PasswordSecurity.cs",
        "WISE_REPORT/Wise_Report/Shared/Forms/ChangePasswordForm.cs",
        "WISE_REPORT/Wise_Report/Shared/Forms/LoginForm.cs",
        "WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml",
        "WISE_REPORT/Wise_Report/Views/Home/Login.cshtml",
        "WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml",
        "WISE_REPORT/Wise_Report/Wise_Report.csproj"
    ) | Sort-Object

    $actualProduction = @(git diff --name-only $sourceBaseline -- "WISE_REPORT/Wise_Report") |
        Where-Object { $_ -notmatch '/(bin|obj)/' } |
        Sort-Object
    Assert-Gate `
        (($actualProduction -join "`n") -eq ($expectedProduction -join "`n")) `
        "STATIC-01-WRITE-SET" `
        "Production paths differ from the eight-path contract."

    $generated = @(git diff --name-only $sourceBaseline -- `
        "WISE_REPORT/Wise_Report/bin" "WISE_REPORT/Wise_Report/obj")
    Assert-Gate ($generated.Count -eq 0) "STATIC-02-NO-GENERATED" "Generated files differ from baseline."
    Assert-Gate (-not (Test-Path "IntiInfra.ps1")) "STATIC-03-NO-EXTRA-SETUP" "Unexpected IntiInfra.ps1 remains."

    git diff --check $sourceBaseline -- "WISE_REPORT/Wise_Report"
    Assert-Gate ($LASTEXITCODE -eq 0) "STATIC-04-DIFF-CHECK" "Whitespace errors found."

    $controller = Get-Content "WISE_REPORT/Wise_Report/Controllers/HomeController.cs" -Raw -Encoding utf8
    $helper = Get-Content "WISE_REPORT/Wise_Report/Models/BusinessModel/PasswordSecurity.cs" -Raw -Encoding utf8
    $changeForm = Get-Content "WISE_REPORT/Wise_Report/Shared/Forms/ChangePasswordForm.cs" -Raw -Encoding utf8
    $loginView = Get-Content "WISE_REPORT/Wise_Report/Views/Home/Login.cshtml" -Raw -Encoding utf8
    $changeView = Get-Content "WISE_REPORT/Wise_Report/Views/Home/ChangePassword.cshtml" -Raw -Encoding utf8
    $layout = Get-Content "WISE_REPORT/Wise_Report/Views/Shared/_Layout.cshtml" -Raw -Encoding utf8
    $project = Get-Content "WISE_REPORT/Wise_Report/Wise_Report.csproj" -Raw -Encoding utf8

    Assert-Gate `
        ($controller -match '(?s)\[HttpPost\]\s*\[ValidateAntiForgeryToken\]\s*public ActionResult Logout\(\)') `
        "STATIC-05-LOGOUT-POST" `
        "Logout is not POST-only with anti-forgery."
    Assert-Gate `
        ($helper -match 'legacySucceeded,\s*legacySucceeded') `
        "STATIC-06-LEGACY-UPGRADE" `
        "Legacy verification does not request upgrade."
    Assert-Gate `
        ($changeForm -match 'MinimumLength\s*=\s*12' -and $changeForm -match '\[Compare\("NewPassword"') `
        "STATIC-07-CHANGE-VALIDATION" `
        "New-password length/confirmation contract is incomplete."
    Assert-Gate `
        (([regex]::Matches($loginView, 'Html\.BeginForm\(')).Count -eq 1 -and
         ([regex]::Matches($changeView, 'Html\.BeginForm\(')).Count -eq 1) `
        "STATIC-08-SINGLE-FORMS" `
        "Login/change view form count is not exactly one."
    Assert-Gate `
        ($changeView -match '@model Wise_Report\.Shared\.Forms\.ChangePasswordForm' -and
         $changeView -match 'ConfirmNewPassword' -and
         $changeView -notmatch 'ConfirmPassword') `
        "STATIC-09-VIEW-MODEL" `
        "Change-password Razor model/property contract is wrong."
    Assert-Gate `
        ($layout -notmatch 'Session\["password"\]' -and
         ([regex]::Matches($layout, 'Html\.BeginForm\("Logout"')).Count -eq 2) `
        "STATIC-10-LAYOUT" `
        "Layout leaks password or lacks two POST logout controls."

    $includes = @(
        'Models\BusinessModel\PasswordSecurity.cs',
        'Shared\Forms\LoginForm.cs',
        'Shared\Forms\ChangePasswordForm.cs'
    )
    $includeContract = $true
    foreach ($include in $includes) {
        if (([regex]::Matches($project, [regex]::Escape($include))).Count -ne 1) {
            $includeContract = $false
        }
    }
    Assert-Gate $includeContract "STATIC-11-PROJECT-INCLUDES" "A new C# file is not included exactly once."
    Assert-Gate `
        ($controller -notmatch 'Commons\.MD5Hash|passwordMD5|ViewBag\.error|Session\["password"\]' -and
         ([regex]::Matches($helper, 'Commons\.MD5Hash')).Count -eq 1) `
        "STATIC-12-CREDENTIAL-WRITES" `
        "Raw/MD5/session password behavior remains outside the legacy helper branch."

    if ($Phase -eq "Static") {
        Write-Host "SUMMARY PASS=$script:Passed FAIL=$script:Failed"
        if ($script:Failed -gt 0) { exit 1 }
        exit 0
    }

    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
    $msbuild = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild `
        -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
    if (-not $msbuild) { throw "Full Framework MSBuild not found." }

    Write-Host "COMMAND $msbuild WISE_REPORT\Wise_Report.sln /t:Restore"
    & $msbuild "WISE_REPORT\Wise_Report.sln" /t:Restore `
        /p:RestorePackagesConfig=true /m /nologo /v:minimal
    Assert-Gate ($LASTEXITCODE -eq 0) "BUILD-01-RESTORE" "Package restore failed."

    $tempRoot = Join-Path $env:TEMP ("OpenERP-ERP0001-{0}" -f [Guid]::NewGuid().ToString("N"))
    $debugBin = Join-Path $tempRoot "Debug\bin"
    $debugObj = Join-Path $tempRoot "Debug\obj"
    $releaseBin = Join-Path $tempRoot "Release\bin"
    $releaseObj = Join-Path $tempRoot "Release\obj"
    New-Item -ItemType Directory -Force -Path $debugBin, $debugObj, $releaseBin, $releaseObj | Out-Null

    Write-Host "COMMAND $msbuild WISE_REPORT\Wise_Report.sln /t:Build /p:Configuration=Debug"
    & $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Debug `
        "/p:OutputPath=$debugBin\" "/p:BaseIntermediateOutputPath=$debugObj\" `
        /m /nologo /v:minimal
    Assert-Gate ($LASTEXITCODE -eq 0) "BUILD-02-DEBUG" "Debug build failed."

    Write-Host "COMMAND $msbuild WISE_REPORT\Wise_Report.sln /t:Build /p:Configuration=Release"
    & $msbuild "WISE_REPORT\Wise_Report.sln" /t:Build /p:Configuration=Release `
        "/p:OutputPath=$releaseBin\" "/p:BaseIntermediateOutputPath=$releaseObj\" `
        /m /nologo /v:minimal
    Assert-Gate ($LASTEXITCODE -eq 0) "BUILD-03-RELEASE" "Release build failed."

    Write-Host "COMMAND PasswordSecurity.Tests.ps1 -AssemblyPath $debugBin\Wise_Report.dll"
    & (Join-Path $PSScriptRoot "PasswordSecurity.Tests.ps1") `
        -AssemblyPath (Join-Path $debugBin "Wise_Report.dll")
    Assert-Gate ($LASTEXITCODE -eq 0) "UNIT-01-PASSWORD-SECURITY" "Password helper tests failed."

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
        foreach ($script in $dbScripts) { Invoke-SqlFile $script }
    }
    Add-Pass "DB-01-BASELINE-RERUN-SMOKE"

    $connection = New-Object System.Data.SqlClient.SqlConnection(
        "Server=(localdb)\MSSQLLocalDB;Database=EmployeeManagementCoreDb;Integrated Security=True;MultipleActiveResultSets=True")
    $connection.Open()

    $ownerCommand = $connection.CreateCommand()
    $ownerCommand.CommandText = @"
SELECT CONVERT(nvarchar(128), [value])
FROM [sys].[extended_properties]
WHERE [class] = 0 AND [major_id] = 0 AND [minor_id] = 0
  AND [name] = N'ERPBaselineOwner';
"@
    Assert-Gate `
        ([string]$ownerCommand.ExecuteScalar() -eq "employee-management-mvc/ERP-0000/v1") `
        "DB-02-OWNERSHIP" `
        "Database ownership token is missing."

    $identityDll = Resolve-Path `
        "WISE_REPORT\packages\Microsoft.AspNet.Identity.Core.2.2.2\lib\net45\Microsoft.AspNet.Identity.Core.dll"
    [void][Reflection.Assembly]::LoadFrom($identityDll.Path)
    $hasher = New-Object Microsoft.AspNet.Identity.PasswordHasher
    $suffix = [Guid]::NewGuid().ToString("N")
    $password = "ERP1!" + $suffix.Substring(0, 18) + "aA1"
    $newPassword = "ERP1-New!" + $suffix.Substring(0, 16) + "aA1"
    $pbHash = $hasher.HashPassword($password)
    $md5 = [Security.Cryptography.MD5]::Create()
    try {
        $legacyHash = ([BitConverter]::ToString(
            $md5.ComputeHash([Text.Encoding]::Default.GetBytes($password)))).Replace("-", "")
    }
    finally { $md5.Dispose() }

    $users = @{
        Pb = "erp1.pb.$suffix"; Legacy = "erp1.legacy.$suffix";
        Deleted = "erp1.deleted.$suffix"; Pending = "erp1.pending.$suffix";
        Rejected = "erp1.rejected.$suffix"; Duplicate = "erp1.duplicate.$suffix"
    }
    $fixtureIds = 1..7 | ForEach-Object { [Guid]::NewGuid() }
    Add-FixtureUser $connection $fixtureIds[0] $users.Pb $pbHash $false 1
    Add-FixtureUser $connection $fixtureIds[1] $users.Legacy $legacyHash $false 1
    Add-FixtureUser $connection $fixtureIds[2] $users.Deleted $pbHash $true 1
    Add-FixtureUser $connection $fixtureIds[3] $users.Pending $pbHash $false 0
    Add-FixtureUser $connection $fixtureIds[4] $users.Rejected $pbHash $false 2
    Add-FixtureUser $connection $fixtureIds[5] $users.Duplicate $pbHash $false 1
    Add-FixtureUser $connection $fixtureIds[6] $users.Duplicate $pbHash $false 1
    Add-Pass "DB-03-ISOLATED-FIXTURES"

    $webRoot = (Resolve-Path "WISE_REPORT\Wise_Report").Path
    $deployedAssembly = Join-Path $webRoot "bin\Wise_Report.dll"
    $assemblyBackup = Join-Path $tempRoot "Wise_Report.dll.baseline"
    Copy-Item -LiteralPath $deployedAssembly -Destination $assemblyBackup -Force
    Copy-Item -LiteralPath (Join-Path $debugBin "Wise_Report.dll") `
        -Destination $deployedAssembly -Force
    Assert-Gate `
        ((Get-FileHash $deployedAssembly -Algorithm SHA256).Hash -eq
         (Get-FileHash (Join-Path $debugBin "Wise_Report.dll") -Algorithm SHA256).Hash) `
        "E2E-00-TEST-DEPLOY" `
        "Freshly built application assembly was not deployed for IIS test."

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
    foreach ($attempt in 1..40) {
        Start-Sleep -Milliseconds 500
        if ($iis.HasExited) { break }
        try {
            $probeCookies = New-Object Net.CookieContainer
            $lastProbe = Invoke-WebRequestRaw "GET" ($baseUrl + "/Home/Login") $probeCookies $null
            if ($lastProbe.Status -eq 200) { $ready = $true; break }
        }
        catch { }
    }
    Assert-Gate $ready "E2E-01-IIS-START" "IIS Express login route did not become ready."
    if (-not $ready) {
        if ($lastProbe) {
            Write-Host "LAST_PROBE_STATUS=$($lastProbe.Status)"
            Write-Host ($lastProbe.Body.Substring(0, [Math]::Min(800, $lastProbe.Body.Length)))
        }
        throw "IIS Express startup failed."
    }

    $emptyCookies = New-Object Net.CookieContainer
    $emptyPage = Get-FormToken $baseUrl "/Home/Login" $emptyCookies
    $emptyPost = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/Login") $emptyCookies @{
        __RequestVerificationToken = $emptyPage.Token; UserName = ""; Password = ""
    }
    Assert-Gate `
        ($emptyPost.Status -eq 200 -and $emptyPost.Body -match 'validation-summary-errors') `
        "E2E-02-FORM-VALIDATION" `
        "Empty login did not return typed validation."

    foreach ($case in @(
        @{ Id = "UNKNOWN"; User = "erp1.unknown.$suffix"; Pass = $password },
        @{ Id = "WRONG"; User = $users.Pb; Pass = "wrong-test-only" },
        @{ Id = "DELETED"; User = $users.Deleted; Pass = $password },
        @{ Id = "PENDING"; User = $users.Pending; Pass = $password },
        @{ Id = "REJECTED"; User = $users.Rejected; Pass = $password },
        @{ Id = "DUPLICATE"; User = $users.Duplicate; Pass = $password }
    )) {
        $attempt = Invoke-Login $baseUrl $case.User $case.Pass
        Assert-Gate `
            ($attempt.Response.Status -eq 200 -and $attempt.Response.Body -match 'validation-summary-errors') `
            ("E2E-03-{0}-GENERIC" -f $case.Id) `
            "Credential/account-state failure was not generic."
    }

    $pbLogin = Invoke-Login $baseUrl $users.Pb $password
    Assert-Gate ($pbLogin.Response.Status -eq 302) "E2E-04-PBKDF2-LOGIN" "Valid PBKDF2 login did not redirect."
    $homeResponse = Invoke-WebRequestRaw "GET" ($baseUrl + "/Home/HomeLayout") $pbLogin.Cookies $null
    Assert-Gate `
        ($homeResponse.Status -eq 200 -and
         $homeResponse.Body -notmatch 'id="password"|Session\["password"\]') `
        "E2E-05-NO-PASSWORD-HTML" `
        "Authenticated HTML exposes a password field/value."

    $logoutWithoutToken = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/Logout") $pbLogin.Cookies $null
    Assert-Gate `
        ($logoutWithoutToken.Status -ge 400) `
        "E2E-06-LOGOUT-TOKEN-REQUIRED" `
        "Logout accepted a missing anti-forgery token."
    $logoutPage = Get-FormToken $baseUrl "/Home/HomeLayout" $pbLogin.Cookies
    $logout = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/Logout") $pbLogin.Cookies @{
        __RequestVerificationToken = $logoutPage.Token
    }
    Assert-Gate ($logout.Status -eq 302) "E2E-07-LOGOUT-POST" "Valid logout did not redirect."
    $logoutGet = Invoke-WebRequestRaw "GET" ($baseUrl + "/Home/Logout") (New-Object Net.CookieContainer) $null
    Assert-Gate ($logoutGet.Status -eq 404) "E2E-08-LOGOUT-GET-BLOCKED" "GET logout remains callable."

    $changeLogin = Invoke-Login $baseUrl $users.Pb $password
    $changePage = Get-FormToken $baseUrl "/Home/ChangePassword" $changeLogin.Cookies
    $shortChange = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/ChangePassword") $changeLogin.Cookies @{
        __RequestVerificationToken = $changePage.Token
        CurrentPassword = $password
        NewPassword = "short"
        ConfirmNewPassword = "different"
    }
    Assert-Gate `
        ($shortChange.Status -eq 200 -and (Get-DatabasePassword $connection $users.Pb) -eq $pbHash) `
        "E2E-09-CHANGE-VALIDATION" `
        "Invalid new password mutated storage or bypassed validation."

    $changePage = Get-FormToken $baseUrl "/Home/ChangePassword" $changeLogin.Cookies
    $changed = Invoke-WebRequestRaw "POST" ($baseUrl + "/Home/ChangePassword") $changeLogin.Cookies @{
        __RequestVerificationToken = $changePage.Token
        CurrentPassword = $password
        NewPassword = $newPassword
        ConfirmNewPassword = $newPassword
    }
    $changedHash = Get-DatabasePassword $connection $users.Pb
    Assert-Gate `
        ($changed.Status -eq 302 -and
         $hasher.VerifyHashedPassword($changedHash, $newPassword).ToString() -ne "Failed") `
        "E2E-10-CHANGE-PERSIST" `
        "Valid password change did not persist PBKDF2 and redirect."
    Assert-Gate `
        ((Invoke-Login $baseUrl $users.Pb $password).Response.Status -eq 200 -and
         (Invoke-Login $baseUrl $users.Pb $newPassword).Response.Status -eq 302) `
        "E2E-11-OLD-NEW-PASSWORD" `
        "Old/new login behavior after change is wrong."

    $legacyBefore = Get-DatabasePassword $connection $users.Legacy
    $legacyWrong = Invoke-Login $baseUrl $users.Legacy "wrong-test-only"
    Assert-Gate `
        ($legacyWrong.Response.Status -eq 200 -and
         (Get-DatabasePassword $connection $users.Legacy) -eq $legacyBefore) `
        "E2E-12-LEGACY-WRONG-NO-MUTATION" `
        "Wrong legacy password mutated storage."
    $legacyLogin = Invoke-Login $baseUrl $users.Legacy $password
    $legacyAfter = Get-DatabasePassword $connection $users.Legacy
    Assert-Gate `
        ($legacyLogin.Response.Status -eq 302 -and
         $legacyAfter -ne $legacyBefore -and
         $hasher.VerifyHashedPassword($legacyAfter, $password).ToString() -ne "Failed") `
        "E2E-13-LEGACY-UPGRADE" `
        "Valid legacy login did not upgrade to PBKDF2."
}
catch {
    Add-Fail "INFRA-UNHANDLED" $_.Exception.Message
    if ($tempRoot -and (Test-Path (Join-Path $tempRoot "iis.stdout.log"))) {
        Write-Host "IIS STDOUT"
        Get-Content (Join-Path $tempRoot "iis.stdout.log") -Head 20 -ErrorAction SilentlyContinue
        Get-Content (Join-Path $tempRoot "iis.stdout.log") -Tail 20 -ErrorAction SilentlyContinue
    }
    if ($tempRoot -and (Test-Path (Join-Path $tempRoot "iis.stderr.log"))) {
        Write-Host "IIS STDERR"
        Get-Content (Join-Path $tempRoot "iis.stderr.log") -Tail 30 -ErrorAction SilentlyContinue
    }
}
finally {
    if ($iis -and -not $iis.HasExited) {
        Stop-Process -Id $iis.Id -Force -ErrorAction SilentlyContinue
        $iis.WaitForExit(5000) | Out-Null
    }
    if ($deployedAssembly -and $assemblyBackup -and (Test-Path $assemblyBackup)) {
        try {
            Copy-Item -LiteralPath $assemblyBackup -Destination $deployedAssembly -Force
        }
        catch { Add-Fail "STATIC-13-RESTORE-GENERATED" $_.Exception.Message }
    }
    if ($connection) {
        try {
            if ($connection.State -ne [Data.ConnectionState]::Open) { $connection.Open() }
            Remove-Fixtures $connection $fixtureIds
            $residueCommand = $connection.CreateCommand()
            $residueCommand.CommandText = "SELECT COUNT_BIG(*) FROM [dbo].[Users] WHERE [UserName] LIKE N'erp1.%';"
            Assert-Gate `
                ([int64]$residueCommand.ExecuteScalar() -eq 0) `
                "DB-04-NO-FIXTURE-RESIDUE" `
                "ERP-0001 fixture rows remain."
        }
        catch { Add-Fail "DB-04-NO-FIXTURE-RESIDUE" $_.Exception.Message }
        finally { $connection.Dispose() }
    }
    if ($tempRoot) {
        $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
        $allowedTemp = [IO.Path]::GetFullPath($env:TEMP)
        if ($resolvedTemp.StartsWith($allowedTemp, [StringComparison]::OrdinalIgnoreCase) -and
            (Split-Path -Leaf $resolvedTemp) -like "OpenERP-ERP0001-*") {
            Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    Pop-Location
}

Write-Host "SUMMARY PASS=$script:Passed FAIL=$script:Failed"
if ($script:Failed -gt 0) { exit 1 }
exit 0
