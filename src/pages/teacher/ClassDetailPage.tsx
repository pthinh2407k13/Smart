import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Award,
  Calendar,
  FileText,
  Plus,
  QrCode,
  Copy,
  Search,
  CheckSquare,
  Clock,
  Sparkles,
  Edit3,
  Save,
  ArrowLeft,
  ChevronRight,
  Smile,
  Frown,
  TrendingUp,
  FolderMinus,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import {
  ClassRoom,
  Student,
  AttendanceSession,
  Assignment,
  StudentGradeRecord,
  GradeItem,
  BehaviorRecord,
  ScheduleItem,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchBox } from '../../components/ui/SearchBox';

type TabKey =
  | 'overview'
  | 'students'
  | 'attendance'
  | 'assignments'
  | 'grades'
  | 'rewards'
  | 'schedule'
  | 'reports';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setSelectedClassId } = useClass();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [currentClass, setCurrentClass] = useState<ClassRoom | undefined>(() =>
    id ? dbService.getClassById(id) : undefined
  );
  const [students, setStudents] = useState<Student[]>(() =>
    id ? dbService.getStudents(id) : []
  );
  const [sessions, setSessions] = useState<AttendanceSession[]>(() =>
    id ? dbService.getAttendanceSessions(id) : []
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    id ? dbService.getAssignments(id) : []
  );
  const [gradeItems, setGradeItems] = useState<GradeItem[]>(() =>
    id ? dbService.getGradeItems(id) : []
  );
  const [gradeRecords, setGradeRecords] = useState<StudentGradeRecord[]>(() =>
    id ? dbService.getGradeRecords(id) : []
  );
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(() =>
    id ? dbService.getBehaviors(undefined, id) : []
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() =>
    dbService.getState().schedules.filter((s) => s.classId === id)
  );

  // Open/Close inner screens drawer/accordion for this Class
  const [isInnerScreensOpen, setIsInnerScreensOpen] = useState(true);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Attendance fast state
  const [todayAttendance, setTodayAttendance] = useState<Record<string, 'PRESENT' | 'EXCUSED' | 'UNEXCUSED' | 'LATE'>>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // New Assignment Modal
  const [isAddAsgOpen, setIsAddAsgOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDue, setAsgDue] = useState('2025-03-05 23:59');

  // Behavior Modal
  const [isAddBehaviorOpen, setIsAddBehaviorOpen] = useState(false);
  const [behaviorStudentId, setBehaviorStudentId] = useState('');
  const [behaviorType, setBehaviorType] = useState<'POSITIVE' | 'NEED_IMPROVEMENT'>('POSITIVE');
  const [behaviorContent, setBehaviorContent] = useState('');
  const [behaviorPoints, setBehaviorPoints] = useState(5);

  useEffect(() => {
    if (id) {
      setSelectedClassId(id);
      setCurrentClass(dbService.getClassById(id));
      setStudents(dbService.getStudents(id));
      setSessions(dbService.getAttendanceSessions(id));
      setAssignments(dbService.getAssignments(id));
      setGradeItems(dbService.getGradeItems(id));
      setGradeRecords(dbService.getGradeRecords(id));
      setBehaviors(dbService.getBehaviors(undefined, id));
      setSchedules(dbService.getState().schedules.filter((s) => s.classId === id));

      const firstSess = dbService.getAttendanceSessions(id)[0];
      if (firstSess) {
        const map: Record<string, 'PRESENT' | 'EXCUSED' | 'UNEXCUSED' | 'LATE'> = {};
        firstSess.records.forEach((r) => {
          map[r.studentId] = r.status as any;
        });
        setTodayAttendance(map);
      }
    }
  }, [id, setSelectedClassId]);

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-[#0D152A] rounded-2xl border border-cyan-500/30 text-white">
        <h3 className="text-lg font-bold text-white">Không tìm thấy lớp học</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Lớp học này có thể đã bị xóa hoặc không hợp lệ.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/teacher/classes')}>
          Quay lại danh sách lớp
        </Button>
      </div>
    );
  }

  // Attendance helpers
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'PRESENT' | 'EXCUSED' | 'UNEXCUSED' | 'LATE'> = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENT';
    });
    setTodayAttendance(updated);
    setAttendanceSaved(false);
    showToast('Đã đánh dấu tất cả có mặt. Bấm Lưu để hoàn tất.', 'info');
  };

  const handleSaveAttendance = () => {
    const records = students.map((s, idx) => ({
      id: `ar_${Date.now()}_${idx}`,
      sessionId: `att_session_${currentClass.id}`,
      studentId: s.id,
      studentName: s.fullName,
      studentCode: s.studentCode,
      status: todayAttendance[s.id] || 'PRESENT',
      updatedAt: new Date().toISOString(),
    }));

    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const unexcusedCount = records.filter((r) => r.status === 'UNEXCUSED').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;

    dbService.saveAttendanceSession({
      id: `att_session_${currentClass.id}`,
      classId: currentClass.id,
      date: new Date().toISOString().split('T')[0],
      period: 1,
      sessionType: 'Sáng',
      teacherId: 'u_teacher_01',
      teacherName: 'Cô Nguyễn Thị Mai',
      totalStudents: students.length,
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      isLocked: false,
      records,
    });

    dbService.logAudit(
      'Cô Nguyễn Thị Mai',
      'TEACHER',
      'LƯU_ĐIỂM_DANH',
      currentClass.name,
      `Điểm danh: ${presentCount} có mặt, ${excusedCount} phép, ${lateCount} muộn.`
    );

    setAttendanceSaved(true);
    showToast('Đã lưu dữ liệu điểm danh thành công!', 'success');
  };

  // Add student handler
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nextCode = `HS${1000 + students.length + 1}`;
    const created = dbService.createStudent({
      schoolId: currentClass.schoolId,
      classId: currentClass.id,
      className: currentClass.name,
      studentCode: nextCode,
      fullName: newStudentName,
      gender: newStudentGender,
      dob: '2009-01-01',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: 'Hà Đông, Hà Nội',
      parentName: newStudentParent || 'Phụ huynh học sinh',
      parentPhone: newStudentPhone || '0988 000 111',
      status: 'ACTIVE',
      conduct: 'Tốt',
    });

    setStudents(dbService.getStudents(currentClass.id));
    setCurrentClass(dbService.getClassById(currentClass.id));
    setIsAddStudentOpen(false);
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
    showToast(`Đã thêm học sinh ${created.fullName} (${created.studentCode})`, 'success');
  };

  // Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    dbService.createAssignment({
      classId: currentClass.id,
      className: currentClass.name,
      title: asgTitle,
      description: asgDesc || 'Hoàn thành các bài tập theo yêu cầu của giáo viên.',
      subjectId: 'sub_toan',
      subjectName: 'Toán học',
      teacherId: 'u_teacher_01',
      teacherName: 'Cô Nguyễn Thị Mai',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: asgDue,
      maxScore: 10,
      status: 'ACTIVE',
      targetGroup: 'ALL',
    });

    setAssignments(dbService.getAssignments(currentClass.id));
    setIsAddAsgOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    showToast('Đã giao bài tập mới thành công!', 'success');
  };

  // Add behavior log
  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorStudentId || !behaviorContent.trim()) return;
    const targetStudent = students.find((s) => s.id === behaviorStudentId);

    dbService.addBehavior({
      studentId: behaviorStudentId,
      studentName: targetStudent?.fullName || 'Học sinh',
      classId: currentClass.id,
      type: behaviorType,
      content: behaviorContent,
      points: behaviorType === 'POSITIVE' ? Math.abs(behaviorPoints) : -Math.abs(behaviorPoints),
      recordedBy: 'Cô Nguyễn Thị Mai',
      category: 'Học tập',
    });

    setBehaviors(dbService.getBehaviors(undefined, currentClass.id));
    setStudents(dbService.getStudents(currentClass.id));
    setIsAddBehaviorOpen(false);
    setBehaviorContent('');
    showToast('Đã ghi nhận hành vi / thi đua', 'success');
  };

  const handleGradeChange = (studentId: string, gradeItemId: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      dbService.updateGradeScore(currentClass.id, studentId, gradeItemId, num);
      setGradeRecords(dbService.getGradeRecords(currentClass.id));
    }
  };

  const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: <FileText className="w-4 h-4" /> },
    { key: 'students', label: `Học sinh (${students.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'attendance', label: 'Điểm danh', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'assignments', label: `Bài tập (${assignments.length})`, icon: <BookOpen className="w-4 h-4" /> },
    { key: 'grades', label: 'Sổ điểm', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'rewards', label: `Thi đua & Hành vi (${behaviors.length})`, icon: <Award className="w-4 h-4" /> },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <Calendar className="w-4 h-4" /> },
    { key: 'reports', label: 'Báo cáo lớp', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Banner */}
      <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 overflow-hidden shadow-xl shadow-cyan-950/50">
        <div className="h-3 w-full" style={{ backgroundColor: currentClass.themeColor || '#06B6D4' }} />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teacher/classes')}
                icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
                className="mt-1"
              >
                Tất cả lớp
              </Button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {currentClass.name}
                  </h1>
                  <Badge variant="blue" size="md">
                    Khối {currentClass.gradeLevelId}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  GVCN: <span className="font-semibold text-cyan-300">{currentClass.homeroomTeacherName}</span> •{' '}
                  Phòng học: <span className="font-semibold text-cyan-300">{currentClass.roomNumber}</span> •{' '}
                  Sĩ số: <span className="font-bold text-cyan-400">{students.length} học sinh</span>
                </p>
              </div>
            </div>

            {/* Quick Tools within class & Open/Close all screens toggle */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsInnerScreensOpen(!isInnerScreensOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isInnerScreensOpen
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60 shadow-md shadow-cyan-950/50'
                    : 'bg-[#0A1022] hover:bg-[#111C38] text-slate-300 border-cyan-500/30'
                }`}
                title={isInnerScreensOpen ? 'Bấm lần 2 để đóng các màn hình bên trong' : 'Bấm để mở các màn hình bên trong'}
              >
                {isInnerScreensOpen ? (
                  <>
                    <FolderMinus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Đóng các màn hình bên trong</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mở các màn hình bên trong (8 mục)</span>
                  </>
                )}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teacher/tools/wheel')}
                icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Vòng quay gọi tên
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080E20] border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentClass.inviteCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentClass.inviteCode);
                    showToast('Đã sao chép mã mời!', 'info');
                  }}
                  className="text-slate-400 hover:text-cyan-300 ml-1 cursor-pointer"
                  title="Sao chép"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation (Visible when Open) */}
          {isInnerScreensOpen && (
            <div className="flex items-center gap-1 border-b border-cyan-500/30 mt-6 overflow-x-auto no-scrollbar animate-fadeIn">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-cyan-500/40'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Closed state placeholder message */}
      {!isInnerScreensOpen && (
        <div className="p-8 text-center bg-[#0D152A] rounded-2xl border border-cyan-500/30 text-slate-300">
          <p className="text-sm font-semibold">Các màn hình bên trong lớp đang được đóng.</p>
          <button
            onClick={() => setIsInnerScreensOpen(true)}
            className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl border border-cyan-400/50 shadow-md cursor-pointer"
          >
            Mở lại các màn hình bên trong
          </button>
        </div>
      )}

      {/* TAB CONTENT 1: OVERVIEW */}
      {isInnerScreensOpen && activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
              <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">
                Chuyên cần trung bình
              </span>
              <div className="text-2xl font-black text-white mt-1">96.8%</div>
              <p className="text-xs text-emerald-400 font-semibold mt-1">↑ Đạt chỉ tiêu thi đua cấp Trường</p>
            </div>

            <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
              <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">
                Điểm trung bình lớp (GPA)
              </span>
              <div className="text-2xl font-black text-white mt-1">8.7 / 10</div>
              <p className="text-xs text-cyan-400 font-semibold mt-1">Xếp loại Học lực: Xuất sắc</p>
            </div>

            <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40">
              <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">
                Bài tập đã giao
              </span>
              <div className="text-2xl font-black text-white mt-1">{assignments.length} nhiệm vụ</div>
              <p className="text-xs text-purple-400 font-semibold mt-1">Tỷ lệ hoàn thành đúng hạn: 92%</p>
            </div>
          </div>

          <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40">
            <h3 className="font-bold text-base text-white mb-3">Mục tiêu & Kế hoạch Lớp học</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentClass.description || 'Lớp học chưa thiết lập mục tiêu chi tiết.'}
            </p>
            <div className="mt-4 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-cyan-300">Thao tác nhanh:</span>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('attendance')}>
                Điểm danh hôm nay
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('assignments')}>
                Giao bài tập mới
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('grades')}>
                Nhập điểm thường xuyên
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: STUDENTS */}
      {isInnerScreensOpen && activeTab === 'students' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-white">Danh sách Học sinh ({students.length})</h3>
              <p className="text-xs text-slate-400">Hồ sơ học sinh và thông tin liên lạc phụ huynh</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teacher/students/import')}
              >
                Nhập từ Excel
              </Button>
              {/* Màu xanh cho Lưu / Thêm */}
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsAddStudentOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Thêm học sinh
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
                <tr>
                  <th className="py-3 px-3">Mã HS</th>
                  <th className="py-3 px-3">Họ và tên</th>
                  <th className="py-3 px-3">Giới tính</th>
                  <th className="py-3 px-3">Tổ</th>
                  <th className="py-3 px-3">Chuyên cần</th>
                  <th className="py-3 px-3">Điểm TB</th>
                  <th className="py-3 px-3">Phụ huynh</th>
                  <th className="py-3 px-3">Điện thoại</th>
                  <th className="py-3 px-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-cyan-950/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">{stu.studentCode}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={stu.avatarUrl}
                          alt={stu.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-cyan-500/40"
                        />
                        <span>{stu.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{stu.gender}</td>
                    <td className="py-3 px-3 text-slate-300">Tổ {stu.groupNumber || 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-400">{stu.attendanceRate}%</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-cyan-300">{stu.gpa}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{stu.parentName}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{stu.parentPhone}</td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/teacher/students/${stu.id}`)}
                      >
                        Hồ sơ 360°
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ATTENDANCE */}
      {isInnerScreensOpen && activeTab === 'attendance' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
            <div>
              <h3 className="font-bold text-base text-white">Điểm danh Lớp học</h3>
              <p className="text-xs text-slate-400">
                Ngày: {new Date().toLocaleDateString('vi-VN')} • Tiết 1 (Buổi Sáng)
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                ✓ Đánh dấu tất cả có mặt
              </Button>
              {/* Màu xanh cho Lưu */}
              <Button
                variant="success"
                size="sm"
                onClick={handleSaveAttendance}
                icon={<Save className="w-4 h-4" />}
              >
                Lưu điểm danh
              </Button>
            </div>
          </div>

          {/* Quick status counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Có mặt</span>
              <div className="text-xl font-black text-emerald-300 mt-0.5">
                {Object.values(todayAttendance).filter((s) => s === 'PRESENT').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center">
              <span className="text-[11px] font-bold text-cyan-400 uppercase">Vắng có phép</span>
              <div className="text-xl font-black text-cyan-300 mt-0.5">
                {Object.values(todayAttendance).filter((s) => s === 'EXCUSED').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
              <span className="text-[11px] font-bold text-amber-400 uppercase">Đi muộn</span>
              <div className="text-xl font-black text-amber-300 mt-0.5">
                {Object.values(todayAttendance).filter((s) => s === 'LATE').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center">
              <span className="text-[11px] font-bold text-rose-400 uppercase">Vắng không phép</span>
              <div className="text-xl font-black text-rose-300 mt-0.5">
                {Object.values(todayAttendance).filter((s) => s === 'UNEXCUSED').length}
              </div>
            </div>
          </div>

          {/* Student Attendance Cards */}
          <div className="space-y-2">
            {students.map((stu) => {
              const currentStatus = todayAttendance[stu.id] || 'PRESENT';
              return (
                <div
                  key={stu.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 bg-[#080E20] gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 w-16">
                      {stu.studentCode}
                    </span>
                    <img
                      src={stu.avatarUrl}
                      alt={stu.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">{stu.fullName}</div>
                      <div className="text-[10px] text-slate-400">Tổ {stu.groupNumber || 1}</div>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
                    {(
                      [
                        { key: 'PRESENT', label: 'Có mặt', active: 'bg-emerald-600 text-white border-emerald-400 font-bold' },
                        { key: 'EXCUSED', label: 'Có phép', active: 'bg-cyan-600 text-white border-cyan-400 font-bold' },
                        { key: 'LATE', label: 'Đi muộn', active: 'bg-amber-600 text-white border-amber-400 font-bold' },
                        { key: 'UNEXCUSED', label: 'Không phép', active: 'bg-rose-600 text-white border-rose-400 font-bold' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.key}
                        onClick={() => {
                          setTodayAttendance((prev) => ({ ...prev, [stu.id]: st.key }));
                          setAttendanceSaved(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          currentStatus === st.key
                            ? st.active
                            : 'bg-[#0D152A] border-cyan-500/20 text-slate-400 hover:text-white hover:border-cyan-400/40'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            {/* Màu xanh cho Lưu */}
            <Button
              variant="success"
              size="md"
              onClick={handleSaveAttendance}
              icon={<Save className="w-4 h-4" />}
            >
              Lưu sổ điểm danh
            </Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ASSIGNMENTS */}
      {isInnerScreensOpen && activeTab === 'assignments' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div>
              <h3 className="font-bold text-base text-white">Bài tập & Nhiệm vụ</h3>
              <p className="text-xs text-slate-400">Quản lý giao bài tập, hạn nộp và chấm điểm</p>
            </div>
            {/* Màu xanh cho Giao bài mới */}
            <Button
              variant="success"
              size="sm"
              onClick={() => setIsAddAsgOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Giao bài mới
            </Button>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 bg-[#080E20] transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{asg.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hạn nộp: <span className="font-semibold text-rose-400">{asg.dueDate}</span> • Thang điểm {asg.maxScore}
                    </p>
                  </div>
                  <Badge variant={asg.status === 'ACTIVE' ? 'emerald' : 'slate'} size="sm">
                    {asg.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{asg.description}</p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Đã nộp: <b className="text-white">{asg.submissionCount}/{students.length}</b> • Đã chấm:{' '}
                    <b className="text-cyan-400">{asg.gradedCount}</b>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/teacher/assignments`)}
                  >
                    Xem chi tiết chấm bài →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: GRADES SPREADSHEET */}
      {isInnerScreensOpen && activeTab === 'grades' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div>
              <h3 className="font-bold text-base text-white">Sổ điểm điện tử</h3>
              <p className="text-xs text-slate-400">Nhập trực tiếp điểm Thường xuyên (TX), Giữa kỳ (GK) và Cuối kỳ (CK)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => showToast('Đã xuất file bảng điểm Excel', 'success')}>
                Xuất Excel
              </Button>
              {/* Màu xanh cho Lưu */}
              <Button variant="success" size="sm" onClick={() => showToast('Đã lưu toàn bộ sổ điểm', 'success')}>
                Lưu sổ điểm
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
                <tr>
                  <th className="py-3 px-3 w-16">Mã HS</th>
                  <th className="py-3 px-3 min-w-[140px]">Họ và tên</th>
                  {gradeItems.map((gi) => (
                    <th key={gi.id} className="py-3 px-3 text-center min-w-[80px]">
                      {gi.name}
                      <span className="block text-[10px] text-cyan-400/80 font-normal">
                        (hệ số {gi.weight})
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[70px]">ĐTB HKI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
                {students.map((stu) => {
                  const rec = gradeRecords.find((r) => r.studentId === stu.id);
                  return (
                    <tr key={stu.id} className="hover:bg-cyan-950/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{stu.studentCode}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{stu.fullName}</td>
                      {gradeItems.map((gi) => {
                        const score = rec?.scores[gi.id];
                        return (
                          <td key={gi.id} className="py-2 px-2 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              defaultValue={score !== null && score !== undefined ? score : ''}
                              onBlur={(e) => handleGradeChange(stu.id, gi.id, e.target.value)}
                              className="w-14 text-center py-1 bg-[#070D1E] border border-cyan-500/40 rounded-lg text-xs font-bold text-white focus:bg-[#0A1224] focus:border-cyan-400 focus:outline-none"
                            />
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-extrabold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                          {rec?.semesterAverage || stu.gpa}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: REWARDS & BEHAVIOR */}
      {isInnerScreensOpen && activeTab === 'rewards' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div>
              <h3 className="font-bold text-base text-white">Thi đua & Hành vi nề nếp</h3>
              <p className="text-xs text-slate-400">Ghi nhận điểm cộng thành tích và nhắc nhở rèn luyện</p>
            </div>
            {/* Màu xanh cho Ghi nhận mới */}
            <Button
              variant="success"
              size="sm"
              onClick={() => setIsAddBehaviorOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Ghi nhận mới
            </Button>
          </div>

          <div className="space-y-3">
            {behaviors.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  b.type === 'POSITIVE'
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      b.type === 'POSITIVE' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                    }`}
                  >
                    {b.type === 'POSITIVE' ? <Smile className="w-4 h-4" /> : <Frown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{b.studentName}</span>
                      <Badge variant="slate" size="sm">
                        {b.category}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{b.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{b.content}</p>
                  </div>
                </div>

                <div
                  className={`text-sm font-black px-2.5 py-1 rounded-lg border ${
                    b.type === 'POSITIVE' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-rose-950 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {b.points > 0 ? `+${b.points}` : b.points} điểm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: SCHEDULE */}
      {isInnerScreensOpen && activeTab === 'schedule' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div>
              <h3 className="font-bold text-base text-white">Thời khóa biểu Lớp học ({currentClass.name})</h3>
              <p className="text-xs text-slate-400">Xem và hiệu chỉnh lịch học theo tuần của lớp</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedClassId(currentClass.id);
                navigate('/teacher/schedule');
              }}
              icon={<Edit3 className="w-4 h-4 text-cyan-400" />}
            >
              Chỉnh sửa trên lưới
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((sch) => (
              <div key={sch.id} className="p-4 rounded-xl border border-cyan-500/20 bg-[#080E20] space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">Thứ {sch.dayOfWeek}</Badge>
                  <span className="text-xs font-bold text-cyan-300">Tiết {sch.period}</span>
                </div>
                <div className="font-extrabold text-sm text-white">{sch.subjectName}</div>
                <div className="text-xs text-slate-400">
                  {sch.startTime} - {sch.endTime} • GV: {sch.teacherName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: REPORTS */}
      {isInnerScreensOpen && activeTab === 'reports' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-6 shadow-md shadow-cyan-950/40 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Báo cáo & Thống kê Chất lượng Lớp</h3>
              <p className="text-xs text-slate-400">Tổng kết học lực, chuyên cần và hạnh kiểm HKI</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => showToast('Đang tải bản in PDF...', 'info')}>
              In báo cáo PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#080E20] border border-cyan-500/20">
              <span className="text-xs text-slate-400">Học sinh giỏi (GPA &gt;= 8.0)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">7 / 8 (87.5%)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#080E20] border border-cyan-500/20">
              <span className="text-xs text-slate-400">Học sinh khá (6.5 - 7.9)</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">1 / 8 (12.5%)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#080E20] border border-cyan-500/20">
              <span className="text-xs text-slate-400">Trung bình / Yếu</span>
              <div className="text-2xl font-black text-slate-500 mt-1">0 (0%)</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      <Modal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        title="Thêm học sinh mới vào lớp"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Họ và tên học sinh *</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="VD: Trần Minh Khang"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Giới tính</label>
              <select
                value={newStudentGender}
                onChange={(e) => setNewStudentGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Họ tên Phụ huynh</label>
              <input
                type="text"
                value={newStudentParent}
                onChange={(e) => setNewStudentParent(e.target.value)}
                placeholder="VD: Ông Trần Văn Cường"
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Số điện thoại liên hệ</label>
            <input
              type="tel"
              value={newStudentPhone}
              onChange={(e) => setNewStudentPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddStudentOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu */}
            <Button variant="success" size="sm" type="submit">
              Lưu học sinh
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD ASSIGNMENT */}
      <Modal
        isOpen={isAddAsgOpen}
        onClose={() => setIsAddAsgOpen(false)}
        title="Giao bài tập mới"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              placeholder="VD: Bài tập tuần 25: Bất phương trình mũ"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Hạn nộp</label>
            <input
              type="text"
              value={asgDue}
              onChange={(e) => setAsgDue(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Hướng dẫn làm bài</label>
            <textarea
              rows={3}
              value={asgDesc}
              onChange={(e) => setAsgDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddAsgOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Công bố/Lưu */}
            <Button variant="success" size="sm" type="submit">
              Công bố bài tập
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD BEHAVIOR */}
      <Modal
        isOpen={isAddBehaviorOpen}
        onClose={() => setIsAddBehaviorOpen(false)}
        title="Ghi nhận Hành vi & Khen thưởng"
      >
        <form onSubmit={handleAddBehavior} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Chọn học sinh *</label>
            <select
              required
              value={behaviorStudentId}
              onChange={(e) => setBehaviorStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Loại ghi nhận</label>
              <select
                value={behaviorType}
                onChange={(e) => setBehaviorType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="POSITIVE">Khen thưởng / Tích cực</option>
                <option value="NEED_IMPROVEMENT">Nhắc nhở / Kỷ luật</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Số điểm cộng / trừ</label>
              <input
                type="number"
                min="1"
                max="20"
                value={behaviorPoints}
                onChange={(e) => setBehaviorPoints(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Nội dung chi tiết *</label>
            <textarea
              required
              rows={3}
              value={behaviorContent}
              onChange={(e) => setBehaviorContent(e.target.value)}
              placeholder="VD: Tích cực phát biểu xây dựng bài trong tiết Toán..."
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddBehaviorOpen(false)}>
              Hủy
            </Button>
            {/* Màu xanh cho Lưu */}
            <Button variant="success" size="sm" type="submit">
              Lưu ghi nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
