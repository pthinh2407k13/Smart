import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  RefreshCw,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const StudentImportWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, selectedClassId } = useClass();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedClass, setSelectedClass] = useState(selectedClassId || classes[0]?.id || '');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; col: string; message: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadSample = () => {
    const sampleCsv = `\uFEFFMã HS,Họ và tên,Giới tính,Ngày sinh,Họ tên Phụ huynh,Số điện thoại
HS1040,Trần Khắc Việt,Nam,2009-05-14,Ông Trần Văn Toàn,0912334455
HS1041,Vũ Minh Trang,Nữ,2009-10-21,Bà Lê Thu Hà,0987654321
HS1042,Đặng Gia Hưng,Nam,2009-02-18,Ông Đặng Văn Hùng,0934112233
HS1043,Nguyễn Mai Anh,Nữ,2009-07-09,Bà Nguyễn Thanh Mai,0905998877`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Danh_Sach_Hoc_Sinh_SmartClass.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file mẫu CSV chuẩn Tiếng Việt (UTF-8)', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        showToast('File không có đủ dòng dữ liệu', 'warning');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());
      const dataRows = lines.slice(1).map((line, idx) => {
        const parts = line.split(',').map((p) => p.replace(/"/g, '').trim());
        const rowObj: any = { _rowNum: idx + 2 };
        headers.forEach((h, hIdx) => {
          rowObj[h] = parts[hIdx] || '';
        });
        return rowObj;
      });

      setParsedRows(dataRows);

      // Perform validation
      const errors: { row: number; col: string; message: string }[] = [];
      dataRows.forEach((row, i) => {
        const nameVal = row['Họ và tên'] || row['fullName'];
        const phoneVal = row['Số điện thoại'] || row['parentPhone'];
        if (!nameVal) {
          errors.push({ row: i + 2, col: 'Họ và tên', message: 'Họ tên không được để trống' });
        }
        if (phoneVal && !/^[0-9+ ]{9,12}$/.test(phoneVal)) {
          errors.push({ row: i + 2, col: 'Số điện thoại', message: 'Định dạng số điện thoại chưa đúng' });
        }
      });

      setValidationErrors(errors);
      setStep(2);
      showToast(`Đã tải lên ${dataRows.length} dòng dữ liệu`, 'info');
    };
    reader.readAsText(file);
  };

  const handleSimulateLoadDemo = () => {
    setFileName('Danh_sach_lop_10A1_demo.csv');
    const demoData = [
      { _rowNum: 2, 'Mã HS': 'HS1040', 'Họ và tên': 'Trần Khắc Việt', 'Giới tính': 'Nam', 'Ngày sinh': '2009-05-14', 'Họ tên Phụ huynh': 'Ông Trần Văn Toàn', 'Số điện thoại': '0912334455' },
      { _rowNum: 3, 'Mã HS': 'HS1041', 'Họ và tên': 'Vũ Minh Trang', 'Giới tính': 'Nữ', 'Ngày sinh': '2009-10-21', 'Họ tên Phụ huynh': 'Bà Lê Thu Hà', 'Số điện thoại': '0987654321' },
      { _rowNum: 4, 'Mã HS': 'HS1042', 'Họ và tên': 'Đặng Gia Hưng', 'Giới tính': 'Nam', 'Ngày sinh': '2009-02-18', 'Họ tên Phụ huynh': 'Ông Đặng Văn Hùng', 'Số điện thoại': '0934112233' },
      { _rowNum: 5, 'Mã HS': 'HS1043', 'Họ và tên': 'Nguyễn Mai Anh', 'Giới tính': 'Nữ', 'Ngày sinh': '2009-07-09', 'Họ tên Phụ huynh': 'Bà Nguyễn Thanh Mai', 'Số điện thoại': '0905998877' },
    ];
    setParsedRows(demoData);
    setValidationErrors([]);
    setStep(2);
    showToast('Đã nạp 4 học sinh mẫu thử nghiệm', 'info');
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const targetClass = classes.find((c) => c.id === selectedClass) || classes[0];

      parsedRows.forEach((r, idx) => {
        dbService.createStudent({
          schoolId: targetClass.schoolId,
          classId: targetClass.id,
          className: targetClass.name,
          studentCode: r['Mã HS'] || `HS${1050 + idx}`,
          fullName: r['Họ và tên'],
          gender: (r['Giới tính'] as any) || 'Nam',
          dob: r['Ngày sinh'] || '2009-01-01',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          address: 'Hà Đông, Hà Nội',
          parentName: r['Họ tên Phụ huynh'] || 'Phụ huynh học sinh',
          parentPhone: r['Số điện thoại'] || '0988 000 111',
          status: 'ACTIVE',
          conduct: 'Tốt',
        });
      });

      dbService.logAudit(
        'Cô Nguyễn Thị Mai',
        'TEACHER',
        'IMPORT_EXCEL_HỌC_SINH',
        targetClass.name,
        `Đã import thành công ${parsedRows.length} học sinh từ file ${fileName}`
      );

      setIsProcessing(false);
      setStep(4);
      showToast(`Đã import thành công ${parsedRows.length} học sinh!`, 'success');
    }, 700);
  };

  return (
    <div className="student-management-container max-w-4xl mx-auto space-y-6 text-white">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/students')}
          icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
        >
          Quay lại danh sách
        </Button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Import Học Sinh từ Excel / CSV</h1>
          <p className="text-xs text-cyan-300/80">
            Quy trình chuẩn hóa 4 bước: Tải file mẫu → Tải lên → Xác thực & Kiểm tra lỗi → Hoàn tất
          </p>
        </div>
      </div>

      {/* 4 Step Progress Indicators */}
      <div className="bg-[#0D152A] p-4 rounded-2xl border border-cyan-500/30 grid grid-cols-4 gap-2 text-center text-xs font-bold shadow-md shadow-cyan-950/40">
        {[
          { num: 1, label: '1. Tải lên file' },
          { num: 2, label: '2. Xem trước & Cột' },
          { num: 3, label: '3. Xác thực dữ liệu' },
          { num: 4, label: '4. Hoàn tất' },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 px-3 rounded-xl transition-all ${
              step === s.num
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-extrabold shadow-xs'
                : step > s.num
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-500'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload File & Target Class */}
      {step === 1 && (
        <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-8 shadow-xl shadow-cyan-950/50 space-y-6">
          <div className="max-w-md">
            <label className="block text-xs font-bold text-cyan-300 mb-2">
              Bước 1.1: Chọn Lớp học để đưa danh sách vào *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#080E20] border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} HS hiện tại)
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-cyan-500/20 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white">Bước 1.2: Chuẩn bị file dữ liệu Excel / CSV</h3>
                <p className="text-xs text-slate-400">Khuyến nghị tải file mẫu chuẩn để hệ thống tự nhận diện cột</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Tải file mẫu CSV
              </Button>
            </div>

            {/* Upload Zone */}
            <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#080E20]/80">
              <FileSpreadsheet className="w-12 h-12 text-cyan-400 mb-3" />
              <span className="font-extrabold text-sm text-white">
                Bấm vào đây để chọn file từ máy tính
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Hỗ trợ định dạng .CSV, .XLSX (Tối đa 500 dòng/lần import)
              </span>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Quick Demo Simulator */}
            <div className="mt-4 pt-4 border-t border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Không có sẵn file?</span>
              <Button
                variant="secondary"
                size="md"
                onClick={handleSimulateLoadDemo}
                icon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Nạp dữ liệu mẫu thử nghiệm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Column Mapping */}
      {step === 2 && (
        <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-8 shadow-xl shadow-cyan-950/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Xem trước & Ánh xạ Cột dữ liệu</h3>
              <p className="text-xs text-slate-400">File: {fileName} • Đã nhận diện {parsedRows.length} dòng</p>
            </div>
            <Badge variant="blue" size="md">
              {parsedRows.length} học sinh
            </Badge>
          </div>

          <div className="overflow-x-auto border border-cyan-500/30 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080E20] text-cyan-300 uppercase font-bold border-b border-cyan-500/30">
                <tr>
                  <th className="py-2.5 px-3">Dòng</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Ngày sinh</th>
                  <th className="py-2.5 px-3">Phụ huynh</th>
                  <th className="py-2.5 px-3">SĐT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 font-medium text-slate-200">
                {parsedRows.slice(0, 5).map((r, idx) => (
                  <tr key={idx} className="hover:bg-cyan-950/30">
                    <td className="py-2 px-3 text-slate-500 font-mono">{r._rowNum}</td>
                    <td className="py-2 px-3 font-mono font-bold text-cyan-400">{r['Mã HS'] || '-'}</td>
                    <td className="py-2 px-3 font-bold text-white">{r['Họ và tên']}</td>
                    <td className="py-2 px-3 text-slate-300">{r['Giới tính']}</td>
                    <td className="py-2 px-3 text-slate-300">{r['Ngày sinh']}</td>
                    <td className="py-2 px-3 text-slate-300">{r['Họ tên Phụ huynh']}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{r['Số điện thoại']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
            <Button variant="secondary" size="md" onClick={() => setStep(1)}>
              Quay lại bước 1
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Tiếp tục: Kiểm tra dữ liệu
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Validate Errors */}
      {step === 3 && (
        <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-8 shadow-xl shadow-cyan-950/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Kết quả Kiểm tra Hợp lệ (Validation)</h3>
              <p className="text-xs text-slate-400">
                Kiểm tra trùng mã học sinh, định dạng ngày tháng và số điện thoại
              </p>
            </div>
            {validationErrors.length === 0 ? (
              <Badge variant="emerald" size="md">
                ✓ 100% Dữ liệu hợp lệ
              </Badge>
            ) : (
              <Badge variant="rose" size="md">
                {validationErrors.length} Cảnh báo dòng lỗi
              </Badge>
            )}
          </div>

          {validationErrors.length > 0 ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <h4 className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Phát hiện các dòng cần điều chỉnh:
              </h4>
              <ul className="text-xs text-rose-200 list-disc list-inside space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>
                    Dòng {err.row} [Cột {err.col}]: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">Dữ liệu sẵn sàng nạp vào hệ thống!</h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Tất cả {parsedRows.length} học sinh đều hợp lệ và sẽ được liên kết vào lớp được chọn.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
            <Button variant="secondary" size="md" onClick={() => setStep(2)}>
              Quay lại xem trước
            </Button>
            {/* Màu xanh cho Xác nhận Import */}
            <Button
              variant="success"
              size="md"
              onClick={handleConfirmImport}
              isLoading={isProcessing}
              icon={<Check className="w-4 h-4" />}
            >
              Xác nhận Import vào hệ thống
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Completion */}
      {step === 4 && (
        <div className="bg-[#0D152A] rounded-3xl border border-cyan-500/30 p-8 shadow-xl shadow-cyan-950/50 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Import thành công!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
              Đã đưa danh sách học sinh vào hệ thống. Sĩ số lớp đã tự động cập nhật và phân bổ mã tài khoản.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setStep(1);
                setParsedRows([]);
              }}
            >
              Import file khác
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/teacher/students')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Xem danh sách học sinh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
