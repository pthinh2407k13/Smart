import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Award,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const ReportsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(selectedClassId || classes[0]?.id || '');
  const [reportType, setReportType] = useState<'OVERVIEW' | 'ATTENDANCE' | 'GRADES'>('OVERVIEW');

  const handleExport = (type: string) => {
    showToast(`Đã xuất báo cáo ${type} thành công!`, 'success');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Trung Tâm Báo Cáo & Thống Kê (Report Hub)
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Tổng hợp dữ liệu học tập, chuyên cần, bài tập và nề nếp thi đua có thể xuất Excel/PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('Excel')}
            icon={<Download className="w-4 h-4 text-cyan-400" />}
          >
            Xuất Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            In báo cáo
          </Button>
        </div>
      </div>

      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-cyan-300">Lớp:</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="px-3 py-1.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl text-xs font-bold border border-cyan-500/30">
          {(
            [
              { key: 'OVERVIEW', label: 'Tổng quan lớp' },
              { key: 'ATTENDANCE', label: 'Báo cáo Chuyên cần' },
              { key: 'GRADES', label: 'Phổ điểm học tập' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setReportType(t.key)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                reportType === t.key ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tỷ lệ chuyên cần chung"
          value="96.5%"
          trend={{ value: 'Tăng 1.2% so với tháng trước', isPositive: true }}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Điểm TB Lớp (GPA)"
          value="8.7 / 10"
          subtitle="87.5% học sinh xếp loại Giỏi"
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Tỷ lệ hoàn thành bài tập"
          value="92.4%"
          subtitle="Tổng số 120 bài nộp đã chấm"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Visual Chart / Breakdown Representation */}
      <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-xl shadow-cyan-950/50 space-y-6">
        <h3 className="font-extrabold text-base text-white">
          Phân bố Xếp loại Học lực Học kỳ I (Biểu đồ thống kê)
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-400">Xuất sắc & Giỏi (Điểm TB &ge; 8.0)</span>
              <span className="text-white">87.5% (7 / 8 HS)</span>
            </div>
            <div className="h-4 bg-[#080E20] border border-cyan-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.5%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-cyan-400">Khá (Điểm TB 6.5 - 7.9)</span>
              <span className="text-white">12.5% (1 / 8 HS)</span>
            </div>
            <div className="h-4 bg-[#080E20] border border-cyan-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '12.5%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400">Trung bình / Yếu (&lt; 6.5)</span>
              <span className="text-white">0% (0 HS)</span>
            </div>
            <div className="h-4 bg-[#080E20] border border-cyan-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#080E20] border border-cyan-500/30 flex items-center justify-between text-xs">
          <div>
            <b className="text-cyan-300">Đánh giá chung của Hội đồng Sư phạm:</b>
            <p className="text-slate-300 mt-0.5">
              Lớp duy trì nề nếp và chất lượng học tập xuất sắc, hoàn thành 100% chỉ tiêu thi đua đề ra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
