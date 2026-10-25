/**
 * Main Application Orchestration & Routing
 */

const App = {
  currentView: 'dashboard',

  init() {
    UI.init();
    this.bindGlobalNavigation();
    this.bindKeyboardShortcuts();
    this.bindSystemActions();

    // Initialize modules
    StudentsModule.init();
    CoursesModule.init();
    AttendanceModule.init();
    AnalyticsModule.init();

    // Default view
    this.switchView('dashboard');
  },

  bindGlobalNavigation() {
    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => UI.toggleTheme());
    }
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Update active class on sidebar links
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view-target') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide all view panels and show targeted one
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.remove('hidden');
      activeSec.classList.add('animate-slide-up');
    }

    // Update header title and breadcrumbs
    const titleEl = document.getElementById('page-main-title');
    const breadcrumbEl = document.getElementById('page-breadcrumb-text');
    
    const titles = {
      dashboard: { title: 'Executive Academic Dashboard', breadcrumb: 'Overview' },
      students: { title: 'Students Directory & Records', breadcrumb: 'Students' },
      courses: { title: 'Course Catalog & Registrations', breadcrumb: 'Academics' },
      attendance: { title: 'Daily Attendance Tracker', breadcrumb: 'Attendance' },
      announcements: { title: 'Campus Notices & Announcements', breadcrumb: 'Announcements' },
      reports: { title: 'Academic Reports & Analytics', breadcrumb: 'Reports' }
    };

    if (titleEl && titles[viewName]) titleEl.textContent = titles[viewName].title;
    if (breadcrumbEl && titles[viewName]) breadcrumbEl.textContent = titles[viewName].breadcrumb;

    // Refresh view specific data
    if (viewName === 'dashboard') {
      AnalyticsModule.refreshDashboard();
    } else if (viewName === 'students') {
      StudentsModule.loadStudents();
    } else if (viewName === 'courses') {
      CoursesModule.loadCourses();
    } else if (viewName === 'attendance') {
      AttendanceModule.loadRoster();
    } else if (viewName === 'announcements') {
      AnalyticsModule.loadAnnouncements();
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
  },

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Focus search on '/' or 'Ctrl+K'
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') || document.getElementById('student-search-input');
        if (searchInput) searchInput.focus();
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        UI.closeAllModals();
      }

      // Press 'N' for new student when not typing
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        StudentsModule.openAddModal();
      }
    });
  },

  bindSystemActions() {
    const resetBtn = document.getElementById('reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to reset and re-seed the system database with demo students and courses?')) {
          return;
        }

        try {
          UI.showToast('Resetting database...', 'info', 2000);
          await API.resetDatabase();
          UI.showToast('Database successfully re-seeded with demo data!', 'success');
          StudentsModule.loadStudents();
          CoursesModule.loadCourses();
          AnalyticsModule.refreshDashboard();
          AnalyticsModule.loadAnnouncements();
        } catch (err) {
          UI.showToast(`Reset failed: ${err.message}`, 'error');
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App = App;
  App.init();
});
