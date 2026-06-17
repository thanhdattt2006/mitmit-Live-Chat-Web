# mitmit - Master Development Roadmap

- [ ] **1. Fix Lỗi Crash Profile (Axios Double Unwrap)**
  - **Vấn đề:** `axiosClient.js` đã tự động bóc lấy `response.data`. Nhưng trong `useStore.js` (`loginWithToken`), lại tiếp tục gọi `set({ userInfo: response.data })` dẫn đến data bị gán thành `undefined`, nát luôn thông tin User. 
  - **Vấn đề phụ:** `App.jsx` đang gọi một hàm `login()` đéo tồn tại trong store.
  - **Giải pháp:**
    - `useStore.js`: Sửa thành `const data = response.data || response; set({ userInfo: data });`.
    - `App.jsx`: Xóa sạch những dòng gọi `login()`. Chỉ dựa vào state `isLoggedIn` từ `useStore()`.
  [ĐÃ HOÀN THÀNH]

- [ ] **2. Bịt Lỗ Hổng Bảo Mật & Xóa `userId` trên URL**
  - **Vấn đề:** Backend (các hàm `/match`, `/join`, `/leave`) vẫn đang dùng `@RequestParam String userId`. Lộ ID ra URL là sai sách bảo mật. Thêm nữa, `SecurityConfig.java` đang để `.permitAll()` cho mọi endpoint.
  - **Giải pháp Backend:** Xóa toàn bộ `@RequestParam String userId`. Nạp `Authentication authentication` vào tham số hàm và lấy ID bằng `authentication.getName()` (hoặc `getPrincipal()`).
  - **Giải pháp Frontend:** Mở `useStore.js`, xóa tham số `userId` trong tất cả các lệnh gọi Axios POST.
  - **SecurityConfig:** Khóa cửa lại. Chỉ cho phép `/api/v1/auth/**` và `/ws/**` là `.permitAll()`, còn lại `.anyRequest().authenticated()`.
  [ĐÃ HOÀN THÀNH]

- [ ] **3. Băm Nhỏ Code Mì Ý (Spaghetti Code)**
  - **Vấn đề:** Vi phạm luật `< 150 dòng/file`. `VideoChat.jsx` (367 dòng), `RoomPage.jsx` và cụm Private Chat đang quá khổ.
  - **Giải pháp:** - Tách `VideoChat.jsx`: Đẻ ra các file con như `<LocalStreamPreview />`, `<RemoteStreamVideo />`, `<TimerCountdownOverlay />`.
    - Tách `RoomPage.jsx`: Tách riêng phần UI chọn Mode (`<CallActionTabs />`) và thông báo Match (`<MatchStatusOverlay />`).
  [ĐÃ HOÀN THÀNH]

- [ ] **4. Dọn Rác File Ngôn Ngữ (Translation)**
  - **Vấn đề:** App 100% login và miễn phí, nhưng `translation.js` vẫn còn key "Nạp xu", "Free Chats", "Guest".
  - **Giải pháp:** Xóa ngay lập tức. Cấm tuyệt đối tư duy code app Freemium/Guest.
  [ĐÃ HOÀN THÀNH]

- [ ] **5. Nối dây Chat Text & Nhắn tin riêng (Inbox)**
  - **Vấn đề:** Hiện đang dùng `setTimeout` để tự rep (ảo ma canada). Ko có WebSockets hay DB gì cả.
  - **Giải pháp Phòng ngẫu nhiên (Text Mode):** Nối STOMP topic `/topic/room/{sessionId}/chat`. Bắn message real-time qua WebSocket (chỉ cần cache Redis cho nhanh, không lưu MySQL vì đóng phòng là hủy).
  - **Giải pháp Inbox riêng tư:** Thiết kế Entity `ChatMessage` (MySQL). Mở endpoint `POST /api/v1/messages` và `GET` để lưu trữ và hiển thị lịch sử chat của bạn bè. Sửa UI `PrivateChatModal.jsx` để ăn API thật.
  [ĐÃ HOÀN THÀNH]

- [ ] **6. Hoàn thiện Hệ thống Match & Kết bạn**
  - **Vấn đề:** 2 bên thả tim xong, Backend ném về tên "Stranger" với ảnh lỗi. Không tạo record kết bạn trong bảng `Friendship`.
  - **Giải pháp Backend (`RoomService.java`):** Khi cả 2 user ấn tim -> Lấy ID 2 đứa query MySQL ra tên thật + Avatar thật để ném về JSON `match_success`.
  - **Quan trọng:** Code logic tự động Insert 2 dòng records vào bảng `Friendship` (A chơi với B, B chơi với A). Bắn thêm STOMP event để UI tự động cập nhật danh sách bạn bè ở Navbar.
  [ĐÃ HOÀN THÀNH]

- [ ] **7. Xây dựng Hệ thống Tố cáo (Report)**
  - **Vấn đề:** Modal Report trên Frontend bấm gửi cho vui, hiện thông báo giả.
  - **Giải pháp Backend:** Khởi tạo Entity `Report` (chứa `reporterId`, `reportedId`, `reason`, `createdAt`). Mở endpoint `POST /api/v1/reports`.
  - **Giải pháp Frontend:** Nối `ReportModal.jsx` gọi Axios lên hàm POST này. Xóa cái setTimeout đi.
  [ĐÃ HOÀN THÀNH]

- [ ] **8. Sửa luồng vào Phòng Text (Bỏ ép Join)**
  - **Vấn đề:** Text Chat đang xài lệnh `setTimeout 1.5s` để ép UI vào phòng, đéo thèm chờ hệ thống Matchmaking xếp hàng.
  - **Giải pháp:** Xóa đoạn `setTimeout` rác trong `RoomPage.jsx`/`useStore.js`. Bắt buộc Text Chat cũng phải vào hàng đợi và đợi tín hiệu `/topic/match/{userId}` từ Backend báo về mới được render phòng.
  [ĐÃ HOÀN THÀNH]

- [ ] **9. Dọn rác Hàng đợi Redis (Chống kẹt Loading Loop & Bóng ma)**
  - **Vấn đề:** Khi user bấm "Cancel" hoặc tắt ngang tab trình duyệt, ID của họ VẪN KẸT lại trong Queue của Redis. Hậu quả: Khi ấn tìm lại hoặc có người khác match trúng cái ID chết đó, hệ thống sẽ bị lú, dẫn đến kẹt vòng lặp Loading vô tận.
  - **Giải pháp:** - *Backend:* Mở API `POST /api/v1/matchmaking/leave` để Frontend chủ động rút lui. 
    - *Backend (Quan trọng):* Code thêm một file `WebSocketEventListener.java` để lắng nghe sự kiện `SessionDisconnectEvent`. Khi một user mất kết nối STOMP (rớt mạng, đóng tab), Backend phải tự động rà soát và xóa sạch ID của user đó khỏi mọi hàng đợi trong Redis.
  [ĐÃ HOÀN THÀNH]

- [ ] **10. Nâng cấp Matchmaking (Chặn ghép cặp lại với Bạn Bè)**
  - **Vấn đề:** Hiện tại vòng lặp quét Redis của `MatchmakingService` đang bắt cặp một cách mù quáng. Nó đéo check xem 2 thằng vừa bốc ra đã có tiền án kết bạn với nhau chưa (chơi app ẩn danh mà cứ bốc trúng người quen thì vứt).
  - **Giải pháp:** - *Backend:* Trong `MatchmakingService`, ngay sau khi pop 2 user từ Redis ra, BẮT BUỘC phải dùng `friendshipRepository.existsByUserIdAndFriendId(user1, user2)` để kiểm tra. 
    - Nếu trả về `true` (đã là bạn), hủy việc tạo Room, đẩy `user2` trả lại Queue và tìm người khác cho `user1`.
  [ĐÃ HOÀN THÀNH]

- [ ] **11. Đảm bảo dọn dẹp State Frontend (Cleanup Guarantee)**
  - **Vấn đề:** Trong `useStore.js` (các hàm `cancelMatching`, `stopCall`), lệnh gọi API `/leave` đang nằm dưới cùng. Nếu phía trên (khúc đóng WebRTC) bị lỗi crash ngầm, lệnh `/leave` đéo được chạy, Frontend bị lệch pha với Backend.
  - **Giải pháp:** - *Frontend:* Bọc lại toàn bộ logic trong `try / finally`. Đảm bảo cái đoạn gọi `axiosClient.post('/api/v1/matchmaking/leave')` phải được ném vào block `finally` để nó **chắc chắn 100% được gọi**, cho dù WebRTC hay Socket có bị crash tung sọ đi nữa.
  [ĐÃ HOÀN THÀNH]

- [ ] **12. Fix Lỗi Đứng Hình (Freeze) khi Auto-Next & Thiếu nút Match**
  - **Vấn đề:** Khi đối phương thoát hoặc ấn Next, user tự động nhảy sang tìm người mới nhưng video bị đứng im (freeze) và Timer của phòng cũ vẫn tiếp tục chạy. Ngoài ra, giao diện Text Chat đang hoàn toàn không có nút "Match" (Thả tim).
  - **Giải pháp:** - *Frontend (Xử lý Freeze):* Trong logic bắt sự kiện đối phương out, bắt buộc phải clear sạch tàn dư (gọi `clearTimeout`, `webRTCClient.close()`, clear stream) TRƯỚC KHI kích hoạt lại hàm `startMatching()`.
    - *Frontend (UI Text Mode):* Cập nhật component của Text Chat để render thêm nút Thả tim, gắn logic gọi hàm `sendMatchDecision()` giống hệt chế độ Video/Voice.
  [ĐÃ HOÀN THÀNH]

- [x] **13. Nâng cấp Hiệu ứng Máy Chém (FOMO)**
  - **Vấn đề:** Hết 3 phút, hệ thống sút văng user bằng một cái alert mặc định rất phèn, không tạo được cảm giác hụt hẫng hay tiếc nuối.
  - **Giải pháp:** - *Frontend:* Tự custom lại UI (Thêm progress bar, nhấp nháy đỏ ở 10s cuối, hiệu ứng tắt màn hình) thay thế cho alert. *(Ghi chú: Đã tự code hoàn thiện phần này).*

- [ ] **14. Fix Bug Chết Đứng Nút Report (Silent Failure)**
  - **Vấn đề:** Khi ấn Submit Report, giao diện bị treo (nút loading xoay vĩnh viễn), không có bất kỳ thông báo lỗi nào hiện ra và Database cũng không ghi nhận dữ liệu.
  - **Giải pháp:** - *Frontend:* Bọc luồng gọi API trong `try / catch / finally`. Đưa lệnh `setIsSubmitting(false)` vào block `finally` để chắc chắn 100% UI được mở khóa dù gọi API thành công hay xịt.
    - *Backend:* Rà soát `SecurityConfig.java` để đảm bảo API `POST /api/v1/reports` không bị chặn (403). Mở Console check log xem `ReportController` có văng lỗi 500 do sai Entity hay null data không.
  [ĐÃ HOÀN THÀNH]

- [ ] **15. Xử lý Timeout Hàng Chờ (60s Limit)**
  - **Vấn đề:** User chờ trong hàng đợi Redis quá lâu (không có ai online) sẽ bị kẹt mãi ở màn hình Loading, gây ức chế.
  - **Giải pháp:** - *Frontend:* Trong hàm `startMatching()`, chèn một lệnh `setTimeout` 60 giây (60000ms). Nếu hết thời gian mà state `isConnected` vẫn là `false`, tự động gọi `cancelMatching()`, hiện Toast thông báo "Không có ai online, vui lòng quay lại sau".
    - *Frontend (Cleanup):* Phải chắc chắn gọi `clearTimeout` cái đồng hồ này nếu user match thành công trước 60s hoặc tự chủ động bấm Cancel sớm.
  [ĐÃ HOÀN THÀNH]

- [x] **16. Đập bỏ Data Ảo & Hoàn thiện API Admin Dashboard**
  - **Vấn đề:** Giao diện Admin (`AdminDashboard.jsx`) đang thao tác trên mảng `reports: []` rỗng (Mock Data). Backend chỉ có chức năng Gửi Report mà ĐÉO CÓ API để Admin lấy dữ liệu ra xem hoặc thực thi lệnh Cấm (Ban).
  - **Giải pháp:** - *Backend:* Bổ sung vào `ReportController.java` các API: `GET /api/v1/reports` (có phân trang) và `POST /api/v1/admin/ban/{userId}`.
    - *Frontend:* Nối Axios vào các API thật này. Xóa bỏ hoàn toàn các logic thao tác mảng ảo trong `useStore.js`.
  [ĐÃ HOÀN THÀNH]

- [x] **17. Gỡ bỏ Con số Online Lừa Tình (Fake Online Count)**
  - **Vấn đề:** Trong `useStore.js`, hàm `updateOnlineCount()` đang dùng `Math.random()` để tự sinh ra số lượng người online giả dối.
  - **Giải pháp:** - *Backend:* Mở một endpoint nhỏ (hoặc bắn qua WebSocket) đếm số lượng Keys trong Redis (Ví dụ đếm các key `QUEUE:*` hoặc Active STOMP Sessions).
    - *Frontend:* Lắng nghe dữ liệu thật này để render UI, dẹp bỏ hàm random.
  [ĐÃ HOÀN THÀNH]

- [x] **18. Băm nhỏ Code Mì Ý (Refactor Zustand & Components)**
  - **Vấn đề:** Vi phạm nghiêm trọng quy tắc `< 150 dòng` của `AGENTS.md`. `useStore.js` phình to 363 dòng (ôm cả Socket lẫn Data), `PrivateMessageRow`, `VideoChat`, `AdminDashboard` đều quá khổ.
  - **Giải pháp:** - *Frontend:* Chẻ `useStore.js` thành các slice nhỏ (VD: `createAuthSlice`, `createMatchSlice`).
    - *Frontend:* Chẻ `VideoChat.jsx` thành `VideoOverlays.jsx` (chứa Timer) và `VideoStreams.jsx`. Tách tương tự cho Admin và Inbox.
  [ĐÃ HOÀN THÀNH]

- [x] **19. Dọn rác Hardcode & Chuẩn hóa i18n**
  - **Vấn đề:** Các file như `AdminDashboard.jsx` code chết 100% tiếng Anh ("Admin Portal", "Login as Admin"). Trong khi `useStore.js` lại gõ cứng các câu `alert` và `console.error` bằng tiếng Việt.
  - **Giải pháp:** - *Frontend:* Đẩy toàn bộ đống text này vào file `translation.js`. Thay thế toàn bộ bằng cú pháp `t.KEY_NAME`. Xóa sổ mọi thông báo `alert()` thuần túy và thay bằng hệ thống Toast.
  [ĐÃ HOÀN THÀNH]

- [x] **20. Vá lỗ hổng bảo mật: Lộ JWT Token trên URL**
  - **Vấn đề:** Quá trình OAuth2 Callback (`OAuth2RedirectHandler.jsx`) đang hứng token trực tiếp trên thanh địa chỉ URL (`?token=abcd...`). Điều này lưu lại JWT trong Lịch sử duyệt web (Browser History), rủi ro bảo mật cực cao.
  - **Giải pháp:** - *Tạm thời (Frontend Quick-win):* Ngay sau khi hứng được Token và lưu vào LocalStorage, sử dụng `window.history.replaceState` để xóa ngay param `?token=` khỏi thanh URL để chùi dấu vết.
    - *Lâu dài (Backend):* Chuyển sang set HttpOnly Cookie từ Backend, Frontend gọi `GET /api/v1/auth/me` để check phiên đăng nhập thay vì parse URL.
  [ĐÃ HOÀN THÀNH]

- [x] **21. Nâng cấp Trải nghiệm Voice Chat (Audio Visualizer)**
  - **Vấn đề:** Chế độ Voice Chat ẩn danh đang quá nhàm chán vì chỉ hiện mỗi Avatar tĩnh, người dùng không biết bên kia có thực sự đang nói hay mic bị hỏng.
  - **Giải pháp:** - *Frontend:* Tích hợp Web Audio API (`AudioContext` -> `AnalyserNode`). Phân tích cường độ âm thanh từ Remote Stream để làm hiệu ứng sóng âm (Waveform) nhấp nháy hoặc vòng Glow tỏa ra quanh Avatar mỗi khi đối phương cất giọng.
  [ĐÃ HOÀN THÀNH]

- [x] **22. Tự động hóa Trừng phạt (Trust Score & Auto-Ban)**
  - **Vấn đề:** Chờ Admin chạy bằng cơm vào đọc Report rồi bấm Ban thủ công thì môi trường app sẽ nát trước khi kịp xử lý kẻ phá hoại.
  - **Giải pháp:** - *Backend:* Code một logic đếm trong `ReportService`. Nếu 1 `userId` bị 3 người dùng *khác nhau* report trong vòng 1 giờ -> Tự động ném ID đó vào Redis Blacklist (24h), đồng thời bắn tín hiệu STOMP force-close sút văng thằng đó ra khỏi phòng ngay lập tức.
  [ĐÃ HOÀN THÀNH]

- [x] **23. Sửa Bug Lặp ID/Trùng Tên trong Bảng Friendship (DB Swap Bug)**
  - **Vấn đề:** Khi Match thành công, logic Backend đang insert 2 dòng user_1 và user_2 nhưng bị sai luồng (swap nhầm ID). Hậu quả là Database bị lặp dữ liệu, dẫn đến trong danh sách Inbox (Private Message) hiện ra 2 người có cùng một tên/Avatar.
  - **Giải pháp:** - Backend (RoomService / FriendshipService): Rà soát lại hàm tạo Friendship. Chỉ cần insert đúng 2 record: Record 1 (UserId = A, FriendId = B) và Record 2 (UserId = B, FriendId = A). Trước khi insert, phải thêm lệnh check existsByUserIdAndFriendId để tuyệt đối không tạo duplicate. Dọn dẹp sạch bảng Friendship hiện tại trong DB để test lại từ đầu.
  [ĐÃ HOÀN THÀNH]

- [x] **24. Trảm triệt để Lỗi Đứng Hình (Freeze) khi đối phương Next/Out**
  - **Vấn đề:** Dựa vào `iceConnectionState` của WebRTC là không đủ nhanh và không đáng tin cậy. Khi User A bấm Next, User B bị kẹt hình video, đồng hồ đếm ngược vẫn chạy, không tự động nhảy sang người mới.
  - **Giải pháp:** - Backend: Khi User A bấm Next hoặc Out phòng, Backend đang xử lý đóng phòng nhưng BẮT BUỘC phải bắn thêm một sự kiện STOMP (ví dụ: `/topic/room/{sessionId}/partner_left`) tới User B.
    - Frontend: Lắng nghe topic này. Vừa nhận được tín hiệu `partner_left` là LẬP TỨC ép luồng cleanup: Xóa Stream, Dừng Timer, gọi `webRTCClient.close()` và kích hoạt `startMatching()` để tìm người mới ngay lập tức mà không cần đợi WebRTC chết.
  [ĐÃ HOÀN THÀNH]

- [x] **25. Đấu nối API thật cho Nút Report trong Phòng Chat**
  - **Vấn đề:** Nút Tố cáo (Report) lúc đang call video/voice/text chỉ để làm cảnh, bấm vào đéo có tác dụng, chưa gọi API.
  - **Giải pháp:** - Frontend: Lấy logic gọi Axios API POST /api/v1/reports (đã làm ngon lành ở Task 14) gắn thẳng vào hàm onClick của nút Report bên trong RoomPage.jsx hoặc VideoChat.jsx. Nhớ truyền đúng reportedUserId của người đang chat cùng. Bấm xong phải hiện Toast thành công và ẩn modal.
  [ĐÃ HOÀN THÀNH]

- [x] **26. Nâng cấp Inbox: Dữ liệu thật, Hủy kết bạn (Unfriend) & Tố cáo kèm Chặn (Block)**
  - **Vấn đề:** Trong Inbox (Private Message) đang cần đổ dữ liệu thật. Thiếu chức năng xóa bạn. Đặc biệt, nếu chat riêng mà bị xúc phạm, bấm Report xong phải tự động Chặn (Block) luôn đối phương.
  - **Giải pháp:** - Backend: Viết API DELETE /api/v1/friendships/{friendId} để xử lý Unfriend (Xóa cả 2 record của A và B). Cập nhật API Report để nếu có cờ isFromInbox = true, tự động xóa Friendship và đưa ID đó vào Blacklist (Chặn).
    - Frontend: Đổ data thật vào list bạn bè. Gắn API vào 2 nút mới trong menu của PrivateChatModal: "Hủy kết bạn" và "Tố cáo & Chặn".
  [ĐÃ HOÀN THÀNH]

- [x] **27. Phủ sóng Data thật (Avatar/Name) & Đồng bộ i18n Timeout**
  - **Vấn đề:** Sau khi Match, vẫn còn một số component hiển thị tên "Stranger" hoặc ảnh placeholder rách nát do chưa map data thật. Ngoài ra, câu thông báo "Đợi 1 phút đéo có ai" lúc Queue chưa được đồng bộ qua hệ thống Đa ngôn ngữ (i18n).
  - **Giải pháp:** - *Frontend (Data):* Rà soát lại Navbar, Profile, PrivateMessageRow, VideoChat (sau khi match). Lấy đúng thông tin avatarUrl và name từ API trả về đắp vào DOM.
    - *Frontend (i18n):* Xóa câu Text tiếng Việt hardcode trong hàm đếm ngược 60s của `useStore.js`. Thêm key `TIMEOUT_NO_MATCH` vào file `translation.js` (cả Tiếng Việt và Tiếng Anh), và gọi ra bằng cú pháp `t.TIMEOUT_NO_MATCH`.
  [ĐÃ HOÀN THÀNH]

- [x] **28. Responsive Video Tỷ lệ chuẩn & Cứu Khung Chat Mobile**
  - **Vấn đề:** Khung camera đang hiển thị méo mó, không tự động co giãn tỷ lệ (cần 16:9 trên Desktop, 9:16 trên Mobile). Tệ hơn, giao diện Mobile đang bị giấu mất khung Text Chat (Quick Chat) vốn đang hoạt động bình thường trên Desktop.
  - **Giải pháp:** - *Frontend (Video):* Dùng Tailwind CSS xử lý linh hoạt trên thẻ `<video>`. Bổ sung class `aspect-video` (16:9) cho màn hình lớn (`md:`) và `aspect-[9/16]` cho màn hình nhỏ. Đảm bảo thuộc tính `object-cover`.
    - *Frontend (Mobile Chat):* Tái cấu trúc lại UI/Grid của `RoomPage.jsx` trên màn Mobile. Đẩy khung Video nhỏ lại một chút để nhét component `<ChatInput />` vào nửa dưới màn hình (hoặc làm dạng Bottom Sheet trượt lên) để user Mobile gõ phím được trong lúc đang gọi.
  [ĐÃ HOÀN THÀNH]

- [x] **29. Hoàn thiện luồng Tin Nhắn Riêng (Private Chat sau Match)**

Vấn đề: Task 26 đã xử lý data Inbox, nhưng luồng nhắn tin riêng tư ngay sau khi 2 người Match thành công (chuyển từ phòng Random sang phòng Bạn bè) cần phải mượt mà và real-time (KHÔNG cần chuyển tiếp/bê dữ liệu tin nhắn từ phòng ngẫu nhiên qua).

Giải pháp: - Frontend/Backend: Khi mở PrivateChatModal.jsx, tự động gọi API GET /api/v1/messages/{friendId} để load lịch sử.

Đảm bảo STOMP Subscribe vào topic dành riêng cho user (/user/queue/messages) để gửi/nhận tin nhắn riêng tư tức thời mà không cần reload trang.

Hiển thị chuẩn xác Tên thật và Avatar thật của đối phương trên Header của khung chat.
  [ĐÃ HOÀN THÀNH]

- [x] **30. Đơn giản hóa Xác thực Admin (Chỉ dùng Google OAuth)**

Vấn đề: Thiết kế thêm Github OAuth riêng cho Admin là quá rườm rà, lằng nhằng code.

Giải pháp: Giữ GitHub OAuth cho luồng User thông thường. Riêng phân quyền Admin, chỉ cho phép xét duyệt dựa trên tài khoản Google.

Phân quyền sẽ được thực hiện thủ công: Admin tự vào Database (MySQL) đổi cột role của tài khoản Google chỉ định thành ROLE_ADMIN.

Frontend: Chỉ cần dựa vào userInfo.role === 'ROLE_ADMIN' trả về từ API /me để quyết định xem có render cái nút "Admin Dashboard" lên giao diện hay không. Khóa route /admin nếu role không hợp lệ.
  [ĐÃ HOÀN THÀNH]

- [x] **31. Bịt lỗ hổng WebSocket bằng ChannelInterceptor (STOMP Auth)**

Vấn đề: WebSocket (/ws/) đang mở toang cửa. Kẻ gian không cần đăng nhập vẫn kết nối được và nghe lén được các topic nhạy cảm.

Giải pháp: - Backend: Viết một class implements ChannelInterceptor. Ghi đè hàm preSend. Bắt sự kiện StompCommand.CONNECT, moi cái JWT token ra từ Header (hoặc query param), dùng JwtUtil để giải mã. Nếu token hợp lệ thì nạp Authentication vào StompHeaderAccessor, nếu sai hoặc rỗng thì ném Exception chặn kết nối ngay lập tức.

Frontend: Sửa lại hàm connect của STOMP trong socketClient.js, nhớ đính kèm JWT Token vào header khi gửi request khởi tạo Socket.
  [ĐÃ HOÀN THÀNH]

- [x] **32. Chặn Lỗ Hổng Giả Mạo Admin & Cân chỉnh Quỹ đạo Phân quyền**

  - **Vấn đề:** Lệch quỹ đạo so với Task 30. Code cũ tự động cấp quyền Admin dựa vào việc soi email (hardcode). Việc này không những cản trở việc cấp quyền thủ công trong MySQL mà còn tạo ra lỗ hổng: Hacker có thể dùng Github đổi email trùng với email Admin để đăng nhập trót lọt.
  - **Giải pháp:** 
    - *Backend (OAuth2AuthenticationSuccessHandler):* Gỡ bỏ hoàn toàn logic "tự động phong tước Admin" bằng email. Tất cả người dùng mới đăng nhập mặc định luôn là `USER`. Việc cấp quyền `ADMIN` 100% phải làm thủ công trong database MySQL.
    - *Chốt chặn bảo mật (Anti-Spoofing):* Code bổ sung điều kiện kiểm tra: Nếu tài khoản trong MySQL đang là `ADMIN` nhưng phương thức đăng nhập lúc đó KHÔNG PHẢI là `google` (vd: đăng nhập qua Github bằng email của Admin) -> Bắn ngay lỗi `SecurityException` để sút văng kẻ gian.
  [ĐÃ HOÀN THÀNH]

- [x] **33. Bịt Lỗ Hổng Giả Mạo (Spoofing) & Xác thực STOMP (Security First)**

  - **Vấn đề:** Hiện tại Controller đang tin tưởng mù quáng vào biến `senderId` do Frontend gửi lên trong payload. Thêm nữa, cửa ngõ WebSocket đang mở toang. Kẻ gian hoàn toàn có thể kết nối chui, tự sửa `senderId` trong mã nguồn JS để mạo danh người khác gửi tin nhắn, hoặc nghe lén topic của phòng khác.
  - **Giải pháp:** 
    - *Backend (Logic Server-side):* Tuyệt đối không xài `senderId` từ payload của Client. Trích xuất ID người dùng trực tiếp từ Authentication Principal (dữ liệu phiên đăng nhập lưu an toàn trên Server).
    - *Backend (Interceptor):* Sử dụng `StompChannelInterceptor` chặn ngay cửa STOMP. Bóc JWT Token từ header lúc client xin kết nối (Handshake), giải mã và xác thực. Không có Token hoặc Token hết hạn -> Rút cáp, chặn kết nối tức khắc.
  [ĐÃ HOÀN THÀNH]

- [x] **34. Đập bỏ Base64 - Tối ưu Upload Media File Vật lý (Fix ERR_CONNECTION_RESET)**

  - **Vấn đề:** API `/upload` đang chuyển file ảnh/voice thành chuỗi Base64 khổng lồ, nhồi vào RAM rồi tống vào MongoDB. Việc này bóp nghẹt bộ nhớ JVM, vi phạm giới hạn 16MB của Mongo và gây văng lỗi `ERR_CONNECTION_RESET` do Tomcat chặn file lớn.
  - **Giải pháp:** 
    - *Backend:* Code lại API lưu file vật lý thẳng xuống thư mục `uploads/` của Server (hoặc đẩy lên S3 ảo). Trả về đúng 1 cái chuỗi URL tĩnh ngắn gọn (VD: `http://localhost:8080/uploads/anh1.jpg`).
    - *Frontend:* Đảm bảo Axios gửi file đính kèm đúng header `multipart/form-data`.
  [ĐÃ HOÀN THÀNH]

- [x] **35. Xử lý Lỗi `data.map is not a function` & Tích hợp Phân Trang Tin Nhắn**

  - **Vấn đề:** Khi mở Inbox, UI văng lỗi trắng màn hình. Nguyên do là Spring Boot Backend trả về dữ liệu kiểu `Page<T>`, nhưng Frontend React lại đinh ninh đó là cái mảng thuần nên nhắm mắt gọi hàm `.map()`.
  - **Giải pháp:** 
    - *Frontend:* Thêm logic check an toàn trước khi render. Bóc tách mảng data bằng câu lệnh: `const msgList = data?.content || data;` và Reverse danh sách để giữ đúng chiều thời gian.
    - *Backend:* Đảm bảo Repository dùng `Pageable` để truy vấn lịch sử chat (`DESC`), giới hạn mặc định 50 tin nhắn để chặn tình trạng tải 10.000 tin nhắn cùng lúc làm sập Database.
  [ĐÃ HOÀN THÀNH]

- [x] **36. Tiêu diệt Tàn dư "Guest" & Ảo giác Đồng hồ (Fake Timer)**

  - **Vấn đề:** Vi phạm luật "Định danh 100%" vì codebase vẫn còn rác `handleGuestAction` và `fakeStream` cho Camera. Nghiêm trọng hơn, đồng hồ đếm ngược 3 phút đang dùng `setTimeout` cục bộ ở Frontend. Nếu user giật lag hoặc đổi Tab, thời gian 2 bên sẽ bị lệch pha hoàn toàn.
  - **Giải pháp:** 
    - *Frontend (Clean up):* Cắt bỏ toàn bộ logic Guest. Chưa đăng nhập thì chặn ở cửa, sút về Login. Gỡ bỏ `fakeStream`, bắt buộc bật Camera/Mic.
    - *Backend/Frontend (Sync Timer):* Chuyển quyền "cầm chịch" thời gian về cho Server (Single Source of Truth). Server tính `matchEndTime` rồi ném thẳng vào STOMP Payload lúc Match Found. Frontend chỉ việc tính toán trừ lùi hiển thị mà không bao giờ bị chênh lệch.
  [ĐÃ HOÀN THÀNH]

- [x] **37. Băm nhỏ "Quái vật" Component (Luật thép < 150 dòng)**

  - **Vấn đề:** Theo báo cáo Audit, các file `VideoChat.jsx`, `PrivateChatModal`, `PrivateMessageRow` đều vượt quá 200-250 dòng. Chúng đang ôm đồm quá nhiều State, DOM, và Logic gọi API, gây khó bảo trì và dễ sinh bug re-render.
  - **Giải pháp:** 
    - *Frontend:* Đã tách toàn bộ logic state, API, WebRTC và luồng chạy của phòng chat vào custom hook `useVideoChat.js`. Component `VideoChat.jsx` hiện tại đã giảm từ gần 250 dòng xuống chỉ còn dưới 70 dòng.
  [ĐÃ HOÀN THÀNH]

- [x] **38. Bịt Lỗ Hổng Nghe Lén WebSocket (IDOR Topic Authorization)**

Vấn đề: Hiện tại ChannelInterceptor mới chỉ kiểm tra JWT ở bước khởi tạo kết nối (CONNECT). Hacker có thể dùng tài khoản hợp lệ để kết nối, sau đó dùng lệnh stompClient.subscribe chọc ngoáy vào topic /user/queue/chat-{ID_CỦA_NGƯỜI_KHÁC} hoặc topic của phòng khác để nghe lén 100% tin nhắn riêng tư.

Giải pháp: - Backend (StompChannelInterceptor): Ghi đè thêm logic bắt sự kiện StompCommand.SUBSCRIBE. Khi user đòi subscribe vào một topic đích danh (VD: chứa friendshipId hoặc userId), BẮT BUỘC phải trích xuất ID đó ra và so sánh với Principal (ID của user đang gửi request). Nếu đéo khớp -> Quăng AccessDeniedException chặn đứng lệnh subscribe.
  [ĐÃ HOÀN THÀNH]

- [x] **39. Chống Thảm Họa "Double Match" (Race Condition MySQL)**

Vấn đề: Nếu 2 user bấm "Thả tim" cách nhau 1 mili-giây, Spring Boot đẻ ra 2 luồng (Thread) chạy song song. Cả 2 luồng đều gọi existsByUserIdAndFriendId thấy false (vì data chưa kịp save), dẫn đến việc insert 2 lần, tạo ra 4 bản ghi lặp lại trong bảng Friendship. Gây crash UI Inbox.

Giải pháp: - Backend (Database): Mở Entity Friendship, gắn thêm @Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"user_1_id", "user_2_id"})}). MySQL sẽ tự động làm lá chắn vật lý đấm văng luồng đến sau.

Backend (Logic): Trong RoomService, bọc khối lệnh lưu DB bằng một khối try-catch bắt lỗi DataIntegrityViolationException, hoặc xịn hơn là dùng redisTemplate.opsForValue().setIfAbsent làm Distributed Lock để ép 2 Thread chạy tuần tự.
  [ĐÃ HOÀN THÀNH]

- [x] **40. Gỡ Bom Nổ Chậm MongoDB (Compound Index & Un-indexed Sort)**

Vấn đề: Khi fetch tin nhắn, truy vấn đang gọi findByFriendshipIdOrderByCreatedAtDesc. MongoDB phải gom hết tin nhắn của phòng đó lên RAM rồi mới Sort. Khi vượt mốc giới hạn 32MB RAM In-memory Sort, MongoDB sẽ ném lỗi Executor error và sập toàn bộ API Inbox.

Giải pháp: - Backend (ChatMessage.java): Xóa cái @Indexed đơn lẻ cũ đi. Thêm @CompoundIndex(def = "{'friendshipId': 1, 'createdAt': -1}") lên trên đầu class Entity để Mongo tạo chỉ mục kép, giúp query và sort trực tiếp trên ổ cứng với tốc độ bàn thờ mà không lạm dụng RAM.
  [ĐÃ HOÀN THÀNH]

- [x] **41. Tái cấu trúc Vòng Đời Socket (Chống Socket Thrashing)**

Vấn đề: Mỗi lần user ấn nút "Next" tìm phòng mới, Frontend đang gọi socket.disconnect() xong lập tức gọi new SockJS(). Thao tác đập đi xây lại đường ống TCP liên tục này sẽ bóp nghẹt băng thông, làm cạn kiệt Port của máy chủ Nginx/Tomcat khi có hàng ngàn user lướt Next.

Giải pháp: - Frontend (useStore.js / socketClient.js): Tuyệt đối KHÔNG disconnect socket khi bấm Next. Giữ nguyên 1 kết nối STOMP duy nhất từ lúc Login đến lúc tắt App. Khi bấm Next, chỉ cần gọi hàm .unsubscribe() để thoát khỏi topic phòng cũ, và .subscribe() vào topic phòng mới.
  [ĐÃ HOÀN THÀNH]

- [x] **42. Khử Hardcode & Tiêu chuẩn hóa Môi trường (Environment Parity)**

Vấn đề: Các URL như http://localhost:8080/uploads và http://localhost:3000 đang bị gõ cứng (hardcode) rải rác trong Controller Backend và API Client Frontend. Mang code này deploy lên VPS Linux chạy Domain thật thì toàn bộ ảnh, Websocket và OAuth2 sẽ văng lỗi 404/Mixed Content.

Giải pháp: - Frontend: Đẩy toàn bộ domain vào biến môi trường import.meta.env.VITE_API_URL trong file .env.

Backend: Đẩy domain vào file application.yml hoặc application.properties. Dùng @Value("${app.frontend.url}") và @Value("${app.backend.url}") để nhúng động vào Controller và Security Config.
  [ĐÃ HOÀN THÀNH]

- [x] **43. Xây dựng Lá Chắn Lỗi Toàn Cục (Global Exception Handler)**

Vấn đề: Chưa có ControllerAdvice. Khi Backend văng lỗi (do JWT sai, Mongo sập, hay cắm file quá to), Spring Boot tự động khạc nguyên cục Stacktrace Java 500 chà bá về Frontend. Axios không parse được JSON chuẩn -> Crash UI React, đồng thời lộ cấu trúc thư mục Server cho hacker.

Giải pháp: - Backend: Tạo class GlobalExceptionHandler.java gắn @RestControllerAdvice. Dùng @ExceptionHandler để bắt các lỗi phổ biến (như MaxUploadSizeExceededException, AccessDeniedException, Exception). Định dạng lại thành 1 cục JSON đồng nhất: { "status": "ERROR", "message": "Thông báo thân thiện" } để Frontend dễ hiển thị Toast.
  [ĐÃ HOÀN THÀNH]

- [x] **44. Vòng lặp Khảo sát Trải nghiệm (User Feedback Loop)**

Vấn đề: Chưa đo lường được UX của user. Cần thực thi logic trong tài liệu: Hiện form khảo sát sau 3 lần Match đầu, và mỗi 10 lần Match sau đó.

Giải pháp: - Backend: Bổ sung cột matchCount (int) vào bảng Users. Mỗi lần 2 user ấn "Trái tim" thành công, tăng matchCount lên 1. Trả con số này về API /me.

Frontend: Viết <FeedbackModal />. Trong useEffect, kiểm tra công thức: if (matchCount === 3 || (matchCount > 3 && (matchCount - 3) % 10 === 0)) -> Bật Modal bắt đánh giá 1-5 sao.
  [ĐÃ HOÀN THÀNH]

- [x] **45. Bộ lọc Từ cấm & "Khóa mõm" Tự động (Auto Text Moderation)**

Vấn đề: Cần chặn user chửi bậy hoặc gửi link bẩn. Vi phạm quá 3 lần phải bị ban, hoặc bị report thì khóa mõm ngay lập tức.

Giải pháp tối ưu: Thay vì đợi xử lý ở Controller hay chặn thủ công, tạo `ProfanityFilterService` hỗ trợ Regex quét link và danh sách từ bậy. Nếu vi phạm, cộng gậy (Strike) vào Redis (TTL 24h). Khi Strike >= 3, tự động cập nhật `isMuted = true` trong MySQL cho Entity User và bắn tín hiệu STOMP báo lỗi hệ thống. Kiểm tra `isMuted` và nội dung nhạy cảm được tích hợp thẳng vào `MessageController` (cho Inbox) và `SignalingController` (cho Room Chat). Cách tiếp cận này hiệu quả vì nó bao quát tất cả các trường hợp nhắn tin (phòng ngẫu nhiên và phòng chat bạn bè), và lưu trữ dữ liệu phạt tập trung.
  [ĐÃ HOÀN THÀNH]

- [x] **46. AI Quét "Hàng Nóng" (NSFW) trên luồng Video WebRTC**

Vấn đề: Để app bị biến thành web đen thì server mày đi tông. Phải quét hình ảnh đồi trụy ngay từ Frontend.

Giải pháp: - Frontend (RemoteStreamVideo.jsx): Tích hợp thư viện nsfwjs (TensorFlow.js). Cứ mỗi 5 giây, capture 1 frame từ thẻ `<video>` của đối phương và đưa vào model AI quét. Nếu tỷ lệ Porn hoặc Hentai > 80% -> Gửi request khẩn cấp POST /api/v1/reports/nsfw lên server.

Backend: Nhận request NSFW -> Bắn tín hiệu STOMP đóng băng phòng ngay lập tức, tống cổ user vi phạm và khóa IP (thông qua Redis blacklist).
  [ĐÃ HOÀN THÀNH]

- [x] **47. Tích hợp Hệ thống Cảnh báo Email (Auto Email Notification)**

Vấn đề: Khóa tài khoản người ta mà im ỉm thì không chuyên nghiệp. Phải có thư báo cáo.

Giải pháp: - Backend: Thêm `spring-boot-starter-mail` vào `pom.xml`. Cấu hình Gmail SMTP trong `application.yaml`. Viết `EmailService.java`. Khi tài khoản bị Admin ban, auto-ban do nhận quá nhiều report, hoặc do AI ban, lấy email từ cột email (của OAuth2), bắn một bức thư với tiêu đề "Tài khoản mitmit của bạn đã bị khóa vĩnh viễn" kèm lý do chi tiết.
  [ĐÃ HOÀN THÀNH]

- [x] **48. Giải cứu Database Connection (Tách Email khỏi Transactional)**
  - **Vấn đề:** Gửi email trong block @Transactional của banUserNsfw hoặc banUser là hành vi tự sát. SMTP delay sẽ khóa chết MySQL Connection Pool, đánh sập toàn bộ API.
  - **Giải pháp:** - Backend (EmailService.java): Phải gắn annotation @Async lên đầu cái phương thức gửi mail (VD: sendBanNotification). Chắc chắn rằng class cấu hình đã có @EnableAsync. Gọi hàm này sau khi DB đã lưu xong. Luồng chính (lưu Mongo/MySQL) sẽ return ngay lập tức, việc gửi mail kệ cho thread background nó lo.
  [ĐÃ HOÀN THÀNH]

- [x] **49. Tích hợp TURN Server cho WebRTC (Chống sập Video)**
  - **Vấn đề:** Ở Local, WebRTC chạy STUN mượt. Lên Production, 30% user dùng mạng 4G/Cty (Symmetric NAT) sẽ không thể gọi Video (màn hình đen).
  - **Giải pháp:** Tích hợp cấu hình TURN Server (vd: Twilio, Metered, Coturn) vào `RTCPeerConnection` trong `webRTCClient.js`.
  [ĐÃ HOÀN THÀNH - Sếp đã tự tay code và tích hợp Metered.ca siêu chuẩn xác]

- [ ] **50. Đổi Kiến trúc Upload sang Cloud (AWS S3 / Cloudinary)**
  - **Vấn đề:** Lưu file vật lý vào `uploads/` trên VPS sẽ gây mất dữ liệu 100% nếu triển khai Load Balancer hoặc Docker container restart.
  - **Giải pháp:** Chuyển API `/upload` sang việc upload trực tiếp lên Cloudinary hoặc S3, trả về URL tĩnh của CDN. Xóa bỏ thư mục `uploads/` trên máy chủ.
  [ĐÃ HOÀN THÀNH]

- [ ] **51. Cấu hình Graceful Shutdown & Log Rotation**
  - **Vấn đề:** Deploy/Restart server sẽ chặt đứt ngang các transaction DB. Log để tràn lan sẽ làm đầy ổ cứng sập VPS.
  - **Giải pháp:** Bật `server.shutdown=graceful` trong `application.yml`. Bổ sung file `logback-spring.xml` để tự động cắt log theo ngày.

- [ ] **52. Xóa Dấu Vết JWT trên URL (Oauth2 Security)**
  - **Vấn đề:** OAuth2 đang trả token qua URL `?token=...`. Dù Frontend có xóa đi thì Token vẫn nằm vĩnh viễn trong file Access Log của Nginx.
  - **Giải pháp:** Đổi phương thức trả Token qua HttpOnly Cookie tại `OAuth2AuthenticationSuccessHandler`.

- [x] **53. Hoàn thiện Admin Dashboard (Đọc Feedback & Appeal)**
  - **Vấn đề:** User đã bị thu thập Feedback nhưng Admin chưa có chỗ xem. User bị khóa mõm/khóa acc không có chỗ kháng cáo (Appeal).
  - **Giải pháp:** Tạo giao diện và API cho Admin đọc Feedback. Cung cấp API un-ban (Ân xá) nếu user gửi khiếu nại qua Email hợp lý.
  [ĐÃ HOÀN THÀNH - Đã tích hợp API GET Feedbacks và làm giao diện cho Admin]

- [x] **54. Tối ưu Frontend: Lazy Load AI NSFW & Bóp Băng Thông WebRTC**
  - **Vấn đề:** Bundle quá nặng do `nsfwjs` làm load trang chậm 10s. WebRTC không giới hạn bitrate đốt sạch 4G của user.
  - **Giải pháp:** Cấu hình Vite chunking/lazy-load cho model. Thiết lập WebRTC Video Bandwidth Limit (SD/HD).
  [ĐÃ HOÀN THÀNH - Đã sử dụng Dynamic Import cho nsfwjs và cấu hình RTCRtpSender maxBitrate = 500kbps]

- [ ] **55. Cấu hình Heartbeat cho WebSocket & Reconnect UI**
  - **Vấn đề:** Nginx/Cloudflare tự động ngắt cáp WebSocket sau 60s không hoạt động. User mất mạng không biết là bị rớt.
  - **Giải pháp:** Bật tính năng Heartbeat Ping/Pong trong Spring Boot STOMP và cấu hình `reconnectDelay` bên `stompjs` của Frontend.

- [x] **56. Fix "Cấm Oan" trong ProfanityFilterService**
  - **Vấn đề:** Dùng `.contains()` khiến từ bình thường bị nhận diện thành từ cấm (Vd: "buổi sáng" thành "buoi").
  - **Giải pháp:** Áp dụng Regex với Word Boundary `(?i)(^|\\s)(word)($|\\s|[.,!?])` để match chính xác các từ bậy.
  [ĐÃ HOÀN THÀNH]

- [x] **57. Fix "Nháy Ảnh" (Flickering) trong Optimistic Upload**
  - **Vấn đề:** Xóa ngay Local Object URL khiến ảnh bị giật/nháy trước khi Websocket kịp nhận tin.
  - **Giải pháp:** Đặt thời gian `revokeObjectURL` trễ 10 giây trong khối `finally`.
  [ĐÃ HOÀN THÀNH]

- [x] **58. Fix Zombie Interval/Memory Leak trong nsfwjs**
  - **Vấn đề:** Component unmount trước khi AI model load xong sinh ra lặp background vô hạn.
  - **Giải pháp:** Dùng `useRef` lưu trạng thái `isMounted` và xử lý clear interval triệt để.
  [ĐÃ HOÀN THÀNH]

- [x] **59. Vá Vòng lặp Vô cực đốt CPU (MatchmakingService)**
  - **Vấn đề:** Hàm `@Scheduled` kéo Redis liên tục dù không có đủ 2 người, gây lãng phí CPU.
  - **Giải pháp:** Thêm `getQueueSize(queueKey) < 2` để chặn lệnh lấy dữ liệu vô ích.
  [ĐÃ HOÀN THÀNH]

- [x] **60. Cấu hình Thread Pool riêng biệt (AsyncConfig)**
  - **Vấn đề:** Các task nặng dùng chung `ForkJoinPool` gây nghẽn cổ chai (Thread Starvation).
  - **Giải pháp:** Tạo `ThreadPoolTaskExecutor` (core 10, max 50) chuyên dụng cho `MatchmakingService`.
  [ĐÃ HOÀN THÀNH]

- [x] **61. Chống Spam / Rate Limiting cơ bản (MessageController)**
  - **Vấn đề:** Dễ bị DDoS STOMP làm sập Database nếu gửi liên tục.
  - **Giải pháp:** Dùng `increment` của Redis set TTL 1 giây, nếu `count > 5` thì chặn ngay tin nhắn (Drop Message).
  [ĐÃ HOÀN THÀNH]
