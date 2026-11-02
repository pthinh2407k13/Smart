import {
  School,
  AcademicYear,
  ClassRoom,
  Student,
  AttendanceSession,
  ScheduleItem,
  Assignment,
  Submission,
  Quiz,
  LearningResource,
  GradeItem,
  StudentGradeRecord,
  BehaviorRecord,
  AlertNotification,
  Announcement,
  AuditLogItem,
  UserProfile,
} from '../types';
import {
  initialSchool,
  initialAcademicYears,
  initialClasses,
  initialStudents,
  initialAttendanceSessions,
  initialSchedules,
  initialAssignments,
  initialSubmissions,
  initialQuizzes,
  initialResources,
  initialGradeItems,
  initialGradeRecords,
  initialBehaviors,
  initialAlerts,
  initialAnnouncements,
  initialAuditLogs,
  demoUsers,
} from './mockData';

const STORAGE_KEY = 'smart_class_db_v1';

export interface AppDatabaseState {
  school: School;
  academicYears: AcademicYear[];
  classes: ClassRoom[];
  students: Student[];
  attendanceSessions: AttendanceSession[];
  schedules: ScheduleItem[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  resources: LearningResource[];
  gradeItems: GradeItem[];
  gradeRecords: StudentGradeRecord[];
  behaviors: BehaviorRecord[];
  alerts: AlertNotification[];
  announcements: Announcement[];
  auditLogs: AuditLogItem[];
  users: Record<string, UserProfile>;
}

class DatabaseService {
  private state: AppDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppDatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data', e);
    }

    const defaultState: AppDatabaseState = {
      school: initialSchool,
      academicYears: initialAcademicYears,
      classes: initialClasses,
      students: initialStudents,
      attendanceSessions: initialAttendanceSessions,
      schedules: initialSchedules,
      assignments: initialAssignments,
      submissions: initialSubmissions,
      quizzes: initialQuizzes,
      resources: initialResources,
      gradeItems: initialGradeItems,
      gradeRecords: initialGradeRecords,
      behaviors: initialBehaviors,
      alerts: initialAlerts,
      announcements: initialAnnouncements,
      auditLogs: initialAuditLogs,
      users: demoUsers,
    };
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: AppDatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  private notify() {
    this.saveState(this.state);
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): AppDatabaseState {
    return this.state;
  }

  public logAudit(actorName: string, actorRole: any, action: string, target: string, details: string) {
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName,
      actorRole,
      action,
      target,
      ipAddress: '127.0.0.1 (Internal)',
      details,
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
    this.notify();
  }

  // --- Classes CRUD ---
  public getClasses(): ClassRoom[] {
    return this.state.classes;
  }

  public getClassById(id: string): ClassRoom | undefined {
    return this.state.classes.find((c) => c.id === id);
  }

  public createClass(newClass: Omit<ClassRoom, 'id' | 'createdAt' | 'studentCount'>): ClassRoom {
    const created: ClassRoom = {
      ...newClass,
      id: `class_${Date.now()}`,
      studentCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.state.classes = [created, ...this.state.classes];
    this.notify();
    return created;
  }

  public updateClass(id: string, updates: Partial<ClassRoom>): ClassRoom {
    this.state.classes = this.state.classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.notify();
    const updated = this.getClassById(id);
    if (!updated) throw new Error('Class not found');
    return updated;
  }

  public deleteClass(id: string): void {
    this.state.classes = this.state.classes.filter((c) => c.id !== id);
    this.notify();
  }

  public archiveClass(id: string, archive: boolean): void {
    this.updateClass(id, { isArchived: archive });
  }

  public duplicateClass(id: string, newName: string): ClassRoom {
    const origin = this.getClassById(id);
    if (!origin) throw new Error('Original class not found');
    const duplicated = this.createClass({
      schoolId: origin.schoolId,
      name: newName,
      gradeLevelId: origin.gradeLevelId,
      academicYearId: origin.academicYearId,
      roomNumber: origin.roomNumber,
      homeroomTeacherId: origin.homeroomTeacherId,
      homeroomTeacherName: origin.homeroomTeacherName,
      themeColor: origin.themeColor,
      description: `${origin.description || ''} (Bản sao)`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      isArchived: false,
    });
    return duplicated;
  }

  // --- Students CRUD ---
  public getStudents(classId?: string): Student[] {
    if (classId) {
      return this.state.students.filter((s) => s.classId === classId);
    }
    return this.state.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.state.students.find((s) => s.id === id);
  }

  public createStudent(student: Omit<Student, 'id' | 'rewardPoints' | 'attendanceRate' | 'gpa'>): Student {
    const newStudent: Student = {
      ...student,
      id: `stu_${Date.now()}`,
      rewardPoints: 0,
      attendanceRate: 100,
      gpa: 8.0,
      conduct: 'Tốt',
    };
    this.state.students = [newStudent, ...this.state.students];
    // update class count
    const targetClass = this.getClassById(student.classId);
    if (targetClass) {
      this.updateClass(targetClass.id, { studentCount: targetClass.studentCount + 1 });
    }
    this.notify();
    return newStudent;
  }

  public bulkImportStudents(studentsList: Omit<Student, 'id' | 'rewardPoints' | 'attendanceRate' | 'gpa'>[]): number {
    const created: Student[] = studentsList.map((s, idx) => ({
      ...s,
      id: `stu_${Date.now()}_${idx}`,
      rewardPoints: 0,
      attendanceRate: 100,
      gpa: 8.0,
      conduct: 'Tốt',
    }));
    this.state.students = [...created, ...this.state.students];
    // Recalculate student count
    this.state.classes = this.state.classes.map((cls) => {
      const count = this.state.students.filter((s) => s.classId === cls.id).length;
      return { ...cls, studentCount: count };
    });
    this.notify();
    return created.length;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student {
    this.state.students = this.state.students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.notify();
    const updated = this.getStudentById(id);
    if (!updated) throw new Error('Student not found');
    return updated;
  }

  public deleteStudent(id: string): void {
    const student = this.getStudentById(id);
    if (student) {
      this.state.students = this.state.students.filter((s) => s.id !== id);
      const targetClass = this.getClassById(student.classId);
      if (targetClass) {
        this.updateClass(targetClass.id, { studentCount: Math.max(0, targetClass.studentCount - 1) });
      }
      this.notify();
    }
  }

  // --- Attendance ---
  public getAttendanceSessions(classId?: string): AttendanceSession[] {
    if (classId) {
      return this.state.attendanceSessions.filter((s) => s.classId === classId);
    }
    return this.state.attendanceSessions;
  }

  public saveAttendanceSession(session: AttendanceSession): void {
    const index = this.state.attendanceSessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      this.state.attendanceSessions[index] = session;
    } else {
      this.state.attendanceSessions = [session, ...this.state.attendanceSessions];
    }
    this.notify();
  }

  // --- Assignments ---
  public getAssignments(classId?: string): Assignment[] {
    if (classId) {
      return this.state.assignments.filter((a) => a.classId === classId);
    }
    return this.state.assignments;
  }

  public createAssignment(asg: Omit<Assignment, 'id' | 'submissionCount' | 'gradedCount'>): Assignment {
    const created: Assignment = {
      ...asg,
      id: `asg_${Date.now()}`,
      submissionCount: 0,
      gradedCount: 0,
    };
    this.state.assignments = [created, ...this.state.assignments];
    this.notify();
    return created;
  }

  public getSubmissions(assignmentId: string): Submission[] {
    return this.state.submissions.filter((s) => s.assignmentId === assignmentId);
  }

  public gradeSubmission(submissionId: string, score: number, feedback: string, teacherName: string): void {
    this.state.submissions = this.state.submissions.map((sub) => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          score,
          feedback,
          status: 'GRADED',
          gradedAt: new Date().toISOString(),
          gradedBy: teacherName,
        };
      }
      return sub;
    });

    // Update assignment gradedCount
    const sub = this.state.submissions.find((s) => s.id === submissionId);
    if (sub) {
      const assignment = this.state.assignments.find((a) => a.id === sub.assignmentId);
      if (assignment) {
        const gradedCount = this.state.submissions.filter((s) => s.assignmentId === assignment.id && s.status === 'GRADED').length;
        this.state.assignments = this.state.assignments.map((a) => (a.id === assignment.id ? { ...a, gradedCount } : a));
      }
    }
    this.notify();
  }

  public submitAssignment(submission: Omit<Submission, 'id' | 'submittedAt'>): Submission {
    const newSub: Submission = {
      ...submission,
      id: `subm_${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SUBMITTED',
    };
    this.state.submissions = [newSub, ...this.state.submissions];
    // update assignment count
    const assignment = this.state.assignments.find((a) => a.id === submission.assignmentId);
    if (assignment) {
      this.state.assignments = this.state.assignments.map((a) =>
        a.id === assignment.id ? { ...a, submissionCount: a.submissionCount + 1 } : a
      );
    }
    this.notify();
    return newSub;
  }

  // --- Quizzes ---
  public getQuizzes(classId?: string): Quiz[] {
    if (classId) {
      return this.state.quizzes.filter((q) => q.classId === classId);
    }
    return this.state.quizzes;
  }

  public createQuiz(quiz: Omit<Quiz, 'id' | 'attemptCount' | 'avgScore'>): Quiz {
    const created: Quiz = {
      ...quiz,
      id: `quiz_${Date.now()}`,
      attemptCount: 0,
      avgScore: 0,
    };
    this.state.quizzes = [created, ...this.state.quizzes];
    this.notify();
    return created;
  }

  // --- Grades ---
  public getGradeItems(classId?: string): GradeItem[] {
    if (classId) {
      return this.state.gradeItems.filter((gi) => gi.classId === classId);
    }
    return this.state.gradeItems;
  }

  public getGradeRecords(classId?: string): StudentGradeRecord[] {
    if (classId) {
      const studentIds = new Set(this.getStudents(classId).map((s) => s.id));
      return this.state.gradeRecords.filter((r) => studentIds.has(r.studentId));
    }
    return this.state.gradeRecords;
  }

  public saveGradeRecord(studentId: string, gradeItemId: string, score: number | null): void {
    let record = this.state.gradeRecords.find((r) => r.studentId === studentId);
    if (!record) {
      const student = this.getStudentById(studentId);
      record = {
        studentId,
        studentName: student?.fullName || 'Học sinh',
        studentCode: student?.studentCode || 'HS00',
        scores: {},
      };
      this.state.gradeRecords.push(record);
    }
    record.scores[gradeItemId] = score;

    // Recalculate average
    const validScores = Object.values(record.scores).filter((v): v is number => typeof v === 'number');
    if (validScores.length > 0) {
      const sum = validScores.reduce((acc, cur) => acc + cur, 0);
      record.semesterAverage = Math.round((sum / validScores.length) * 10) / 10;
    }
    this.notify();
  }

  public updateGradeScore(classId: string, studentId: string, gradeItemId: string, score: number): void {
    this.saveGradeRecord(studentId, gradeItemId, score);
  }

  // --- Behaviors ---
  public getBehaviors(studentId?: string, classId?: string): BehaviorRecord[] {
    if (studentId) return this.state.behaviors.filter((b) => b.studentId === studentId);
    if (classId) return this.state.behaviors.filter((b) => b.classId === classId);
    return this.state.behaviors;
  }

  public addBehavior(b: Omit<BehaviorRecord, 'id' | 'date'>): BehaviorRecord {
    const created: BehaviorRecord = {
      ...b,
      id: `bh_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    this.state.behaviors = [created, ...this.state.behaviors];
    // update student reward points
    const student = this.getStudentById(b.studentId);
    if (student) {
      this.updateStudent(student.id, { rewardPoints: Math.max(0, student.rewardPoints + b.points) });
    }
    this.notify();
    return created;
  }

  // --- Alerts ---
  public getAlerts(): AlertNotification[] {
    return this.state.alerts;
  }

  public updateAlertStatus(id: string, status: AlertNotification['status']): void {
    this.state.alerts = this.state.alerts.map((a) => (a.id === id ? { ...a, status } : a));
    this.notify();
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    return this.state.announcements;
  }

  public createAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt' | 'readCount'>): Announcement {
    const created: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      createdAt: new Date().toISOString(),
      readCount: 0,
    };
    this.state.announcements = [created, ...this.state.announcements];
    this.notify();
    return created;
  }

  // --- Schedules ---
  public getSchedules(classId?: string): ScheduleItem[] {
    if (classId) return this.state.schedules.filter((s) => s.classId === classId);
    return this.state.schedules;
  }

  public saveSchedules(classId: string, schedules: ScheduleItem[]): void {
    this.state.schedules = [
      ...this.state.schedules.filter((s) => s.classId !== classId),
      ...schedules,
    ];
    this.notify();
  }

  // --- Reset & Export ---
  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadInitialState();
    this.notify();
  }

  public exportBackupJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.classes && parsed.students) {
        this.state = parsed;
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON', e);
    }
    return false;
  }
}

export const dbService = new DatabaseService();
