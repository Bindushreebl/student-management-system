/**
 * Seed data for Student Management System
 */

const sampleDepartments = [
  'Computer Science',
  'Data Science & AI',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Information Technology'
];

const sampleCourses = [
  { course_code: 'CS-101', course_name: 'Introduction to Computer Science', department: 'Computer Science', credits: 4, instructor: 'Dr. Alan Turing', capacity: 45, schedule: 'Mon/Wed 09:00 - 10:30' },
  { course_code: 'CS-204', course_name: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, instructor: 'Prof. Ada Lovelace', capacity: 40, schedule: 'Tue/Thu 11:00 - 12:30' },
  { course_code: 'DS-301', course_name: 'Machine Learning Foundations', department: 'Data Science & AI', credits: 3, instructor: 'Dr. Geoffrey Hinton', capacity: 35, schedule: 'Mon/Wed 14:00 - 15:30' },
  { course_code: 'DS-202', course_name: 'Big Data Analytics & SQL', department: 'Data Science & AI', credits: 3, instructor: 'Prof. Andrew Ng', capacity: 35, schedule: 'Fri 10:00 - 13:00' },
  { course_code: 'EE-110', course_name: 'Digital Circuits & Microprocessors', department: 'Electrical Engineering', credits: 4, instructor: 'Dr. Nikola Tesla', capacity: 30, schedule: 'Tue/Thu 09:00 - 10:30' },
  { course_code: 'EE-320', course_name: 'Signal Processing & IoT', department: 'Electrical Engineering', credits: 3, instructor: 'Prof. Claude Shannon', capacity: 30, schedule: 'Wed/Fri 11:00 - 12:30' },
  { course_code: 'ME-201', course_name: 'Thermodynamics & Fluid Dynamics', department: 'Mechanical Engineering', credits: 4, instructor: 'Dr. James Watt', capacity: 40, schedule: 'Mon/Wed 11:00 - 12:30' },
  { course_code: 'ME-305', course_name: 'Robotics & CAD Modeling', department: 'Mechanical Engineering', credits: 4, instructor: 'Prof. Henry Ford', capacity: 25, schedule: 'Tue/Thu 14:00 - 15:30' },
  { course_code: 'BA-101', course_name: 'Principles of Modern Management', department: 'Business Administration', credits: 3, instructor: 'Dr. Peter Drucker', capacity: 50, schedule: 'Mon/Wed 10:00 - 11:30' },
  { course_code: 'BA-205', course_name: 'Corporate Finance & Analytics', department: 'Business Administration', credits: 3, instructor: 'Prof. Warren Buffett', capacity: 45, schedule: 'Tue/Thu 13:00 - 14:30' },
  { course_code: 'IT-105', course_name: 'Web Technologies & Full Stack Dev', department: 'Information Technology', credits: 4, instructor: 'Dr. Tim Berners-Lee', capacity: 40, schedule: 'Tue/Thu 15:00 - 16:30' },
  { course_code: 'IT-302', course_name: 'Cloud Computing & Cyber Security', department: 'Information Technology', credits: 3, instructor: 'Prof. Linus Torvalds', capacity: 35, schedule: 'Fri 14:00 - 17:00' }
];

const sampleStudents = [
  {
    student_id: 'STU-2026-001',
    first_name: 'Sophia',
    last_name: 'Chen',
    email: 'sophia.chen@campus.edu',
    phone: '+1 (555) 234-5678',
    dob: '2004-05-14',
    gender: 'Female',
    department: 'Computer Science',
    semester: 4,
    status: 'Active',
    gpa: 3.92,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2024-09-01'
  },
  {
    student_id: 'STU-2026-002',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@campus.edu',
    phone: '+1 (555) 345-6789',
    dob: '2003-11-20',
    gender: 'Male',
    department: 'Data Science & AI',
    semester: 6,
    status: 'Active',
    gpa: 3.85,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2023-09-01'
  },
  {
    student_id: 'STU-2026-003',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@campus.edu',
    phone: '+1 (555) 456-7890',
    dob: '2005-02-18',
    gender: 'Female',
    department: 'Computer Science',
    semester: 2,
    status: 'Active',
    gpa: 3.78,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2025-09-01'
  },
  {
    student_id: 'STU-2026-004',
    first_name: 'Liam',
    last_name: 'O\'Connor',
    email: 'liam.oconnor@campus.edu',
    phone: '+1 (555) 567-8901',
    dob: '2003-08-30',
    gender: 'Male',
    department: 'Electrical Engineering',
    semester: 6,
    status: 'Active',
    gpa: 3.65,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2023-09-01'
  },
  {
    student_id: 'STU-2026-005',
    first_name: 'Amina',
    last_name: 'Diallo',
    email: 'amina.diallo@campus.edu',
    phone: '+1 (555) 678-9012',
    dob: '2004-12-05',
    gender: 'Female',
    department: 'Business Administration',
    semester: 4,
    status: 'Active',
    gpa: 3.96,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2024-09-01'
  },
  {
    student_id: 'STU-2026-006',
    first_name: 'David',
    last_name: 'Kim',
    email: 'david.kim@campus.edu',
    phone: '+1 (555) 789-0123',
    dob: '2004-03-22',
    gender: 'Male',
    department: 'Mechanical Engineering',
    semester: 4,
    status: 'Active',
    gpa: 3.42,
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2024-09-01'
  },
  {
    student_id: 'STU-2026-007',
    first_name: 'Zoe',
    last_name: 'Kowalski',
    email: 'zoe.kowalski@campus.edu',
    phone: '+1 (555) 890-1234',
    dob: '2005-07-11',
    gender: 'Female',
    department: 'Information Technology',
    semester: 2,
    status: 'Active',
    gpa: 3.88,
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2025-09-01'
  },
  {
    student_id: 'STU-2026-008',
    first_name: 'Tariq',
    last_name: 'Al-Mansoor',
    email: 'tariq.mansoor@campus.edu',
    phone: '+1 (555) 901-2345',
    dob: '2002-10-15',
    gender: 'Male',
    department: 'Computer Science',
    semester: 8,
    status: 'Graduated',
    gpa: 3.95,
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2022-09-01'
  },
  {
    student_id: 'STU-2026-009',
    first_name: 'Isabella',
    last_name: 'Santos',
    email: 'isabella.santos@campus.edu',
    phone: '+1 (555) 012-3456',
    dob: '2004-09-25',
    gender: 'Female',
    department: 'Data Science & AI',
    semester: 4,
    status: 'Active',
    gpa: 3.71,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2024-09-01'
  },
  {
    student_id: 'STU-2026-010',
    first_name: 'Lucas',
    last_name: 'Müller',
    email: 'lucas.mueller@campus.edu',
    phone: '+1 (555) 123-4560',
    dob: '2003-04-19',
    gender: 'Male',
    department: 'Electrical Engineering',
    semester: 6,
    status: 'Active',
    gpa: 3.50,
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2023-09-01'
  },
  {
    student_id: 'STU-2026-011',
    first_name: 'Ananya',
    last_name: 'Sharma',
    email: 'ananya.sharma@campus.edu',
    phone: '+1 (555) 234-5671',
    dob: '2005-01-30',
    gender: 'Female',
    department: 'Computer Science',
    semester: 2,
    status: 'Active',
    gpa: 4.00,
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2025-09-01'
  },
  {
    student_id: 'STU-2026-012',
    first_name: 'Ethan',
    last_name: 'Wright',
    email: 'ethan.wright@campus.edu',
    phone: '+1 (555) 345-6782',
    dob: '2004-06-12',
    gender: 'Male',
    department: 'Business Administration',
    semester: 3,
    status: 'Inactive',
    gpa: 2.89,
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2024-09-01'
  },
  {
    student_id: 'STU-2026-013',
    first_name: 'Chloe',
    last_name: 'Dubois',
    email: 'chloe.dubois@campus.edu',
    phone: '+1 (555) 456-7893',
    dob: '2004-08-08',
    gender: 'Female',
    department: 'Mechanical Engineering',
    semester: 5,
    status: 'Active',
    gpa: 3.68,
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2023-09-01'
  },
  {
    student_id: 'STU-2026-014',
    first_name: 'Kenji',
    last_name: 'Takahashi',
    email: 'kenji.takahashi@campus.edu',
    phone: '+1 (555) 567-8904',
    dob: '2003-12-14',
    gender: 'Male',
    department: 'Data Science & AI',
    semester: 6,
    status: 'Active',
    gpa: 3.82,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2023-09-01'
  },
  {
    student_id: 'STU-2026-015',
    first_name: 'Olivia',
    last_name: 'Martinez',
    email: 'olivia.martinez@campus.edu',
    phone: '+1 (555) 678-9015',
    dob: '2005-04-02',
    gender: 'Female',
    department: 'Information Technology',
    semester: 1,
    status: 'Active',
    gpa: 3.55,
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    enrollment_date: '2026-01-15'
  }
];

const sampleAnnouncements = [
  {
    title: 'Mid-Term Examination Schedule Released (Fall 2026)',
    content: 'The official datesheets for all departments are now published. Review your course portals for room allocations.',
    category: 'Exam',
    priority: 'High',
    created_at: '2026-10-24 10:00:00'
  },
  {
    title: 'Annual Tech & Innovation Symposium 2026',
    content: 'Student project submissions are open until November 15th. Cash prizes and industry mentorships will be awarded.',
    category: 'Event',
    priority: 'Medium',
    created_at: '2026-10-22 14:30:00'
  },
  {
    title: 'Library Digital Database Upgrade & Access Credentials',
    content: 'IEEE Xplore and ACM Digital Library are now integrated with your unified student ID login credentials.',
    category: 'Academic',
    priority: 'Normal',
    created_at: '2026-10-20 09:15:00'
  },
  {
    title: 'Campus Hackathon: AI for Sustainable Futures',
    content: 'Registrations are open for teams of 3-4 students. Free refreshments, server credits, and sponsor swag provided.',
    category: 'Event',
    priority: 'Normal',
    created_at: '2026-10-18 16:45:00'
  }
];

module.exports = {
  sampleDepartments,
  sampleCourses,
  sampleStudents,
  sampleAnnouncements
};
