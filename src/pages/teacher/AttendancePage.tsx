import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Calendar,
  Save,
  Clock,
  History,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { AttendanceStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';

export const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number>(1);
  const [sessionType, setSessionType] = useState<'Sáng' | 'Chiều'>('Sáng');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState(() => dbService.getStudents(classId));
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(true);

  // Sync students when classId changes
  useEffect(() => {
    const list = dbService.getStudents(classId);
    setStudents(list);
    const existingSession = dbService
      .getAttendanceSessions(classId)
      .find((s) => s.date === date && s.period === period);

    const initialStatus: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    list.forEach((s) => {
      const match = existingSession?.records.find((r) => r.studentId === s.id);
      initialStatus[s.id] = match ? match.status : 'PRESENT';
      if (match?.note) initialNotes[s.id] = match.note;
    });

    setStatusMap(initialStatus);
    setNoteMap(initialNotes);
    setIsSaved(true);
  }, [classId, date, period]);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(statusMap).filter((st) => st === 'PRESENT').length;
  const excusedCount = Object.values(statusMap).filter((st) => st === 'EXCUSED').length;
  const unexcusedCount = Object.values(statusMap).filter((st) => st === 'UNEXCUSED').length;
  const lateCount = Object.values(statusMap).filter((st) => st === 'LATE').length;
  const earlyCount = Object.values(statusMap).filter((st) => st === 'EARLY_LEAVE').length;

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENT';
    });
    setStatusMap(updated);
    setIsSaved(false);
    showToast('Đã đánh dấu tất cả có mặt. Bấm Lưu để chốt dữ liệu.', 'info');
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNoteMap((prev) => ({ ...prev, [studentId]: note }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const targetClass = classes.find((c) => c.id === classId) || classes[0];
    const records = students.map((s, idx) => ({
      id: `ar_${Date.now()}_${idx}`,
      sessionId: `att_${classId}_${date}_p${period}`,
      studentId: s.id,
      studentName: s.fullName,
      studentCode: s.studentCode,
      status: statusMap[s.id] || 'PRESENT',
      note: noteMap[s.id] || undefined,
      updatedAt: new Date().toISOString(),
    }));

    dbService.saveAttendanceSession({
      id: `att_${classId}_${date}_p${period}`,
      classId,
      date,
      period,
      sessionType,
      teacherId: 'u_teacher_01',
      teacherName: 'Cô Nguyễn Thị Mai',
      totalStudents: students.length,
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      earlyLeaveCount: earlyCount,
      isLocked: false,
      records,
    });

    dbService.logAudit(
      'Cô Nguyễn Thị Mai',
      'TEACHER',
      'LƯU_ĐIỂM_DANH',
      targetClass?.name || classId,
      `Điểm danh: ${presentCount} có mặt, ${excusedCount} phép, ${lateCount} muộn, ${unexcusedCount} không phép.`
    );

    setIsSaved(true);
    showToast(`Đã lưu thành công sổ điểm danh lớp ${targetClass?.name}!`, 'success');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            Sổ Điểm Danh Lớp Học
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Ghi nhận chính xác tình hình hiện diện, lý do vắng và đồng bộ tới phụ huynh tức thì
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
            ✓ Đánh dấu tất cả có mặt
          </Button>
          {/* Màu xanh cho Lưu */}
          <Button
            variant="success"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            Lưu điểm danh
          </Button>
        </div>
      </div>

      {/* Filter / Session bar */}
      <div className="bg-[#0D152A] p-5 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-cyan-300 mb-1">Chọn Lớp học *</label>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSelectedClassId(e.target.value);
            }}
            className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-300 mb-1">Ngày điểm danh *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-300 mb-1">Tiết học</label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            <option value={1}>Tiết 1 (07:15 - 08:00)</option>
            <option value={2}>Tiết 2 (08:05 - 08:50)</option>
            <option value={3}>Tiết 3 (09:05 - 09:50)</option>
            <option value={4}>Tiết 4 (09:55 - 10:40)</option>
            <option value={5}>Tiết 5 (10:45 - 11:30)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-300 mb-1">Buổi</label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="Sáng">Buổi Sáng</option>
            <option value="Chiều">Buổi Chiều</option>
          </select>
        </div>
      </div>

      {/* General Session Note Input */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md flex items-center gap-3">
        <span className="text-xs font-bold text-cyan-300 whitespace-nowrap">
          Ghi chú buổi học:
        </span>
        <input
          type="text"
          placeholder="Nhập ghi chú chung cho buổi điểm danh này (VD: Lớp nghỉ học sớm do thời tiết, sĩ số đủ...)"
          className="flex-1 px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Realtime KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Có mặt</span>
          <div className="text-2xl font-black text-emerald-300 mt-0.5">{presentCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-center">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Vắng có phép</span>
          <div className="text-2xl font-black text-cyan-300 mt-0.5">{excusedCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Đi muộn</span>
          <div className="text-2xl font-black text-amber-300 mt-0.5">{lateCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Vắng không phép</span>
          <div className="text-2xl font-black text-rose-300 mt-0.5">{unexcusedCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-purple-400 uppercase">Về sớm</span>
          <div className="text-2xl font-black text-purple-300 mt-0.5">{earlyCount}</div>
        </div>
      </div>

      {/* Search Student in list */}
      <div className="flex items-center justify-between">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm học sinh theo tên hoặc mã..."
          className="w-full sm:max-w-xs"
        />
        {!isSaved && (
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/40 animate-pulse">
            ● Có thay đổi chưa lưu
          </span>
        )}
      </div>

      {/* Student Attendance List */}
      <div className="space-y-3">
        {filteredStudents.map((stu, index) => {
          const currentStatus = statusMap[stu.id] || 'PRESENT';
          return (
            <div
              key={stu.id}
              className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 shadow-md shadow-cyan-950/40 space-y-3 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-xs text-slate-400">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {stu.studentCode}
                  </span>
                  <img
                    src={stu.avatarUrl}
                    alt={stu.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
                  />
                  <div>
                    <div className="font-bold text-sm text-white">{stu.fullName}</div>
                    <div className="text-[10px] text-slate-400">
                      Tổ {stu.groupNumber || 1} • Tỉ lệ dự lớp: {stu.attendanceRate}%
                    </div>
                  </div>
                </div>

                {/* 5 Status Options */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { key: 'PRESENT', label: 'Có mặt', activeClass: 'bg-emerald-600 text-white border-emerald-400 font-bold' },
                      { key: 'EXCUSED', label: 'Có phép', activeClass: 'bg-cyan-600 text-white border-cyan-400 font-bold' },
                      { key: 'LATE', label: 'Đi muộn', activeClass: 'bg-amber-600 text-white border-amber-400 font-bold' },
                      { key: 'UNEXCUSED', label: 'Không phép', activeClass: 'bg-rose-600 text-white border-rose-400 font-bold' },
                      { key: 'EARLY_LEAVE', label: 'Về sớm', activeClass: 'bg-purple-600 text-white border-purple-400 font-bold' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleStatusChange(stu.id, option.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        currentStatus === option.key
                          ? `${option.activeClass} shadow-xs scale-102`
                          : 'bg-[#080E20] border-cyan-500/20 text-slate-400 hover:text-white hover:border-cyan-400/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note input if exception */}
              {currentStatus !== 'PRESENT' && (
                <div className="pt-2 border-t border-cyan-500/20 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-cyan-300 whitespace-nowrap">
                    Lý do / Ghi chú:
                  </span>
                  <input
                    type="text"
                    value={noteMap[stu.id] || ''}
                    onChange={(e) => handleNoteChange(stu.id, e.target.value)}
                    placeholder="VD: Phụ huynh xin phép ốm, kẹt xe muộn 15p..."
                    className="flex-1 px-3 py-1 bg-[#080E20] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Save Bar in Dark Navy */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#070D1E]/95 backdrop-blur-md border-t border-cyan-500/30 px-6 py-3.5 shadow-2xl flex items-center justify-between lg:pl-72">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-white">
            Tổng cộng: {students.length} học sinh
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-semibold">{presentCount} có mặt</span>
          <span className="text-rose-400 font-semibold">{unexcusedCount + excusedCount} vắng</span>
        </div>

        {/* Màu xanh cho Lưu */}
        <Button
          variant="success"
          size="md"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
          className="font-bold shadow-md"
        >
          Lưu sổ điểm danh
        </Button>
      </div>
    </div>
  );
};
