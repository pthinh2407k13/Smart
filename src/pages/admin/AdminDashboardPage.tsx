import React, { useState } from 'react';
import {
  Shield,
  Building,
  Users,
  GraduationCap,
  Database,
  FileText,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Server,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const state = dbService.getState();
  const [auditLogs] = useState(() => state.auditLogs);

  const handleExportBackup = () => {
    const json = dbService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_class_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Đã xuất bản sao lưu hệ thống JSON!', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại cơ sở dữ liệu về mặc định ban đầu?')) {
      dbService.resetToDefault();
      showToast('Đã khôi phục dữ liệu ban đầu thành công!', 'info');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Bảng Quản Trị Hệ Thống (Admin Control Center)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị toàn trường, phân quyền vai trò, nhật ký kiểm toán (Audit Log) và sao lưu dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            icon={<Download className="w-4 h-4" />}
          >
            Sao lưu dữ liệu (Backup)
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reset về mặc định
          </Button>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trường học"
          value="1 Cơ sở"
          subtitle={state.school.name}
          icon={<Building className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Tổng người dùng"
          value={state.students.length + 12}
          subtitle="Gồm Admin, GV, HS và PH"
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Tổng số Lớp"
          value={`${state.classes.length} Lớp`}
          subtitle="Khối 10, 11 và 12"
          icon={<GraduationCap className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Trạng thái hệ thống"
          value="Hoạt động 100%"
          subtitle="PostgreSQL / RLS Đã bảo vệ"
          icon={<Server className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* 2 columns: Audit Logs & Tenant settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Nhật Ký Kiểm Toán (Immutable Audit Logs)
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhận mọi thao tác nhạy cảm: điểm danh, sửa điểm, đổi quyền và xóa dữ liệu
              </p>
            </div>
            <Badge variant="purple" size="sm">
              {auditLogs.length} sự kiện
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Hành động</th>
                  <th className="py-2.5 px-3">Đối tượng</th>
                  <th className="py-2.5 px-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{log.target}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings & Architecture Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Thông tin Trường học (Tenant)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Tên cơ sở:</span>
                <span className="font-bold text-slate-900">{state.school.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mã định danh:</span>
                <span className="font-mono font-bold text-blue-600">{state.school.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Địa chỉ:</span>
                <span className="text-slate-700">{state.school.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Năm học hiện hành:</span>
                <span className="font-bold text-emerald-600">2024 - 2025 (Học kỳ II)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Sao lưu & Khôi phục (JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dữ liệu được bảo toàn tự động và có thể xuất ra file JSON hoàn chỉnh bất cứ lúc nào để phục vụ lưu trữ định kỳ.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBackup}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Tải file Backup ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
