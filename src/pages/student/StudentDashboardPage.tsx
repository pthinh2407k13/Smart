import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Upload,
  BarChart3,
  Bell,
  FileQuestion,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Assignment, Submission } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const student = dbService.getStudentById('stu_1001') || dbService.getState().students[0];
  const assignments = dbService.getAssignments('class_10a1');
  const schedules = dbService.getState().schedules.filter((s) => s.dayOfWeek === 2);
  const announcements = dbService.getAnnouncements();

  // Submit modal
  const [activeAsg, setActiveAsg] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsg || !submissionContent.trim()) return;

    setIsSubmitting(true);
    dbService.submitAssignment({
      assignmentId: activeAsg.id,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      classId: student.classId,
      content: submissionContent,
      files: [{ name: 'BaiTap_HoangNam.pdf', url: '#', size: '1.2 MB' }],
      status: 'SUBMITTED',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActiveAsg(null);
      setSubmissionContent('');
      showToast('Đã nộp bài tập thành công cho giáo viên!', 'success');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Học sinh Lớp 10A1 • Mã HS: {student.studentCode}</span>
              </div>
              <h1 className="text-2xl font-black">Chào em, {student.fullName}! 📚</h1>
              <p className="text-xs text-emerald-100 mt-1">
                Hôm nay em có 2 bài tập cần hoàn thành trước thứ Sáu. Chúc em học tốt!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md text-center">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Điểm thi đua</span>
              <span className="text-2xl font-black text-amber-300">+{student.rewardPoints} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Điểm trung bình (GPA)"
          value={student.gpa}
          subtitle="Xếp loại Học lực: Giỏi"
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Chuyên cần"
          value={`${student.attendanceRate}%`}
          subtitle="Đi học đầy đủ, đúng giờ"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Hạnh kiểm"
          value={student.conduct}
          subtitle="Nề nếp lớp học tốt"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Nhiệm vụ cần làm"
          value="2 bài tập"
          subtitle="Môn Toán học"
          icon={<BookOpen className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* 2-column main area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Homework & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Homework todo list */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Bài tập & Nhiệm vụ cần nộp</h3>
              </div>
              <Badge variant="amber" size="sm">
                2 bài đang mở
              </Badge>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {asg.subjectName}
                      </span>
                      <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Hạn: {asg.dueDate}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">{asg.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{asg.description}</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveAsg(asg)}
                    icon={<Upload className="w-3.5 h-3.5" />}
                    className="shrink-0"
                  >
                    Nộp bài làm
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Lịch học hôm nay (Thứ 2)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((sch) => (
                <div key={sch.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="blue" size="sm">Tiết {sch.period}</Badge>
                    <span className="text-slate-500 font-mono">{sch.startTime} - {sch.endTime}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{sch.subjectName}</div>
                  <div className="text-xs text-slate-500">{sch.room} • GV: {sch.teacherName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Announcements & Achievements */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              Thông báo lớp học
            </h3>
            <div className="space-y-2">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{ann.title}</div>
                  <p className="text-slate-600 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Huy hiệu đạt được
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                ⭐ Chiến binh Chuyên cần
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                📐 Siêu sao Toán học
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                🏆 Top 3 Điểm thi đua
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Submit Assignment Modal */}
      {activeAsg && (
        <Modal
          isOpen={!!activeAsg}
          onClose={() => setActiveAsg(null)}
          title={`Nộp bài tập: ${activeAsg.title}`}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <span className="font-bold text-blue-900">Yêu cầu từ cô giáo:</span>
              <p className="text-blue-800 mt-1">{activeAsg.description}</p>
              <span className="block mt-2 font-bold text-rose-600">Hạn nộp: {activeAsg.dueDate}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung bài làm / Lời giải của em *
              </label>
              <textarea
                rows={4}
                required
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Nhập lời giải hoặc mô tả tệp bài làm đính kèm..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-700">Đính kèm ảnh bài làm hoặc file PDF</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Tối đa 15MB (.pdf, .png, .jpg, .docx)</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setActiveAsg(null)}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Gửi bài cho giáo viên
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
