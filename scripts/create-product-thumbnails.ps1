Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path $PSScriptRoot '..\frontend\img\Productos'
$files = Get-ChildItem -LiteralPath $assetDirectory -Filter 'sauz-*.png' -File
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' } |
  Select-Object -First 1
$quality = New-Object System.Drawing.Imaging.EncoderParameters 1
$quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]88)

foreach ($file in $files) {
  $original = [System.Drawing.Image]::FromFile($file.FullName)
  try {
    foreach ($edge in @(480, 960)) {
      $scale = [Math]::Min([double]1, [double]$edge / [double][Math]::Max($original.Width, $original.Height))
      $width = [Math]::Max(1, [int][Math]::Round($original.Width * $scale))
      $height = [Math]::Max(1, [int][Math]::Round($original.Height * $scale))
      $bitmap = [System.Drawing.Bitmap]::new($width, $height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(16, 16, 16))
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($original, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }
      try {
        $destination = Join-Path $assetDirectory ($file.BaseName + "-" + $edge + '.jpg')
        $bitmap.Save($destination, $codec, $quality)
      } finally {
        $bitmap.Dispose()
      }
    }
  } finally {
    $original.Dispose()
  }
}
$quality.Dispose()
Write-Output "Generadas $($files.Count * 2) versiones JPEG a partir de $($files.Count) PNG originales."
