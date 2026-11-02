import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Plus,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Users,
  CheckCircle,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { selectedClass } = useClass();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    showToast('Đã đăng xuất tài khoản thành công', 'success');
    navigate('/login');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    switchRole(newRole);
    setIsRoleMenuOpen(false);
    showToast(`Đã chuyển sang vai trò ${newRole}`, 'info');

    // Navigate to role landing
    const map: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      TEACHER: '/teacher/dashboard',
      STUDENT: '/student/dashboard',
      PARENT: '/parent/dashboard',
    };
    navigate(map[newRole]);
  };

  const roleBadgeConfig = {
    ADMIN: { label: 'Quản trị viên', bg: 'bg-purple-950/70 text-purple-300 border-purple-500/50' },
    TEACHER: { label: 'Giáo viên', bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50' },
    STUDENT: { label: 'Học sinh', bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' },
    PARENT: { label: 'Phụ huynh', bg: 'bg-amber-950/70 text-amber-300 border-amber-500/50' },
  }[role];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070D1E]/95 backdrop-blur-md border-b border-cyan-500/30 px-4 lg:px-6 flex items-center justify-between text-white">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-cyan-400 hover:text-white hover:bg-cyan-950/40 rounded-xl lg:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="font-bold text-xs text-cyan-300 bg-[#0E1832] border border-cyan-500/30 px-2.5 py-1 rounded-lg">
            THPT Chuyên Nguyễn Huệ
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-medium">Năm học 2024 - 2025</span>
          {role === 'TEACHER' && selectedClass && (
            <>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                {selectedClass.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fast Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md hover:brightness-110 cursor-pointer ${roleBadgeConfig.bg}`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vai trò: {roleBadgeConfig.label}</span>
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#0D152A] border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 p-2 z-50 animate-scale-up">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-3 py-1.5 border-b border-cyan-500/20 mb-1">
                Chuyển vai trò thử nghiệm
              </div>
              <button
                onClick={() => handleSwitchRole('TEACHER')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  role === 'TEACHER' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'hover:bg-[#131E38] text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-white">Giáo viên (Cô Mai)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Quản lý lớp, điểm danh, sổ điểm</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('STUDENT')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  role === 'STUDENT' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'hover:bg-[#131E38] text-slate-200'
                }`}
              >
                <User className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Học sinh (Hoàng Nam)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Xem bài tập, quiz, thời khóa biểu</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('PARENT')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  role === 'PARENT' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' : 'hover:bg-[#131E38] text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Phụ huynh (Bố Nam)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Theo dõi điểm, chuyên cần con</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  role === 'ADMIN' ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40' : 'hover:bg-[#131E38] text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold text-white">Quản trị viên (Hiệu phó)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Quản lý toàn trường & audit log</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Button for Teacher (Cyan / Green theme) */}
        {role === 'TEACHER' && (
          <div className="relative">
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="hidden md:flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-xl border border-cyan-400/50 shadow-md shadow-cyan-950 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Tạo nhanh</span>
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0D152A] border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 p-2 z-50">
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    navigate('/teacher/attendance');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#131E38] hover:text-cyan-300 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Điểm danh hôm nay</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    navigate('/teacher/assignments');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#131E38] hover:text-cyan-300 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Giao bài tập mới</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    navigate('/teacher/students');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#131E38] hover:text-cyan-300 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Thêm học sinh mới</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    navigate('/teacher/classes/create');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#131E38] hover:text-cyan-300 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>Tạo lớp học mới</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-cyan-300 hover:text-white hover:bg-cyan-950/40 rounded-xl transition-colors cursor-pointer border border-cyan-500/20"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070D1E] animate-pulse" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D152A] border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-2">
                <span className="text-xs font-bold text-white">Thông báo mới (3)</span>
                <span className="text-[10px] text-cyan-400 font-semibold cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#091024] border border-cyan-500/30">
                  <div className="font-bold text-cyan-300">Trần Hoàng Nam đã nộp bài tập tuần 24</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">2 giờ trước • Môn Toán học</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#091024] border border-amber-500/30">
                  <div className="font-bold text-amber-300">Cảnh báo chuyên cần: Vũ Minh Khôi</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hôm nay • Đi muộn 3 lần</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#091024] border border-slate-700">
                  <div className="font-bold text-slate-200">Lịch kiểm tra GK II bắt đầu từ 15/03</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hôm qua • Ban Giám Hiệu</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-cyan-500/30 cursor-pointer group text-left"
            title="Tài khoản & Đăng xuất"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-md border border-cyan-400/50 group-hover:ring-2 ring-cyan-400/50 transition-all">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {user?.fullName}
              </div>
              <div className="text-[10px] text-cyan-300/80">{user?.email}</div>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0D152A] border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 p-2 z-50 animate-scale-up">
              <div className="px-3 py-2 border-b border-cyan-500/20 mb-1">
                <div className="font-bold text-white text-xs">{user?.fullName}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
