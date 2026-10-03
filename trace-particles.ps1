# Read the supplied reference into editable vector particle coordinates.
# The bitmap is not modified. Only the artwork above the caption is sampled.
Add-Type -AssemblyName System.Drawing
$sourcePath = Join-Path $PSScriptRoot 'particle-reference.png'
$outputPath = Join-Path $PSScriptRoot 'particle-points.json'
$bitmap = [System.Drawing.Bitmap]::new($sourcePath)
$points = [System.Text.StringBuilder]::new()
[void]$points.Append('{"width":735,"height":440,"points":[')
$count = 0
try {
  for ($y = 0; $y -lt 440; $y += 2) {
    for ($x = 0; $x -lt 734; $x += 2) {
      $lum = 0
      for ($dy = 0; $dy -lt 2; $dy++) {
        for ($dx = 0; $dx -lt 2; $dx++) {
          $lum += $bitmap.GetPixel($x + $dx, $y + $dy).R
        }
      }
      $lum = [int][Math]::Round($lum / 4)
      if ($lum -lt 24) { continue }
      if ($count -gt 0) { [void]$points.Append(',') }
      [void]$points.Append("[$x,$y,$lum]")
      $count++
    }
  }
} finally { $bitmap.Dispose() }
[void]$points.Append(']}')
[System.IO.File]::WriteAllText($outputPath, $points.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Output "Traced $count particles from the reference artwork."
