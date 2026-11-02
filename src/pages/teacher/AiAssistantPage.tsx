import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  FileText,
  UserCheck,
  Check,
  Copy,
  Edit3,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/db';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type AiTaskType = 'QUIZ_GEN' | 'LESSON_PLAN' | 'STUDENT_FEEDBACK' | 'SUMMARY';

export const AiAssistantPage: React.FC = () => {
  const { classes, selectedClass } = useClass();
  const { showToast } = useToast();

  const [activeTask, setActiveTask] = useState<AiTaskType>('QUIZ_GEN');
  const [topic, setTopic] = useState('Bất đẳng thức Cauchy và ứng dụng cực trị');
  const [grade, setGrade] = useState('10');
  const [difficulty, setDifficulty] = useState('Vận dụng cao');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>(`Câu 1 (Trắc nghiệm): Cho hai số thực dương x, y thỏa mãn x + y = 2. Giá trị nhỏ nhất của P = 1/x + 1/y là:
A. 1
B. 2
C. 4
D. 1/2
Đáp án đúng: B (Vì 1/x + 1/y >= 4/(x+y) = 4/2 = 2. Dấu bằng khi x = y = 1).

Câu 2 (Trắc nghiệm): Cho a, b, c > 0 và abc = 1. Giá trị nhỏ nhất của biểu thức a/(b+c) + b/(c+a) + c/(a+b) là:
A. 3/2
B. 1
C. 2
D. 3
Đáp án đúng: A (Bất đẳng thức Nesbitt nổi tiếng).

Câu 3 (Tự luận ngắn): Nêu điều kiện để dấu đẳng thức xảy ra trong BĐT Cauchy-Schwarz dạng Engel: (a1^2)/b1 + (a2^2)/b2 >= (a1+a2)^2 / (b1+b2).
Gợi ý đáp án: Dấu bằng xảy ra khi và chỉ khi a1/b1 = a2/b2.`);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (activeTask === 'QUIZ_GEN') {
        setAiOutput(`Đề kiểm tra nhanh môn Toán (${topic} - Mức độ: ${difficulty}):

Câu 1: Cho a, b > 0. Biểu thức nào sau đây luôn đúng theo BĐT Cauchy?
A. a + b ≥ 2√(ab)
B. a + b ≤ 2√(ab)
C. ab ≥ (a+b)/2
D. a² + b² ≤ 2ab
Đáp án: A. Dấu bằng khi a = b.

Câu 2: Giá trị nhỏ nhất của f(x) = x + 4/x với x > 0 là:
A. 2
B. 4
C. 8
D. 16
Đáp án: B. Khi x = 2 thì f(2) = 2 + 2 = 4.

Câu 3: Bất đẳng thức Cauchy-Schwarz áp dụng cho hai bộ số (a1, a2) và (b1, b2) có dạng:
Đáp án: (a1² + a2²)(b1² + b2²) ≥ (a1b1 + a2b2)². Dấu bằng khi a1/b1 = a2/b2.`);
      } else if (activeTask === 'LESSON_PLAN') {
        setAiOutput(`KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ):
Chủ đề: ${topic}
Khối: ${grade} | Thời lượng dự kiến: 2 tiết (90 phút)

I. MỤC TIÊU BÀI HỌC:
1. Kiến thức: Nắm vững định lý, điều kiện xảy ra dấu bằng và các dạng biến đổi phụ.
2. Năng lực: Rèn luyện năng lực giải quyết vấn đề toán học, tư duy logic phản biện.
3. Phẩm chất: Tính cẩn thận, kiên trì tìm lời giải tối ưu.

II. TIẾN TRÌNH DẠY HỌC:
- Hoạt động 1 (10p): Khởi động bằng bài toán thực tế về tối ưu diện tích hàng rào.
- Hoạt động 2 (25p): Hình thành kiến thức - Dẫn dắt chứng minh hình học và đại số.
- Hoạt động 3 (35p): Luyện tập nhóm - Phiếu bài tập phân hóa theo tổ.
- Hoạt động 4 (20p): Vận dụng & Củng cố qua Vòng quay may mắn.`);
      } else if (activeTask === 'STUDENT_FEEDBACK') {
        setAiOutput(`GỢI Ý NHẬN XÉT HỌC BẠ / SỔ LIÊN LẠC:
1. Dành cho học sinh xuất sắc:
"Em có tư duy toán học nhạy bén, lập luận logic và trình bày rất chuẩn mực. Luôn tích cực trao đổi và nhiệt tình giúp đỡ bạn bè trong tổ."

2. Dành cho học sinh khá, cần cẩn thận:
"Em nắm chắc kiến thức cơ bản, có nhiều sáng tạo trong cách giải. Cần rèn luyện thêm tính cẩn thận khi tính toán bước cuối để đạt kết quả tối đa."

3. Dành cho học sinh cần bồi dưỡng thêm:
"Em có tinh thần học tập nghiêm túc, chú ý nghe giảng. Cần chủ động làm thêm bài tập chuyên đề và trao đổi cùng cô giáo khi chưa rõ kiến thức."`);
      } else {
        setAiOutput(`TÓM TẮT TÀI LIỆU TRỌNG TÂM:
- Chủ đề: ${topic}
- 3 Điểm lưu ý cốt lõi khi giảng dạy:
  1. Luôn kiểm tra điều kiện các số thực không âm trước khi dùng định lý.
  2. Rèn kỹ năng dự đoán điểm rơi đối xứng trước khi chọn kỹ thuật đánh giá.
  3. Phân biệt rõ chiều bất đẳng thức (Lớn hơn hay bằng vs Nhỏ hơn hay bằng).`);
      }
      showToast('AI đã hoàn thành tạo nội dung sư phạm!', 'success');
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiOutput);
    showToast('Đã sao chép nội dung vào Clipboard!', 'info');
  };

  const handleApplyToClass = () => {
    showToast(`Đã áp dụng tài liệu vào kho học liệu của ${selectedClass?.name || 'Lớp học'}`, 'success');
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            AI Trợ Lý Giáo Viên (Teacher Copilot)
          </h1>
          <p className="text-xs text-cyan-300/80 mt-1">
            Soạn đề trắc nghiệm, tạo giáo án kế hoạch bài dạy và gợi ý nhận xét học bạ tự động
          </p>
        </div>

        <Badge variant="blue" size="md">
          Mô hình Giáo dục Chuẩn hóa
        </Badge>
      </div>

      {/* Task selector tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'QUIZ_GEN', label: 'Tạo Đề Trắc Nghiệm', icon: <FileQuestion className="w-4 h-4" /> },
          { key: 'LESSON_PLAN', label: 'Soạn Giáo Án', icon: <BookOpen className="w-4 h-4" /> },
          { key: 'STUDENT_FEEDBACK', label: 'Nhận Xét Học Bạ', icon: <UserCheck className="w-4 h-4" /> },
          { key: 'SUMMARY', label: 'Tóm Tắt & Gợi Ý', icon: <FileText className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTask(t.key as AiTaskType)}
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
              activeTask === t.key
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/60'
                : 'bg-[#0D152A] border-cyan-500/20 text-slate-300 hover:border-cyan-400/40 hover:bg-[#121E3C]'
            }`}
          >
            <span className={activeTask === t.key ? 'text-cyan-400' : 'text-slate-400'}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main 2-column studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Parameters input */}
        <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 shadow-xl shadow-cyan-950/50 space-y-4">
          <h3 className="font-bold text-sm text-white">Tham số yêu cầu sư phạm</h3>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Chuyên đề / Bài học *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Mức độ phân hóa</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="Nhận biết - Thông hiểu">Cơ bản</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao (HSG)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={isGenerating}
              icon={<Sparkles className="w-4 h-4 text-cyan-300" />}
              className="w-full font-bold shadow-md shadow-cyan-950/60"
            >
              Tạo nội dung với AI
            </Button>
          </div>
        </div>

        {/* Right column: Generated output preview */}
        <div className="lg:col-span-2 bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-6 shadow-xl shadow-cyan-950/50 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Kết quả sinh tự động (Có thể chỉnh sửa & áp dụng):
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} icon={<Copy className="w-3.5 h-3.5 text-cyan-400" />}>
                  Sao chép
                </Button>
                {/* Màu xanh cho Lưu / Áp dụng */}
                <Button variant="success" size="sm" onClick={handleApplyToClass} icon={<Check className="w-3.5 h-3.5" />}>
                  Áp dụng vào lớp
                </Button>
              </div>
            </div>

            <textarea
              rows={16}
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              className="w-full p-4 mt-3 bg-[#080E20] border border-cyan-500/30 rounded-2xl text-xs font-mono text-cyan-100 leading-relaxed focus:outline-none focus:border-cyan-400 focus:bg-[#070D1E]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
