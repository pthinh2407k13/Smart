export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  schoolId: string;
  createdAt: string;
  studentId?: string; // If student
  childrenIds?: string[]; // If parent
  subjectExpertise?: string[]; // If teacher
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  activeAcademicYearId: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024 - 2025"
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeLevel {
  id: string;
  name: string; // Khối 10, Khối 11, Khối 12
  level: number;
}

export interface Subject {
  id: string;
  name: string; // Toán, Ngữ Văn, Tiếng Anh...
  code: string;
  color: string;
  iconName: string;
}

export interface ClassRoom {
  id: string;
  schoolId: string;
  name: string; // 10A1, 11B2...
  gradeLevelId: string;
  academicYearId: string;
  roomNumber: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  themeColor: string;
  description?: string;
  studentCount: number;
  inviteCode: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  studentCode: string; // HS1001
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  avatarUrl: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentId?: string;
  groupNumber?: number; // Tổ 1, 2, 3, 4
  seatNumber?: number;
  status: 'ACTIVE' | 'LEAVE' | 'SUSPENDED';
  attendanceRate: number; // e.g. 96.5%
  gpa: number; // e.g. 8.4
  conduct: 'Tốt' | 'Khá' | 'Trung bình';
  rewardPoints: number;
}

export type AttendanceStatus = 'PRESENT' | 'EXCUSED' | 'UNEXCUSED' | 'LATE' | 'EARLY_LEAVE';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  period: number; // Tiết 1 - 5
  sessionType: 'Sáng' | 'Chiều';
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  lateCount: number;
  earlyLeaveCount?: number;
  isLocked: boolean;
  notes?: string;
  records: AttendanceRecord[];
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // Thứ 2 - Thứ 7
  period: number; // 1 - 5
  subjectId: string;
  subjectName: string;
  teacherName: string;
  room: string;
  startTime: string;
  endTime: string;
}

export type AssignmentStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RESUBMIT';

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  status: AssignmentStatus;
  attachments?: { name: string; url: string; size: string; type: string }[];
  targetGroup: 'ALL' | 'GROUP' | 'INDIVIDUAL';
  targetIds?: string[];
  submissionCount: number;
  gradedCount: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  submittedAt: string;
  content: string;
  files?: { name: string; url: string; size: string }[];
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  questionText: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string | number | number[];
  explanation?: string;
  points: number;
  subject: string;
  gradeLevel: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Quiz {
  id: string;
  classId: string;
  className: string;
  subjectName: string;
  title: string;
  description: string;
  durationMinutes: number;
  openDate: string;
  closeDate: string;
  questionsCount: number;
  totalPoints: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  questions: QuizQuestion[];
  attemptCount: number;
  avgScore: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  completedAt: string;
  durationSeconds: number;
  answers: Record<string, any>;
}

export interface LearningResource {
  id: string;
  title: string;
  subjectName: string;
  gradeLevel: number;
  chapter: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'LINK';
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  isFavorite?: boolean;
}

export interface GradeItem {
  id: string;
  classId: string;
  subjectId: string;
  name: string; // Miệng, 15 phút, Giữa kỳ, Cuối kỳ
  type: 'TX' | 'GK' | 'CK'; // Thường xuyên, Giữa kỳ, Cuối kỳ
  weight: number; // 1, 2, 3
  maxScore: number;
  semester: 1 | 2;
}

export interface StudentGradeRecord {
  studentId: string;
  studentName: string;
  studentCode: string;
  scores: Record<string, number | null>; // gradeItemId -> score
  semesterAverage?: number;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'POSITIVE' | 'NEED_IMPROVEMENT';
  content: string;
  points: number; // +5, -3
  recordedBy: string;
  date: string;
  category: 'Học tập' | 'Kỷ luật' | 'Văn thể mỹ' | 'Giúp đỡ bạn';
}

export interface AlertNotification {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  type: 'ATTENDANCE' | 'GRADE_DROP' | 'UNSUBMITTED' | 'BEHAVIOR';
  title: string;
  description: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  status: 'NEW' | 'REVIEWED' | 'PROCESSING' | 'RESOLVED';
  createdAt: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  targetRole: 'ALL' | 'TEACHER' | 'STUDENT' | 'PARENT';
  targetClassId?: string; // Optional class specific
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  readCount: number;
  attachments?: { name: string; url: string }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  ipAddress: string;
  details: string;
}
