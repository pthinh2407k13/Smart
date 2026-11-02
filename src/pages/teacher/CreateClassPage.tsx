import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';

export const CreateClassPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [gradeLevelId, setGradeLevelId] = useState('10');
  const [roomNumber, setRoomNumber] = useState('');
  const [homeroomTeacherName, setHomeroomTeacherName] = useState('Cô Nguyễn Thị Mai');
  const [themeColor, setThemeColor] = useState('#06B6D4');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    { name: 'Xanh Cyan', hex: '#06B6D4' },
    { name: 'Xanh Dương', hex: '#2563EB' },
    { name: 'Tím', hex: '#7C3AED' },
    { name: 'Xanh ngọc', hex: '#059669' },
    { name: 'Cam hổ phách', hex: '#D97706' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên lớp học', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = dbService.createClass({
        schoolId: 'school_01',
        name,
        gradeLevelId,
        academicYearId: 'ay_2024_2025',
        roomNumber: roomNumber || 'Chưa xếp phòng',
        homeroomTeacherId: 'u_teacher_01',
        homeroomTeacherName,
        themeColor,
        description,
        inviteCode,
        isArchived: false,
      });

      dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'TẠO_LỚP_MỚI', created.name, 'Đã tạo lớp mới thành công');
      showToast(`Đã tạo thành công lớp ${created.name}!`, 'success');
      setSelectedClassId(created.id);
      navigate(`/teacher/classes/${created.id}`);
    } catch (e) {
      showToast('Lỗi khi tạo lớp', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/classes')}
          icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Tạo Lớp Học Mới</h1>
          <p className="text-xs text-cyan-300/80">Khởi tạo không gian số quản lý lớp học và kết nối học sinh</p>
        </div>
      </div>

      {/* Form card in Dark Navy with Cyan Border */}
      <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-xl shadow-cyan-950/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1.5">
                Tên lớp học <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Lớp 10A3 (Chuyên Hóa)"
                required
                className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1.5">
                Khối lớp <span className="text-rose-400">*</span>
              </label>
              <select
                value={gradeLevelId}
                onChange={(e) => setGradeLevelId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-medium"
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1.5">
                Phòng học / Địa điểm
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="VD: Phòng 304 - Dãy Nhà A"
                className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1.5">
                Giáo viên chủ nhiệm
              </label>
              <input
                type="text"
                value={homeroomTeacherName}
                onChange={(e) => setHomeroomTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-medium"
              />
            </div>
          </div>

          {/* Theme Color Selection */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-2">
              Màu sắc đại diện lớp
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setThemeColor(c.hex)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    themeColor === c.hex ? 'ring-2 ring-offset-2 ring-cyan-400 ring-offset-[#0D152A] scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5">
              Mô tả / Giới thiệu mục tiêu lớp
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Lớp định hướng thi học sinh giỏi cấp Thành phố và chứng chỉ Quốc tế..."
              className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5 flex items-center justify-between">
              <span>Mã mời tham gia lớp</span>
              <button
                type="button"
                onClick={() => setInviteCode(Math.random().toString(36).substring(2, 8).toUpperCase())}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer text-xs"
              >
                Tạo mã ngẫu nhiên khác
              </button>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm font-mono font-bold text-cyan-300 tracking-wider"
            />
          </div>

          <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/teacher/classes')}
            >
              Hủy bỏ
            </Button>
            {/* Màu xanh cho Tạo / Lưu */}
            <Button
              type="submit"
              variant="success"
              size="md"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
            >
              Tạo và lưu lớp học
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
