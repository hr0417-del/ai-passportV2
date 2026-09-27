$zipPath = 'C:\Users\HP\Downloads\AI PASSPORT LIVE 20TH SEPT CERTIFICATES -20260927T215735Z-1-001.zip'
$destDir = 'C:\Users\HP\Downloads\(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026 (1)'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($e in $zip.Entries) {
    if ($e.Name.EndsWith('.png')) {
        $outPath = [System.IO.Path]::Combine($destDir, $e.Name)
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($e, $outPath, $true)
        Write-Host "Extracted:" $e.Name
    }
}
$zip.Dispose()
