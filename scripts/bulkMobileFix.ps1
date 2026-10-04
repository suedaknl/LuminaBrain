$files = Get-ChildItem -Path "${PSScriptRoot}\..\src\games" -Recurse -Filter *.tsx
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $new = $content -replace 'onClick=', 'onPointerDownCapture='
  # Ensure select-none touch-none on className attributes
  $new = $new -replace '(className=")', '${1}select-none touch-none '
  Set-Content -Path $file.FullName -Value $new
}
