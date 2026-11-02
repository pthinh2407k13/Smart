import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CheckSquare,
  Calendar,
  BookOpen,
  FileQuestion,
  Sparkles,
  BarChart3,
  Award,
  Bell,
  Settings,
  Clock,
  Layers,
  ChevronDown,
  Building,
  Shield,
  FileText,
  Database,
  Shuffle,
  Dices,
  FolderOpen,
  AlertTriangle,
  FolderMinus,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { role } = useAuth();
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const location = useLocation();

  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(360, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Navigation items by role
  const getNavSections = () => {
    if (role === 'TEACHER') {
      return [
        {
          id: 'overview',
          title: 'TỔNG QUAN',
          items: [
            { label: 'Bảng điều khiển', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          ],
        },
        {
          id: 'classes',
          title: 'QUẢN LÝ LỚP HỌC',
          items: [
            { label: 'Lớp của tôi', path: '/teacher/classes', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Học sinh', path: '/teacher/students', icon: <Users className="w-4 h-4" /> },
            { label: 'Điểm danh lớp', path: '/teacher/attendance', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Thời khóa biểu', path: '/teacher/schedule', icon: <Calendar className="w-4 h-4" /> },
          ],
        },
        {
          id: 'teaching',
          title: 'DẠY & HỌC',
          items: [
            { label: 'Ngân hàng câu hỏi', path: '/teacher/quizzes', icon: <FileQuestion className="w-4 h-4" /> },
            { label: 'Giao bài tập', path: '/teacher/assignments', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Chấm bài tự động', path: '/teacher/grading', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Tài liệu số', path: '/teacher/resources', icon: <FolderOpen className="w-4 h-4" /> },
            { label: 'AI HỖ TRỢ', path: '/teacher/ai', icon: <Sparkles className="w-4 h-4" />, highlight: true },
          ],
        },
        {
          id: 'tracking',
          title: 'THEO DÕI & ĐÁNH GIÁ',
          items: [
            { label: 'Sổ điểm điện tử', path: '/teacher/grades', icon: <BarChart3 className="w-4 h-4" /> },
            { label: 'Hành vi & Nề nếp', path: '/teacher/behavior', icon: <Shield className="w-4 h-4" /> },
            { label: 'Thi đua & Khen thưởng', path: '/teacher/rewards', icon: <Award className="w-4 h-4" /> },
            { label: 'Cảnh báo học tập', path: '/teacher/alerts', icon: <AlertTriangle className="w-4 h-4" /> },
          ],
        },
        {
          id: 'tools',
          title: 'CÔNG CỤ LỚP HỌC',
          items: [
            { label: 'Vòng quay may mắn', path: '/teacher/tools/wheel', icon: <Dices className="w-4 h-4" /> },
            { label: 'Chọn học sinh ngẫu nhiên', path: '/teacher/tools/random', icon: <Shuffle className="w-4 h-4" /> },
            { label: 'Chia nhóm tự động', path: '/teacher/tools/groups', icon: <Layers className="w-4 h-4" /> },
            { label: 'Đồng hồ đếm ngược', path: '/teacher/tools/timer', icon: <Clock className="w-4 h-4" /> },
          ],
        },
        {
          id: 'system',
          title: 'HỆ THỐNG & BÁO CÁO',
          items: [
            { label: 'Bảng tin & Thông báo', path: '/teacher/announcements', icon: <Bell className="w-4 h-4" /> },
            { label: 'Báo cáo & Thống kê', path: '/teacher/reports', icon: <FileText className="w-4 h-4" /> },
          ],
        },
      ];
    }

    if (role === 'STUDENT') {
      return [
        {
          id: 'study',
          title: 'GÓC HỌC TẬP',
          items: [
            { label: 'Trang chủ cá nhân', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Thời khóa biểu', path: '/student/schedule', icon: <Calendar className="w-4 h-4" /> },
            { label: 'Bài tập của tôi', path: '/student/assignments', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Kiểm tra & Quiz', path: '/student/quizzes', icon: <FileQuestion className="w-4 h-4" /> },
            { label: 'Học liệu ôn tập', path: '/student/resources', icon: <FolderOpen className="w-4 h-4" /> },
          ],
        },
        {
          id: 'results',
          title: 'KẾT QUẢ RÈN LUYỆN',
          items: [
            { label: 'Bảng điểm của tôi', path: '/student/grades', icon: <BarChart3 className="w-4 h-4" /> },
            { label: 'Chuyên cần', path: '/student/attendance', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Huy hiệu & Thành tích', path: '/student/achievements', icon: <Award className="w-4 h-4" /> },
            { label: 'Thông báo lớp học', path: '/student/announcements', icon: <Bell className="w-4 h-4" /> },
          ],
        },
      ];
    }

    if (role === 'PARENT') {
      return [
        {
          id: 'parent_book',
          title: 'SỔ LIÊN LẠC ĐIỆN TỬ',
          items: [
            { label: 'Tổng quan tình hình con', path: '/parent/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Hồ sơ học sinh', path: '/parent/children', icon: <Users className="w-4 h-4" /> },
            { label: 'Kết quả học tập (Điểm)', path: '/parent/grades', icon: <BarChart3 className="w-4 h-4" /> },
            { label: 'Tình hình chuyên cần', path: '/parent/attendance', icon: <CheckSquare className="w-4 h-4" /> },
            { label: 'Bài tập & Nhiệm vụ', path: '/parent/assignments', icon: <BookOpen className="w-4 h-4" /> },
            { label: 'Khen thưởng & Nề nếp', path: '/parent/achievements', icon: <Award className="w-4 h-4" /> },
            { label: 'Thông báo nhà trường', path: '/parent/announcements', icon: <Bell className="w-4 h-4" /> },
          ],
        },
      ];
    }

    // ADMIN
    return [
      {
        id: 'admin_school',
        title: 'QUẢN TRỊ TRƯỜNG',
        items: [
          { label: 'Bảng điều khiển Admin', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Trường học & Cơ sở', path: '/admin/schools', icon: <Building className="w-4 h-4" /> },
          { label: 'Năm học & Khối môn', path: '/admin/academic', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Quản lý toàn bộ Lớp', path: '/admin/classes', icon: <GraduationCap className="w-4 h-4" /> },
        ],
      },
      {
        id: 'admin_users',
        title: 'NGƯỜI DÙNG & TÀI KHOẢN',
        items: [
          { label: 'Quản lý Giáo viên', path: '/admin/teachers', icon: <Users className="w-4 h-4" /> },
          { label: 'Quản lý Học sinh', path: '/admin/students', icon: <GraduationCap className="w-4 h-4" /> },
          { label: 'Phụ huynh liên kết', path: '/admin/parents', icon: <Users className="w-4 h-4" /> },
          { label: 'Phân quyền & Vai trò', path: '/admin/roles', icon: <Shield className="w-4 h-4" /> },
        ],
      },
      {
        id: 'admin_system',
        title: 'HỆ THỐNG & DỮ LIỆU',
        items: [
          { label: 'Nhật ký kiểm toán (Audit)', path: '/admin/audit-logs', icon: <FileText className="w-4 h-4" /> },
          { label: 'Sao lưu & Phục hồi', path: '/admin/backups', icon: <Database className="w-4 h-4" /> },
          { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
        ],
      },
    ];
  };

  const sections = getNavSections();

  // Collapsible Open/Close State for every module
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec) => {
      initial[sec.id] = true;
    });
    return initial;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const areAllOpen = sections.every((sec) => openSections[sec.id] !== false);
  const toggleAllSections = () => {
    const newState = !areAllOpen;
    const updated: Record<string, boolean> = {};
    sections.forEach((sec) => {
      updated[sec.id] = newState;
    });
    setOpenSections(updated);
  };

  useEffect(() => {
    sections.forEach((sec) => {
      const hasActiveChild = sec.items.some(
        (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
      );
      if (hasActiveChild && openSections[sec.id] === false) {
        setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        style={{ width: isCollapsed ? '80px' : `${sidebarWidth}px` }}
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0A1022] border-r border-cyan-500/35 flex flex-col transition-all duration-75 ease-out text-white shadow-2xl shadow-cyan-950/60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Resize Handle (Kéo ra kéo vào) */}
        {!isCollapsed && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-cyan-400/40 transition-colors group z-50 flex items-center justify-center"
            title="Kéo để thay đổi độ rộng menu"
          >
            <div className="w-0.5 h-10 bg-cyan-500/50 group-hover:bg-cyan-300 rounded-full" />
          </div>
        )}
        {/* Brand header */}
        <div className="h-16 px-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070D1E]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-cyan-500/30 text-lg tracking-wider border border-cyan-300/40 shrink-0">
              SC
            </div>
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <div className="font-extrabold text-sm tracking-tight text-white leading-tight truncate">
                  SMART CLASS
                </div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider truncate">
                  Quản Lý Lớp Học Số
                </div>
              </div>
            )}
          </div>

          {/* Toggle Collapse Button in the exact red box region */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-950/60 rounded-lg transition-colors cursor-pointer border border-cyan-500/30 shrink-0"
              title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick Class Switcher for Teachers (Hidden when collapsed) */}
        {!isCollapsed && role === 'TEACHER' && (
          <div className="p-3 border-b border-cyan-500/20 bg-[#0C142A]">
            <label className="text-[11px] font-bold text-cyan-300/80 uppercase tracking-wider px-1 block mb-1.5">
              Lớp đang thao tác
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 cursor-pointer shadow-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0A1022] text-white">
                    {c.name} ({c.studentCount} HS)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Global Expand / Collapse All control (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-cyan-400/80">
            <span>DANH MỤC MODULE</span>
            <button
              onClick={toggleAllSections}
              className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white font-bold px-1.5 py-0.5 rounded-md hover:bg-cyan-950/60 transition-colors cursor-pointer border border-cyan-500/30"
              title={areAllOpen ? 'Đóng tất cả các module' : 'Mở tất cả các module'}
            >
              {areAllOpen ? (
                <>
                  <FolderMinus className="w-3 h-3 text-cyan-400" />
                  <span>Đóng tất cả</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3 h-3 text-cyan-400" />
                  <span>Mở tất cả</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Scrollable navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {sections.map((sec) => {
            const isSectionOpen = openSections[sec.id] !== false;
            const hasActiveChild = sec.items.some(
              (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
            );

            if (isCollapsed) {
              return (
                <div key={sec.id} className="space-y-1">
                  {sec.items.map((item) => {
                    const isActive =
                      location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/60 shadow-md shadow-cyan-950/50'
                            : 'text-slate-300 hover:bg-[#131F3B] hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {item.icon}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            return (
              <div
                key={sec.id}
                className="rounded-xl border border-transparent transition-all"
              >
                {/* Accordion Module Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  aria-expanded={isSectionOpen}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group border ${
                    hasActiveChild
                      ? 'bg-cyan-950/60 border-cyan-400/50 shadow-md shadow-cyan-950/40 text-cyan-200'
                      : 'bg-[#0E172E] border-cyan-500/20 hover:border-cyan-400/40 hover:bg-[#132040] text-slate-200'
                  }`}
                  title={`${isSectionOpen ? 'Thu gọn' : 'Mở rộng'} module ${sec.title}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                        isSectionOpen ? 'bg-cyan-400 shadow-xs shadow-cyan-400' : 'bg-slate-600'
                      }`}
                    />
                    <span className="text-[11px] font-black tracking-wider uppercase text-white group-hover:text-cyan-300 whitespace-nowrap">
                      {sec.title}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ml-1.5 ${
                      isSectionOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Sub-screens inside module */}
                {isSectionOpen && (
                  <nav className="space-y-1 mt-1 pl-1 border-l-2 border-cyan-500/30 ml-2 animate-fadeIn">
                    {sec.items.map((item) => {
                      const isActive =
                        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onCloseMobile}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-400/60 shadow-md shadow-cyan-950/50'
                              : 'text-slate-300 hover:bg-[#131F3B] hover:text-white'
                          }`}
                        >
                          <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {item.icon}
                          </span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.highlight && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-xs">
                              AI
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3 border-t border-cyan-500/20 bg-[#070D1E] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span className="text-[11px] font-medium text-cyan-300">Đã đồng bộ</span>
            </div>
            <span className="text-[10px] text-slate-400">v2.5 Pro</span>
          </div>
        )}
      </aside>
    </>
  );
};
