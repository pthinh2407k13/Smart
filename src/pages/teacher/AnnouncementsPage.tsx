import React, { useState } from 'react';
import { Bell, Plus, Search, Send, Clock, User } from 'lucide-react';
import { dbService } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { Announcement } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchBox } from '../../components/ui/SearchBox';

export const AnnouncementsPage: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    dbService.getAnnouncements()
  );
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'STUDENT' | 'PARENT'>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const created = dbService.createAnnouncement({
      schoolId: 'school_01',
      title,
      content,
      authorName: 'Cô Nguyễn Thị Mai',
      authorRole: 'TEACHER',
      targetRole,
      priority,
    });

    setAnnouncements(dbService.getAnnouncements());
    setIsCreateOpen(false);
    setTitle('');
    setContent('');
    showToast(`Đã phát hành thông báo: "${created.title}"`, 'success');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Bảng Tin & Thông Báo Lớp Học
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Gửi thông báo tới toàn trường, giáo viên, học sinh hoặc kênh riêng phụ huynh
          </p>
        </div>

        {/* Màu xanh cho Đăng thông báo */}
        <Button
          variant="success"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Đăng thông báo mới
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm thông báo..."
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Badge
                  variant={
                    ann.priority === 'URGENT'
                      ? 'rose'
                      : ann.priority === 'HIGH'
                      ? 'amber'
                      : 'blue'
                  }
                  size="sm"
                >
                  {ann.priority === 'URGENT'
                    ? 'Khẩn'
                    : ann.priority === 'HIGH'
                    ? 'Quan trọng'
                    : 'Thông thường'}
                </Badge>
                <Badge variant="slate" size="sm">
                  Đối tượng: {ann.targetRole === 'ALL' ? 'Toàn bộ' : ann.targetRole}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{ann.createdAt}</span>
              </div>
            </div>

            <h3 className="font-extrabold text-base text-white">{ann.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{ann.content}</p>

            <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Người gửi: <b className="text-cyan-300">{ann.authorName}</b>
              </span>
              <span className="text-[11px] text-slate-400">Đã gửi tới phụ huynh & học sinh</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Đăng thông báo mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kế hoạch ôn tập kiểm tra giữa học kỳ II"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Đối tượng nhận</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="ALL">Toàn thể lớp học</option>
                <option value="STUDENT">Chỉ Học sinh</option>
                <option value="PARENT">Chỉ Phụ huynh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="NORMAL">Thông thường</option>
                <option value="HIGH">Quan trọng</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Nội dung thông báo *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung đầy đủ của thông báo..."
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu / Phát hành */}
            <Button variant="success" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Phát hành thông báo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
