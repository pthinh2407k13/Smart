import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Upload,
  Download,
  Sparkles,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  BookOpen,
  Filter,
  Layers,
  Award,
} from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchBox } from '../../components/ui/SearchBox';

interface QuestionItem {
  id: string;
  code: string;
  questionText: string;
  subject: string;
  gradeLevel: number;
  topic: string;
  type: 'Trắc nghiệm (1 đáp án)' | 'Trắc nghiệm (nhiều đáp án)' | 'Đúng / Sai' | 'Điền từ' | 'Tự luận';
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  status: 'Đã duyệt' | 'Bản nháp' | 'Lưu trữ';
  options?: string[];
  correctAnswer: string | number | number[];
  explanation: string;
  points: number;
  createdAt: string;
  createdBy: string;
}

export const QuizzesPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { showToast } = useToast();

  // Initial mock questions database
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q_01',
      code: 'Q-1001',
      questionText: 'Cho hàm số bậc hai y = ax² + bx + c. Đỉnh của parabol có tọa độ đỉnh I xác định bởi công thức nào?',
      subject: 'Toán học',
      gradeLevel: 10,
      topic: 'Hàm số bậc hai',
      type: 'Trắc nghiệm (1 đáp án)',
      difficulty: 'Nhận biết',
      status: 'Đã duyệt',
      options: ['I(-b/2a, -Δ/4a)', 'I(b/2a, Δ/4a)', 'I(-b/a, -Δ/2a)', 'I(b/a, Δ/2a)'],
      correctAnswer: 0,
      explanation: 'Tọa độ đỉnh của parabol y = ax² + bx + c là x = -b/(2a) và y = -Δ/(4a).',
      points: 2.0,
      createdAt: '2025-02-10',
      createdBy: 'Cô Nguyễn Thị Mai',
    },
    {
      id: 'q_02',
      code: 'Q-1002',
      questionText: 'Phát biểu nào sau đây là đúng về định luật II Newton?',
      subject: 'Vật lý',
      gradeLevel: 10,
      topic: 'Động lực học chất điểm',
      type: 'Đúng / Sai',
      difficulty: 'Thông hiểu',
      status: 'Đã duyệt',
      options: ['Đúng', 'Sai'],
      correctAnswer: 0,
      explanation: 'Gia tốc của một vật cùng hướng với lực tác dụng lên vật. Độ lớn gia tốc tỉ lệ thuận với độ lớn của lực và tỉ lệ nghịch với khối lượng của vật.',
      points: 1.5,
      createdAt: '2025-02-11',
      createdBy: 'Thầy Trần Văn Nam',
    },
    {
      id: 'q_03',
      code: 'Q-1003',
      questionText: 'Điền từ còn thiếu vào chỗ trống: "Water ... boiling at 100 degrees Celsius at standard pressure."',
      subject: 'Tiếng Anh',
      gradeLevel: 11,
      topic: 'Present Simple Tense',
      type: 'Điền từ',
      difficulty: 'Nhận biết',
      status: 'Đã duyệt',
      correctAnswer: 'is',
      explanation: 'Sự thật hiển nhiên dùng thì hiện tại đơn với chủ ngữ số ít "Water" đi với "is".',
      points: 1.0,
      createdAt: '2025-02-12',
      createdBy: 'Cô Sarah Huỳnh',
    },
    {
      id: 'q_04',
      code: 'Q-1004',
      questionText: 'Giải phương trình lượng giác: sin(x) = 1/2 với x thuộc [-π, π].',
      subject: 'Toán học',
      gradeLevel: 11,
      topic: 'Phương trình lượng giác',
      type: 'Tự luận',
      difficulty: 'Vận dụng cao',
      status: 'Bản nháp',
      correctAnswer: 'x = π/6 hoặc x = 5π/6',
      explanation: 'Sử dụng vòng tròn lượng giác suy ra nghiệm thuộc đoạn đã cho.',
      points: 3.0,
      createdAt: '2025-02-14',
      createdBy: 'Cô Nguyễn Thị Mai',
    },
  ]);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Selected checkboxes for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dynamic Subjects & Grades management
  const [subjectsList, setSubjectsList] = useState<string[]>([
    'Toán học',
    'Vật lý',
    'Tiếng Anh',
    'Hóa học',
    'Sinh học',
    'Ngữ văn',
    'Tin học'
  ]);
  const [gradesList, setGradesList] = useState<number[]>([6, 7, 8, 9, 10, 11, 12]);

  const handleAddSubject = () => {
    const newSub = prompt('Nhập tên môn học mới (ví dụ: Hóa học, Sinh học, Lịch sử...):');
    if (newSub && newSub.trim()) {
      const trimmed = newSub.trim();
      if (!subjectsList.includes(trimmed)) {
        setSubjectsList([...subjectsList, trimmed]);
        showToast(`Đã thêm môn học: ${trimmed}`, 'success');
        return trimmed;
      } else {
        showToast('Môn học này đã tồn tại trong danh sách.', 'info');
        return trimmed;
      }
    }
    return null;
  };

  const handleAddGrade = () => {
    const newGradeStr = prompt('Nhập số khối/lớp mới (ví dụ: 6, 7, 8, 9, 13...):');
    if (newGradeStr && !isNaN(Number(newGradeStr))) {
      const num = Number(newGradeStr);
      if (!gradesList.includes(num)) {
        const nextGrades = [...gradesList, num].sort((a, b) => a - b);
        setGradesList(nextGrades);
        showToast(`Đã thêm khối lớp: ${num}`, 'success');
        return num;
      } else {
        showToast('Khối lớp này đã tồn tại trong danh sách.', 'info');
        return num;
      }
    }
    return null;
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [createTab, setCreateTab] = useState<'import' | 'ai' | 'manual'>('manual');

  // Form states for Create/Edit
  const [formText, setFormText] = useState('');
  const [formSubject, setFormSubject] = useState('Toán học');
  const [formGrade, setFormGrade] = useState(10);
  const [formTopic, setFormTopic] = useState('Đại số cơ bản');
  const [formType, setFormType] = useState<QuestionItem['type']>('Trắc nghiệm (1 đáp án)');
  const [formDifficulty, setFormDifficulty] = useState<QuestionItem['difficulty']>('Nhận biết');
  const [formStatus, setFormStatus] = useState<QuestionItem['status']>('Đã duyệt');
  const [formPoints, setFormPoints] = useState(2.0);
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<number | string>(0);
  const [formExplanation, setFormExplanation] = useState('');

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState<QuestionItem['difficulty']>('Thông hiểu');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.code.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'ALL' || q.subject === filterSubject;
    const matchGrade = filterGrade === 'ALL' || q.gradeLevel === Number(filterGrade);
    const matchType = filterType === 'ALL' || q.type === filterType;
    const matchDiff = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    const matchStatus = filterStatus === 'ALL' || q.status === filterStatus;
    return matchSearch && matchSubject && matchGrade && matchType && matchDiff && matchStatus;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      showToast('Đã xóa câu hỏi thành công', 'success');
    }
  };

  const handleDuplicate = (q: QuestionItem) => {
    const duplicated: QuestionItem = {
      ...q,
      id: `q_${Date.now()}`,
      code: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      questionText: `${q.questionText} (Bản sao)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuestions([duplicated, ...questions]);
    showToast('Đã nhân bản câu hỏi thành công', 'success');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi', 'warning');
      return;
    }

    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                questionText: formText,
                subject: formSubject,
                gradeLevel: formGrade,
                topic: formTopic,
                type: formType,
                difficulty: formDifficulty,
                status: formStatus,
                points: formPoints,
                options: formType.includes('Trắc nghiệm') ? formOptions : undefined,
                correctAnswer: formCorrect,
                explanation: formExplanation,
              }
            : q
        )
      );
      showToast('Đã cập nhật câu hỏi thành công', 'success');
    } else {
      const newQ: QuestionItem = {
        id: `q_${Date.now()}`,
        code: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        questionText: formText,
        subject: formSubject,
        gradeLevel: formGrade,
        topic: formTopic,
        type: formType,
        difficulty: formDifficulty,
        status: formStatus,
        points: formPoints,
        options: formType.includes('Trắc nghiệm') ? formOptions : undefined,
        correctAnswer: formCorrect,
        explanation: formExplanation,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Cô Nguyễn Thị Mai',
      };
      setQuestions([newQ, ...questions]);
      showToast('Đã thêm câu hỏi mới vào ngân hàng', 'success');
    }

    setIsCreateOpen(false);
    setEditingQuestion(null);
    resetForm();
  };

  const resetForm = () => {
    setFormText('');
    setFormSubject('Toán học');
    setFormGrade(10);
    setFormTopic('Đại số cơ bản');
    setFormType('Trắc nghiệm (1 đáp án)');
    setFormDifficulty('Nhận biết');
    setFormStatus('Đã duyệt');
    setFormPoints(2.0);
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormExplanation('');
  };

  const openEdit = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormText(q.questionText);
    setFormSubject(q.subject);
    setFormGrade(q.gradeLevel);
    setFormTopic(q.topic);
    setFormType(q.type);
    setFormDifficulty(q.difficulty);
    setFormStatus(q.status);
    setFormPoints(q.points);
    setFormOptions(q.options || ['', '', '', '']);
    setFormCorrect(typeof q.correctAnswer === 'number' || typeof q.correctAnswer === 'string' ? q.correctAnswer : 0);
    setFormExplanation(q.explanation);
    setIsCreateOpen(true);
  };

  const handleExportExcel = () => {
    const headers = ['Mã câu hỏi', 'Nội dung', 'Môn học', 'Khối', 'Chủ đề', 'Dạng', 'Mức độ', 'Điểm', 'Đáp án'];
    const rows = filteredQuestions.map((q) => [
      q.code,
      `"${q.questionText.replace(/"/g, '""')}"`,
      q.subject,
      q.gradeLevel,
      q.topic,
      q.type,
      q.difficulty,
      q.points,
      `"${String(q.correctAnswer)}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ngan_hang_cau_hoi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Xuất dữ liệu ngân hàng câu hỏi thành công!', 'success');
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) {
      showToast('Vui lòng nhập chủ đề hoặc nội dung yêu cầu AI', 'warning');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const generated: QuestionItem = {
        id: `q_${Date.now()}`,
        code: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        questionText: `[AI tạo từ khóa "${aiPrompt}"] Cho phương trình bậc hai với tham số m. Tìm điều kiện của m để phương trình có hai nghiệm phân biệt trái dấu?`,
        subject: aiSubject,
        gradeLevel: aiGrade,
        topic: aiPrompt,
        type: 'Trắc nghiệm (1 đáp án)',
        difficulty: aiDifficulty,
        status: 'Bản nháp',
        options: ['m < 0', 'm > 0', 'm = 1', 'm khác 0'],
        correctAnswer: 0,
        explanation: 'AI giải thích: Phương trình có hai nghiệm trái dấu khi ac < 0.',
        points: 2.5,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'AI Trợ lý giáo viên',
      };
      setQuestions([generated, ...questions]);
      setIsAiOpen(false);
      setAiPrompt('');
      showToast('AI đã tạo thành công câu hỏi mới (lưu ở trạng thái Bản nháp để rà soát)!', 'success');
    }, 1500);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} câu hỏi đã chọn?`)) {
      setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
      setSelectedIds([]);
      showToast('Đã xóa hàng loạt câu hỏi thành công', 'success');
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* 1. Header Card (Riêng biệt) */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center gap-3">
        <div className="p-2.5 bg-cyan-950/60 rounded-xl border border-cyan-500/40 text-cyan-400">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Ngân Hàng Câu Hỏi</h1>
          <p className="text-[11px] text-cyan-300/80">Quản lý kho câu hỏi chuẩn kiến thức, tích hợp AI tự động tạo câu hỏi và chấm điểm thông minh</p>
        </div>
      </div>

      {/* 2. Stats & Action Toolbar in ONE single unified card strictly on the same line */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-4 overflow-x-auto">
        {/* Left: Stats Inline Pills */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="bg-[#080E20] px-3 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Tổng:</span>
            <span className="text-xs font-black text-white">{questions.length} câu</span>
          </div>
          <div className="bg-[#080E20] px-3 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Đã duyệt:</span>
            <span className="text-xs font-black text-emerald-400">{questions.filter((q) => q.status === 'Đã duyệt').length} câu</span>
          </div>
          <div className="bg-[#080E20] px-3 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Bản nháp:</span>
            <span className="text-xs font-black text-amber-400">{questions.filter((q) => q.status === 'Bản nháp').length} câu</span>
          </div>
          <div className="bg-[#080E20] px-3 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Đã chọn:</span>
            <span className="text-xs font-black text-cyan-300">{selectedIds.length} câu</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiOpen(true)}
            icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
            className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/40 text-xs"
          >
            AI Tạo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            icon={<Upload className="w-4 h-4" />}
            className="border-cyan-500/50 text-slate-200 hover:bg-cyan-950/40 text-xs"
          >
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<Download className="w-4 h-4" />}
            className="border-cyan-500/50 text-slate-200 hover:bg-cyan-950/40 text-xs"
          >
            Xuất
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingQuestion(null);
              resetForm();
              setIsCreateOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Tạo mới
          </Button>
        </div>
      </div>

      {/* Phương thức Selection Bar (Matching reference image) */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto">
          <span className="text-xs font-black text-cyan-300 whitespace-nowrap">Phương thức:</span>
          <div className="bg-[#080E20] p-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" /> Tab 1: Nhập câu hỏi bằng cách Import
            </button>
            <button
              onClick={() => setIsAiOpen(true)}
              className="py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Tab 2: Tạo bằng AI thông minh
            </button>
            <button
              onClick={() => {
                setEditingQuestion(null);
                resetForm();
                setIsCreateOpen(true);
              }}
              className="py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" /> Tab 3: Tạo bằng thủ công
            </button>
          </div>
        </div>
        <div className="text-xs text-slate-400 italic whitespace-nowrap">
          Chọn tab để bổ sung câu hỏi vào kho
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo nội dung, mã câu hỏi hoặc chủ đề..."
              className="w-full bg-[#080E20] border-cyan-500/40 text-xs"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-300">Đã chọn {selectedIds.length} câu</span>
              <Button variant="danger" size="sm" onClick={handleBatchDelete} icon={<Trash2 className="w-3.5 h-3.5" />}>
                Xóa đã chọn
              </Button>
            </div>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-cyan-500/20 text-xs">
          <select
            value={filterSubject}
            onChange={(e) => {
              if (e.target.value === 'ADD_NEW') {
                const added = handleAddSubject();
                if (added) setFilterSubject(added);
              } else {
                setFilterSubject(e.target.value);
              }
            }}
            className="bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả môn học</option>
            {subjectsList.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
            <option value="ADD_NEW">➕ Thêm môn học mới...</option>
          </select>

          <select
            value={filterGrade}
            onChange={(e) => {
              if (e.target.value === 'ADD_NEW') {
                const added = handleAddGrade();
                if (added !== null) setFilterGrade(String(added));
              } else {
                setFilterGrade(e.target.value);
              }
            }}
            className="bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả khối lớp</option>
            {gradesList.map((g) => (
              <option key={g} value={String(g)}>Khối {g}</option>
            ))}
            <option value="ADD_NEW">➕ Thêm khối lớp mới...</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả dạng câu hỏi</option>
            <option value="Trắc nghiệm (1 đáp án)">Trắc nghiệm (1 đáp án)</option>
            <option value="Đúng / Sai">Đúng / Sai</option>
            <option value="Điền từ">Điền từ</option>
            <option value="Tự luận">Tự luận</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Bản nháp">Bản nháp</option>
            <option value="Lưu trữ">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="cursor-pointer text-cyan-400">
                    {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Mã câu hỏi</th>
                <th className="py-3 px-4 min-w-[260px]">Nội dung câu hỏi</th>
                <th className="py-3 px-4 whitespace-nowrap">Môn / Lớp</th>
                <th className="py-3 px-4 whitespace-nowrap">Chủ đề</th>
                <th className="py-3 px-4 whitespace-nowrap">Dạng</th>
                <th className="py-3 px-4 whitespace-nowrap">Mức độ</th>
                <th className="py-3 px-4 whitespace-nowrap">Trạng thái</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => {
                  const isChecked = selectedIds.includes(q.id);
                  return (
                    <tr key={q.id} className="hover:bg-cyan-950/30 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleToggleSelect(q.id)} className="cursor-pointer text-cyan-400">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300 whitespace-nowrap">{q.code}</td>
                      <td className="py-3 px-4 max-w-sm truncate text-white" title={q.questionText}>
                        {q.questionText}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {q.subject} / Lớp {q.gradeLevel}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{q.topic}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="blue" size="sm">
                          {q.type.includes('Trắc nghiệm') ? 'Trắc nghiệm' : q.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            q.difficulty === 'Nhận biết'
                              ? 'text-blue-400'
                              : q.difficulty === 'Thông hiểu'
                              ? 'text-cyan-300'
                              : q.difficulty === 'Vận dụng'
                              ? 'text-amber-300'
                              : 'text-rose-400'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={q.status === 'Đã duyệt' ? 'emerald' : q.status === 'Bản nháp' ? 'amber' : 'slate'} size="sm">
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer"
                            title="Xem trước"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(q)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(q)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer"
                            title="Nhân bản"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#080E20] rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Question */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Môn học</label>
              <select
                value={formSubject}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    const added = handleAddSubject();
                    if (added) setFormSubject(added);
                  } else {
                    setFormSubject(e.target.value);
                  }
                }}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              >
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="ADD_NEW">➕ Thêm môn học mới...</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Khối lớp</label>
              <select
                value={formGrade}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    const added = handleAddGrade();
                    if (added !== null) setFormGrade(added);
                  } else {
                    setFormGrade(Number(e.target.value));
                  }
                }}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              >
                {gradesList.map((g) => (
                  <option key={g} value={g}>Khối {g}</option>
                ))}
                <option value="ADD_NEW">➕ Thêm khối lớp mới...</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Dạng câu hỏi</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Trắc nghiệm (1 đáp án)">Trắc nghiệm (1 đáp án)</option>
                <option value="Đúng / Sai">Đúng / Sai</option>
                <option value="Điền từ">Điền từ</option>
                <option value="Tự luận">Tự luận</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Mức độ khó</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as any)}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Chủ đề / Bài học</label>
              <input
                type="text"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="Ví dụ: Hàm số bậc hai"
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Trạng thái duyệt</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Bản nháp">Bản nháp</option>
                <option value="Lưu trữ">Lưu trữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-cyan-300 block mb-1">Nội dung câu hỏi</label>
            <textarea
              rows={3}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Nhập nội dung câu hỏi chi tiết..."
              className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          {formType.includes('Trắc nghiệm') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-300 block">Các phương án lựa chọn & Đáp án đúng</label>
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={formCorrect === idx}
                    onChange={() => setFormCorrect(idx)}
                    className="cursor-pointer"
                    title="Chọn làm đáp án đúng"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...formOptions];
                      next[idx] = e.target.value;
                      setFormOptions(next);
                    }}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-cyan-300 block mb-1">Lời giải chi tiết & Giải thích</label>
            <textarea
              rows={2}
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="Nhập lời giải thích hướng dẫn học sinh..."
              className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingQuestion ? 'Lưu thay đổi' : 'Thêm vào ngân hàng'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Preview Question */}
      <Modal
        isOpen={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        title="Xem trước câu hỏi (Góc nhìn học sinh)"
      >
        {previewQuestion && (
          <div className="space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between bg-[#080E20] p-3 rounded-xl border border-cyan-500/30">
              <div>
                <span className="font-bold text-cyan-300">{previewQuestion.subject}</span> - Lớp {previewQuestion.gradeLevel}
              </div>
              <Badge variant="blue" size="sm">
                Mức độ: {previewQuestion.difficulty}
              </Badge>
            </div>

            <div className="text-sm font-bold text-white leading-relaxed p-2">
              {previewQuestion.questionText}
            </div>

            {previewQuestion.options && (
              <div className="space-y-2">
                {previewQuestion.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      Number(previewQuestion.correctAnswer) === idx
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-bold'
                        : 'bg-[#080E20] border-cyan-500/20 text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/40 space-y-1">
              <div className="font-bold text-cyan-300">Lời giải / Hướng dẫn giải:</div>
              <div className="text-slate-300">{previewQuestion.explanation}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: AI Generate */}
      <Modal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} title="AI Trợ lý giáo viên tạo câu hỏi">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Nhập chủ đề hoặc nội dung bài học, AI sẽ tự động biên soạn câu hỏi chuẩn kiến thức kèm đáp án và lời giải chi tiết.
          </p>

          <div>
            <label className="text-xs font-bold text-cyan-300 block mb-1">Chủ đề bài học / Nội dung tài liệu</label>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ví dụ: Định luật bảo toàn cơ năng, Phương trình bậc hai..."
              className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Môn</label>
              <select
                value={aiSubject}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    const added = handleAddSubject();
                    if (added) setAiSubject(added);
                  } else {
                    setAiSubject(e.target.value);
                  }
                }}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-2 py-2 text-xs text-white"
              >
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="ADD_NEW">➕ Thêm môn...</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Khối</label>
              <select
                value={aiGrade}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    const added = handleAddGrade();
                    if (added !== null) setAiGrade(added);
                  } else {
                    setAiGrade(Number(e.target.value));
                  }
                }}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-2 py-2 text-xs text-white"
              >
                {gradesList.map((g) => (
                  <option key={g} value={g}>Khối {g}</option>
                ))}
                <option value="ADD_NEW">➕ Thêm...</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1">Mức độ</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as any)}
                className="w-full bg-[#080E20] border border-cyan-500/40 rounded-xl px-2 py-2 text-xs text-white"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
            <Button variant="outline" size="sm" onClick={() => setIsAiOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAiGenerate}
              disabled={isGenerating}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isGenerating ? 'AI đang biên soạn...' : 'Tạo câu hỏi ngay'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Import */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import câu hỏi từ tệp Excel / CSV">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Tải lên tệp danh sách câu hỏi theo mẫu chuẩn để hệ thống tự động kiểm tra lỗi và nhập hàng loạt vào ngân hàng.
          </p>

          <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 text-center space-y-2 bg-[#080E20]/50">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="font-bold text-white">Kéo thả tệp vào đây hoặc bấm để chọn tệp</div>
            <div className="text-[11px] text-slate-400">Hỗ trợ định dạng .xlsx, .csv (Tối đa 10MB)</div>
            <Button variant="outline" size="sm" className="mt-2">
              Tải tệp mẫu Excel
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsImportOpen(false);
                showToast('Import thành công 15 câu hỏi vào ngân hàng!', 'success');
              }}
            >
              Xác nhận Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
