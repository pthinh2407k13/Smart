import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  BarChart3,
  Shield,
  Smile,
  Frown,
  AlertTriangle,
  Mail,
  Send,
  Save,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { Student, StudentGradeRecord, BehaviorRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const StudentProfile360Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState<Student | undefined>(() =>
    id ? dbService.getStudentById(id) : undefined
  );
  const [gradeRecord, setGradeRecord] = useState<StudentGradeRecord | undefined>(() =>
    id ? dbService.getState().gradeRecords.find((r) => r.studentId === id) : undefined
  );
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(() =>
    id ? dbService.getBehaviors(id) : []
  );

  const [teacherNote, setTeacherNote] = useState(
    'Học sinh có tư duy toán học nhanh nhạy, chịu khó trao đổi bài và hỗ trợ các bạn trong tổ.'
  );

  useEffect(() => {
    if (id) {
      setStudent(dbService.getStudentById(id));
      setGradeRecord(dbService.getState().gradeRecords.find((r) => r.studentId === id));
      setBehaviors(dbService.getBehaviors(id));
    }
  }, [id]);

  if (!student) {
    return (
      <div className="p-8 text-center bg-[#0D152A] rounded-2xl border border-cyan-500/30 text-white">
        <h3 className="text-lg font-bold text-white">Không tìm thấy thông tin học sinh</h3>
        <Button variant="primary" size="sm" onClick={() => navigate('/teacher/students')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleSaveNote = () => {
    showToast('Đã lưu nhận xét học sinh vào hồ sơ số!', 'success');
  };

  return (
    <div className="student-management-container space-y-6 text-white">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/students')}
          icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
        >
          Danh sách học sinh
        </Button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hồ Sơ Học Sinh 360°</h1>
          <p className="text-xs text-cyan-300/80">
            Mã: <span className="font-mono font-bold text-cyan-300">{student.studentCode}</span> • Lớp {student.className}
          </p>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-xl shadow-cyan-950/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white">{student.fullName}</h2>
                <Badge variant="blue" size="md">
                  {student.gender}
                </Badge>
                <Badge variant="emerald" size="md">
                  Đang theo học
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Sinh ngày: {student.dob}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {student.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Tổ {student.groupNumber || 1} • Vị trí {student.seatNumber || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Điểm thi đua</span>
              <span className="text-xl font-black text-amber-300">+{student.rewardPoints} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tỷ lệ chuyên cần"
          value={`${student.attendanceRate}%`}
          subtitle="Đi học đầy đủ, đúng giờ"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Điểm trung bình (GPA)"
          value={`${gradeRecord?.semesterAverage || student.gpa}`}
          subtitle="Xếp loại: Giỏi / Xuất sắc"
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Hạnh kiểm"
          value={student.conduct}
          subtitle="Kỷ luật lớp học tốt"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Bài tập hoàn thành"
          value="95%"
          subtitle="19 / 20 bài tập đúng hạn"
          icon={<BookOpen className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* 2 Columns: Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grades breakdown */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Điểm số chi tiết Học kỳ I
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {gradeRecord &&
                Object.entries(gradeRecord.scores).map(([k, v], idx) => (
                  <div key={k} className="p-3 rounded-xl bg-[#080E20] border border-cyan-500/20 text-center">
                    <span className="text-[10px] font-bold text-cyan-400/80 uppercase">Cột điểm {idx + 1}</span>
                    <div className="text-lg font-black text-cyan-300 mt-0.5">{v ?? '-'}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Behavior and achievements */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Nhật ký Thi đua & Rèn luyện
            </h3>

            <div className="space-y-3">
              {behaviors.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Chưa có ghi nhận rèn luyện nào.</p>
              ) : (
                behaviors.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      b.type === 'POSITIVE'
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {b.type === 'POSITIVE' ? (
                        <Smile className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Frown className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-xs text-white">{b.content}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ngày: {b.date} • Ghi nhận bởi: {b.recordedBy}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-xs text-emerald-300">+{b.points}đ</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teacher observation notes */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-3">
            <h3 className="font-bold text-base text-white">Nhận xét của Giáo viên chủ nhiệm</h3>
            <textarea
              rows={3}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              className="w-full p-3 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end">
              {/* Màu xanh cho Lưu */}
              <Button variant="success" size="sm" onClick={handleSaveNote} icon={<Save className="w-4 h-4" />}>
                Lưu nhận xét
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Parent Contact */}
        <div className="space-y-6">
          <div className="parent-info-screen bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Thông tin Phụ huynh liên kết
            </h3>

            <div className="p-4 rounded-xl bg-[#080E20] border border-cyan-500/20 space-y-2">
              <div className="text-xs text-slate-400">Họ tên Phụ huynh:</div>
              <div className="font-extrabold text-sm text-white">{student.parentName}</div>

              <div className="text-xs text-slate-400 pt-2">Số điện thoại:</div>
              <div className="font-mono font-bold text-sm text-cyan-300">{student.parentPhone}</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => showToast(`Đã mở kết nối gửi tin nhắn tới ${student.parentPhone}`, 'info')}
              icon={<Send className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Gửi thông báo riêng cho Phụ huynh
            </Button>
          </div>

          {/* Attendance History Summary */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Thống kê chuyên cần tháng này
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-cyan-500/10">
                <span className="text-slate-400">Số buổi có mặt:</span>
                <span className="font-bold text-emerald-400">22 buổi</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-cyan-500/10">
                <span className="text-slate-400">Nghỉ có phép:</span>
                <span className="font-bold text-cyan-300">1 buổi (sốt)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-cyan-500/10">
                <span className="text-slate-400">Đi muộn:</span>
                <span className="font-bold text-amber-400">0 lần</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Nghỉ không phép:</span>
                <span className="font-bold text-rose-400">0 lần</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
