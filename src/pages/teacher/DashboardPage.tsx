import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Bell,
  CheckSquare,
  BarChart3,
  Shuffle,
  ChevronRight,
  TrendingUp,
  FolderOpen,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, setSelectedClassId } = useClass();

  const [students, setStudents] = useState(() => dbService.getStudents());
  const [sessions, setSessions] = useState(() => dbService.getAttendanceSessions());
  const [assignments, setAssignments] = useState(() => dbService.getAssignments());
  const [alerts, setAlerts] = useState(() => dbService.getAlerts());
  const [schedules] = useState(() => dbService.getState().schedules);
  const [auditLogs] = useState(() => dbService.getState().auditLogs);

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setStudents(dbService.getStudents());
      setSessions(dbService.getAttendanceSessions());
      setAssignments(dbService.getAssignments());
      setAlerts(dbService.getAlerts());
    });
    return unsub;
  }, []);

  const totalStudents = students.length;
  const todaySession = sessions[0];
  const presentCount = todaySession?.presentCount || 0;
  const pendingAssignments = assignments.filter((a) => a.status === 'ACTIVE').length;
  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'PROCESSING').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner in Dark Navy with Cyan highlights */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0C1A38] via-[#0E224A] to-[#0A1734] border border-cyan-500/40 p-6 sm:p-8 text-white shadow-2xl shadow-cyan-950/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 backdrop-blur-md text-xs font-semibold text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Học kỳ II • Năm học 2024 - 2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
              Hôm nay bạn có 2 tiết Toán tại Lớp 10A1. Hệ thống đã đồng bộ sĩ số và cập nhật 2 cảnh báo chuyên cần mới.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Màu xanh cho thao tác chính */}
            <Button
              variant="success"
              size="md"
              onClick={() => navigate('/teacher/attendance')}
              icon={<CheckSquare className="w-4 h-4" />}
            >
              Điểm danh ngay
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/teacher/tools/wheel')}
              icon={<Shuffle className="w-4 h-4 text-cyan-400" />}
            >
              Gọi tên ngẫu nhiên
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng học sinh"
          value={totalStudents}
          subtitle={`Phân bổ trong ${classes.length} lớp học`}
          icon={<Users className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          title="Có mặt hôm nay"
          value={`${presentCount} / ${totalStudents}`}
          trend={{ value: '94.8% tỉ lệ chuyên cần', isPositive: true }}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
          onClick={() => navigate('/teacher/attendance')}
        />
        <StatCard
          title="Bài cần chấm"
          value={pendingAssignments}
          subtitle="2 bài tập đang nhận bài làm"
          icon={<BookOpen className="w-5 h-5" />}
          color="purple"
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          title="Cảnh báo cần xử lý"
          value={activeAlerts}
          trend={{ value: '1 học sinh đi muộn 3 lần', isPositive: false }}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/teacher/alerts')}
        />
      </div>

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Classes + Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Classroom Hub */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Danh sách Lớp học của bạn</h3>
                <p className="text-xs text-slate-400">Bấm vào lớp để vào không gian làm việc chi tiết</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/classes')}
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Xem tất cả ({classes.length})
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedClassId(c.id);
                    navigate(`/teacher/classes/${c.id}`);
                  }}
                  className="group p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-950/50 transition-all cursor-pointer bg-[#080E20] relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: c.themeColor || '#06B6D4' }}
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-cyan-400/80 mt-0.5">{c.roomNumber}</p>
                    </div>
                    <Badge variant="blue" size="sm">
                      {c.studentCount} HS
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {c.description || 'Chưa có mô tả lớp'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Mã lớp: {c.inviteCode}</span>
                    <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Vào lớp <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Thời khóa biểu hôm nay (Thứ 2)</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/schedule')}
                className="text-cyan-400 font-bold"
              >
                Toàn bộ tuần
              </Button>
            </div>

            <div className="space-y-3">
              {schedules.slice(0, 4).map((sch) => (
                <div
                  key={sch.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/20 bg-[#080E20] hover:bg-cyan-950/40 hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                      T.{sch.period}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{sch.subjectName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {sch.className} • {sch.room} • GV: {sch.teacherName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-300">
                      {sch.startTime} - {sch.endTime}
                    </div>
                    <Badge variant="slate" size="sm" className="mt-1">
                      Chính khóa
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Alerts + Recent Activity Audit */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Cảnh báo thông minh
              </h3>
              <Badge variant="amber" size="sm">
                {activeAlerts} Cần xem
              </Badge>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{alt.studentName}</span>
                    <Badge
                      variant={alt.severity === 'WARNING' ? 'amber' : 'rose'}
                      size="sm"
                    >
                      {alt.severity === 'WARNING' ? 'Cảnh báo' : 'Nghiêm trọng'}
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{alt.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Lớp {alt.className}</span>
                    <button
                      onClick={() => navigate('/teacher/alerts')}
                      className="font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Xử lý ngay →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tools Access */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Công cụ lớp học tức thì
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => navigate('/teacher/tools/wheel')}
                className="p-3 rounded-xl bg-[#080E20] hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left cursor-pointer"
              >
                <div className="text-cyan-400 font-bold mb-1">🎯 Vòng quay</div>
                <div className="text-[10px] text-slate-400">Gọi số may mắn</div>
              </button>

              <button
                onClick={() => navigate('/teacher/tools/random')}
                className="p-3 rounded-xl bg-[#080E20] hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left cursor-pointer"
              >
                <div className="text-cyan-400 font-bold mb-1">🎲 Chọn ngẫu nhiên</div>
                <div className="text-[10px] text-slate-400">Không trùng lặp</div>
              </button>

              <button
                onClick={() => navigate('/teacher/tools/groups')}
                className="p-3 rounded-xl bg-[#080E20] hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left cursor-pointer"
              >
                <div className="text-cyan-400 font-bold mb-1">👥 Chia nhóm</div>
                <div className="text-[10px] text-slate-400">Theo sĩ số / tổ</div>
              </button>

              <button
                onClick={() => navigate('/teacher/tools/timer')}
                className="p-3 rounded-xl bg-[#080E20] hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left cursor-pointer"
              >
                <div className="text-cyan-400 font-bold mb-1">⏱ Đồng hồ bấm giờ</div>
                <div className="text-[10px] text-slate-400">Chiếu màn hình</div>
              </button>
            </div>
          </div>

          {/* Recent Audit Timeline */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Nhật ký hoạt động gần đây
            </h3>
            <div className="space-y-3">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs pb-2 border-b border-cyan-500/10 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-bold text-cyan-300">{log.action}</span>
                    <span>{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <div className="font-semibold text-white mt-0.5">{log.target}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
