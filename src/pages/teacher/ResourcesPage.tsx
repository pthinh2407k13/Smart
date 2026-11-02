import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Download,
  Star,
  Plus,
  Search,
  Video,
  FileCode,
  Share2,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { LearningResource } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';
import { Modal } from '../../components/ui/Modal';

export const ResourcesPage: React.FC = () => {
  const { showToast } = useToast();
  const [resources, setResources] = useState<LearningResource[]>(() => dbService.getState().resources);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PDF' | 'PPTX' | 'VIDEO'>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [resType, setResType] = useState<'PDF' | 'PPTX' | 'VIDEO'>('PDF');

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.chapter.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleToggleFavorite = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
    showToast('Đã cập nhật mục tài liệu yêu thích', 'info');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRes: LearningResource = {
      id: `res_${Date.now()}`,
      title,
      subjectName: 'Toán học',
      gradeLevel: 10,
      chapter: chapter || 'Tài liệu tham khảo chung',
      type: resType,
      fileUrl: '#',
      fileSize: '3.5 MB',
      uploadedBy: 'Cô Nguyễn Thị Mai',
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      isFavorite: false,
    };

    setResources([newRes, ...resources]);
    showToast('Đã tải lên học liệu thành công!', 'success');
    setIsUploadOpen(false);
    setTitle('');
    setChapter('');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-cyan-400" />
            Học Liệu & Bài Giảng Số
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Thư viện số lưu trữ tài liệu PDF, Slide thuyết trình PPTX, Video và giáo án điện tử
          </p>
        </div>

        {/* Màu xanh cho Tải lên mới */}
        <Button
          variant="success"
          size="md"
          onClick={() => setIsUploadOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tải lên tài liệu mới
        </Button>
      </div>

      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên bài giảng, chuyên đề..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl text-xs font-bold border border-cyan-500/30">
          {(['ALL', 'PDF', 'PPTX', 'VIDEO'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === t ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 hover:border-cyan-400/60 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={res.type === 'PDF' ? 'rose' : res.type === 'PPTX' ? 'amber' : 'purple'}
                  size="sm"
                >
                  {res.type}
                </Badge>
                <button
                  onClick={() => handleToggleFavorite(res.id)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    res.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              <h4 className="font-extrabold text-sm text-white line-clamp-2">{res.title}</h4>
              <p className="text-xs text-slate-300">{res.chapter}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-cyan-500/10">
                <span>{res.fileSize}</span>
                <span>Tải: {res.downloadCount} lượt</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Bởi: {res.uploadedBy}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast(`Đang tải file: ${res.title}...`, 'info')}
                icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Tải xuống
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Tải lên học liệu mới">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Tên tài liệu / Bài giảng *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giáo án Chuyên đề 2: Bất đẳng thức Cauchy"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Định dạng file</label>
              <select
                value={resType}
                onChange={(e) => setResType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="PDF">Tài liệu PDF</option>
                <option value="PPTX">Bài trình chiếu PowerPoint (PPTX)</option>
                <option value="VIDEO">Video bài giảng</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Chương / Mục</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="VD: Chương 2: Bất đẳng thức"
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu / Tải lên */}
            <Button variant="success" size="sm" type="submit">
              Lưu học liệu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
