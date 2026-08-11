param(
    [Parameter(Mandatory = $true)]
    [string]$AssemblyPath
)

$ErrorActionPreference = "Stop"
$resolvedAssembly = (Resolve-Path -LiteralPath $AssemblyPath).Path
$assemblyDirectory = Split-Path -Parent $resolvedAssembly
$identityAssembly = Join-Path $assemblyDirectory "Microsoft.AspNet.Identity.Core.dll"

if (-not (Test-Path -LiteralPath $identityAssembly)) {
    throw "Microsoft.AspNet.Identity.Core.dll is missing beside the tested assembly."
}

$testSource = @'
using System;
using Wise_Report.Models.BusinessModel;

internal static class PasswordSecurityContractTests
{
    private static int passed;
    private static int failed;

    private static void Assert(bool condition, string id)
    {
        if (condition)
        {
            passed++;
            Console.WriteLine("PASS " + id);
            return;
        }

        failed++;
        Console.WriteLine("FAIL " + id);
    }

    public static int Main()
    {
        var password = "ERP0001-Test-Only!" + Guid.NewGuid().ToString("N");
        var firstHash = PasswordSecurity.HashPassword(password);
        var secondHash = PasswordSecurity.HashPassword(password);

        Assert(firstHash != secondHash, "UT-01-SALTED");
        Assert(PasswordSecurity.VerifyPassword(firstHash, password).Succeeded,
            "UT-02-PBKDF2-VALID");
        Assert(!PasswordSecurity.VerifyPassword(firstHash, "wrong-test-value").Succeeded,
            "UT-03-PBKDF2-WRONG");
        Assert(!PasswordSecurity.VerifyPassword("not-a-valid-hash", password).Succeeded,
            "UT-04-MALFORMED-CLOSED");
        Assert(!PasswordSecurity.VerifyPassword(null, password).Succeeded,
            "UT-05-NULL-CLOSED");

        var legacyHash = Commons.MD5Hash(password);
        var legacyResult = PasswordSecurity.VerifyPassword(legacyHash, password);
        Assert(legacyResult.Succeeded, "UT-06-LEGACY-VALID");
        Assert(legacyResult.RequiresUpgrade, "UT-07-LEGACY-UPGRADE");
        Assert(!PasswordSecurity.VerifyPassword(legacyHash, "wrong-test-value").Succeeded,
            "UT-08-LEGACY-WRONG");

        var emptyRejected = false;
        try
        {
            PasswordSecurity.HashPassword(string.Empty);
        }
        catch (ArgumentException)
        {
            emptyRejected = true;
        }

        Assert(emptyRejected, "UT-09-EMPTY-REJECTED");
        Console.WriteLine("SUMMARY PASS={0} FAIL={1}", passed, failed);
        return failed == 0 ? 0 : 1;
    }
}
'@

$provider = New-Object Microsoft.CSharp.CSharpCodeProvider
$parameters = New-Object System.CodeDom.Compiler.CompilerParameters
$parameters.GenerateExecutable = $true
$parameters.GenerateInMemory = $false
$parameters.IncludeDebugInformation = $false
$parameters.OutputAssembly = Join-Path `
    $assemblyDirectory `
    ("ERP0001-PasswordSecurity-{0}.exe" -f [Guid]::NewGuid().ToString("N"))

[void]$parameters.ReferencedAssemblies.Add("System.dll")
[void]$parameters.ReferencedAssemblies.Add($resolvedAssembly)
[void]$parameters.ReferencedAssemblies.Add($identityAssembly)

$result = $provider.CompileAssemblyFromSource($parameters, $testSource)
if ($result.Errors.HasErrors) {
    $result.Errors | ForEach-Object { Write-Error $_.ToString() }
    exit 2
}

try {
    Push-Location $assemblyDirectory
    & $parameters.OutputAssembly
    exit $LASTEXITCODE
}
finally {
    Pop-Location
    Remove-Item -LiteralPath $parameters.OutputAssembly -Force -ErrorAction SilentlyContinue
}
