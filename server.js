const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==========================================
// API ROUTES
// ==========================================

// Dashboard Analytics & KPIs
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Students List with Multi-Filtering & Sorting
app.get('/api/students', (req, res) => {
  try {
    const { search, department, semester, status, sortBy, order, page, limit } = req.query;
    const result = db.getStudents({
      search,
      department,
      semester,
      status,
      sortBy,
      order,
      page,
      limit
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Single Student Full Profile
app.get('/api/students/:id', (req, res) => {
  try {
    const student = db.getStudentById(Number(req.params.id));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Student
app.post('/api/students', (req, res) => {
  try {
    const { first_name, last_name, email, department } = req.body;
    if (!first_name || !last_name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and department are required.'
      });
    }

    const newStudent = db.createStudent(req.body);
    res.status(201).json({ success: true, data: newStudent, message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.message.includes('UNIQUE constraint failed: students.email')) {
      return res.status(409).json({ success: false, message: 'A student with this email address already exists.' });
    }
    if (error.message.includes('UNIQUE constraint failed: students.student_id')) {
      return res.status(409).json({ success: false, message: 'Student ID already in use.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Student
app.put('/api/students/:id', (req, res) => {
  try {
    const updated = db.updateStudent(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: updated, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Student
app.delete('/api/students/:id', (req, res) => {
  try {
    const success = db.deleteStudent(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student profile deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Courses List
app.get('/api/courses', (req, res) => {
  try {
    const courses = db.getCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Course
app.post('/api/courses', (req, res) => {
  try {
    const { course_code, course_name, department } = req.body;
    if (!course_code || !course_name || !department) {
      return res.status(400).json({ success: false, message: 'Course code, name, and department are required' });
    }
    const newCourse = db.createCourse(req.body);
    res.status(201).json({ success: true, data: newCourse, message: 'Course created successfully' });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.message.includes('UNIQUE constraint failed: courses.course_code')) {
      return res.status(409).json({ success: false, message: 'Course code already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll Student in Course
app.post('/api/enrollments', (req, res) => {
  try {
    const { student_id, course_id, semester, grade, score } = req.body;
    if (!student_id || !course_id) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }
    const result = db.enrollStudent(Number(student_id), Number(course_id), Number(semester) || 1, grade || 'Pending', Number(score) || 0);
    res.json({ success: true, message: 'Course enrolled successfully', result });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Grade / Score for Enrollment
app.put('/api/enrollments/:id', (req, res) => {
  try {
    const { grade, score } = req.body;
    const updated = db.updateEnrollment(Number(req.params.id), grade, score);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    res.json({ success: true, data: updated, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating enrollment grade:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Drop Course Enrollment
app.delete('/api/enrollments/:id', (req, res) => {
  try {
    const success = db.dropEnrollment(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    res.json({ success: true, message: 'Course dropped successfully' });
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Attendance Records Query
app.get('/api/attendance', (req, res) => {
  try {
    const { courseId, date, studentId } = req.query;
    const list = db.getAttendanceList({ courseId, date, studentId });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record Bulk Attendance
app.post('/api/attendance', (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : [req.body];
    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'No attendance records provided' });
    }
    const result = db.recordBulkAttendance(records);
    res.json({ success: true, ...result, message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Announcements
app.get('/api/announcements', (req, res) => {
  try {
    const announcements = db.getAnnouncements();
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/announcements', (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const announcement = db.createAnnouncement({ title, content, category, priority });
    res.status(201).json({ success: true, data: announcement, message: 'Announcement posted' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export CSV of Students
app.get('/api/export/csv', (req, res) => {
  try {
    const { students } = db.getStudents({ limit: 1000 });
    const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Semester', 'Status', 'GPA', 'Enrollment Date'];
    
    const rows = students.map(s => [
      `"${s.student_id}"`,
      `"${s.first_name}"`,
      `"${s.last_name}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      `"${s.department}"`,
      s.semester,
      `"${s.status}"`,
      s.gpa,
      `"${s.enrollment_date || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_directory_export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset & Reseed Database
app.post('/api/reset-data', (req, res) => {
  try {
    db.resetAndSeedDatabase();
    res.json({ success: true, message: 'System database successfully reset and re-seeded with demo data' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fallback to index.html for SPA-style client routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Student Management System Server Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⚡ Environment: Production Ready`);
  console.log(`=================================================`);
});
