[Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null
$img = [System.Drawing.Image]::FromFile('src/assets/Primaria/B2/B2.jpg')
$bmp = New-Object System.Drawing.Bitmap($img)
$p1 = $bmp.GetPixel(50, 50)
$p2 = $bmp.GetPixel(400, 50)
Write-Host "B2 Pixel (50,50): R=$($p1.R) G=$($p1.G) B=$($p1.B)"
Write-Host "B2 Pixel (400,50): R=$($p2.R) G=$($p2.G) B=$($p2.B)"
$img.Dispose()
$bmp.Dispose()
