import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { AlertNotification } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AlertsPage: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertNotification[]>(() => dbService.getAlerts());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEW' | 'PROCESSING' | 'RESOLVED'>('ALL');

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setAlerts(dbService.getAlerts());
    });
    return unsub;
  }, []);

  const filtered = alerts.filter(
    (a) => filterStatus === 'ALL' || a.status === filterStatus
  );

  const handleUpdateStatus = (id: string, status: AlertNotification['status']) => {
    dbService.updateAlertStatus(id, status);
    showToast(`Đã chuyển trạng thái cảnh báo sang: ${status}`, 'success');
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Cảnh Báo Thông Minh (Early Warning System)
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Phát hiện sớm nguy cơ giảm sút học lực, đi muộn nhiều lần hoặc chưa hoàn thành bài tập
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#080E20] p-1 rounded-xl text-xs font-bold border border-cyan-500/30">
          {(
            [
              { key: 'ALL', label: 'Tất cả cảnh báo' },
              { key: 'NEW', label: 'Mới' },
              { key: 'PROCESSING', label: 'Đang xử lý' },
              { key: 'RESOLVED', label: 'Đã giải quyết' },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === s.key ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Hiện có <b className="text-cyan-300">{filtered.length}</b> cảnh báo
        </span>
      </div>

      {/* Alerts Workflow Cards */}
      <div className="space-y-4">
        {filtered.map((alt) => {
          const isCritical = alt.severity === 'CRITICAL';
          return (
            <div
              key={alt.id}
              className={`bg-[#0D152A] rounded-2xl border p-6 shadow-md shadow-cyan-950/40 transition-all space-y-4 ${
                isCritical ? 'border-rose-500/50 bg-rose-950/10' : 'border-amber-500/50 bg-amber-950/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Badge variant={isCritical ? 'rose' : 'amber'} size="md" dot>
                    {alt.type === 'ATTENDANCE'
                      ? 'Chuyên cần'
                      : alt.type === 'UNSUBMITTED'
                      ? 'Chưa nộp bài'
                      : 'Học lực'}
                  </Badge>
                  <span className="text-xs font-bold text-white">{alt.studentName}</span>
                  <span className="text-xs text-slate-400">• Lớp {alt.className}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      alt.status === 'NEW'
                        ? 'rose'
                        : alt.status === 'PROCESSING'
                        ? 'amber'
                        : 'emerald'
                    }
                    size="sm"
                  >
                    {alt.status === 'NEW'
                      ? '● Mới phát sinh'
                      : alt.status === 'PROCESSING'
                      ? '◐ Đang xử lý với PH'
                      : '✓ Đã giải quyết'}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white">{alt.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alt.description}</p>
              </div>

              {/* Action buttons across lifecycle */}
              <div className="pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Phát hiện: {new Date(alt.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showToast(`Đang liên hệ phụ huynh của ${alt.studentName}...`, 'info')}
                    icon={<Phone className="w-3.5 h-3.5 text-cyan-400" />}
                  >
                    Gọi Phụ huynh
                  </Button>

                  {alt.status === 'NEW' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(alt.id, 'PROCESSING')}
                    >
                      Bắt đầu xử lý →
                    </Button>
                  )}

                  {alt.status !== 'RESOLVED' && (
                    /* Màu xanh cho Hoàn tất / Giải quyết */
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUpdateStatus(alt.id, 'RESOLVED')}
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Đánh dấu Đã giải quyết
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
