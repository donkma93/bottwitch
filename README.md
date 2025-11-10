# 🎁 Twitch Giveaway System

Hệ thống quản lý giveaway Twitch với bot tự động, tích hợp Game API và hỗ trợ đa ngôn ngữ.

## ✨ Tính năng

- 🎯 **Giveaway System**: Quản lý từ khóa, danh sách tham gia, roll ngẫu nhiên
- 🤖 **Twitch Bot**: Tự động gửi tin nhắn xác nhận và thông báo người chiến thắng
- 🎮 **Game API Integration**: Tích hợp với Game API để quản lý phần thưởng
- 🌍 **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt, English, Português, Español
- 🎨 **Dark Theme**: Giao diện tối màu, dễ nhìn
- ⚡ **Real-time**: Cập nhật real-time với Socket.IO

## 🚀 Cài đặt

### Yêu cầu
- Node.js 14+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📦 Cấu trúc dự án

```
BOTTWITCH/
├── server.js          # Backend server (Express + Socket.IO)
├── package.json       # Dependencies
├── public/            # Frontend files
│   ├── index.html     # Main HTML
│   ├── app.js         # Client-side JavaScript
│   ├── style.css      # Styles
│   └── i18n.js        # Internationalization
└── README.md          # Documentation
```

## 🔧 Cấu hình

### Twitch Bot
1. Lấy OAuth token tại: https://twitchtokengenerator.com
2. Nhập Bot Username và OAuth Token vào phần cấu hình bot
3. Bot sẽ tự động kết nối và gửi tin nhắn khi có người tham gia

### Game API
1. Nhập DV Login và API Key vào phần Game API Integration
2. API endpoint: `https://megamu.net/dvapi.php`

## 📝 Sử dụng

1. **Kết nối kênh**: Nhập tên kênh Twitch và click "Kết nối"
2. **Cài đặt từ khóa**: Nhập từ khóa giveaway (ví dụ: `!join`, `giveaway`)
3. **Cấu hình bot**: Nhập thông tin bot để gửi tin nhắn tự động
4. **Roll quà**: Click "🎲 Roll" để chọn người chiến thắng ngẫu nhiên
5. **Quản lý phần thưởng**: Sử dụng Game API để gửi phần thưởng

## 🌐 Deploy

### GitHub Pages (Frontend only)
GitHub Pages chỉ hỗ trợ static files. Để deploy frontend:

1. Tạo repository trên GitHub
2. Copy thư mục `public/` vào root của repository
3. Enable GitHub Pages trong Settings > Pages
4. Chọn branch `main` và folder `/ (root)`

**Lưu ý**: Backend cần được host riêng trên service như:
- [Heroku](https://www.heroku.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/) (với serverless functions)

### Deploy Full Stack

#### Option 1: Railway
1. Tạo tài khoản tại https://railway.app
2. Tạo project mới và connect GitHub repository
3. Railway sẽ tự động detect Node.js và deploy

#### Option 2: Render
1. Tạo tài khoản tại https://render.com
2. Tạo Web Service mới
3. Connect GitHub repository
4. Build command: `npm install`
5. Start command: `npm start`

#### Option 3: Heroku
1. Cài đặt Heroku CLI
2. Login: `heroku login`
3. Tạo app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

## 📄 License

MIT

## 👤 Author

Created for Twitch Giveaway Management
