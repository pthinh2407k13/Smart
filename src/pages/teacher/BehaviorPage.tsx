import React, { useState } from 'react';
import {
  Shield,
  Smile,
  Frown,
  Plus,
  Search,
  Calendar,
  User,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { BehaviorRecord, Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchBox } from '../../components/ui/SearchBox';

export const BehaviorPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents(classId));
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(() =>
    dbService.getBehaviors(undefined, classId)
  );
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'POSITIVE' | 'NEED_IMPROVEMENT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState<'POSITIVE' | 'NEED_IMPROVEMENT'>('POSITIVE');
  const [points, setPoints] = useState(5);
  const [category, setCategory] = useState<'Học tập' | 'Kỷ luật' | 'Văn thể mỹ' | 'Giúp đỡ bạn'>('Học tập');
  const [content, setContent] = useState('');

  const filtered = behaviors.filter((b) => {
    const matchSearch = b.studentName.toLowerCase().includes(search.toLowerCase()) || b.content.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || b.type === filterType;
    return matchSearch && matchType;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !content.trim()) return;
    const targetStudent = students.find((s) => s.id === studentId);

    const created = dbService.addBehavior({
      studentId,
      studentName: targetStudent?.fullName || 'Học sinh',
      classId,
      type,
      content,
      points: type === 'POSITIVE' ? Math.abs(points) : -Math.abs(points),
      recordedBy: 'Cô Nguyễn Thị Mai',
      category,
    });

    setBehaviors(dbService.getBehaviors(undefined, classId));
    setIsModalOpen(false);
    setContent('');
    showToast(`Đã ghi nhận nề nếp cho ${created.studentName}`, 'success');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Theo Dõi Hành Vi & Nề Nếp
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Ghi nhận việc chấp hành nội quy, phát biểu tích cực và nhắc nhở nề nếp học đường
          </p>
        </div>

        {/* Màu xanh cho Thêm mới */}
        <Button
          variant="success"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Ghi nhận hành vi mới
        </Button>
      </div>

      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên học sinh, nội dung..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl text-xs font-bold border border-cyan-500/30">
          {(['ALL', 'POSITIVE', 'NEED_IMPROVEMENT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === t ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'POSITIVE' ? 'Khen thưởng' : 'Nhắc nhở'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
              b.type === 'POSITIVE'
                ? 'bg-[#0D152A] border-emerald-500/40 hover:border-emerald-400'
                : 'bg-[#0D152A] border-rose-500/40 hover:border-rose-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  b.type === 'POSITIVE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {b.type === 'POSITIVE' ? <Smile className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{b.studentName}</span>
                  <Badge variant="slate" size="sm">
                    {b.category}
                  </Badge>
                  <span className="text-xs text-slate-400">• Ngày {b.date}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{b.content}</p>
                <div className="text-[10px] text-slate-400 mt-1">Ghi nhận bởi: {b.recordedBy}</div>
              </div>
            </div>

            <div
              className={`font-black text-sm px-3 py-1 rounded-xl shrink-0 border ${
                b.type === 'POSITIVE' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-rose-950 text-rose-300 border-rose-500/50'
              }`}
            >
              {b.points > 0 ? `+${b.points}` : b.points} điểm
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ghi nhận nề nếp / hành vi">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Chọn Học sinh *</label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Tính chất</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="POSITIVE">Khen ngợi / Tích cực</option>
                <option value="NEED_IMPROVEMENT">Nhắc nhở / Kỷ luật</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="Học tập">Học tập</option>
                <option value="Kỷ luật">Kỷ luật</option>
                <option value="Văn thể mỹ">Văn thể mỹ</option>
                <option value="Giúp đỡ bạn">Giúp đỡ bạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Nội dung chi tiết *</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="VD: Chủ động hỗ trợ dọn dẹp phòng thực hành..."
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu */}
            <Button variant="success" size="sm" type="submit">
              Lưu ghi nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
