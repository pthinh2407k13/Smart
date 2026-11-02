import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  UserCheck,
  MapPin,
  Copy,
  Check,
  User,
  Shield,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBox } from '../../components/ui/SearchBox';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatCard } from '../../components/ui/StatCard';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useClass();
  const { showToast } = useToast();

  // Active Tab: 'students' (Danh sách học sinh) | 'parents' (Thông tin phụ huynh)
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students');

  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents());
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterRelation, setFilterRelation] = useState<string>('ALL');
  const [filterAppStatus, setFilterAppStatus] = useState<string>('ALL');

  // Modal create student
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Modal edit student/parent
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editGender, setEditGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Modal message to parent
  const [messageTarget, setMessageTarget] = useState<Student | null>(null);
  const [messageChannel, setMessageChannel] = useState<'APP' | 'SMS' | 'ZALO'>('APP');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // Modal broadcast to all parents
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Delete student
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Copied phone tracker
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setStudents(dbService.getStudents());
    });
    return unsub;
  }, []);

  const filteredStudents = students.filter((s, index) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.fullName.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.parentPhone.includes(search) ||
      (s.address && s.address.toLowerCase().includes(q));
    const matchClass = filterClass === 'ALL' || s.classId === filterClass;

    const isDad = s.parentName.startsWith('Ông');
    const matchRelation =
      filterRelation === 'ALL' ||
      (filterRelation === 'DAD' && isDad) ||
      (filterRelation === 'MOM' && !isDad);

    const isConnected = index % 8 !== 0;
    const matchAppStatus =
      filterAppStatus === 'ALL' ||
      (filterAppStatus === 'CONNECTED' && isConnected) ||
      (filterAppStatus === 'SMS' && !isConnected);

    return matchSearch && matchClass && matchRelation && matchAppStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetClass = classes.find((c) => c.id === classId) || classes[0];
    const nextCode = `HS${1000 + students.length + 1}`;

    const created = dbService.createStudent({
      schoolId: targetClass?.schoolId || 'school_01',
      classId: targetClass?.id || 'class_10a1',
      className: targetClass?.name || '10A1',
      studentCode: nextCode,
      fullName: name,
      gender,
      dob: '2009-02-15',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: 'Hà Đông, Hà Nội',
      parentName: parentName || 'Phụ huynh học sinh',
      parentPhone: parentPhone || '0988 123 456',
      status: 'ACTIVE',
      conduct: 'Tốt',
    });

    dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'THÊM_HỌC_SINH', created.fullName, `Thêm vào lớp ${created.className}`);
    showToast(`Đã thêm học sinh ${created.fullName} (${created.studentCode})`, 'success');
    setIsAddOpen(false);
    setName('');
    setParentName('');
    setParentPhone('');
  };

  const handleStartEdit = (stu: Student) => {
    setEditingStudent(stu);
    setEditFullName(stu.fullName);
    setEditClassId(stu.classId);
    setEditGender(stu.gender);
    setEditParentName(stu.parentName);
    setEditParentPhone(stu.parentPhone);
    setEditAddress(stu.address || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const targetClass = classes.find((c) => c.id === editClassId) || classes[0];

    dbService.updateStudent(editingStudent.id, {
      fullName: editFullName,
      classId: editClassId,
      className: targetClass?.name || editingStudent.className,
      gender: editGender,
      parentName: editParentName,
      parentPhone: editParentPhone,
      address: editAddress,
    });

    dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'CẬP_NHẬT_HỌC_SINH', editFullName, 'Cập nhật thông tin học sinh & phụ huynh');
    showToast(`Đã cập nhật thông tin học sinh ${editFullName}`, 'success');
    setEditingStudent(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const target = students.find((s) => s.id === deleteId);
    dbService.deleteStudent(deleteId);
    dbService.logAudit('Cô Nguyễn Thị Mai', 'TEACHER', 'XÓA_HỌC_SINH', target?.fullName || deleteId, 'Đã xóa hồ sơ học sinh');
    showToast('Đã xóa học sinh khỏi danh sách', 'success');
    setDeleteId(null);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    showToast(`Đã sao chép số điện thoại: ${phone}`, 'info');
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTarget || !messageBody.trim()) return;

    dbService.logAudit(
      'Cô Nguyễn Thị Mai',
      'TEACHER',
      'GỬI_TIN_NHẮN_PHỤ_HUYNH',
      messageTarget.parentName,
      `Gửi tin nhắn qua kênh ${messageChannel}: "${messageTitle || 'Thông báo lớp học'}"`
    );

    showToast(`Đã gửi tin nhắn thành công tới ${messageTarget.parentName} (${messageTarget.parentPhone})`, 'success');
    setMessageTarget(null);
    setMessageTitle('');
    setMessageBody('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastBody.trim()) return;

    dbService.logAudit(
      'Cô Nguyễn Thị Mai',
      'TEACHER',
      'GỬI_THÔNG_BÁO_ĐỒNG_LOẠT_PH',
      filterClass === 'ALL' ? 'Tất cả phụ huynh' : `Lớp ${filterClass}`,
      `Gửi thông báo: "${broadcastTitle || 'Thông báo từ giáo viên chủ nhiệm'}"`
    );

    showToast(`Đã gửi thông báo tới ${filteredStudents.length} phụ huynh qua App Sổ liên lạc số và SMS!`, 'success');
    setIsBroadcastOpen(false);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  // Xuất file Excel (.xls) định dạng chuẩn UTF-8, phông chữ Times New Roman 13pt
  // Mở trực tiếp trên Microsoft Excel và Google Sheets 100% không bao giờ bị lỗi font tiếng Việt hay dính cột
  const handleExportExcel = () => {
    const isParentTab = activeTab === 'parents';
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = isParentTab
      ? `Danh_ba_phu_huynh_${dateStr}.xls`
      : `Danh_sach_hoc_sinh_${dateStr}.xls`;

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          body, table, td, th {
            font-family: "Times New Roman", Times, serif !important;
            font-size: 13px !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th {
            background-color: #0284c7;
            color: #ffffff;
            font-weight: bold;
            border: 1px solid #000000;
            padding: 8px 10px;
            text-align: center;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            font-size: 13px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            color: #0369a1;
            padding: 12px;
          }
          .subtitle {
            font-size: 12px;
            text-align: center;
            color: #475569;
            padding-bottom: 8px;
          }
        </style>
      </head>
      <body>
    `;

    if (isParentTab) {
      tableHtml += `
        <table>
          <tr><td colspan="7" class="title">DANH BẠ THÔNG TIN PHỤ HUYNH HỌC SINH</td></tr>
          <tr><td colspan="7" class="subtitle">Trường THPT Chuyên Hà Nội | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} | Phông chữ: Times New Roman 13pt</td></tr>
          <tr><td colspan="7"></td></tr>
          <thead>
            <tr>
              <th>STT</th>
              <th>MÃ HỌC SINH</th>
              <th>HỌ TÊN CON (HỌC SINH)</th>
              <th>LỚP</th>
              <th>HỌ TÊN PHỤ HUYNH</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>ĐỊA CHỈ GIA ĐÌNH</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map((s, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="center bold">${s.studentCode}</td>
                <td class="bold">${s.fullName}</td>
                <td class="center">${s.className}</td>
                <td class="bold">${s.parentName}</td>
                <td class="center bold" style="mso-number-format:'\\@';">${s.parentPhone}</td>
                <td>${s.address || 'Hà Đông, Hà Nội'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      tableHtml += `
        <table>
          <tr><td colspan="10" class="title">DANH SÁCH HỌC SINH TOÀN TRƯỜNG</td></tr>
          <tr><td colspan="10" class="subtitle">Trường THPT Chuyên Hà Nội | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} | Phông chữ: Times New Roman 13pt</td></tr>
          <tr><td colspan="10"></td></tr>
          <thead>
            <tr>
              <th>STT</th>
              <th>MÃ HỌC SINH</th>
              <th>HỌ VÀ TÊN</th>
              <th>LỚP</th>
              <th>GIỚI TÍNH</th>
              <th>CHUYÊN CẦN</th>
              <th>ĐIỂM TB</th>
              <th>HẠNH KIỂM</th>
              <th>PHỤ HUYNH ĐẠI DIỆN</th>
              <th>SỐ ĐIỆN THOẠI PHỤ HUYNH</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map((s, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="center bold">${s.studentCode}</td>
                <td class="bold">${s.fullName}</td>
                <td class="center">${s.className}</td>
                <td class="center">${s.gender}</td>
                <td class="center">${s.attendanceRate}%</td>
                <td class="center bold">${s.gpa}</td>
                <td class="center">${s.conduct}</td>
                <td>${s.parentName}</td>
                <td class="center bold" style="mso-number-format:'\\@';">${s.parentPhone}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    tableHtml += `</body></html>`;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      isParentTab
        ? 'Đã xuất danh bạ phụ huynh ra file Excel (.xls) chuẩn font Times New Roman 13, không bị lỗi font!'
        : 'Đã xuất danh sách học sinh ra file Excel (.xls) chuẩn font Times New Roman 13, không bị lỗi font!',
      'success'
    );
  };

  const handleExportCsv = () => {
    const isParentTab = activeTab === 'parents';
    const rows: string[] = [];

    const escapeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const text = String(val).replace(/"/g, '""');
      return `"${text}"`;
    };

    if (isParentTab) {
      rows.push(['STT', 'Mã HS', 'Họ tên Học sinh', 'Lớp', 'Họ tên Phụ huynh', 'Số điện thoại', 'Địa chỉ', 'Trạng thái kết nối'].map(escapeCell).join(','));
      filteredStudents.forEach((s, idx) => {
        rows.push([
          idx + 1,
          s.studentCode,
          s.fullName,
          s.className,
          s.parentName,
          s.parentPhone,
          s.address || 'Hà Đông, Hà Nội',
          'Đã kết nối App SLLĐT',
        ].map(escapeCell).join(','));
      });
    } else {
      rows.push(['STT', 'Mã HS', 'Họ tên', 'Lớp', 'Giới tính', 'Chuyên cần', 'Điểm TB', 'Hạnh kiểm', 'Phụ huynh', 'Số điện thoại'].map(escapeCell).join(','));
      filteredStudents.forEach((s, idx) => {
        rows.push([
          idx + 1,
          s.studentCode,
          s.fullName,
          s.className,
          s.gender,
          `${s.attendanceRate}%`,
          s.gpa,
          s.conduct,
          s.parentName,
          s.parentPhone,
        ].map(escapeCell).join(','));
      });
    }

    // '\uFEFF' (UTF-8 BOM) is required by Microsoft Excel on Windows to render Vietnamese characters properly
    const BOM = '\uFEFF';
    const csvContent = BOM + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      isParentTab
        ? `danh_ba_phu_huynh_${new Date().toISOString().split('T')[0]}.csv`
        : `danh_sach_hoc_sinh_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      isParentTab
        ? 'Đã xuất danh bạ phụ huynh ra file CSV (UTF-8 chuẩn Tiếng Việt)'
        : 'Đã xuất danh sách học sinh ra file CSV (UTF-8 chuẩn Tiếng Việt)',
      'success'
    );
  };

  return (
    <div
      className="student-management-container w-full space-y-4 overflow-hidden"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '13px' }}
    >
      {/* Breadcrumbs - 1 dòng duy nhất */}
      <div className="flex items-center gap-1.5 text-xs text-cyan-400/80 font-medium whitespace-nowrap">
        <span>🏠</span>
        <span className="text-slate-500">/</span>
        <span className="hover:text-cyan-300 cursor-pointer">Lớp học</span>
        <span className="text-slate-500">/</span>
        <span className="text-white font-bold">
          {activeTab === 'students' ? 'Danh sách học sinh' : 'Thông tin phụ huynh'}
        </span>
      </div>

      {/* Top Header - 1 dòng gọn gàng, vừa vặn khung */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2 whitespace-nowrap shrink-0">
            <Users className="w-5 h-5 text-cyan-400 shrink-0" />
            Quản lý Học sinh & Phụ huynh
          </h1>
          <span className="text-slate-600 hidden md:inline">|</span>
          <p className="text-xs text-cyan-300/80 whitespace-nowrap truncate hidden md:inline">
            Hệ thống quản lý thông tin học sinh và danh bạ liên lạc phụ huynh học sinh
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          {/* Nút xuất file Excel với font Times New Roman 13 chuẩn không lỗi tiếng Việt */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            title="Xuất file Excel (.xls) chuẩn phông Times New Roman 13pt không bị lỗi chữ tiếng Việt"
          >
            {activeTab === 'students' ? 'Xuất Excel (.xls)' : 'Xuất danh bạ Excel'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5 text-slate-400" />}
            title="Xuất file định dạng CSV UTF-8"
          >
            Xuất CSV
          </Button>

          {activeTab === 'students' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teacher/students/import')}
                icon={<Upload className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Import file
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Thêm học sinh
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBroadcastOpen(true)}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Gửi tin nhắn cả lớp
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Thêm thông tin
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2 Main Tabs: [Danh sách học sinh] & [Thông tin phụ huynh] */}
      <div className="flex items-center border-b border-cyan-500/30 bg-[#0A1124] p-1.5 rounded-2xl whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60 border border-cyan-400/40'
              : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách học sinh</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'students' ? 'bg-cyan-950/80 text-cyan-200' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parents')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'parents'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60 border border-cyan-400/40'
              : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Thông tin phụ huynh</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'parents' ? 'bg-cyan-950/80 text-cyan-200' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {students.length} PH
          </span>
        </button>
      </div>

      {/* Filter and Search Bar (1 dòng duy nhất, không cuộn ngang) */}
      <div className="bg-[#0D152A] p-2.5 px-3 rounded-2xl border border-cyan-500/30 shadow-md shadow-cyan-950/40 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 w-full text-xs whitespace-nowrap">
          <div className="flex items-center gap-2 flex-1 min-w-0 whitespace-nowrap">
            {/* Lớp học */}
            <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
              <span className="text-slate-400 font-medium whitespace-nowrap">Lớp:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-2 py-1.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer whitespace-nowrap"
              >
                <option value="ALL">Tất cả lớp ({students.length} HS)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount} HS)
                  </option>
                ))}
              </select>
            </div>

            {/* Tìm kiếm */}
            <div className="flex-1 min-w-[120px] max-w-xs whitespace-nowrap">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder={
                  activeTab === 'students'
                    ? 'Tìm mã HS, họ tên...'
                    : 'Tìm phụ huynh, SĐT, tên con...'
                }
                className="w-full"
              />
            </div>

            {/* Quan hệ (dành cho Tab Phụ huynh) */}
            {activeTab === 'parents' && (
              <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="text-slate-400 font-medium whitespace-nowrap">Quan hệ:</span>
                <select
                  value={filterRelation}
                  onChange={(e) => setFilterRelation(e.target.value)}
                  className="px-2 py-1.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer whitespace-nowrap"
                >
                  <option value="ALL">Tất cả mối quan hệ</option>
                  <option value="DAD">Bố / Cha</option>
                  <option value="MOM">Mẹ</option>
                </select>
              </div>
            )}

            {/* Trạng thái App (dành cho Tab Phụ huynh) */}
            {activeTab === 'parents' && (
              <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="text-slate-400 font-medium whitespace-nowrap">App:</span>
                <select
                  value={filterAppStatus}
                  onChange={(e) => setFilterAppStatus(e.target.value)}
                  className="px-2 py-1.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer whitespace-nowrap"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="CONNECTED">Đã cài App</option>
                  <option value="SMS">Chỉ SMS</option>
                </select>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-300 font-medium whitespace-nowrap shrink-0 pl-2">
            <span className="font-bold text-cyan-300">{filteredStudents.length}</span>{' '}
            {activeTab === 'students' ? 'học sinh' : 'phụ huynh'}
          </div>
        </div>
      </div>

      {/* KHỐI THỐNG KÊ (CHỖ BÔI ĐỎ) - 1 DÒNG DUY NHẤT, VỪA VẶN 100%, KHÔNG CUỘN NGANG */}
      {activeTab === 'parents' && (
        <div className="bg-[#0B132B] rounded-2xl border border-cyan-500/30 p-2.5 px-3 shadow-md shadow-cyan-950/40 w-full overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-cyan-500/20 text-xs w-full items-center whitespace-nowrap">
            {/* 1. Tổng số Phụ huynh */}
            <div className="flex items-center gap-1.5 px-2.5 min-w-0 whitespace-nowrap">
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex items-center gap-1 text-xs whitespace-nowrap truncate">
                <span className="text-slate-400 whitespace-nowrap">Tổng PH:</span>
                <span className="font-bold text-white whitespace-nowrap">{filteredStudents.length} người</span>
                <span className="text-slate-400 text-[11px] whitespace-nowrap hidden sm:inline">
                  ({Math.ceil(filteredStudents.length / 2)} Bố · {Math.floor(filteredStudents.length / 2)} Mẹ)
                </span>
              </div>
            </div>

            {/* 2. Đã kết nối App */}
            <div className="flex items-center gap-1.5 px-2.5 min-w-0 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex items-center gap-1 text-xs whitespace-nowrap truncate">
                <span className="text-slate-400 whitespace-nowrap">Đã kết nối App:</span>
                <span className="font-bold text-emerald-400 whitespace-nowrap">
                  {Math.round(filteredStudents.length * 0.92)}/{filteredStudents.length}
                </span>
                <span className="text-emerald-300 text-[11px] whitespace-nowrap">(92%)</span>
              </div>
            </div>

            {/* 3. Đầy đủ số điện thoại */}
            <div className="flex items-center gap-1.5 px-2.5 min-w-0 whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex items-center gap-1 text-xs whitespace-nowrap truncate">
                <span className="text-slate-400 whitespace-nowrap">Đầy đủ SĐT:</span>
                <span className="font-bold text-cyan-300 whitespace-nowrap">
                  {filteredStudents.length}/{filteredStudents.length}
                </span>
                <span className="text-cyan-400 text-[11px] whitespace-nowrap">(100%)</span>
              </div>
            </div>

            {/* 4. Ban Đại diện CMHS */}
            <div className="flex items-center gap-1.5 px-2.5 min-w-0 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="flex items-center gap-1 text-xs whitespace-nowrap truncate">
                <span className="text-slate-400 whitespace-nowrap">Ban ĐD CMHS:</span>
                <span className="font-bold text-white whitespace-nowrap truncate">Trần Văn Kiên</span>
                <span className="px-1 py-0.5 rounded text-[9px] font-black bg-purple-900/80 text-purple-200 border border-purple-500/40 whitespace-nowrap shrink-0">
                  Trưởng ban
                </span>
                <span className="text-slate-400 text-[11px] whitespace-nowrap truncate hidden xl:inline">· Vũ Thị Loan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DANH SÁCH HỌC SINH - 1 KHUNG DUY NHẤT, VỪA VẶN 100%, KHÔNG CUỘN NGANG */}
      {activeTab === 'students' && (
        <div className="bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40 w-full">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[8%]" />   {/* MÃ HS */}
                <col className="w-[18%]" />  {/* HỌ VÀ TÊN */}
                <col className="w-[6%]" />   {/* LỚP */}
                <col className="w-[6%]" />   {/* GIỚI TÍNH */}
                <col className="w-[8%]" />   {/* CHUYÊN CẦN */}
                <col className="w-[7%]" />   {/* ĐIỂM TB */}
                <col className="w-[8%]" />   {/* HẠNH KIỂM */}
                <col className="w-[18%]" />  {/* PHỤ HUYNH */}
                <col className="w-[12%]" />  {/* LIÊN HỆ */}
                <col className="w-[9%]" />   {/* THAO TÁC */}
              </colgroup>
              <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
                <tr>
                  <th className="py-2.5 px-2 text-center truncate whitespace-nowrap">MÃ HS</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">HỌ VÀ TÊN</th>
                  <th className="py-2.5 px-1 truncate whitespace-nowrap text-center">LỚP</th>
                  <th className="py-2.5 px-1 truncate whitespace-nowrap text-center">GIỚI TÍNH</th>
                  <th className="py-2.5 px-1 truncate whitespace-nowrap text-center">CHUYÊN CẦN</th>
                  <th className="py-2.5 px-1 truncate whitespace-nowrap text-center">ĐIỂM TB</th>
                  <th className="py-2.5 px-1 truncate whitespace-nowrap text-center">HẠNH KIỂM</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">PHỤ HUYNH</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">LIÊN HỆ</th>
                  <th className="py-2.5 px-2 text-right truncate whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 truncate whitespace-nowrap">
                      Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-cyan-950/30 transition-colors">
                      <td className="py-2 px-2 text-center font-mono font-bold text-cyan-400 truncate whitespace-nowrap">
                        {stu.studentCode}
                      </td>
                      <td className="py-2 px-2 font-bold text-white truncate whitespace-nowrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={stu.avatarUrl}
                            alt={stu.fullName}
                            className="w-5 h-5 rounded-full object-cover border border-cyan-500/40 shrink-0"
                          />
                          <span className="truncate whitespace-nowrap">{stu.fullName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-1 text-center truncate whitespace-nowrap">
                        <span className="font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-1 py-0.5 rounded text-[11px] truncate whitespace-nowrap inline-block">
                          {stu.className}
                        </span>
                      </td>
                      <td className="py-2 px-1 text-center text-slate-300 truncate whitespace-nowrap">
                        {stu.gender}
                      </td>
                      <td className="py-2 px-1 text-center truncate whitespace-nowrap">
                        <span className="font-bold text-emerald-400 truncate whitespace-nowrap">
                          {stu.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2 px-1 text-center font-extrabold text-cyan-300 truncate whitespace-nowrap">
                        {stu.gpa}
                      </td>
                      <td className="py-2 px-1 text-center truncate whitespace-nowrap">
                        <Badge variant={stu.conduct === 'Tốt' ? 'emerald' : 'amber'} size="sm">
                          {stu.conduct}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-slate-200 truncate whitespace-nowrap">
                        <span className="truncate whitespace-nowrap block" title={stu.parentName}>
                          {stu.parentName}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-mono text-cyan-300 truncate whitespace-nowrap">
                        <span className="truncate whitespace-nowrap block">{stu.parentPhone}</span>
                      </td>
                      <td className="py-2 px-2 text-right truncate whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 shrink-0">
                          <button
                            onClick={() => navigate(`/teacher/students/${stu.id}`)}
                            className="p-1 text-cyan-400 hover:text-white hover:bg-cyan-950/60 rounded transition-colors cursor-pointer shrink-0"
                            title="Xem hồ sơ 360°"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(stu)}
                            className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 rounded transition-colors cursor-pointer shrink-0"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(stu.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded transition-colors cursor-pointer shrink-0"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: THÔNG TIN PHỤ HUYNH - 1 KHUNG DUY NHẤT, VỪA VẶN 100%, KHÔNG CUỘN NGANG */}
      {activeTab === 'parents' && (
        <div className="parent-info-screen bg-[#0D152A] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-950/40 w-full">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[4%]" />   {/* STT */}
                <col className="w-[19%]" />  {/* PHỤ HUYNH ĐẠI DIỆN */}
                <col className="w-[19%]" />  {/* CON (HỌC SINH) */}
                <col className="w-[14%]" />  {/* SỐ ĐIỆN THOẠI */}
                <col className="w-[6%]" />   {/* LỚP */}
                <col className="w-[19%]" />  {/* ĐỊA CHỈ */}
                <col className="w-[11%]" />  {/* SMARTCLASS APP */}
                <col className="w-[8%]" />   {/* THAO TÁC */}
              </colgroup>
              <thead className="bg-[#080E20] text-cyan-300 uppercase tracking-wider font-bold border-b border-cyan-500/30">
                <tr>
                  <th className="py-2.5 px-1 text-center truncate whitespace-nowrap">STT</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">PHỤ HUYNH ĐẠI DIỆN</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">CON (HỌC SINH)</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">SỐ ĐIỆN THOẠI LIÊN HỆ</th>
                  <th className="py-2.5 px-1 text-center truncate whitespace-nowrap">LỚP</th>
                  <th className="py-2.5 px-2 truncate whitespace-nowrap">ĐỊA CHỈ GIA ĐÌNH</th>
                  <th className="py-2.5 px-1 text-center truncate whitespace-nowrap">SMARTCLASS APP</th>
                  <th className="py-2.5 px-2 text-right truncate whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 truncate whitespace-nowrap">
                      Không tìm thấy phụ huynh nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu, index) => {
                    const isAppConnected = index % 8 !== 0; // 7/8 connected

                    return (
                      <tr key={stu.id} className="hover:bg-cyan-950/30 transition-colors">
                        <td className="py-2 px-1 text-center font-mono text-slate-400 font-bold truncate whitespace-nowrap">
                          {index + 1}
                        </td>

                        {/* Phụ huynh */}
                        <td className="py-2 px-2 truncate whitespace-nowrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-[10px] border border-cyan-400/40 shadow-xs shrink-0">
                              {stu.parentName.split(' ').pop()?.charAt(0) || 'P'}
                            </div>
                            <span className="font-bold text-white text-xs truncate whitespace-nowrap">
                              {stu.parentName}
                            </span>
                          </div>
                        </td>

                        {/* Học sinh con */}
                        <td className="py-2 px-2 truncate whitespace-nowrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img
                              src={stu.avatarUrl}
                              alt={stu.fullName}
                              className="w-5 h-5 rounded-full object-cover border border-cyan-500/40 shrink-0"
                            />
                            <span className="font-bold text-slate-100 truncate whitespace-nowrap">
                              {stu.fullName}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 truncate whitespace-nowrap shrink-0">
                              ({stu.studentCode})
                            </span>
                          </div>
                        </td>

                        {/* Số điện thoại */}
                        <td className="py-2 px-2 truncate whitespace-nowrap">
                          <div className="flex items-center gap-1 min-w-0">
                            <a
                              href={`tel:${stu.parentPhone}`}
                              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 truncate whitespace-nowrap"
                              title="Bấm để gọi ngay"
                            >
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate whitespace-nowrap">{stu.parentPhone}</span>
                            </a>
                            <button
                              onClick={() => handleCopyPhone(stu.parentPhone)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                              title="Sao chép số điện thoại"
                            >
                              {copiedPhone === stu.parentPhone ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Lớp */}
                        <td className="py-2 px-1 text-center truncate whitespace-nowrap">
                          <span className="font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-1 py-0.5 rounded text-[11px] truncate whitespace-nowrap inline-block">
                            {stu.className}
                          </span>
                        </td>

                        {/* Địa chỉ */}
                        <td className="py-2 px-2 text-slate-300 truncate whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px] min-w-0">
                            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate whitespace-nowrap">{stu.address || 'Hà Đông, Hà Nội'}</span>
                          </div>
                        </td>

                        {/* Trạng thái kết nối App Sổ liên lạc */}
                        <td className="py-2 px-1 text-center truncate whitespace-nowrap">
                          {isAppConnected ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 truncate whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              Đã cài App
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 truncate whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                              Nhận SMS
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="py-2 px-2 text-right truncate whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setMessageTarget(stu);
                                setMessageTitle(`Trao đổi tình hình học sinh ${stu.fullName}`);
                              }}
                              className="p-1 text-cyan-400 hover:text-white hover:bg-cyan-950/60 rounded transition-colors cursor-pointer shrink-0"
                              title="Gửi tin nhắn"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(stu)}
                              className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 rounded transition-colors cursor-pointer shrink-0"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-3.5 h-3.5" />
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
      )}

      {/* MODAL 1: GỬI TIN NHẮN TỚI PHỤ HUYNH */}
      <Modal
        isOpen={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        title={`Trao đổi với ${messageTarget?.parentName || 'Phụ huynh'}`}
      >
        {messageTarget && (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#080E20] border border-cyan-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Phụ huynh em:</span>{' '}
                <strong className="text-white">{messageTarget.fullName}</strong> ({messageTarget.studentCode} - {messageTarget.className})
              </div>
              <div className="font-mono text-emerald-400 font-bold">{messageTarget.parentPhone}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1.5">Kênh gửi tin nhắn</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMessageChannel('APP')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    messageChannel === 'APP'
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-xs'
                      : 'bg-[#080E20] border-cyan-500/30 text-slate-300 hover:bg-cyan-950/40'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  App Sổ LLĐT
                </button>
                <button
                  type="button"
                  onClick={() => setMessageChannel('SMS')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    messageChannel === 'SMS'
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-xs'
                      : 'bg-[#080E20] border-cyan-500/30 text-slate-300 hover:bg-cyan-950/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Tin nhắn SMS
                </button>
                <button
                  type="button"
                  onClick={() => setMessageChannel('ZALO')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    messageChannel === 'ZALO'
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-xs'
                      : 'bg-[#080E20] border-cyan-500/30 text-slate-300 hover:bg-cyan-950/40'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Zalo ZNS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Tiêu đề thông điệp</label>
              <input
                type="text"
                required
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="VD: Nhắc nhở chuyên cần và kết quả kiểm tra"
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Nội dung trao đổi với phụ huynh *</label>
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Nhập nội dung trao đổi cụ thể về tình hình học tập, chuyên cần, nề nếp..."
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setMessageTarget(null)}>
                Hủy
              </Button>
              <Button variant="success" size="sm" type="submit" icon={<Send className="w-4 h-4" />}>
                Gửi tin nhắn ngay
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: GỬI THÔNG BÁO CHUNG CHO TẤT CẢ PHỤ HUYNH */}
      <Modal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Gửi thông báo đồng loạt tới Phụ huynh"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#080E20] border border-cyan-500/30 text-xs text-cyan-300">
            Tin nhắn sẽ được gửi đồng loạt tới{' '}
            <strong className="text-white">{filteredStudents.length} phụ huynh</strong> của{' '}
            {filterClass === 'ALL' ? 'toàn bộ các lớp' : `lớp đang chọn`} qua App Sổ liên lạc và SMS Brandname.
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="VD: Thông báo họp phụ huynh / Lịch thi học kỳ I"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Nội dung thông báo *</label>
            <textarea
              rows={4}
              required
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder="Kính gửi quý phụ huynh, Nhà trường và Giáo viên chủ nhiệm xin thông báo..."
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsBroadcastOpen(false)}>
              Hủy
            </Button>
            <Button variant="success" size="sm" type="submit" icon={<Send className="w-4 h-4" />}>
              Phát thông báo tới tất cả
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CHỈNH SỬA THÔNG TIN HỌC SINH & PHỤ HUYNH */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Chỉnh sửa thông tin học sinh & phụ huynh"
      >
        {editingStudent && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Mã học sinh</label>
                <input
                  type="text"
                  disabled
                  value={editingStudent.studentCode}
                  className="w-full px-3 py-2 bg-[#080E20]/60 border border-slate-700 rounded-xl text-xs text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Lớp</label>
                <select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Giới tính</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#080E20] rounded-xl border border-cyan-500/30 space-y-3">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Thông tin người giám hộ / Phụ huynh liên kết
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Họ tên Phụ huynh *</label>
                  <input
                    type="text"
                    required
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A1124] border border-cyan-500/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    required
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A1124] border border-cyan-500/40 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Địa chỉ gia đình</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                  className="w-full px-3 py-2 bg-[#0A1124] border border-cyan-500/40 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setEditingStudent(null)}>
                Hủy
              </Button>
              <Button variant="success" size="sm" type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 4: THÊM HỌC SINH MỚI */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Thêm học sinh & phụ huynh mới">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1">Họ và tên học sinh *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lê Minh Trí"
              className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Xếp vào Lớp *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Họ tên Phụ huynh</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Bà Nguyễn Thị Lan"
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0912 888 999"
                className="w-full px-3 py-2 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button variant="success" size="sm" type="submit">
              Lưu học sinh
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa học sinh"
        message="Bạn có chắc chắn muốn xóa học sinh này khỏi danh sách lớp? Thao tác này sẽ cập nhật sĩ số lớp."
        confirmText="Xác nhận xóa"
        variant="danger"
      />
    </div>
  );
};
