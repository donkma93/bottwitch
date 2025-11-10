# PowerShell script để deploy lên GitHub Pages
# Chạy script này: .\deploy-pages.ps1

Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Green

# Kiểm tra xem đã có git chưa
if (-not (Test-Path .git)) {
    Write-Host "❌ Git chưa được khởi tạo. Chạy 'git init' trước." -ForegroundColor Red
    exit 1
}

# Lưu branch hiện tại
$currentBranch = git branch --show-current
Write-Host "📌 Current branch: $currentBranch" -ForegroundColor Yellow

# Tạo hoặc chuyển sang branch gh-pages
Write-Host "🌿 Creating/checking out gh-pages branch..." -ForegroundColor Cyan
git checkout -b gh-pages 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout gh-pages
}

# Copy files từ public/ lên root
Write-Host "📁 Copying files from public/ to root..." -ForegroundColor Cyan
if (Test-Path public) {
    Copy-Item -Path public\* -Destination . -Recurse -Force
    Write-Host "✅ Files copied successfully" -ForegroundColor Green
} else {
    Write-Host "❌ public/ folder not found!" -ForegroundColor Red
    exit 1
}

# Add và commit
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git add .
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
git commit -m $commitMessage

# Push lên GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin gh-pages

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your website will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/" -ForegroundColor Yellow
Write-Host "⏳ Wait a few minutes for GitHub Pages to build..." -ForegroundColor Yellow

# Quay lại branch ban đầu
Write-Host "🔄 Switching back to $currentBranch..." -ForegroundColor Cyan
git checkout $currentBranch

Write-Host "✨ Done!" -ForegroundColor Green


