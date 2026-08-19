Add-Type -AssemblyName System.Drawing

function Render-Logo([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $verde = [System.Drawing.ColorTranslator]::FromHtml("#143129")
    $dourado = [System.Drawing.ColorTranslator]::FromHtml("#d9b978")

    $bVerde = New-Object System.Drawing.SolidBrush($verde)
    $pDourado = New-Object System.Drawing.Pen($dourado, ($size * 0.14))

    # Círculo de fundo verde
    $g.FillEllipse($bVerde, 1, 1, ($size - 2), ($size - 2))

    # Anel dourado
    $ringMargin = $size * 0.16
    $ringSize = $size - (2 * $ringMargin)
    $g.DrawEllipse($pDourado, $ringMargin, $ringMargin, $ringSize, $ringSize)

    # Núcleo verde central
    $coreMargin = $size * 0.30
    $coreSize = $size - (2 * $coreMargin)
    $g.FillEllipse($bVerde, $coreMargin, $coreMargin, $coreSize, $coreSize)

    # Recorte da fechadura/ferradura na base
    $p1 = New-Object System.Drawing.PointF(($size * 0.43), ($size * 0.50))
    $p2 = New-Object System.Drawing.PointF(($size * 0.36), ($size * 0.88))
    $p3 = New-Object System.Drawing.PointF(($size * 0.64), ($size * 0.88))
    $p4 = New-Object System.Drawing.PointF(($size * 0.57), ($size * 0.50))
    $points = [System.Drawing.PointF[]]@($p1, $p2, $p3, $p4)
    $g.FillPolygon($bVerde, $points)

    $dir = [System.IO.Path]::GetDirectoryName($outPath)
    if (-not (Test-Path $dir)) { 
        New-Item -ItemType Directory -Path $dir -Force | Out-Null 
    }

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outPath ($size x $size)"
}

Render-Logo 48 "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
Render-Logo 48 "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
Render-Logo 48 "android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png"

Render-Logo 72 "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
Render-Logo 72 "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
Render-Logo 72 "android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png"

Render-Logo 96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
Render-Logo 96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
Render-Logo 96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png"

Render-Logo 144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
Render-Logo 144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
Render-Logo 144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png"

Render-Logo 192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
Render-Logo 192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"
Render-Logo 192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"

Render-Logo 192 "public/icon-192.png"
Render-Logo 512 "public/icon-512.png"
Render-Logo 512 "public/icon-maskable-512.png"
Render-Logo 512 "public/logo.png"
Render-Logo 64 "public/favicon.png"
Render-Logo 180 "public/apple-touch-icon.png"

Write-Host "All Android & Web icons successfully updated!"
