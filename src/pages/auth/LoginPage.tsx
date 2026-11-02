import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  User,
  Users,
  ArrowRight,
  Lock,
  Mail,
  School,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('teacher@smartclass.edu.vn');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Đăng nhập thành công!', 'success');
      navigate('/teacher/dashboard');
    } catch (err: any) {
      showToast(err?.message || 'Đăng nhập thất bại', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    showToast(`Đã đăng nhập nhanh với vai trò ${role}`, 'success');
    const routes: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      TEACHER: '/teacher/dashboard',
      STUDENT: '/student/dashboard',
      PARENT: '/parent/dashboard',
    };
    navigate(routes[role]);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black mx-auto shadow-lg shadow-cyan-500/30 text-2xl mb-4 border border-cyan-300/40">
          SC
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">SMART CLASS</h2>
        <p className="mt-2 text-sm text-cyan-300/80">
          Nền tảng Quản lý Lớp học Thông minh & Chuyển đổi số Giáo dục
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0D152A] py-8 px-6 shadow-2xl shadow-cyan-950/80 rounded-3xl border border-cyan-500/40 sm:px-10">
          {/* Quick Demo Access Buttons */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Vào nhanh theo 4 Vai trò (Demo):
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('TEACHER')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/40 bg-[#080E20] hover:bg-cyan-950/60 text-cyan-200 text-xs font-bold transition-all text-left cursor-pointer hover:border-cyan-400"
              >
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-white font-extrabold">Giáo viên</div>
                  <div className="text-[10px] text-cyan-300/80 font-normal">Cô Mai (10A1)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/40 bg-[#080E20] hover:bg-emerald-950/40 text-emerald-200 text-xs font-bold transition-all text-left cursor-pointer hover:border-emerald-400"
              >
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-white font-extrabold">Học sinh</div>
                  <div className="text-[10px] text-emerald-300/80 font-normal">Hoàng Nam</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('PARENT')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/40 bg-[#080E20] hover:bg-amber-950/40 text-amber-200 text-xs font-bold transition-all text-left cursor-pointer hover:border-amber-400"
              >
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-white font-extrabold">Phụ huynh</div>
                  <div className="text-[10px] text-amber-300/80 font-normal">Ông Tuấn</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-500/40 bg-[#080E20] hover:bg-purple-950/40 text-purple-200 text-xs font-bold transition-all text-left cursor-pointer hover:border-purple-400"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-white font-extrabold">Quản trị viên</div>
                  <div className="text-[10px] text-purple-300/80 font-normal">TS. Quang Huy</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0D152A] px-3 text-cyan-300/80 font-semibold">hoặc đăng nhập thủ công</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Email hoặc Mã tài khoản</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400/80 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="teacher@smartclass.edu.vn"
                  className="w-full pl-9 pr-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400/80 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-cyan-500 text-cyan-500" />
                <span className="text-slate-300 font-medium">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="font-semibold text-cyan-400 hover:text-cyan-300">
                Quên mật khẩu?
              </a>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-2">
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-300">
            Chưa có tài khoản hệ thống?{' '}
            <Link to="/register" className="font-bold text-cyan-400 hover:underline">
              Đăng ký ngay
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/20 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <School className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hệ thống áp dụng chuẩn an toàn thông tin GDĐT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
