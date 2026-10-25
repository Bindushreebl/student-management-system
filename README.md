# EduPulse - Student Management System (SMS)

A full-stack, responsive Student Management System built with a Node.js & Express REST API, SQLite database with transactional persistence, and a modern, high-performance vanilla frontend.

![EduPulse SMS](https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 📊 Executive Academic Dashboard
- **Key Performance Indicators (KPIs)**: Real-time metrics for Total Enrolled, Active Students, Offered Courses, Institutional GPA, and Class Attendance Rate.
- **Dynamic Charts**:
  - Department enrollment breakdown bar chart.
  - Academic standing distribution (GPA tiers: Dean's List, Honors, Good Standing).
- **Recent Registrations**: Instant overview of new student admissions.
- **System Audit Log**: Live audit trail logging every database modification.

### 🎓 Students Directory & Records
- **Table & Grid Card Views**: Seamlessly switch between a data table view and visual student profile cards.
- **Advanced Multi-Filtering & Live Search**: Instant search by student name, ID, or email, with filters for Department, Semester, Status, and sorting options.
- **Comprehensive Student Dossier (Modal)**:
  - Enrolled courses with letter grades, percentage scores, and course credit weights.
  - Historical attendance records.
  - Personal contact and enrollment details.
- **Full CRUD Support**: Add new students (with automatic unique ID generation), edit details, and safely delete records.
- **CSV Data Export**: One-click download of student records.

### 📚 Course Catalog & Registrations
- Catalog display with course code, title, instructor, schedule, credits, and capacity meter.
- Add new courses and enroll students directly with initial grade assignment.
- Automatic cumulative GPA recalculation based on course credit weights.

### 📅 Session Attendance Registry
- Course-specific attendance tracker by date.
- Quick status toggles: `Present`, `Late`, `Absent`, and `Excused`.
- **"Mark All Present"** bulk helper button for rapid roll call.

### 📄 Transcripts & Reports
- Digital report card generator formatted for print and official recordkeeping.

### 🎨 Modern Aesthetics & UI Design
- **Theme Support**: Seamless toggle between Dark Mode and Light Mode (persisted in `localStorage`).
- **Typography**: `Plus Jakarta Sans` for clean typography and `JetBrains Mono` for codes and IDs.
- **Micro-Animations**: Smooth slide-ins, status pulses, and glassmorphic card overlays.
- **Toast Notifications**: Non-intrusive feedback for every system action.
- **Keyboard Shortcuts**: `/` to focus search, `Esc` to close modals, and `N` for new student entry.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, CORS
- **Database**: SQLite3 via `better-sqlite3` (WAL mode enabled, foreign keys, cascading deletes)
- **Frontend**: HTML5, Vanilla Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism), Vanilla JavaScript (ES6+ modular)
- **Icons & Visuals**: Modern SVG Icon system and Unsplash/DiceBear avatars

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or higher)
- [npm](https://www.npmjs.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bindushreebl/student-management-system.git
   cd student-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
student-management-system/
├── db/
│   ├── database.js          # SQLite connection, schema definition & queries
│   └── seedData.js          # Sample students, courses, and announcements
├── public/
│   ├── css/
│   │   ├── variables.css    # Design tokens, color palette, dark/light theme
│   │   ├── base.css         # Typography, reset, layout scaffolding
│   │   ├── components.css   # Cards, tables, modals, badges, toolbar
│   │   └── animations.css   # Micro-interactions, transitions, pulse effects
│   ├── js/
│   │   ├── api.js           # REST API client
│   │   ├── ui.js            # Toast notification system, modal controls, theme
│   │   ├── students.js      # Student directory logic, filters, and profile view
│   │   ├── courses.js       # Course catalog & enrollment manager
│   │   ├── attendance.js    # Attendance tracker & batch session logging
│   │   ├── analytics.js     # Dashboard KPIs, SVG charts, transcript generator
│   │   └── app.js           # Router, navigation & keyboard shortcuts
│   └── index.html           # Main single-page application structure
├── server.js                # Express REST API routes & static server
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

---

## 📄 License
MIT License
