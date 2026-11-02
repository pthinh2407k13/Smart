import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070D1E] flex items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-[#0D152A] rounded-3xl border border-cyan-500/40 p-8 text-center shadow-2xl shadow-cyan-950/80">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-950">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-white mt-1">Không tìm thấy trang</h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Đường dẫn không tồn tại hoặc đã được di chuyển trong hệ thống Smart Class.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" size="sm" onClick={() => navigate('/')} icon={<Home className="w-4 h-4" />}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};
