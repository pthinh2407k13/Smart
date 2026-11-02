import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  BarChart3,
  BookOpen,
  Award,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Send,
  Check,
  Phone,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Student, StudentGradeRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';

export const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Child switcher
  const myChildren = [dbService.getStudentById('stu_1001')!].filter(Boolean);
  const [selectedChildId, setSelectedChildId] = useState(myChildren[0]?.id || 'stu_1001');
  const child = dbService.getStudentById(selectedChildId) || myChildren[0];

  const gradeRecord = dbService.getState().gradeRecords.find((r) => r.studentId === child?.id);
  const behaviors = dbService.getBehaviors(child?.id);
  const alerts = dbService.getAlerts().filter((a) => a.studentId === child?.id);
  const announcements = dbService.getAnnouncements();

  // Contact Teacher modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [readAnnouncements, setReadAnnouncements] = useState<Record<string, boolean>>({});

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    showToast('Đã gửi tin nhắn trao đổi tới Cô giáo chủ nhiệm Nguyễn Thị Mai!', 'success');
    setIsContactOpen(false);
    setMsgContent('');
  };

  const handleMarkRead = (annId: string) => {
    setReadAnnouncements((prev) => ({ ...prev, [annId]: true }));
    showToast('Đã ghi nhận "Phụ huynh đã đọc" tới nhà trường!', 'info');
  };

  if (!child) return null;

  return (
    <div className="parent-info-screen space-y-6">
      {/* Top Banner with Child Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={child.avatarUrl}
              alt={child.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Sổ Liên Lạc Điện Tử
                </span>
                <span className="text-xs text-slate-400">• Lớp 10A1</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Con: {child.fullName}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                GVCN: <b>Cô Nguyễn Thị Mai</b> (0988 123 456)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsContactOpen(true)}
              icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
            >
              Trao đổi với Giáo viên
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards for child */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tình hình chuyên cần"
          value={`${child.attendanceRate}%`}
          subtitle="Đi học đầy đủ đúng giờ"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Điểm trung bình (GPA)"
          value={gradeRecord?.semesterAverage || child.gpa}
          subtitle="Xếp loại: Giỏi"
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Hạnh kiểm"
          value={child.conduct}
          subtitle="Nề nếp tác phong tốt"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Điểm thi đua tích lũy"
          value={`+${child.rewardPoints} đ`}
          subtitle="Tích cực xây dựng bài"
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* 2 columns: Grades/Behaviors & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Điểm số mới cập nhật
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {gradeRecord &&
                Object.entries(gradeRecord.scores).map(([k, v], idx) => (
                  <div key={k} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cột điểm {idx + 1}</span>
                    <div className="text-xl font-black text-blue-700 mt-1">{v ?? '-'}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Behavior and Teacher Comments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Nhận xét của Giáo viên & Khen thưởng
            </h3>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
              <span className="font-bold text-blue-950">Nhận xét định kỳ của GVCN Cô Nguyễn Thị Mai:</span>
              <p className="text-blue-900 leading-relaxed">
                "Em Nam có học lực rất vững vàng môn Toán, tích cực tham gia các hoạt động đội nhóm. Gia đình tiếp tục động viên em giữ vững phong độ."
              </p>
            </div>

            <div className="space-y-2">
              {behaviors.map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{b.content}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{b.date} • {b.category}</span>
                  </div>
                  <span className="font-bold text-emerald-700">+{b.points} điểm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Announcements with "Tôi đã đọc" button */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Thông báo từ Nhà trường</h3>

            <div className="space-y-3">
              {announcements.map((ann) => {
                const isRead = readAnnouncements[ann.id];
                return (
                  <div key={ann.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="font-bold text-slate-900">{ann.title}</div>
                    <p className="text-slate-600 line-clamp-3 leading-relaxed">{ann.content}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{ann.authorName}</span>
                      {isRead ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Đã đọc
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkRead(ann.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors"
                        >
                          Tôi đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Teacher Modal */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        title="Gửi tin nhắn trao đổi với Giáo viên chủ nhiệm"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <b>Người nhận:</b> Cô Nguyễn Thị Mai (GVCN Lớp 10A1)
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung trao đổi *</label>
            <textarea
              rows={4}
              required
              value={msgContent}
              onChange={(e) => setMsgContent(e.target.value)}
              placeholder="Kính gửi cô giáo, tôi là phụ huynh của em Nam, tôi muốn trao đổi về..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsContactOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Gửi tin nhắn
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
