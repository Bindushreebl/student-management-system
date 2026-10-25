const Database = require('better-sqlite3');
const path = require('path');
const { sampleCourses, sampleStudents, sampleAnnouncements } = require('./seedData');

const dbPath = path.join(__dirname, '..', 'student_system.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      department TEXT NOT NULL,
      semester INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Active',
      gpa REAL DEFAULT 0.0,
      avatar_url TEXT,
      enrollment_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT UNIQUE NOT NULL,
      course_name TEXT NOT NULL,
      department TEXT NOT NULL,
      credits INTEGER DEFAULT 3,
      instructor TEXT,
      capacity INTEGER DEFAULT 40,
      schedule TEXT
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      semester INTEGER DEFAULT 1,
      grade TEXT DEFAULT 'Pending',
      score REAL DEFAULT 0,
      enrolled_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Excused')),
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'Academic',
      priority TEXT DEFAULT 'Normal',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function logAudit(action, details) {
  try {
    const stmt = db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)');
    stmt.run(action, typeof details === 'object' ? JSON.stringify(details) : String(details));
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

function seedDatabaseIfEmpty() {
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  if (studentCount > 0) {
    return;
  }
  resetAndSeedDatabase();
}

function resetAndSeedDatabase() {
  const dropTables = db.transaction(() => {
    db.prepare('DELETE FROM audit_logs').run();
    db.prepare('DELETE FROM attendance').run();
    db.prepare('DELETE FROM enrollments').run();
    db.prepare('DELETE FROM announcements').run();
    db.prepare('DELETE FROM courses').run();
    db.prepare('DELETE FROM students').run();

    // Insert courses
    const insertCourse = db.prepare(`
      INSERT INTO courses (course_code, course_name, department, credits, instructor, capacity, schedule)
      VALUES (@course_code, @course_name, @department, @credits, @instructor, @capacity, @schedule)
    `);
    for (const c of sampleCourses) {
      insertCourse.run(c);
    }

    // Insert students
    const insertStudent = db.prepare(`
      INSERT INTO students (student_id, first_name, last_name, email, phone, dob, gender, department, semester, status, gpa, avatar_url, enrollment_date)
      VALUES (@student_id, @first_name, @last_name, @email, @phone, @dob, @gender, @department, @semester, @status, @gpa, @avatar_url, @enrollment_date)
    `);
    for (const s of sampleStudents) {
      insertStudent.run(s);
    }

    // Insert announcements
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (title, content, category, priority, created_at)
      VALUES (@title, @content, @category, @priority, @created_at)
    `);
    for (const a of sampleAnnouncements) {
      insertAnnouncement.run(a);
    }

    // Assign realistic enrollments & grades
    const allStudents = db.prepare('SELECT id, department, semester FROM students').all();
    const allCourses = db.prepare('SELECT id, department, course_code FROM courses').all();

    const insertEnrollment = db.prepare(`
      INSERT OR IGNORE INTO enrollments (student_id, course_id, semester, grade, score, enrolled_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const gradeOptions = [
      { grade: 'A', score: 94 },
      { grade: 'A-', score: 90 },
      { grade: 'B+', score: 87 },
      { grade: 'B', score: 83 },
      { grade: 'B-', score: 80 },
      { grade: 'C+', score: 77 },
      { grade: 'A', score: 98 }
    ];

    allStudents.forEach((student, index) => {
      // Find courses in student's department + general
      const relevantCourses = allCourses.filter(c => c.department === student.department);
      const otherCourses = allCourses.filter(c => c.department !== student.department);
      
      const toEnroll = [...relevantCourses, ...otherCourses.slice(0, 1)].slice(0, 3);
      toEnroll.forEach((course, courseIdx) => {
        const gradePick = gradeOptions[(index + courseIdx) % gradeOptions.length];
        insertEnrollment.run(student.id, course.id, student.semester, gradePick.grade, gradePick.score, '2026-02-01');
      });
    });

    // Seed recent attendance records (last 5 instructional days)
    const insertAttendance = db.prepare(`
      INSERT INTO attendance (student_id, course_id, date, status, remarks)
      VALUES (?, ?, ?, ?, ?)
    `);

    const dates = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24'];
    const enrollments = db.prepare('SELECT student_id, course_id FROM enrollments').all();

    enrollments.forEach(enr => {
      dates.forEach(d => {
        const rand = Math.random();
        let status = 'Present';
        let remarks = 'On time';
        if (rand < 0.08) {
          status = 'Absent';
          remarks = 'Unexcused';
        } else if (rand < 0.15) {
          status = 'Late';
          remarks = '10 mins late';
        } else if (rand < 0.18) {
          status = 'Excused';
          remarks = 'Medical leave';
        }
        insertAttendance.run(enr.student_id, enr.course_id, d, status, remarks);
      });
    });

    logAudit('SYSTEM_INIT', 'Database schema created and seeded with comprehensive student data');
  });

  dropTables();
}

// Student Operations
function getStudents({ search = '', department = '', semester = '', status = '', sortBy = 'id', order = 'DESC', page = 1, limit = 50 }) {
  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }

  if (semester) {
    query += ' AND semester = ?';
    params.push(Number(semester));
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  // Count total matching
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = db.prepare(countQuery).get(...params).total;

  // Validate sort columns to prevent SQL injection
  const allowedSortCols = ['id', 'student_id', 'first_name', 'last_name', 'gpa', 'semester', 'department', 'status', 'created_at'];
  const sortCol = allowedSortCols.includes(sortBy) ? sortBy : 'id';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  query += ` ORDER BY ${sortCol} ${sortOrder}`;

  const numLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const numOffset = (Math.max(1, Number(page) || 1) - 1) * numLimit;

  query += ' LIMIT ? OFFSET ?';
  params.push(numLimit, numOffset);

  const students = db.prepare(query).all(...params);

  return {
    students,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit)
    }
  };
}

function getStudentById(id) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!student) return null;

  // Get enrolled courses and grades
  const enrollments = db.prepare(`
    SELECT e.id as enrollment_id, e.semester, e.grade, e.score, e.enrolled_date,
           c.id as course_id, c.course_code, c.course_name, c.department, c.credits, c.instructor, c.schedule
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
    ORDER BY c.course_code ASC
  `).all(id);

  // Get attendance stats for this student
  const attendanceStats = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM attendance
    WHERE student_id = ?
    GROUP BY status
  `).all(id);

  const recentAttendance = db.prepare(`
    SELECT a.*, c.course_code, c.course_name
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.student_id = ?
    ORDER BY a.date DESC
    LIMIT 10
  `).all(id);

  return {
    ...student,
    enrollments,
    attendanceStats,
    recentAttendance
  };
}

function createStudent(data) {
  // Generate next student_id if not supplied
  let studentId = data.student_id;
  if (!studentId) {
    const last = db.prepare('SELECT id FROM students ORDER BY id DESC LIMIT 1').get();
    const nextNum = (last ? last.id + 1 : 1).toString().padStart(3, '0');
    studentId = `STU-2026-${nextNum}`;
  }

  const avatar = data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.first_name + data.last_name)}`;

  const stmt = db.prepare(`
    INSERT INTO students (
      student_id, first_name, last_name, email, phone, dob, gender,
      department, semester, status, gpa, avatar_url, enrollment_date
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  const info = stmt.run(
    studentId,
    data.first_name,
    data.last_name,
    data.email,
    data.phone || '',
    data.dob || '',
    data.gender || 'Other',
    data.department,
    Number(data.semester) || 1,
    data.status || 'Active',
    Number(data.gpa) || 0.0,
    avatar,
    data.enrollment_date || new Date().toISOString().split('T')[0]
  );

  logAudit('STUDENT_CREATED', `Created student ${studentId} (${data.first_name} ${data.last_name})`);

  return getStudentById(info.lastInsertRowid);
}

function updateStudent(id, data) {
  const current = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!current) return null;

  const stmt = db.prepare(`
    UPDATE students SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender),
      department = COALESCE(?, department),
      semester = COALESCE(?, semester),
      status = COALESCE(?, status),
      gpa = COALESCE(?, gpa),
      avatar_url = COALESCE(?, avatar_url)
    WHERE id = ?
  `);

  stmt.run(
    data.first_name,
    data.last_name,
    data.email,
    data.phone,
    data.dob,
    data.gender,
    data.department,
    data.semester !== undefined ? Number(data.semester) : undefined,
    data.status,
    data.gpa !== undefined ? Number(data.gpa) : undefined,
    data.avatar_url,
    id
  );

  logAudit('STUDENT_UPDATED', `Updated student ID ${current.student_id} (${data.first_name || current.first_name} ${data.last_name || current.last_name})`);

  return getStudentById(id);
}

function deleteStudent(id) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!student) return false;

  db.prepare('DELETE FROM students WHERE id = ?').run(id);
  logAudit('STUDENT_DELETED', `Deleted student ${student.student_id} (${student.first_name} ${student.last_name})`);
  return true;
}

// Course Operations
function getCourses() {
  return db.prepare(`
    SELECT c.*,
           COUNT(e.id) as enrolled_count
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    GROUP BY c.id
    ORDER BY c.course_code ASC
  `).all();
}

function createCourse(data) {
  const stmt = db.prepare(`
    INSERT INTO courses (course_code, course_name, department, credits, instructor, capacity, schedule)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.course_code,
    data.course_name,
    data.department,
    Number(data.credits) || 3,
    data.instructor || '',
    Number(data.capacity) || 40,
    data.schedule || 'TBA'
  );

  logAudit('COURSE_CREATED', `Created course ${data.course_code} - ${data.course_name}`);
  return db.prepare('SELECT * FROM courses WHERE id = ?').get(info.lastInsertRowid);
}

// Enrollment Operations
function enrollStudent(studentId, courseId, semester = 1, grade = 'Pending', score = 0) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO enrollments (student_id, course_id, semester, grade, score, enrolled_date)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const info = stmt.run(studentId, courseId, semester, grade, score);
  
  // Recalculate GPA automatically if score / grade provided
  recalculateStudentGPA(studentId);

  logAudit('STUDENT_ENROLLED', `Student ID ${studentId} enrolled in Course ID ${courseId}`);
  return info;
}

function updateEnrollment(id, grade, score) {
  const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id);
  if (!enrollment) return null;

  db.prepare(`
    UPDATE enrollments SET grade = ?, score = ? WHERE id = ?
  `).run(grade, Number(score), id);

  recalculateStudentGPA(enrollment.student_id);
  logAudit('GRADE_UPDATED', `Enrollment ${id} grade updated to ${grade} (${score})`);
  return db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id);
}

function dropEnrollment(id) {
  const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id);
  if (!enrollment) return false;

  db.prepare('DELETE FROM enrollments WHERE id = ?').run(id);
  recalculateStudentGPA(enrollment.student_id);
  logAudit('COURSE_DROPPED', `Dropped enrollment ID ${id} for student ${enrollment.student_id}`);
  return true;
}

function recalculateStudentGPA(studentId) {
  const gradePoints = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
  };

  const records = db.prepare(`
    SELECT e.grade, c.credits
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ? AND e.grade != 'Pending'
  `).all(studentId);

  if (records.length === 0) return;

  let totalPoints = 0;
  let totalCredits = 0;

  records.forEach(r => {
    const points = gradePoints[r.grade.toUpperCase()] !== undefined ? gradePoints[r.grade.toUpperCase()] : 3.0;
    const credits = r.credits || 3;
    totalPoints += points * credits;
    totalCredits += credits;
  });

  const calculatedGpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0.0;
  db.prepare('UPDATE students SET gpa = ? WHERE id = ?').run(calculatedGpa, studentId);
}

// Attendance Operations
function getAttendanceList({ courseId = '', date = '', studentId = '' }) {
  let query = `
    SELECT a.*, s.student_id as stu_code, s.first_name, s.last_name, s.avatar_url,
           c.course_code, c.course_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN courses c ON a.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (courseId) {
    query += ' AND a.course_id = ?';
    params.push(Number(courseId));
  }
  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }
  if (studentId) {
    query += ' AND a.student_id = ?';
    params.push(Number(studentId));
  }

  query += ' ORDER BY a.date DESC, s.last_name ASC';
  return db.prepare(query).all(...params);
}

function recordBulkAttendance(records) {
  const insert = db.prepare(`
    INSERT INTO attendance (student_id, course_id, date, status, remarks)
    VALUES (?, ?, ?, ?, ?)
  `);

  const runBulk = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.student_id, item.course_id, item.date, item.status, item.remarks || '');
    }
  });

  runBulk(records);
  logAudit('ATTENDANCE_RECORDED', `Logged attendance batch of ${records.length} records`);
  return { success: true, count: records.length };
}

// Dashboard Analytics & Stats
function getDashboardStats() {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  const activeStudents = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'Active'").get().count;
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  const avgGpaRow = db.prepare('SELECT AVG(gpa) as avg_gpa FROM students WHERE gpa > 0').get();
  const avgGpa = avgGpaRow && avgGpaRow.avg_gpa ? Number(avgGpaRow.avg_gpa.toFixed(2)) : 0.0;

  // Attendance rate
  const attendanceBreakdown = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM attendance
    GROUP BY status
  `).all();

  const totalAtt = attendanceBreakdown.reduce((acc, curr) => acc + curr.count, 0);
  const presentCount = attendanceBreakdown.find(a => a.status === 'Present')?.count || 0;
  const lateCount = attendanceBreakdown.find(a => a.status === 'Late')?.count || 0;
  const attendanceRate = totalAtt > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalAtt) * 100) : 95;

  // Department distribution
  const deptDistribution = db.prepare(`
    SELECT department, COUNT(*) as count, AVG(gpa) as avg_gpa
    FROM students
    GROUP BY department
    ORDER BY count DESC
  `).all();

  // GPA Distribution brackets
  const gpaBrackets = [
    { label: '3.8 - 4.0 (Dean\'s List)', count: db.prepare('SELECT COUNT(*) as c FROM students WHERE gpa >= 3.8').get().c },
    { label: '3.5 - 3.79 (Honors)', count: db.prepare('SELECT COUNT(*) as c FROM students WHERE gpa >= 3.5 AND gpa < 3.8').get().c },
    { label: '3.0 - 3.49 (Good)', count: db.prepare('SELECT COUNT(*) as c FROM students WHERE gpa >= 3.0 AND gpa < 3.5').get().c },
    { label: 'Below 3.0 (Needs Support)', count: db.prepare('SELECT COUNT(*) as c FROM students WHERE gpa < 3.0').get().c }
  ];

  // Recent 5 Students
  const recentStudents = db.prepare(`
    SELECT id, student_id, first_name, last_name, department, semester, gpa, status, avatar_url, created_at
    FROM students
    ORDER BY id DESC
    LIMIT 5
  `).all();

  // Recent audit logs
  const recentLogs = db.prepare(`
    SELECT * FROM audit_logs
    ORDER BY id DESC
    LIMIT 6
  `).all();

  return {
    kpis: {
      totalStudents,
      activeStudents,
      totalCourses,
      avgGpa,
      attendanceRate
    },
    deptDistribution,
    gpaBrackets,
    attendanceBreakdown,
    recentStudents,
    recentLogs
  };
}

function getAnnouncements() {
  return db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10').all();
}

function createAnnouncement(data) {
  const stmt = db.prepare(`
    INSERT INTO announcements (title, content, category, priority, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(data.title, data.content, data.category || 'Academic', data.priority || 'Normal');
  logAudit('ANNOUNCEMENT_POSTED', `New announcement: ${data.title}`);
  return db.prepare('SELECT * FROM announcements WHERE id = ?').get(info.lastInsertRowid);
}

// Initialize on require
initSchema();
seedDatabaseIfEmpty();

module.exports = {
  db,
  initSchema,
  resetAndSeedDatabase,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getCourses,
  createCourse,
  enrollStudent,
  updateEnrollment,
  dropEnrollment,
  getAttendanceList,
  recordBulkAttendance,
  getDashboardStats,
  getAnnouncements,
  createAnnouncement,
  logAudit
};
