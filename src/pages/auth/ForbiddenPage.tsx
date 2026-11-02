import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getHomeRoute = () => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      case 'PARENT':
        return '/parent/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] flex items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-[#0D152A] rounded-3xl border border-cyan-500/40 p-8 text-center shadow-2xl shadow-cyan-950/80">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">403</h1>
        <h2 className="text-xl font-bold text-white mt-1">Truy cập bị từ chối</h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Tài khoản với vai trò <span className="font-bold text-cyan-300">{role}</span> không có quyền truy cập vào phân hệ này theo chính sách bảo mật RLS.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
            Quay lại
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(getHomeRoute())} icon={<Home className="w-4 h-4" />}>
            Về trang chủ của tôi
          </Button>
        </div>
      </div>
    </div>
  );
};
