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
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEACHER');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, fullName.trim() || 'Người dùng mới', selectedRole);
      showToast('Đăng ký tài khoản thành công và đã lưu lên Firebase!', 'success');
      
      const routes: Record<UserRole, string> = {
        ADMIN: '/admin/dashboard',
        TEACHER: '/teacher/dashboard',
        STUDENT: '/student/dashboard',
        PARENT: '/parent/dashboard',
      };
      navigate(routes[selectedRole]);
    } catch (err: any) {
      showToast(err?.message || 'Đăng ký tài khoản thất bại', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black mx-auto shadow-lg shadow-cyan-500/30 text-2xl mb-4 border border-cyan-300/40">
          SC
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">ĐĂNG KÝ TÀI KHOẢN</h2>
        <p className="mt-2 text-sm text-cyan-300/80">
          Tạo tài khoản mới để tham gia Hệ thống Quản lý Lớp học Thông minh
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0D152A] py-8 px-6 shadow-2xl shadow-cyan-950/80 rounded-3xl border border-cyan-500/40 sm:px-10">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-cyan-400/80 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Email trường học / cá nhân</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400/80 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@smartclass.edu.vn"
                  className="w-full pl-9 pr-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Vai trò người dùng</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="TEACHER">Giáo viên</option>
                <option value="STUDENT">Học sinh</option>
                <option value="PARENT">Phụ huynh</option>
                <option value="ADMIN">Quản trị viên nhà trường</option>
              </select>
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

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400/80 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-4">
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Đăng ký tài khoản ngay</span>
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-cyan-500/20 text-center text-xs text-slate-300">
            Đã có tài khoản hệ thống?{' '}
            <Link to="/login" className="font-bold text-cyan-400 hover:underline">
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
