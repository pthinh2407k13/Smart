import React, { useState, useEffect } from 'react';
import { Layers, Shuffle, Download, Printer, Users } from 'lucide-react';
import { dbService } from '../../../services/db';
import { useClass } from '../../../contexts/ClassContext';
import { useToast } from '../../../contexts/ToastContext';
import { Student } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const GroupMakerPage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents(classId));
  const [groupCount, setGroupCount] = useState<number>(4);
  const [groups, setGroups] = useState<Student[][]>([]);

  useEffect(() => {
    setStudents(dbService.getStudents(classId));
    setGroups([]);
  }, [classId]);

  const handleGenerateGroups = () => {
    if (students.length === 0) return;

    // Shuffle array
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const result: Student[][] = Array.from({ length: groupCount }, () => []);

    shuffled.forEach((stu, index) => {
      result[index % groupCount].push(stu);
    });

    setGroups(result);
    showToast(`Đã chia lớp thành ${groupCount} nhóm ngẫu nhiên!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            Chia Nhóm Học Tập Tự Động
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân bổ đều học sinh theo số lượng nhóm mong muốn hoặc kích cỡ mỗi nhóm
          </p>
        </div>

        {groups.length > 0 && (
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
              In danh sách nhóm
            </Button>
          </div>
        )}
      </div>

      {/* Configuration bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="w-64">
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Lớp học</label>
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSelectedClassId(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng nhóm muốn chia</label>
            <select
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value))}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value={2}>2 Nhóm</option>
              <option value={3}>3 Nhóm</option>
              <option value={4}>4 Nhóm (Khuyến nghị)</option>
              <option value={5}>5 Nhóm</option>
              <option value={6}>6 Nhóm</option>
              <option value={8}>8 Nhóm</option>
            </select>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleGenerateGroups}
          icon={<Shuffle className="w-4 h-4" />}
          className="self-end sm:self-auto font-bold"
        >
          Tạo nhóm ngẫu nhiên
        </Button>
      </div>

      {/* Groups Display */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
          <p className="text-sm font-semibold">Bấm "Tạo nhóm ngẫu nhiên" để chia {students.length} học sinh</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((grp, gIdx) => (
            <div key={gIdx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Nhóm {gIdx + 1}</h3>
                <Badge variant="blue" size="sm">
                  {grp.length} thành viên
                </Badge>
              </div>

              <div className="space-y-2">
                {grp.map((stu, sIdx) => (
                  <div
                    key={stu.id}
                    className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800">
                      {sIdx + 1}. {stu.fullName}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{stu.studentCode}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
