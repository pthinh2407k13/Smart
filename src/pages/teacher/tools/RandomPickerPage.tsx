import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Shuffle, Sparkles, Award, RotateCcw, Users } from 'lucide-react';
import { dbService } from '../../../services/db';
import { useClass } from '../../../contexts/ClassContext';
import { useToast } from '../../../contexts/ToastContext';
import { Student } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const RandomPickerPage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents(classId));
  const [currentPicked, setCurrentPicked] = useState<Student | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [history, setHistory] = useState<Student[]>([]);
  const [avoidRepeat, setAvoidRepeat] = useState(true);

  useEffect(() => {
    setStudents(dbService.getStudents(classId));
    setHistory([]);
    setCurrentPicked(null);
  }, [classId]);

  const pool = avoidRepeat ? students.filter((s) => !history.some((h) => h.id === s.id)) : students;

  const handlePickRandom = () => {
    if (pool.length === 0) {
      showToast('Đã gọi hết tất cả học sinh trong lớp!', 'warning');
      return;
    }

    setIsPicking(true);
    let counter = 0;
    const interval = setInterval(() => {
      const tempPick = pool[Math.floor(Math.random() * pool.length)];
      setCurrentPicked(tempPick);
      counter++;
      if (counter > 18) {
        clearInterval(interval);
        const finalPick = pool[Math.floor(Math.random() * pool.length)];
        setCurrentPicked(finalPick);
        setHistory((prev) => [finalPick, ...prev]);
        setIsPicking(false);
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch {}
      }
    }, 100);
  };

  const handleReward = (points: number) => {
    if (!currentPicked) return;
    dbService.addBehavior({
      studentId: currentPicked.id,
      studentName: currentPicked.fullName,
      classId,
      type: points > 0 ? 'POSITIVE' : 'NEED_IMPROVEMENT',
      content: `Chọn ngẫu nhiên kiểm tra bài: ${points > 0 ? 'Đạt điểm tốt' : 'Nhắc nhở chuẩn bị bài'}`,
      points,
      recordedBy: 'Cô Nguyễn Thị Mai',
      category: 'Học tập',
    });
    showToast(`Đã ghi nhận ${points > 0 ? `+${points}` : points} điểm cho ${currentPicked.fullName}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-blue-600" />
            Chọn Học Sinh Ngẫu Nhiên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiệu ứng xáo trộn thẻ bài công bằng, minh bạch và hồi hộp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center min-h-[420px] text-center">
          {currentPicked ? (
            <div className={`p-8 rounded-3xl border-2 max-w-sm w-full transition-all ${isPicking ? 'scale-95 bg-slate-50 border-slate-200' : 'scale-100 bg-linear-to-b from-blue-50/50 to-white border-blue-300 shadow-xl'}`}>
              <img
                src={currentPicked.avatarUrl}
                alt={currentPicked.fullName}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-md mb-4"
              />
              <Badge variant="blue" size="md" className="mb-2">
                {currentPicked.studentCode}
              </Badge>
              <h3 className="text-2xl font-black text-slate-900">{currentPicked.fullName}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tổ {currentPicked.groupNumber || 1} • {currentPicked.className}
              </p>

              {!isPicking && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                  <Button variant="success" size="sm" onClick={() => handleReward(5)}>
                    +5đ Đúng
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleReward(2)}>
                    +2đ Có ý thức
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 space-y-3">
              <Users className="w-16 h-16 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-semibold">Bấm nút bên dưới để chọn ngẫu nhiên một bạn học sinh</p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              disabled={isPicking || pool.length === 0}
              onClick={handlePickRandom}
              className="px-8 font-black text-base shadow-lg"
            >
              {isPicking ? 'Đang chọn ngẫu nhiên...' : 'CHỌN NGẪU NHIÊN 🎲'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setHistory([]);
                setCurrentPicked(null);
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Right Panel: Class & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Lớp học & Tùy chọn</h3>
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

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidRepeat}
                onChange={(e) => setAvoidRepeat(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Tránh gọi lặp (còn {pool.length} HS)</span>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Đã gọi ({history.length})</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {history.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs font-semibold">
                  <span>{s.fullName}</span>
                  <Badge variant="blue" size="sm">{s.studentCode}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
