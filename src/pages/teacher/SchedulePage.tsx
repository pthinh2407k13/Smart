import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Edit3,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Download,
  Save,
  Plus,
  X,
  AlertCircle,
  Clock,
  Check,
  Upload,
  RefreshCw,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { ScheduleItem } from '../../types';
import { Button } from '../../components/ui/Button';

// Standard 7 days of the week definition
const ALL_WEEK_DAYS = [
  { id: 'd2', dayNumber: 2, label: 'Thứ 2' },
  { id: 'd3', dayNumber: 3, label: 'Thứ 3' },
  { id: 'd4', dayNumber: 4, label: 'Thứ 4' },
  { id: 'd5', dayNumber: 5, label: 'Thứ 5' },
  { id: 'd6', dayNumber: 6, label: 'Thứ 6' },
  { id: 'd7', dayNumber: 7, label: 'Thứ 7' },
  { id: 'd8', dayNumber: 8, label: 'Chủ nhật' },
];

export interface DayColumn {
  id: string;
  dayNumber: number;
  label: string;
}

export interface PeriodRow {
  id: string;
  periodNumber: number;
  label: string;
  startTime: string;
  endTime: string;
}

interface HistorySnapshot {
  days: DayColumn[];
  periods: PeriodRow[];
  grid: Record<string, string>;
}

export const SchedulePage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [currentClassId, setCurrentClassId] = useState<string>(
    selectedClassId || classes[0]?.id || 'class_10a1'
  );

  // Edit and Delete Modes
  const [isEditing, setIsEditing] = useState<boolean>(true); // Default to editing mode to match the mockup
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

  // Columns: Initial Mon - Fri (Thứ 2 - Thứ 6) as in screenshot
  const [days, setDays] = useState<DayColumn[]>([
    { id: 'd2', dayNumber: 2, label: 'Thứ 2' },
    { id: 'd3', dayNumber: 3, label: 'Thứ 3' },
    { id: 'd4', dayNumber: 4, label: 'Thứ 4' },
    { id: 'd5', dayNumber: 5, label: 'Thứ 5' },
    { id: 'd6', dayNumber: 6, label: 'Thứ 6' },
  ]);

  // Rows: Tiết 1 to Tiết 8 matching the mockup
  const [periods, setPeriods] = useState<PeriodRow[]>([
    { id: 'p1', periodNumber: 1, label: 'Tiết 1', startTime: '07:00', endTime: '07:45' },
    { id: 'p2', periodNumber: 2, label: 'Tiết 2', startTime: '07:45', endTime: '08:30' },
    { id: 'p3', periodNumber: 3, label: 'Tiết 3', startTime: '08:30', endTime: '09:15' },
    { id: 'p4', periodNumber: 4, label: 'Tiết 4', startTime: '09:15', endTime: '10:00' },
    { id: 'p5', periodNumber: 5, label: 'Tiết 5', startTime: '10:35', endTime: '11:20' },
    { id: 'p6', periodNumber: 6, label: 'Tiết 6', startTime: '11:25', endTime: '12:10' },
    { id: 'p7', periodNumber: 7, label: 'Tiết 7', startTime: '12:15', endTime: '13:00' },
    { id: 'p8', periodNumber: 8, label: 'Tiết 8', startTime: '13:05', endTime: '13:50' },
  ]);

  // Grid contents: key is `${periodId}_${dayId}`
  const [gridData, setGridData] = useState<Record<string, string>>(() => {
    // Initial mock values closely matching user screenshot
    return {
      'p1_d3': 'dsf',
      'p1_d4': 'dsfsdf',
      'p1_d5': 'dfsdf',
      'p2_d3': 'dsfsdf',
      'p2_d4': 'sdf',
      'p2_d5': 'sdfsdf',
      'p3_d2': 'fdsf',
      'p3_d3': 'sdfsd',
      'p3_d4': 'fdsfdsf',
      'p3_d5': 'dsfsdf',
      'p4_d2': 'dsfsdf',
      'p4_d3': 'dsfsdf',
      'p4_d4': 'sdfsdf',
      'p5_d2': 'dsfsd',
      'p5_d3': 'fsdf',
      'p5_d4': 'ssdfsddf',
      'p6_d2': 'dsfsdf',
      'p6_d3': 'sdfsdf',
      'p6_d4': 'sdfdsf',
      'p7_d2': 'sdfsdf',
      'p7_d3': 'sdf',
      'p7_d4': 'sdfsdf',
      'p8_d2': 'fsdf',
      'p8_d3': 'dsfsdf',
    };
  });

  // Undo / Redo History
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');

  // Record a history snapshot before state mutation
  const pushHistory = (
    newDays: DayColumn[] = days,
    newPeriods: PeriodRow[] = periods,
    newGrid: Record<string, string> = gridData
  ) => {
    const nextSnapshot: HistorySnapshot = {
      days: [...newDays],
      periods: [...newPeriods],
      grid: { ...newGrid },
    };
    const currentHistory = history.slice(0, historyIndex + 1);
    setHistory([...currentHistory, nextSnapshot]);
    setHistoryIndex(currentHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setDays(prev.days);
      setPeriods(prev.periods);
      setGridData(prev.grid);
      setHistoryIndex(historyIndex - 1);
      showToast('Đã hoàn tác thao tác trước', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setDays(next.days);
      setPeriods(next.periods);
      setGridData(next.grid);
      setHistoryIndex(historyIndex + 1);
      showToast('Đã làm lại thao tác', 'info');
    }
  };

  // Sync with selected class
  useEffect(() => {
    if (selectedClassId) {
      setCurrentClassId(selectedClassId);
    }
  }, [selectedClassId]);

  // Initialize history on mount
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ days, periods, grid: gridData }]);
      setHistoryIndex(0);
    }
  }, []);

  // --- Column operations ---
  // Cho phép user xóa cột khi bấm vào icon chữ X
  const handleDeleteColumn = (dayId: string) => {
    const dayToDelete = days.find((d) => d.id === dayId);
    if (!dayToDelete) return;

    if (days.length <= 1) {
      showToast('Không thể xóa hết tất cả các cột ngày trong tuần', 'warning');
      return;
    }

    const nextDays = days.filter((d) => d.id !== dayId);
    // remove grid cells of that column
    const nextGrid = { ...gridData };
    Object.keys(nextGrid).forEach((k) => {
      if (k.endsWith(`_${dayId}`)) {
        delete nextGrid[k];
      }
    });

    pushHistory(nextDays, periods, nextGrid);
    setDays(nextDays);
    setGridData(nextGrid);
    showToast(`Đã xóa cột ${dayToDelete.label}`, 'info');
  };

  // Cho phép user thêm cột thứ, 7, chủ nhật. Lúc này user muốn thêm tiếp thì báo msg Lỗi, tuần chỉ có 7 ngày.
  const handleAddDayColumn = () => {
    // Check if table already has all 7 days
    if (days.length >= 7) {
      showToast('Lỗi, tuần chỉ có 7 ngày.', 'error');
      return;
    }

    // Find the next day in the standard week sequence that is not yet in `days`
    const nextDayCandidate = ALL_WEEK_DAYS.find(
      (allDay) => !days.some((existing) => existing.id === allDay.id)
    );

    if (!nextDayCandidate) {
      showToast('Lỗi, tuần chỉ có 7 ngày.', 'error');
      return;
    }

    const nextDays = [...days, nextDayCandidate].sort((a, b) => a.dayNumber - b.dayNumber);
    pushHistory(nextDays, periods, gridData);
    setDays(nextDays);
    showToast(`Đã thêm cột ${nextDayCandidate.label}`, 'success');
  };

  // --- Row operations ---
  // Cho phép user xóa hàng khi bấm vào icon thùng rác
  const handleDeleteRow = (periodId: string) => {
    const periodToDelete = periods.find((p) => p.id === periodId);
    if (!periodToDelete) return;

    if (periods.length <= 1) {
      showToast('Không thể xóa hết tất cả các tiết học', 'warning');
      return;
    }

    const nextPeriods = periods.filter((p) => p.id !== periodId);
    // remove grid cells of that row
    const nextGrid = { ...gridData };
    Object.keys(nextGrid).forEach((k) => {
      if (k.startsWith(`${periodId}_`)) {
        delete nextGrid[k];
      }
    });

    pushHistory(days, nextPeriods, nextGrid);
    setPeriods(nextPeriods);
    setGridData(nextGrid);
    showToast(`Đã xóa ${periodToDelete.label}`, 'info');
  };

  // Ở dưới cùng có button [ Thêm tiết học mới]
  const handleAddPeriodRow = () => {
    const nextIndex = periods.length + 1;
    const newId = `p_${Date.now()}`;

    // Auto calculate approximate start/end time
    const lastPeriod = periods[periods.length - 1];
    let startTime = '14:00';
    let endTime = '14:45';

    if (lastPeriod) {
      const [endH, endM] = lastPeriod.endTime.split(':').map(Number);
      let newStartH = endH;
      let newStartM = endM + 10;
      if (newStartM >= 60) {
        newStartH += 1;
        newStartM -= 60;
      }
      let newEndH = newStartH;
      let newEndM = newStartM + 45;
      if (newEndM >= 60) {
        newEndH += 1;
        newEndM -= 60;
      }
      startTime = `${String(newStartH).padStart(2, '0')}:${String(newStartM).padStart(2, '0')}`;
      endTime = `${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`;
    }

    const newPeriod: PeriodRow = {
      id: newId,
      periodNumber: nextIndex,
      label: `Tiết ${nextIndex}`,
      startTime,
      endTime,
    };

    const nextPeriods = [...periods, newPeriod];
    pushHistory(days, nextPeriods, gridData);
    setPeriods(nextPeriods);
    showToast(`Đã thêm ${newPeriod.label} mới`, 'success');
  };

  // --- Cell Direct Editing & Cell Click Deletion ---
  const handleCellClick = (periodId: string, dayId: string) => {
    const cellKey = `${periodId}_${dayId}`;

    // Khi ở chế độ xóa, nhấp vào bất kỳ ô thời khóa biểu nào để xóa nội dung về -trống-
    if (isDeleteMode) {
      if (gridData[cellKey] && gridData[cellKey].trim() !== '') {
        const nextGrid = { ...gridData, [cellKey]: '' };
        pushHistory(days, periods, nextGrid);
        setGridData(nextGrid);
        showToast('Đã xóa nội dung ô về -trống-', 'info');
      }
    }
  };

  const handleCellChange = (periodId: string, dayId: string, value: string) => {
    const cellKey = `${periodId}_${dayId}`;
    setGridData((prev) => ({
      ...prev,
      [cellKey]: value,
    }));
  };

  const handleCellBlur = (periodId: string, dayId: string, value: string) => {
    const cellKey = `${periodId}_${dayId}`;
    pushHistory(days, periods, { ...gridData, [cellKey]: value });
  };

  // --- Save Timetable ---
  const handleSave = () => {
    // Convert grid data into ScheduleItem format
    const targetClass = classes.find((c) => c.id === currentClassId);
    const convertedSchedules: ScheduleItem[] = [];

    periods.forEach((period) => {
      days.forEach((day) => {
        const content = gridData[`${period.id}_${day.id}`];
        if (content && content.trim() !== '') {
          convertedSchedules.push({
            id: `sch_${currentClassId}_${day.dayNumber}_${period.periodNumber}`,
            classId: currentClassId,
            className: targetClass?.name || 'Lớp 10A1',
            dayOfWeek: (day.dayNumber >= 2 && day.dayNumber <= 7 ? day.dayNumber : 2) as any,
            period: period.periodNumber,
            subjectId: 'sub_custom',
            subjectName: content.split('\n')[0] || content,
            teacherName: targetClass?.homeroomTeacherName || 'Giáo viên phụ trách',
            room: targetClass?.roomNumber || 'Phòng 201',
            startTime: period.startTime,
            endTime: period.endTime,
          });
        }
      });
    });

    dbService.saveSchedules(currentClassId, convertedSchedules);
    showToast('Đã lưu thời khóa biểu thành công!', 'success');
  };

  // --- Export to CSV ---
  const handleExportCsv = () => {
    const headers = ['Tiết / Giờ', ...days.map((d) => d.label)];
    const rows = periods.map((p) => {
      const rowData = [
        `${p.label} (${p.startTime} - ${p.endTime})`,
        ...days.map((d) => {
          const val = gridData[`${p.id}_${d.id}`] || '';
          return `"${val.replace(/"/g, '""')}"`;
        }),
      ];
      return rowData.join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Thoi_Khoa_Bieu_${currentClassId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất thời khóa biểu thành công!', 'success');
  };

  // --- Import Sample or Excel Matrix ---
  const handleImportSubmit = () => {
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split('\n');
      const nextGrid: Record<string, string> = { ...gridData };

      lines.forEach((line, rIdx) => {
        if (rIdx < periods.length) {
          const cells = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
          cells.forEach((val, cIdx) => {
            if (cIdx < days.length) {
              const cleanVal = val.trim().replace(/^"|"$/g, '');
              if (cleanVal) {
                nextGrid[`${periods[rIdx].id}_${days[cIdx].id}`] = cleanVal;
              }
            }
          });
        }
      });

      pushHistory(days, periods, nextGrid);
      setGridData(nextGrid);
      setIsImportModalOpen(false);
      setImportText('');
      showToast('Đã import thời khóa biểu thành công!', 'success');
    } catch (e) {
      showToast('Định dạng dữ liệu không hợp lệ', 'error');
    }
  };

  const selectedClass = classes.find((c) => c.id === currentClassId);

  return (
    <div className="space-y-4 text-white">
      {/* Top Header & Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Thời Khóa Biểu
          </h1>
          <p className="text-xs text-cyan-300/80 mt-0.5">
            Quản lý và biên tập thời khóa biểu lớp học theo từng thứ, tiết và nội dung giảng dạy
          </p>
        </div>

        {/* Class Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Lớp:</span>
          <select
            value={currentClassId}
            onChange={(e) => {
              setCurrentClassId(e.target.value);
              setSelectedClassId(e.target.value);
            }}
            className="bg-[#0D152A] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-md"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTION TOOLBAR MATCHING SCREENSHOT EXACTLY */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#080E20] border border-cyan-500/30 shadow-lg shadow-cyan-950/40">
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút [ Đang chỉnh sửa ] / [ Chỉnh sửa ] */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isEditing
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/80 shadow-md shadow-cyan-950/60'
                : 'bg-[#0F1B36] text-slate-300 border-cyan-500/30 hover:border-cyan-400/50 hover:text-white'
            }`}
            title="Bật/Tắt chế độ chỉnh sửa trực tiếp trên lưới"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>{isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}</span>
          </button>

          {/* Nút [ Chế độ xóa: BẬT ] / [ Xóa ] */}
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                const next = !isDeleteMode;
                setIsDeleteMode(next);
                if (next) {
                  showToast('Chế độ xóa đã BẬT. Nhấp vào ô bất kỳ để xóa nội dung', 'warning');
                } else {
                  showToast('Đã tắt chế độ xóa ô', 'info');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isDeleteMode
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/80 shadow-md shadow-rose-950/60 animate-pulse-subtle'
                  : 'bg-[#0F1B36] text-rose-400 border-cyan-500/30 hover:border-rose-500/40 hover:bg-rose-950/20'
              }`}
              title="Nhấp để bật chế độ xóa ô nhanh"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>{isDeleteMode ? 'Chế độ xóa: BẬT' : 'Xóa'}</span>
            </button>
          )}

          {/* Nút [ Hoàn tác ] */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F1B36] border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-400/40 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
            <span>Hoàn tác</span>
          </button>

          {/* Nút [ Làm lại ] */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F1B36] border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-400/40 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
            <span>Làm lại</span>
          </button>

          {/* Nút [ Import Excel ] */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F1B36] border border-cyan-500/20 text-slate-200 hover:text-emerald-300 hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          {/* Nút [ Xuất thời khóa biểu ] */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F1B36] border border-cyan-500/20 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Xuất thời khóa biểu</span>
          </button>
        </div>

        {/* Nút [ Lưu ] (Màu xanh lá theo quy chuẩn) */}
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="md"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
            className="px-5 shadow-lg shadow-emerald-950/60 font-bold"
          >
            Lưu
          </Button>
        </div>
      </div>

      {/* ALERT BANNER: DELETE MODE ACTIVE (RED) */}
      {isEditing && isDeleteMode && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/30 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Chế độ xóa ô đang bật: Nhấp vào bất kỳ ô thời khóa biểu nào để xóa nội dung về{' '}
              <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 font-bold border border-rose-500/40 font-mono">
                -trống-
              </span>{' '}
              . Nhấp lại nút Xóa để thoát.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteMode(false)}
            className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs font-bold border border-rose-400/50 cursor-pointer shrink-0 transition-colors"
          >
            Đóng chế độ xóa
          </button>
        </div>
      )}

      {/* ALERT BANNER: EDIT MODE ACTIVE (CYAN) */}
      {isEditing && (
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2.5 shadow-lg shadow-cyan-950/30">
          <Edit3 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Chế độ chỉnh sửa đang bật: Nhấp trực tiếp vào ô để gõ bài học (nhấn Enter xuống dòng giống Word); hàng tự động giãn chiều cao đồng bộ. Nhớ nhấn{' '}
            <span className="text-emerald-400 font-bold">Lưu</span> khi hoàn thành.
          </span>
        </div>
      )}

      {/* TIMETABLE GRID CONTAINER */}
      <div className="bg-[#091024] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-950/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#070D1E] border-b border-cyan-500/30">
                {/* Column 1: Tiết / Giờ */}
                <th className="py-3.5 px-4 w-36 text-center text-cyan-300 font-bold tracking-wider uppercase border-r border-cyan-500/20">
                  Tiết / Giờ
                </th>

                {/* Day Columns */}
                {days.map((day) => (
                  <th
                    key={day.id}
                    className="py-3 px-3 text-center text-cyan-300 font-bold border-r border-cyan-500/20 min-w-[130px]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-cyan-200">{day.label}</span>

                      {/* Header Actions when in Edit mode */}
                      {isEditing && (
                        <div className="flex items-center gap-1.5">
                          {/* Nút + thêm ngày */}
                          <button
                            type="button"
                            onClick={handleAddDayColumn}
                            className="p-1 rounded hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                            title="Thêm cột ngày vào tuần"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút X xóa cột */}
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(day.id)}
                            className="p-1 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title={`Xóa cột ${day.label}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                ))}

                {/* Extra column for row delete icon */}
                {isEditing && (
                  <th className="py-3 px-2 w-12 text-center text-rose-400 font-bold">
                    <span className="sr-only">Xóa hàng</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-cyan-500/20">
              {periods.map((period) => (
                <tr
                  key={period.id}
                  className="hover:bg-cyan-950/20 transition-colors group"
                >
                  {/* Period Name & Time */}
                  <td className="py-3 px-3 text-center bg-[#070D1E]/60 border-r border-cyan-500/20 align-middle">
                    <div className="font-extrabold text-white text-xs">{period.label}</div>
                    <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-500 shrink-0" />
                      <span>
                        {period.startTime} - {period.endTime}
                      </span>
                    </div>
                  </td>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const cellKey = `${period.id}_${day.id}`;
                    const content = gridData[cellKey] || '';
                    const isEmpty = !content || content.trim() === '';

                    return (
                      <td
                        key={day.id}
                        onClick={() => handleCellClick(period.id, day.id)}
                        className={`p-2 border-r border-cyan-500/20 align-top transition-colors relative min-h-[64px] ${
                          isDeleteMode
                            ? 'hover:bg-rose-950/40 hover:border-rose-500/50 cursor-pointer'
                            : ''
                        }`}
                        title={
                          isDeleteMode
                            ? 'Nhấp để xóa nội dung ô về -trống-'
                            : isEditing
                            ? 'Nhấp để nhập bài học (Enter xuống dòng)'
                            : ''
                        }
                      >
                        {isEditing ? (
                          <div className="w-full h-full relative">
                            {/* Auto-expanding direct textarea for rich multi-line word-like editing */}
                            <textarea
                              value={content}
                              disabled={isDeleteMode}
                              placeholder="-trống-"
                              onChange={(e) => handleCellChange(period.id, day.id, e.target.value)}
                              onBlur={(e) => handleCellBlur(period.id, day.id, e.target.value)}
                              className={`w-full min-h-[48px] bg-transparent resize-none overflow-hidden rounded-lg p-2 text-xs font-semibold transition-all focus:outline-none focus:ring-1 leading-relaxed ${
                                isDeleteMode ? 'cursor-pointer pointer-events-none' : ''
                              } ${
                                isEmpty
                                  ? 'text-slate-500 italic placeholder:text-slate-500 placeholder:italic'
                                  : 'text-cyan-100 placeholder:text-slate-500'
                              } focus:bg-[#0D1832] focus:ring-cyan-400`}
                              rows={Math.max(1, content.split('\n').length)}
                            />

                            {/* Red erase indicator when in delete mode */}
                            {isDeleteMode && (
                              <div className="absolute inset-0 flex items-center justify-center bg-rose-950/20 hover:bg-rose-950/50 border border-transparent hover:border-rose-500/40 rounded-lg transition-all cursor-pointer">
                                {!isEmpty && (
                                  <span className="text-[10px] text-rose-300 font-bold bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-500/40">
                                    Click để xóa
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // View mode
                          <div className="min-h-[48px] p-2 flex items-center justify-center text-center">
                            {isEmpty ? (
                              <span className="text-slate-500 italic font-medium">-trống-</span>
                            ) : (
                              <span className="text-cyan-100 font-semibold whitespace-pre-wrap break-words leading-relaxed">
                                {content}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Icon thùng rác xóa hàng */}
                  {isEditing && (
                    <td className="py-3 px-2 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(period.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/60 transition-all cursor-pointer"
                        title={`Xóa hàng ${period.label}`}
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM ACTION: [ Thêm tiết học mới ] */}
        {isEditing && (
          <div className="p-3 bg-[#070D1E] border-t border-cyan-500/30 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddPeriodRow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 hover:text-white bg-[#0D1832] hover:bg-[#122246] border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Thêm tiết học mới</span>
            </button>

            <div className="flex items-center gap-2">
              {days.length < 7 && (
                <button
                  type="button"
                  onClick={handleAddDayColumn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-950/70 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm ngày vào tuần ({days.length}/7)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* IMPORT EXCEL MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0D152A] border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Import Thời Khóa Biểu từ Excel</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-cyan-950/50 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có thể copy bảng thời khóa biểu từ file Excel (các ô cách nhau bởi tab hoặc dấu phẩy) và dán vào ô bên dưới. Hệ thống sẽ tự động điền vào lưới.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Dán dữ liệu Excel vào đây (Ví dụ:
Toán	Văn	Anh	Lý	Hóa
Sinh	Sử	Địa	GDCD	Tin)"
              rows={6}
              className="w-full bg-[#070D1E] border border-cyan-500/40 rounded-xl p-3 text-xs text-cyan-100 placeholder:text-slate-500 font-mono focus:border-cyan-400 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleImportSubmit}
                icon={<Upload className="w-4 h-4" />}
              >
                Xác nhận Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
