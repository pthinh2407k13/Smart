import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  QrCode,
  LayoutGrid,
  List,
  ChevronDown,
  CheckSquare,
  BookOpen,
  BarChart3,
  Award,
  Calendar,
  FileText,
  Sparkles,
  Edit2,
  Home,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { ClassRoom } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';

export const ClassesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<ClassRoom[]>(() => dbService.getClasses());
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<'ALL' | '10' | '11' | '12'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'my_classes' | 'add_class'>('my_classes');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setClasses(dbService.getClasses());
    });
    return unsub;
  }, []);

  const filteredClasses = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.inviteCode.toLowerCase().includes(search.toLowerCase());
    const matchGrade = filterGrade === 'ALL' || c.gradeLevelId === filterGrade;
    return matchSearch && matchGrade;
  });

  const handleDelete = () => {
    if (!deleteId) return;
    const target = classes.find((c) => c.id === deleteId);
    dbService.deleteClass(deleteId);
    dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'XÓA_LỚP', target?.name || deleteId, 'Đã xóa lớp học');
    showToast('Đã xóa lớp học thành công', 'success');
    setDeleteId(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã tham gia: ${code}`, 'success');
  };

  return (
    <div className="class-management-container space-y-6">
      {/* Top Header & Top Right Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Quản Lý Lớp Học</h1>
          <p className="text-xs text-cyan-300/80 mt-0.5">Danh sách các lớp học phần công tác giảng dạy</p>
        </div>

        {/* Top Right Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/teacher/classes/create')}
          icon={<Plus className="w-4 h-4" />}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-950/60"
        >
          Thêm
        </Button>
      </div>

      {/* Sub-tabs bar matching image: [Lớp của tôi 4] | [+ Thêm] */}
      <div className="flex items-center gap-6 border-b border-cyan-500/30 pb-0 pt-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('my_classes');
          }}
          className={`relative pb-3 flex items-center gap-2.5 font-bold text-sm transition-colors cursor-pointer ${
            activeTab === 'my_classes' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Lớp tôi</span>
          <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full text-xs font-black border border-cyan-500/30">
            {classes.length}
          </span>
          {activeTab === 'my_classes' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-glow" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('add_class');
            navigate('/teacher/classes/create');
          }}
          className="pb-3 flex items-center gap-2 font-medium text-sm text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-400" />
          <span>Thêm</span>
        </button>
      </div>

      {/* Filter and Search Bar matching image */}
      <div className="bg-[#0D152A] p-3.5 px-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="w-full sm:max-w-md">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Tìm lớp..."
              className="w-full bg-[#080E20] border-cyan-500/40 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#080E20] px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 border border-cyan-500/40 shrink-0">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value as any)}
              className="bg-transparent border-none text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#080E20] text-white">Tất cả 12 khối lớp</option>
              <option value="10" className="bg-[#080E20] text-white">Khối 10</option>
              <option value="11" className="bg-[#080E20] text-white">Khối 11</option>
              <option value="12" className="bg-[#080E20] text-white">Khối 12</option>
            </select>
          </div>
        </div>

        {/* View mode toggle icons matching image */}
        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl border border-cyan-500/30 self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Danh sách"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Classes list */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          title="Không tìm thấy lớp học nào"
          description="Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút 'Thêm mới lớp' để thêm lớp học vào hệ thống."
          actionText="Thêm mới lớp"
          onAction={() => navigate('/teacher/classes/create')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls, index) => {
            const colors = ['#06B6D4', '#A855F7', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899'];
            const dotColor = cls.themeColor || colors[index % colors.length];

            return (
              <div
                key={cls.id}
                className={`bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40 hover:border-cyan-400 hover:shadow-cyan-900/40 transition-all flex flex-col justify-between ${
                  cls.isArchived ? 'opacity-60 bg-[#080E20]' : ''
                }`}
              >
                <div>
                  <div className="p-4 space-y-3">
                    {/* Top Row: Dot + Class Name + Invite code badge + Edit + Delete on 1 single line */}
                    <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: dotColor }}
                        />
                        <h3 className="font-extrabold text-sm text-white truncate" title={cls.name}>
                          {cls.name}
                        </h3>
                        {cls.isArchived && <Badge variant="slate" size="sm">Lưu trữ</Badge>}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Invite Code badge */}
                        <button
                          onClick={() => handleCopyCode(cls.inviteCode)}
                          className="flex items-center gap-1 font-mono text-[11px] font-bold text-cyan-300 bg-[#080E20] border border-cyan-500/40 px-2 py-1 rounded-lg hover:border-cyan-400 transition-colors cursor-pointer whitespace-nowrap"
                          title="Bấm để sao chép mã tham gia"
                        >
                          <QrCode className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{cls.inviteCode}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-400 ml-0.5 shrink-0" />
                        </button>

                        {/* Edit icon */}
                        <button
                          onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                          className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Chỉnh sửa lớp"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete icon */}
                        <button
                          onClick={() => setDeleteId(cls.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Xóa lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: ultra-minimal values separated by dots */}
                    <div className="text-xs text-slate-300 flex items-center gap-2 pt-1.5 border-t border-cyan-500/10 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="font-bold text-white">{cls.roomNumber || 'A.302'}</span>
                      <span className="text-cyan-500">·</span>
                      <span className="font-bold text-cyan-300">{cls.studentCount} HS</span>
                      <span className="text-cyan-500">·</span>
                      <span className="font-bold text-white truncate">Cô Ngư</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Vào lớp > */}
                <div className="px-4 py-2 bg-[#080E20] border-t border-cyan-500/20 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      navigate(`/teacher/classes/${cls.id}`);
                    }}
                    className="w-full flex items-center justify-between text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer group py-0.5"
                  >
                    <span>Vào lớp</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">›</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
              <tr>
                <th className="py-3 px-4">Tên lớp</th>
                <th className="py-3 px-4">Khối</th>
                <th className="py-3 px-4">Phòng học</th>
                <th className="py-3 px-4">Sĩ số</th>
                <th className="py-3 px-4">Mã mời</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
              {filteredClasses.map((cls, idx) => (
                <tr key={cls.id} className="hover:bg-cyan-950/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cls.themeColor || '#06B6D4' }}
                      />
                      <span>{cls.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">Khối {cls.gradeLevelId}</td>
                  <td className="py-3 px-4 text-slate-300">{cls.roomNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant="blue" size="sm">
                      {cls.studentCount} HS
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">{cls.inviteCode}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteId(cls.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          navigate(`/teacher/classes/${cls.id}`);
                        }}
                      >
                        Vào không gian làm việc chính
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa lớp học"
        message="Bạn có chắc chắn muốn xóa lớp học này không?"
        confirmText="Xóa vĩnh viễn"
        variant="danger"
      />
    </div>
  );
};
