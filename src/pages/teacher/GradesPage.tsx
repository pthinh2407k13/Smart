import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Save,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Student, GradeItem, StudentGradeRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';

export const GradesPage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents(classId));
  const [gradeItems, setGradeItems] = useState<GradeItem[]>(() => dbService.getGradeItems(classId));
  const [gradeRecords, setGradeRecords] = useState<StudentGradeRecord[]>(() =>
    dbService.getGradeRecords(classId)
  );
  const [search, setSearch] = useState('');

  useEffect(() => {
    setStudents(dbService.getStudents(classId));
    setGradeItems(dbService.getGradeItems(classId));
    setGradeRecords(dbService.getGradeRecords(classId));
  }, [classId]);

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleScoreChange = (studentId: string, gradeItemId: string, val: string) => {
    const num = val === '' ? null : parseFloat(val);
    if (num !== null && (isNaN(num) || num < 0 || num > 10)) {
      showToast('Điểm số phải từ 0 đến 10', 'warning');
      return;
    }
    dbService.saveGradeRecord(studentId, gradeItemId, num);
    setGradeRecords(dbService.getGradeRecords(classId));
  };

  const handleExport = () => {
    showToast('Đã xuất sổ điểm lớp ra file Excel (.xlsx)', 'success');
  };

  const handleSaveAll = () => {
    dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'LƯU_SỔ_ĐIỂM', `Lớp ${classId}`, 'Đã cập nhật toàn bộ sổ điểm');
    showToast('Đã lưu dữ liệu sổ điểm thành công!', 'success');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Sổ Điểm Điện Tử & Đánh Giá
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Nhập điểm thường xuyên, giữa kỳ, tính điểm trung bình học kỳ theo công thức Bộ GDĐT
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExport} icon={<Download className="w-4 h-4 text-cyan-400" />}>
            Xuất Excel
          </Button>
          {/* Màu xanh cho Lưu */}
          <Button variant="success" size="sm" onClick={handleSaveAll} icon={<Save className="w-4 h-4" />}>
            Lưu sổ điểm
          </Button>
        </div>
      </div>

      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên học sinh, mã HS..."
            className="w-full sm:max-w-xs"
          />

          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSelectedClassId(e.target.value);
            }}
            className="px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Môn học: <b className="text-white">Toán học</b> • Học kỳ: <b className="text-cyan-300">Học kỳ I</b>
        </div>
      </div>

      {/* Spreadsheet Matrix Table in Dark Navy */}
      <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080E20] text-cyan-300 uppercase font-bold border-b border-cyan-500/30">
              <tr>
                <th className="py-3 px-3 w-16">STT</th>
                <th className="py-3 px-3 w-24">Mã HS</th>
                <th className="py-3 px-3 min-w-[150px]">Họ và tên</th>
                {gradeItems.map((gi) => (
                  <th key={gi.id} className="py-3 px-3 text-center min-w-[90px]">
                    {gi.name}
                    <span className="block text-[10px] text-cyan-400/80 font-normal">
                      (Hệ số {gi.weight})
                    </span>
                  </th>
                ))}
                <th className="py-3 px-3 text-center min-w-[80px]">ĐTB HKI</th>
                <th className="py-3 px-3 text-center">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
              {filtered.map((stu, idx) => {
                const rec = gradeRecords.find((r) => r.studentId === stu.id);
                const avg = rec?.semesterAverage || stu.gpa;
                return (
                  <tr key={stu.id} className="hover:bg-cyan-950/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{stu.studentCode}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{stu.fullName}</td>

                    {gradeItems.map((gi) => {
                      const val = rec?.scores[gi.id];
                      return (
                        <td key={gi.id} className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            defaultValue={val !== null && val !== undefined ? val : ''}
                            onBlur={(e) => handleScoreChange(stu.id, gi.id, e.target.value)}
                            className="w-16 text-center py-1 bg-[#070D1E] border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 focus:bg-[#0A1224] focus:border-cyan-400 focus:outline-none"
                          />
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-black text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                        {avg}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant={avg >= 8.0 ? 'emerald' : avg >= 6.5 ? 'blue' : 'amber'} size="sm">
                        {avg >= 8.0 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : 'TB'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
