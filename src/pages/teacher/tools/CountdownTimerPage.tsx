import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Bell, Maximize2, Minimize2, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../contexts/ToastContext';

export const CountdownTimerPage: React.FC = () => {
  const { showToast } = useToast();
  const [initialSeconds, setInitialSeconds] = useState(300); // 5 mins
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      showToast('⏰ HẾT GIỜ LÀM BÀI!', 'warning', 'Thông báo thời gian');
      // Browser audio chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch {}
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, showToast]);

  const setPreset = (sec: number) => {
    setIsRunning(false);
    setInitialSeconds(sec);
    setSecondsLeft(sec);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Đồng Hồ Bấm Giờ Lớp Học (Timer)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dùng chiếu máy chiếu khi học sinh làm bài kiểm tra, thảo luận nhóm hoặc giải lao
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        >
          {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình máy chiếu'}
        </Button>
      </div>

      {/* Main Timer Display */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center">
        {/* Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { label: '1 Phút', sec: 60 },
            { label: '3 Phút', sec: 180 },
            { label: '5 Phút', sec: 300 },
            { label: '10 Phút', sec: 600 },
            { label: '15 Phút', sec: 900 },
            { label: '45 Phút', sec: 2700 },
          ].map((preset) => (
            <button
              key={preset.sec}
              onClick={() => setPreset(preset.sec)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                initialSeconds === preset.sec && !isRunning
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Digital Clock Numbers */}
        <div className="relative my-4">
          <div
            className={`font-mono text-7xl sm:text-9xl font-black tracking-tight select-none transition-colors ${
              secondsLeft < 30 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
            }`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden my-6">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(initialSeconds);
            }}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Đặt lại
          </Button>

          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 font-black text-lg h-14"
            icon={isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          >
            {isRunning ? 'TẠM DỪNG' : 'BẮT ĐẦU'}
          </Button>
        </div>
      </div>
    </div>
  );
};
