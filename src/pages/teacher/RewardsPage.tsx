import React, { useState } from 'react';
import { Award, Trophy, Star, Medal, Users, Sparkles } from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { Student } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const RewardsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [students] = useState<Student[]>(() => dbService.getStudents(classId));

  // Sort students by rewardPoints descending
  const sorted = [...students].sort((a, b) => b.rewardPoints - a.rewardPoints);

  // Group teams calculation (Tổ 1, 2, 3, 4)
  const groupScores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  students.forEach((s) => {
    const grp = s.groupNumber || 1;
    groupScores[grp] = (groupScores[grp] || 0) + s.rewardPoints;
  });

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-cyan-400" />
            Thi Đua & Vinh Danh Thành Tích
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Khuyến khích tiến bộ học tập, tích lũy huy hiệu số và điểm thi đua theo tổ
          </p>
        </div>
      </div>

      {/* Team Leaderboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((g) => (
          <div key={g} className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 text-center space-y-1">
            <span className="text-xs font-bold text-cyan-400/80 uppercase tracking-wider">
              Tổ {g}
            </span>
            <div className="text-2xl font-black text-white">{groupScores[g] || 0} điểm</div>
            <div className="text-[11px] font-semibold text-cyan-300 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{g === 1 ? 'Dẫn đầu tuần' : 'Đang thi đua'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Achievements Roster */}
      <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 shadow-xl shadow-cyan-950/50 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Medal className="w-5 h-5 text-cyan-400" />
          Bảng Điểm Tích Lũy Cá Nhân (Khuyến khích tiến bộ)
        </h3>

        <div className="divide-y divide-cyan-500/10">
          {sorted.map((stu, rank) => (
            <div key={stu.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    rank === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-900'
                      : rank === 2
                      ? 'bg-amber-700/60 text-white'
                      : 'text-slate-500 font-bold'
                  }`}
                >
                  {rank + 1}
                </span>
                <img src={stu.avatarUrl} alt={stu.fullName} className="w-8 h-8 rounded-full object-cover border border-cyan-500/40" />
                <div>
                  <div className="font-bold text-white">{stu.fullName}</div>
                  <div className="text-[10px] text-slate-400">Tổ {stu.groupNumber || 1} • Mã: {stu.studentCode}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {rank < 3 && (
                  <Badge variant="amber" size="sm">
                    🌟 Ngôi sao nỗ lực
                  </Badge>
                )}
                <span className="font-black text-sm text-cyan-300 bg-cyan-950/70 px-3 py-1 rounded-xl border border-cyan-500/40">
                  +{stu.rewardPoints} đ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
