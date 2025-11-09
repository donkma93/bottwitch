# Twitch Chat Viewer

Ứng dụng Node.js với giao diện web để xem chat trực tiếp từ Twitch.tv

## Tính năng

- ✅ Kết nối với bất kỳ kênh Twitch nào
- ✅ Hiển thị chat real-time
- ✅ Hiển thị thông tin người dùng (username, màu sắc, badges)
- ✅ Phân biệt MOD, VIP, Subscriber, Turbo
- ✅ **Giveaway System**: Cài đặt từ khóa và tự động thu thập participants
- ✅ Tự động thêm người vào danh sách khi comment từ khóa
- ✅ Mỗi người chỉ được thêm 1 lần vào danh sách
- ✅ Xuất danh sách participants ra file .txt
- ✅ Giao diện đẹp, hiện đại
- ✅ Responsive design
- ✅ Tự động scroll chat
- ✅ Đếm số lượng tin nhắn

## Yêu cầu

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

## Cài đặt

1. Cài đặt các dependencies:
```bash
npm install
```

## Sử dụng

1. Khởi chạy server:
```bash
npm start
```

2. Mở trình duyệt và truy cập:
```
http://localhost:3000
```

3. Nhập tên kênh Twitch (ví dụ: `xqcow`, `pokimane`) và click "Kết nối"

4. Chat sẽ hiển thị real-time!

5. **Sử dụng Giveaway:**
   - Nhập từ khóa giveaway (ví dụ: `!join`, `giveaway`)
   - Click "Cài đặt" để bắt đầu thu thập participants
   - Khi ai comment từ khóa trong chat, họ sẽ tự động được thêm vào danh sách
   - Click "Xuất danh sách" để tải file .txt chứa danh sách participants
   - Click "Xóa danh sách" để reset danh sách

## Cấu trúc dự án

```
BOTTWITCH/
├── server.js          # Server Node.js xử lý kết nối Twitch
├── package.json       # Dependencies và scripts
├── README.md          # File hướng dẫn
└── public/
    ├── index.html    # Giao diện chính
    ├── style.css      # Styling
    └── app.js         # Client-side JavaScript
```

## Công nghệ sử dụng

- **Express.js**: Web server
- **tmi.js**: Thư viện kết nối với Twitch IRC
- **Socket.IO**: Real-time communication giữa server và client
- **HTML/CSS/JavaScript**: Giao diện người dùng

## Lưu ý

- Bạn không cần tài khoản Twitch để xem chat công khai
- Chỉ cần nhập tên kênh (không cần #)
- Chat sẽ tự động reconnect nếu mất kết nối

## License

MIT

