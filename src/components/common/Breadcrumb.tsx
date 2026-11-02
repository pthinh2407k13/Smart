import React from 'react';
import { useLocation } from 'react-router-dom';

export const GlobalBreadcrumb: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getBreadcrumbTrail = (pathname: string): string[] => {
    if (pathname.startsWith('/teacher/')) {
      if (pathname.includes('/dashboard')) return ['Tổng quan', 'Bảng điều khiển'];
      if (pathname.includes('/classes')) return ['Quản lý lớp học', 'Lớp của tôi'];
      if (pathname.includes('/students')) return ['Quản lý lớp học', 'Học sinh'];
      if (pathname.includes('/attendance')) return ['Quản lý lớp học', 'Điểm danh lớp'];
      if (pathname.includes('/schedule')) return ['Quản lý lớp học', 'Thời khóa biểu'];
      if (pathname.includes('/quizzes')) return ['Dạy & Học', 'Ngân hàng câu hỏi'];
      if (pathname.includes('/assignments')) return ['Dạy & Học', 'Giao bài tập'];
      if (pathname.includes('/grading')) return ['Dạy & Học', 'Chấm bài tự động'];
      if (pathname.includes('/resources')) return ['Dạy & Học', 'Tài liệu số'];
      if (pathname.includes('/ai')) return ['Dạy & Học', 'AI HỖ TRỢ'];
      if (pathname.includes('/grades')) return ['Đánh giá', 'Sổ điểm điện tử'];
      if (pathname.includes('/behavior')) return ['Đánh giá', 'Hành vi & Nề nếp'];
      if (pathname.includes('/rewards')) return ['Đánh giá', 'Thi đua & Khen thưởng'];
      if (pathname.includes('/alerts')) return ['Đánh giá', 'Cảnh báo học tập'];
      if (pathname.includes('/tools/wheel')) return ['Công cụ', 'Vòng quay may mắn'];
      if (pathname.includes('/tools/random')) return ['Công cụ', 'Chọn học sinh ngẫu nhiên'];
      if (pathname.includes('/tools/groups')) return ['Công cụ', 'Chia nhóm tự động'];
      if (pathname.includes('/tools/timer')) return ['Công cụ', 'Đồng hồ đếm ngược'];
      if (pathname.includes('/announcements')) return ['Hệ thống', 'Bảng tin & Thông báo'];
      if (pathname.includes('/reports')) return ['Hệ thống', 'Báo cáo & Thống kê'];
      return ['Quản lý giáo viên', 'Trang giáo viên'];
    }
    if (pathname.startsWith('/student/')) {
      if (pathname.includes('/dashboard')) return ['Góc học tập', 'Trang chủ cá nhân'];
      if (pathname.includes('/schedule')) return ['Góc học tập', 'Thời khóa biểu'];
      if (pathname.includes('/assignments')) return ['Góc học tập', 'Bài tập của tôi'];
      if (pathname.includes('/quizzes')) return ['Góc học tập', 'Kiểm tra & Quiz'];
      if (pathname.includes('/resources')) return ['Góc học tập', 'Học liệu ôn tập'];
      if (pathname.includes('/grades')) return ['Kết quả', 'Bảng điểm của tôi'];
      if (pathname.includes('/attendance')) return ['Kết quả', 'Chuyên cần'];
      if (pathname.includes('/achievements')) return ['Kết quả', 'Huy hiệu & Thành tích'];
      if (pathname.includes('/announcements')) return ['Kết quả', 'Thông báo lớp học'];
      return ['Góc học tập', 'Học sinh'];
    }
    if (pathname.startsWith('/parent/')) {
      if (pathname.includes('/dashboard')) return ['Sổ liên lạc', 'Tổng quan tình hình con'];
      if (pathname.includes('/children')) return ['Sổ liên lạc', 'Hồ sơ học sinh'];
      if (pathname.includes('/grades')) return ['Sổ liên lạc', 'Kết quả học tập'];
      if (pathname.includes('/attendance')) return ['Sổ liên lạc', 'Tình hình chuyên cần'];
      if (pathname.includes('/assignments')) return ['Sổ liên lạc', 'Bài tập & Nhiệm vụ'];
      if (pathname.includes('/achievements')) return ['Sổ liên lạc', 'Khen thưởng & Nề nếp'];
      if (pathname.includes('/announcements')) return ['Sổ liên lạc', 'Thông báo nhà trường'];
      return ['Sổ liên lạc', 'Phụ huynh'];
    }
    if (pathname.startsWith('/admin/')) {
      if (pathname.includes('/dashboard')) return ['Quản trị trường', 'Bảng điều khiển Admin'];
      if (pathname.includes('/schools')) return ['Quản trị trường', 'Trường học & Cơ sở'];
      if (pathname.includes('/academic')) return ['Quản trị trường', 'Năm học & Khối môn'];
      if (pathname.includes('/classes')) return ['Quản trị trường', 'Quản lý toàn bộ Lớp'];
      if (pathname.includes('/teachers')) return ['Người dùng', 'Quản lý Giáo viên'];
      if (pathname.includes('/students')) return ['Người dùng', 'Quản lý Học sinh'];
      if (pathname.includes('/parents')) return ['Người dùng', 'Phụ huynh liên kết'];
      if (pathname.includes('/roles')) return ['Người dùng', 'Phân quyền & Vai trò'];
      if (pathname.includes('/audit-logs')) return ['Hệ thống', 'Nhật ký kiểm toán (Audit)'];
      if (pathname.includes('/backups')) return ['Hệ thống', 'Sao lưu & Phục hồi'];
      if (pathname.includes('/settings')) return ['Hệ thống', 'Cấu hình hệ thống'];
      return ['Quản trị', 'Hệ thống'];
    }
    return ['Tổng quan', 'Trang chủ'];
  };

  const trail = getBreadcrumbTrail(path);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0C142A]/90 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 shadow-md mb-4 backdrop-blur-xs">
      <span className="text-cyan-400 flex items-center font-bold">
        🏠
      </span>
      <span className="text-slate-500 font-bold">›</span>
      <span className="text-slate-300 font-medium">{trail[0]}</span>
      <span className="text-slate-500 font-bold">›</span>
      <span className="text-cyan-400 font-extrabold">{trail[1]}</span>
    </div>
  );
};
