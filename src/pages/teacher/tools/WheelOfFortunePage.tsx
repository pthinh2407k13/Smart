import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Users,
  Award,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { dbService } from '../../../services/db';
import { useClass } from '../../../contexts/ClassContext';
import { useToast } from '../../../contexts/ToastContext';
import { Student } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const WheelOfFortunePage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents(classId));
  const [excludeCalled, setExcludeCalled] = useState(true);
  const [calledHistory, setCalledHistory] = useState<Student[]>([]);
  const [winner, setWinner] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);

  // Available students pool
  const pool = excludeCalled
    ? students.filter((s) => !calledHistory.some((c) => c.id === s.id))
    : students;

  useEffect(() => {
    const list = dbService.getStudents(classId);
    setStudents(list);
    setCalledHistory([]);
    setWinner(null);
  }, [classId]);

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const items = pool.length > 0 ? pool : [{ id: '0', fullName: 'Hết lượt' } as any];
    const sliceAngle = (2 * Math.PI) / items.length;

    const palette = ['#06B6D4', '#2563EB', '#0D9488', '#0284C7', '#3B82F6', '#14B8A6', '#6366F1', '#0891B2'];

    items.forEach((item, i) => {
      const angle = currentAngleRef.current + i * sliceAngle;

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      ctx.strokeStyle = '#070D1E';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;

      const name = item.fullName.split(' ').slice(-2).join(' '); // last 2 words of name
      ctx.fillText(name, radius - 20, 5);
      ctx.restore();
    });

    // Center pin
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#070D1E';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06B6D4';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#06B6D4';
    ctx.fill();
  }, [pool]);

  const spinWheel = () => {
    if (isSpinning || pool.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const fullSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 spins
    const randomOffset = Math.random() * 2 * Math.PI;
    const targetAngle = fullSpins * 2 * Math.PI + randomOffset;

    const startTime = performance.now();
    const duration = 4500; // 4.5 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      currentAngleRef.current = ease * targetAngle;

      // Redraw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const radius = width / 2 - 10;
          const cx = width / 2;
          const cy = height / 2;
          ctx.clearRect(0, 0, width, height);

          const items = pool;
          const sliceAngle = (2 * Math.PI) / items.length;
          const palette = ['#06B6D4', '#2563EB', '#0D9488', '#0284C7', '#3B82F6', '#14B8A6', '#6366F1', '#0891B2'];

          items.forEach((item, i) => {
            const angle = currentAngleRef.current + i * sliceAngle;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = palette[i % palette.length];
            ctx.fill();
            ctx.strokeStyle = '#070D1E';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
            ctx.fillText(item.fullName.split(' ').slice(-2).join(' '), radius - 20, 5);
            ctx.restore();
          });

          // Center pin
          ctx.beginPath();
          ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
          ctx.fillStyle = '#070D1E';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#06B6D4';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
          ctx.fillStyle = '#06B6D4';
          ctx.fill();
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        const normalizedAngle = (2 * Math.PI - (currentAngleRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / pool.length;
        const winningIndex = Math.floor(normalizedAngle / sliceAngle) % pool.length;
        const selected = pool[winningIndex] || pool[0];

        setWinner(selected);
        setCalledHistory((prev) => [selected, ...prev]);

        // Trigger confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          console.log(e);
        }

        showToast(`Chúc mừng học sinh: ${selected.fullName}!`, 'success');
      }
    };

    requestAnimationFrame(animate);
  };

  const handleRewardPoints = (points: number) => {
    if (!winner) return;
    dbService.addBehavior({
      studentId: winner.id,
      studentName: winner.fullName,
      classId,
      type: points > 0 ? 'POSITIVE' : 'NEED_IMPROVEMENT',
      content: `Vòng quay may mắn gọi tên trả lời câu hỏi (${points > 0 ? 'Trả lời xuất sắc' : 'Cần cố gắng'})`,
      points,
      recordedBy: 'Cô Nguyễn Thị Mai',
      category: 'Học tập',
    });
    showToast(`Đã ghi nhận ${points > 0 ? `+${points}` : points} điểm thi đua cho ${winner.fullName}`, 'success');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Vòng Quay May Mắn (Lucky Wheel)
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Công cụ gọi tên ngẫu nhiên phục vụ kiểm tra bài cũ, phát biểu và tổ chức mini-game lớp học
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            icon={isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          >
            {isFullscreen ? 'Thu nhỏ' : 'Chiếu toàn màn hình'}
          </Button>
        </div>
      </div>

      {/* Main Wheel View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Wheel Canvas */}
        <div className="lg:col-span-2 bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-xl shadow-cyan-950/50 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Wheel Pointer */}
          <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-0 h-0 border-t-16 border-t-transparent border-b-16 border-b-transparent border-r-32 border-r-cyan-400 drop-shadow-md" />
          </div>

          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="max-w-full drop-shadow-2xl"
            />
          </div>

          {/* Action Spin Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              disabled={isSpinning || pool.length === 0}
              onClick={spinWheel}
              className="px-8 font-black text-base shadow-xl shadow-cyan-950/60"
            >
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY! 🎯'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setCalledHistory([]);
                setWinner(null);
                showToast('Đã làm mới danh sách lượt quay', 'info');
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Đặt lại
            </Button>
          </div>

          {/* Winner Callout Card */}
          {winner && (
            <div className="mt-6 p-5 rounded-2xl bg-[#080E20] border-2 border-cyan-400/80 w-full max-w-md text-center shadow-xl shadow-cyan-950/80 animate-scale-up">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                🎉 Người được chọn gọi tên:
              </span>
              <h3 className="text-2xl font-black text-white mt-1">{winner.fullName}</h3>
              <p className="text-xs text-cyan-400/80 mt-0.5">
                Mã số: {winner.studentCode} • Tổ {winner.groupNumber || 1}
              </p>

              <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-center gap-2">
                {/* Màu xanh cho Thưởng điểm */}
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleRewardPoints(5)}
                >
                  +5đ Trả lời đúng
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewardPoints(2)}
                >
                  +2đ Phát biểu
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Class & Options */}
        <div className="space-y-6">
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 space-y-4">
            <h3 className="font-bold text-sm text-white">Cấu hình vòng quay</h3>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Chọn Lớp học</label>
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

            <label className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={excludeCalled}
                onChange={(e) => setExcludeCalled(e.target.checked)}
                className="rounded border-cyan-500 text-cyan-500"
              />
              <span>Tránh gọi lặp (Học sinh đã gọi sẽ ẩn)</span>
            </label>

            <div className="text-xs text-slate-400 pt-2 border-t border-cyan-500/20 flex justify-between">
              <span>Còn lại trong vòng quay:</span>
              <span className="font-bold text-cyan-300">{pool.length} học sinh</span>
            </div>
          </div>

          {/* History of Called Students */}
          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Lịch sử lượt gọi ({calledHistory.length})</h3>
              {calledHistory.length > 0 && (
                <button
                  onClick={() => setCalledHistory([])}
                  className="text-[10px] text-rose-400 font-semibold hover:underline cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>

            {calledHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có lượt quay nào.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {calledHistory.map((stu, i) => (
                  <div
                    key={`${stu.id}_${i}`}
                    className="p-2.5 rounded-xl bg-[#080E20] border border-cyan-500/20 flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-slate-400 font-bold">#{calledHistory.length - i}</span>
                      <span className="font-bold text-white">{stu.fullName}</span>
                    </div>
                    <Badge variant="blue" size="sm">
                      {stu.studentCode}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
