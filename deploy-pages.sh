#!/bin/bash
# Bash script để deploy lên GitHub Pages
# Chạy script này: chmod +x deploy-pages.sh && ./deploy-pages.sh

echo "🚀 Deploying to GitHub Pages..."

# Kiểm tra xem đã có git chưa
if [ ! -d .git ]; then
    echo "❌ Git chưa được khởi tạo. Chạy 'git init' trước."
    exit 1
fi

# Lưu branch hiện tại
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"

# Tạo hoặc chuyển sang branch gh-pages
echo "🌿 Creating/checking out gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Copy files từ public/ lên root
echo "📁 Copying files from public/ to root..."
if [ -d public ]; then
    cp -r public/* .
    echo "✅ Files copied successfully"
else
    echo "❌ public/ folder not found!"
    exit 1
fi

# Add và commit
echo "💾 Committing changes..."
git add .
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$COMMIT_MSG"

# Push lên GitHub
echo "📤 Pushing to GitHub..."
git push -u origin gh-pages

echo "✅ Deployment complete!"
echo "🌐 Your website will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
echo "⏳ Wait a few minutes for GitHub Pages to build..."

# Quay lại branch ban đầu
echo "🔄 Switching back to $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

echo "✨ Done!"


