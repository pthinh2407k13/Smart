import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Send,
  Eye,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Assignment, Submission } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';
import { Modal } from '../../components/ui/Modal';

export const AssignmentsListPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { showToast } = useToast();

  const [classFilter, setClassFilter] = useState(selectedClassId || 'ALL');
  const [assignments, setAssignments] = useState<Assignment[]>(() => dbService.getAssignments());
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [search, setSearch] = useState('');

  // Grading modal
  const [activeAsg, setActiveAsg] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('9.0');
  const [gradeFeedback, setGradeFeedback] = useState<string>('Bài làm tốt!');

  // Create Assignment modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('2025-03-05 23:59');
  const [newTargetClass, setNewTargetClass] = useState(selectedClassId || classes[0]?.id || '');

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setAssignments(dbService.getAssignments());
    });
    return unsub;
  }, []);

  const filtered = assignments.filter((a) => {
    const matchClass = classFilter === 'ALL' || a.classId === classFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  const handleOpenGrading = (asg: Assignment) => {
    setActiveAsg(asg);
    const subs = dbService.getSubmissions(asg.id);
    setSubmissions(subs);
    setSelectedSub(subs[0] || null);
    if (subs[0]?.score) setGradeScore(String(subs[0].score));
    if (subs[0]?.feedback) setGradeFeedback(subs[0].feedback);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    const scoreNum = parseFloat(gradeScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      showToast('Điểm số phải từ 0 đến 10', 'warning');
      return;
    }

    dbService.gradeSubmission(selectedSub.id, scoreNum, gradeFeedback, 'Cô Nguyễn Thị Mai');
    if (activeAsg) {
      setSubmissions(dbService.getSubmissions(activeAsg.id));
    }
    showToast(`Đã lưu điểm ${scoreNum} cho học sinh ${selectedSub.studentName}`, 'success');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const targetClassObj = classes.find((c) => c.id === newTargetClass) || classes[0];

    dbService.createAssignment({
      classId: targetClassObj.id,
      className: targetClassObj.name,
      title: newTitle,
      description: newDesc || 'Hoàn thành các bài tập theo nội dung đã học trên lớp.',
      subjectId: 'sub_toan',
      subjectName: 'Toán học',
      teacherId: 'u_teacher_01',
      teacherName: 'Cô Nguyễn Thị Mai',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      maxScore: 10,
      status: 'ACTIVE',
      targetGroup: 'ALL',
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    showToast('Đã tạo và công bố bài tập mới!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Quản Lý Bài Tập & Nhiệm Vụ
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Giao bài tập, đôn đốc học sinh nộp bài và chấm điểm kèm phản hồi chi tiết
          </p>
        </div>

        {/* Màu xanh cho Giao bài tập */}
        <Button
          variant="success"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Giao bài tập mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tiêu đề bài tập..."
            className="w-full sm:max-w-xs"
          />

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl text-xs font-bold border border-cyan-500/30">
          {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang giao' : 'Đã đóng'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments list */}
      <div className="space-y-4">
        {filtered.map((asg) => (
          <div
            key={asg.id}
            className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 hover:border-cyan-400/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <Badge variant="blue" size="sm">
                  {asg.className}
                </Badge>
                <Badge variant={asg.status === 'ACTIVE' ? 'emerald' : 'slate'} size="sm">
                  {asg.status === 'ACTIVE' ? 'Đang mở nộp bài' : 'Đã kết thúc'}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">
                  Giao ngày: {asg.assignedDate}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-white">{asg.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                {asg.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Hạn nộp: {asg.dueDate}
                </span>
                <span>•</span>
                <span>Thang điểm: <b className="text-white">{asg.maxScore}</b></span>
              </div>
            </div>

            <div className="flex md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-cyan-500/20">
              <div className="text-right">
                <div className="text-xs text-slate-400">
                  Đã nộp: <b className="text-white font-bold">{asg.submissionCount} HS</b>
                </div>
                <div className="text-xs text-cyan-300 font-semibold">
                  Đã chấm: {asg.gradedCount} bài
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenGrading(asg)}
                icon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Chấm bài ({asg.submissionCount})
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: GRADING INTERFACE */}
      {activeAsg && (
        <Modal
          isOpen={!!activeAsg}
          onClose={() => setActiveAsg(null)}
          title={`Chấm bài: ${activeAsg.title}`}
          maxWidth="2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left list of submissions */}
            <div className="border border-cyan-500/30 rounded-xl p-3 bg-[#080E20] space-y-2 max-h-96 overflow-y-auto">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                Danh sách bài đã nộp ({submissions.length})
              </div>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Chưa có học sinh nào nộp bài.</p>
              ) : (
                submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      if (sub.score) setGradeScore(String(sub.score));
                      if (sub.feedback) setGradeFeedback(sub.feedback);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors border cursor-pointer ${
                      selectedSub?.id === sub.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-[#0D152A] border-cyan-500/20 text-slate-300 hover:bg-[#121E3C]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{sub.studentName}</span>
                      {sub.score !== undefined ? (
                        <span className="font-black text-cyan-400">{sub.score}đ</span>
                      ) : (
                        <span className="text-[10px] text-amber-400">Chưa chấm</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sub.submittedAt}</div>
                  </button>
                ))
              )}
            </div>

            {/* Right details & scoring form */}
            <div className="md:col-span-2 space-y-4">
              {selectedSub ? (
                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#080E20] border border-cyan-500/30 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{selectedSub.studentName} ({selectedSub.studentCode})</span>
                      <Badge variant="blue" size="sm">Nộp: {selectedSub.submittedAt}</Badge>
                    </div>
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">{selectedSub.content}</p>
                    {selectedSub.files && selectedSub.files.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                        <FileText className="w-4 h-4" />
                        <span>{selectedSub.files[0].name} ({selectedSub.files[0].size})</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-cyan-300 mb-1">Điểm số (0 - 10) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        required
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className="w-full px-3 py-2 bg-[#070D1E] border border-cyan-500/40 rounded-xl text-sm font-extrabold text-cyan-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-300 mb-1">Lời nhận xét của Giáo viên</label>
                    <textarea
                      rows={3}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="VD: Trình bày bài mạch lạc, lập luận chính xác..."
                      className="w-full px-3 py-2 bg-[#070D1E] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setActiveAsg(null)}>
                      Đóng
                    </Button>
                    {/* Màu xanh cho Lưu điểm */}
                    <Button variant="success" size="sm" type="submit">
                      Lưu điểm & Trả bài
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Chọn một học sinh từ danh sách bên trái để chấm điểm
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Giao bài tập mới cho học sinh"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Giao cho Lớp *</label>
            <select
              value={newTargetClass}
              onChange={(e) => setNewTargetClass(e.target.value)}
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="VD: Chuyên đề 4: Phương trình vô tỷ"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Hạn nộp bài</label>
            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Yêu cầu & Nội dung</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Yêu cầu chi tiết về bài tập..."
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu / Giao bài */}
            <Button variant="success" size="sm" type="submit">
              Giao bài tập ngay
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
