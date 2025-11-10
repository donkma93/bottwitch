# 🚀 Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Tạo GitHub Repository

1. Đăng nhập vào GitHub
2. Click "New repository" (hoặc vào https://github.com/new)
3. Đặt tên repository (ví dụ: `twitch-giveaway-system`)
4. Chọn Public hoặc Private
5. **KHÔNG** tích "Initialize with README" (nếu bạn đã có code)
6. Click "Create repository"

## Bước 2: Khởi tạo Git và Push code

Mở terminal/PowerShell trong thư mục dự án và chạy:

```bash
# Khởi tạo git repository
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: Twitch Giveaway System"

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

## Bước 3: Tạo Branch cho GitHub Pages

GitHub Pages cần files trong thư mục `public/` ở root của repository:

```bash
# Tạo branch gh-pages
git checkout -b gh-pages

# Copy files từ public/ lên root
# Windows PowerShell:
Copy-Item -Path public\* -Destination . -Recurse -Force

# Hoặc trên Linux/Mac:
# cp -r public/* .

# Commit và push
git add .
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages
```

## Bước 4: Enable GitHub Pages

1. Vào repository trên GitHub
2. Click **Settings** > **Pages**
3. Trong phần **Source**:
   - Branch: chọn `gh-pages`
   - Folder: chọn `/ (root)`
4. Click **Save**

Sau vài phút, website sẽ có tại: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## ⚠️ Lưu ý quan trọng

**GitHub Pages chỉ host static files (HTML, CSS, JS). Backend Node.js không thể chạy trên GitHub Pages.**

### Giải pháp:

#### Option 1: Host Backend riêng (Khuyến nghị)

1. **Railway** (Miễn phí với giới hạn):
   - Vào https://railway.app
   - Tạo project mới
   - Connect GitHub repository
   - Railway tự động detect và deploy Node.js

2. **Render** (Miễn phí):
   - Vào https://render.com
   - Tạo Web Service
   - Connect GitHub repository
   - Build: `npm install`
   - Start: `npm start`

3. **Heroku**:
   - Cài Heroku CLI
   - `heroku create your-app-name`
   - `git push heroku main`

#### Option 2: Sử dụng CORS Proxy

Nếu backend được host ở domain khác, cần cấu hình CORS trong `server.js`:

```javascript
// Thêm vào server.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://YOUR_USERNAME.github.io');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

Và cập nhật `app.js` để kết nối với backend URL:

```javascript
// Thay đổi socket connection
const socket = io('https://your-backend-url.com');
```

## 📝 Cấu trúc Repository cho GitHub Pages

```
your-repo/
├── index.html          # Từ public/index.html
├── app.js              # Từ public/app.js
├── style.css           # Từ public/style.css
├── i18n.js             # Từ public/i18n.js
├── server.js           # Backend (không chạy trên Pages)
├── package.json
└── README.md
```

## 🔄 Cập nhật Website

Mỗi khi có thay đổi:

```bash
# Chuyển sang branch gh-pages
git checkout gh-pages

# Copy files mới từ public/
Copy-Item -Path public\* -Destination . -Recurse -Force

# Commit và push
git add .
git commit -m "Update website"
git push
```

GitHub Pages sẽ tự động rebuild sau vài phút.

