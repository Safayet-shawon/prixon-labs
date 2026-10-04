$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
    throw "Missing backend\.env. From the repository root, run: Copy-Item backend\.env.example backend\.env"
}

foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*(#.*)?$') {
        continue
    }

    if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
        throw "Invalid line in backend\.env: $line"
    }

    $name = $Matches[1]
    $value = $Matches[2]
    if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

$java = Get-Command java -CommandType Application -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($env:JAVA_HOME) -and $java) {
    $javaHome = Split-Path (Split-Path $java.Source -Parent) -Parent
    if (Test-Path (Join-Path $javaHome 'bin\javac.exe')) {
        $env:JAVA_HOME = $javaHome
    }
}

if ([string]::IsNullOrWhiteSpace($env:JAVA_HOME) -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    throw 'A Java 17+ JDK is required. Install a JDK and set JAVA_HOME to its installation folder.'
}

& .\mvnw.cmd --batch-mode spring-boot:run
exit $LASTEXITCODE
