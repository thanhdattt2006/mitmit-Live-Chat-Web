Ca 1: Đại Phẫu "Trái Tim" MatchmakingService (Sáng mai)

Diệt bug phân thân: Sửa lệnh Push Redis. Dùng ZSET (Sorted Set) hoặc Set để đảm bảo ID của thằng Đạt chỉ nằm trong hàng chờ đúng 1 lần, dù mày có spam click gãy chuột.

Chống kẹt xe (Head-of-line blocking): Sửa vòng lặp while(true). Thằng nào bị Blacklist thì sút nó xuống bét hàng chờ để duyệt 2 thằng tiếp theo, đéo có chuyện bắt cả ngàn người phải đợi 2 thằng ghét nhau.

Ném Database ra luồng phụ (Async): Thêm @Async vào việc lưu ChatSession. Ghép đôi xong là báo WebSocket cho Frontend gọi nhau liền, còn việc ghi log xuống DB cứ để Spring Boot nó lẳng lặng làm phía sau. Tốc độ server sẽ tăng x100 lần.

Ca 2: Bắt Ma & Cắm Ổ Điện (Chiều mai)

Làm máy hút bụi (Ghost Cleanup): Code cái WebSocketEventListener. Đang ở phòng chờ mà user tắt tab Chrome cái rụp -> Bắt event xóa mẹ ID khỏi Redis ngay lập tức.

Cắm API Nút Thả Tim & Text Chat: Mở cổng /api/v1/match/like để nhận cờ trái tim, và /app/chat.send cho tin nhắn text.
