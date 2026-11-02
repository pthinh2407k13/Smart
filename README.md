# SMART CLASS – QUẢN LÝ LỚP HỌC THÔNG MINH

Hệ thống quản lý lớp học số và sổ liên lạc điện tử toàn diện cho Nhà trường, Giáo viên, Học sinh và Phụ huynh. Ứng dụng đáp ứng chuẩn kiến trúc multi-tenant, bảo mật phân quyền Row Level Security (RLS) và quy trình nghiệp vụ giáo dục thực tế.

---

## 👥 TÀI KHOẢN TRẢI NGHIỆM DEMO (4 VAI TRÒ)

Hệ thống hỗ trợ **nút bấm chuyển vai trò tức thì (Fast Role Switcher)** ngay trên thanh tiêu đề (Header) hoặc chọn nhanh tại màn hình Đăng nhập:

| Vai trò | Tài khoản Demo | Tên hiển thị | Phạm vi quyền hạn |
| :--- | :--- | :--- | :--- |
| **Giáo viên (Teacher)** | `teacher@smartclass.edu.vn` | Cô Nguyễn Thị Mai | Quản lý lớp, học sinh, điểm danh, bài tập, sổ điểm, công cụ lớp học |
| **Học sinh (Student)** | `student@smartclass.edu.vn` | Trần Hoàng Nam (10A1) | Xem TKB, nộp bài tập, thi quiz, xem điểm cá nhân, huy hiệu |
| **Phụ huynh (Parent)** | `parent@smartclass.edu.vn` | Ông Trần Minh Tuấn | Sổ liên lạc điện tử, chuyên cần, điểm con, trao đổi với GV, xác nhận "Tôi đã đọc" |
| **Quản trị viên (Admin)** | `admin@smartclass.edu.vn` | TS. Bùi Quang Huy | Quản trị trường, năm học, khối môn, tài khoản, audit log, sao lưu JSON |

*Mật khẩu mặc định:* `password123` (hoặc bấm trực tiếp các nút demo 1-click).

---

## 🚀 TÍNH NĂNG NỔI BẬT ĐÃ HOÀN THÀNH

### 1. Không gian làm việc Giáo viên (Teacher Workspace)
- **Teacher Dashboard:** Thống kê sĩ số thời gian thực, có mặt/vắng/muộn hôm nay, lịch dạy, bài cần chấm, cảnh báo học tập.
- **Quản lý Lớp học:** Danh sách lớp (Grid/List), Tạo lớp mới với mã mời/QR, Sao chép lớp, Lưu trữ/Khôi phục, Xóa có xác nhận.
- **Chi tiết Lớp 8 Tab:** Tổng quan • Học sinh • Điểm danh • Bài tập • Sổ điểm • Thi đua & Hành vi • TKB • Báo cáo.
- **Quản lý Học sinh & Hồ sơ 360°:** Bảng danh sách HS, tìm kiếm, lọc theo lớp, xuất CSV, xem hồ sơ toàn diện (điểm, chuyên cần, hành vi, phụ huynh).
- **Import Wizard 4 Bước:** Tải mẫu CSV → Tải file lên → Ánh xạ cột & Xem trước → Báo lỗi dòng/cột → Xác nhận nạp dữ liệu.
- **Sổ Điểm danh Thông minh:** Chọn ngày, tiết, buổi. Nút "Tất cả có mặt", chuyển trạng thái 5 mức (Có mặt, Phép, Không phép, Đi muộn, Về sớm), ghi lý do, thanh lưu cố định (Sticky bar).
- **Công cụ Lớp học (Classroom Tools):**
  - *Vòng quay may mắn (Lucky Wheel):* Canvas tương tác, pháo hoa rực rỡ, tránh gọi lặp, toàn màn hình máy chiếu.
  - *Chọn ngẫu nhiên (Random Picker):* Hiệu ứng đảo thẻ, cộng điểm thi đua tức thì.
  - *Đồng hồ đếm ngược (Timer):* Preset 1, 3, 5, 10, 15, 45 phút, chuông báo hết giờ, chế độ máy chiếu.
  - *Chia nhóm tự động (Group Maker):* Chia 2, 3, 4, 6 nhóm ngẫu nhiên, hỗ trợ in ấn.
- **Bài tập & Chấm điểm:** Giao bài, đính kèm, danh sách bài nộp, giao diện chấm điểm 0-10 và nhận xét trả bài.
- **Kiểm tra / Quiz:** Ngân hàng câu hỏi trắc nghiệm, tạo đề thi, xem đề và đáp án.
- **AI Trợ lý Giáo viên:** Soạn câu hỏi quiz, lập đề cương giáo án, gợi ý nhận xét học sinh, tóm tắt bài giảng có chỉnh sửa & phê duyệt trước khi lưu.
- **Sổ điểm điện tử:** Nhập điểm trực tiếp trên ma trận spreadsheet, tự động tính ĐTB theo hệ số, xuất Excel.
- **Thi đua & Nề nếp:** Ghi nhận điểm cộng/trừ, bảng xếp hạng tổ và cá nhân khích lệ nỗ lực.
- **Cảnh báo sớm (Early Warning):** Quy trình xử lý cảnh báo: Mới → Đang xử lý → Đã giải quyết.

### 2. Cổng Học sinh (Student Portal)
- Xem thời khóa biểu trong ngày.
- Danh sách bài tập, nộp bài trực tiếp đính kèm nội dung và tệp.
- Theo dõi điểm số, chuyên cần và huy hiệu thi đua đạt được.

### 3. Cổng Phụ huynh (Parent Portal)
- Sổ liên lạc điện tử cập nhật điểm số, chuyên cần và nhận xét của giáo viên.
- Nhận thông báo nhà trường kèm nút **"Tôi đã đọc"**.
- Gửi tin nhắn trao đổi riêng tới Giáo viên chủ nhiệm.

### 4. Cổng Quản trị viên (Admin Portal)
- Thống kê toàn trường, kiểm soát tenant.
- Nhật ký kiểm toán bất biến (Immutable Audit Logs) với địa chỉ IP, hành động và dấu thời gian.
- Sao lưu và phục hồi dữ liệu hoàn chỉnh dạng JSON.

---

## 🛠️ CÀI ĐẶT & CHẠY LOCAL

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Kiểm tra cú pháp & TypeScript
npm run lint

# Build production
npm run build
```

---

## 🗄️ CẤU TRÚC DATABASE (SUPABASE / POSTGRESQL)

Xem chi tiết tại tệp `database/schema.sql` gồm:
- Schema đầy đủ các bảng: `schools`, `academic_years`, `profiles`, `classes`, `students`, `student_parents`, `attendance_sessions`, `attendance_records`, `assignments`, `submissions`, `behaviors`, `alerts`, `announcements`, `audit_logs`.
- Chính sách Row Level Security (RLS) bảo vệ truy cập theo từng vai trò.
