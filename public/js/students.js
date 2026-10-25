/**
 * Students Directory Component & Management Logic
 */

const StudentsModule = {
  state: {
    students: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    filters: {
      search: '',
      department: '',
      semester: '',
      status: '',
      sortBy: 'id',
      order: 'DESC'
    },
    viewMode: 'table', // 'table' | 'grid'
    selectedStudentId: null,
    searchDebounceTimer: null
  },

  init() {
    this.bindEvents();
    this.loadStudents();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('student-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.state.searchDebounceTimer);
        this.state.searchDebounceTimer = setTimeout(() => {
          this.state.filters.search = e.target.value.trim();
          this.state.pagination.page = 1;
          this.loadStudents();
        }, 300);
      });
    }

    // Header global search synchronization
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        clearTimeout(this.state.searchDebounceTimer);
        this.state.searchDebounceTimer = setTimeout(() => {
          this.state.filters.search = e.target.value.trim();
          this.state.pagination.page = 1;
          // Switch to students tab if not active
          if (window.App && window.App.currentView !== 'students') {
            window.App.switchView('students');
          }
          if (searchInput) searchInput.value = e.target.value;
          this.loadStudents();
        }, 350);
      });
    }

    // Filter dropdowns
    const deptFilter = document.getElementById('filter-dept');
    if (deptFilter) {
      deptFilter.addEventListener('change', (e) => {
        this.state.filters.department = e.target.value;
        this.state.pagination.page = 1;
        this.loadStudents();
      });
    }

    const semFilter = document.getElementById('filter-sem');
    if (semFilter) {
      semFilter.addEventListener('change', (e) => {
        this.state.filters.semester = e.target.value;
        this.state.pagination.page = 1;
        this.loadStudents();
      });
    }

    const statusFilter = document.getElementById('filter-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.state.filters.status = e.target.value;
        this.state.pagination.page = 1;
        this.loadStudents();
      });
    }

    const sortFilter = document.getElementById('filter-sort');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        const [sortBy, order] = e.target.value.split(':');
        this.state.filters.sortBy = sortBy;
        this.state.filters.order = order || 'DESC';
        this.loadStudents();
      });
    }

    // View toggles
    const tableViewBtn = document.getElementById('view-table-btn');
    const gridViewBtn = document.getElementById('view-grid-btn');
    if (tableViewBtn && gridViewBtn) {
      tableViewBtn.addEventListener('click', () => {
        this.state.viewMode = 'table';
        tableViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        this.renderView();
      });
      gridViewBtn.addEventListener('click', () => {
        this.state.viewMode = 'grid';
        gridViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        this.renderView();
      });
    }

    // Add Student form submission
    const studentForm = document.getElementById('add-student-form');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => this.handleSaveStudent(e));
    }

    // Edit Student form submission
    const editForm = document.getElementById('edit-student-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleUpdateStudent(e));
    }

    // Export CSV
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.location.href = '/api/export/csv';
        UI.showToast('Generating students CSV export...', 'info', 2000);
      });
    }

    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.state.filters = { search: '', department: '', semester: '', status: '', sortBy: 'id', order: 'DESC' };
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = '';
        if (semFilter) semFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (sortFilter) sortFilter.value = 'id:DESC';
        this.loadStudents();
        UI.showToast('Filters cleared', 'info', 1500);
      });
    }
  },

  async loadStudents() {
    try {
      const container = document.getElementById('students-display-container');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted);">
            <div class="status-dot-pulse" style="margin-bottom: 0.5rem;"></div>
            <p>Loading student directory...</p>
          </div>
        `;
      }

      const res = await API.getStudents({
        ...this.state.filters,
        page: this.state.pagination.page,
        limit: 50
      });

      this.state.students = res.students || [];
      this.state.pagination = res.pagination || { page: 1, totalPages: 1, total: 0 };

      // Update count badge
      const countBadge = document.getElementById('students-count-badge');
      if (countBadge) {
        countBadge.textContent = this.state.pagination.total;
      }
      const navBadge = document.getElementById('nav-students-count');
      if (navBadge) {
        navBadge.textContent = this.state.pagination.total;
      }

      this.renderView();
    } catch (err) {
      console.error(err);
      UI.showToast(`Failed to load students: ${err.message}`, 'error');
    }
  },

  renderView() {
    const container = document.getElementById('students-display-container');
    if (!container) return;

    if (this.state.students.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-dim); background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <svg style="width:48px;height:48px;margin-bottom:1rem;color:var(--text-dim);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 style="color: var(--text-main); margin-bottom: 0.35rem;">No Students Found</h3>
          <p>No student records match your selected criteria. Try adjusting your filters or search query.</p>
        </div>
      `;
      return;
    }

    if (this.state.viewMode === 'table') {
      this.renderTable(container);
    } else {
      this.renderGrid(container);
    }
  },

  renderTable(container) {
    const rowsHtml = this.state.students.map(s => {
      return `
        <tr>
          <td>
            <div class="student-cell">
              <img src="${s.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.first_name}" alt="${s.first_name}" class="student-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=avatar'"/>
              <div>
                <div class="student-info-name">${s.first_name} ${s.last_name}</div>
                <div class="student-info-meta">${s.student_id}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size:0.82rem;color:var(--text-muted);">${s.email}</span>
            <div style="font-size:0.75rem;color:var(--text-dim);">${s.phone || 'N/A'}</div>
          </td>
          <td>${UI.getDepartmentBadge(s.department)}</td>
          <td>
            <span class="badge" style="background:var(--bg-input);border:1px solid var(--border-color);">Sem ${s.semester}</span>
          </td>
          <td>${UI.getGpaBadge(s.gpa)}</td>
          <td>${UI.getStatusBadge(s.status)}</td>
          <td style="text-align: right;">
            <div class="flex items-center gap-1" style="justify-content: flex-end;">
              <button class="btn btn-outline btn-sm" onclick="StudentsModule.viewDetails(${s.id})" title="View Complete Profile">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button class="btn btn-secondary btn-sm btn-icon-only" onclick="StudentsModule.openEditModal(${s.id})" title="Edit Student">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn btn-danger btn-sm btn-icon-only" onclick="StudentsModule.confirmDelete(${s.id}, '${s.first_name} ${s.last_name}')" title="Delete Student">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="content-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Semester</th>
                <th>GPA</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderGrid(container) {
    const cardsHtml = this.state.students.map(s => {
      return `
        <div class="student-card">
          <div class="student-card-header">
            <img src="${s.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.first_name}" alt="${s.first_name}" class="student-card-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=avatar'"/>
            <div style="flex:1;min-width:0;">
              <h4 class="student-info-name truncate">${s.first_name} ${s.last_name}</h4>
              <span class="student-info-meta">${s.student_id}</span>
              <div style="margin-top:0.35rem;">${UI.getStatusBadge(s.status)}</div>
            </div>
          </div>
          <div class="student-card-body">
            <div class="student-detail-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="truncate">${s.department}</span>
            </div>
            <div class="student-detail-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="truncate">${s.email}</span>
            </div>
            <div class="flex items-center justify-between" style="margin-top:0.5rem;padding:0.4rem 0.6rem;background:var(--bg-input);border-radius:var(--radius-md);">
              <span style="font-size:0.75rem;color:var(--text-muted);">Semester ${s.semester}</span>
              <div>GPA: ${UI.getGpaBadge(s.gpa)}</div>
            </div>
          </div>
          <div class="student-card-footer">
            <button class="btn btn-outline btn-sm" onclick="StudentsModule.viewDetails(${s.id})">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Profile
            </button>
            <div class="flex items-center gap-1">
              <button class="btn btn-secondary btn-sm btn-icon-only" onclick="StudentsModule.openEditModal(${s.id})" title="Edit">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn btn-danger btn-sm btn-icon-only" onclick="StudentsModule.confirmDelete(${s.id}, '${s.first_name} ${s.last_name}')" title="Delete">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="student-grid">${cardsHtml}</div>`;
  },

  async viewDetails(studentId) {
    try {
      const res = await API.getStudentById(studentId);
      const student = res.data;
      this.state.selectedStudentId = student.id;

      const modalBody = document.getElementById('student-profile-body');
      if (!modalBody) return;

      const enrollmentsHtml = (student.enrollments && student.enrollments.length > 0) ? `
        <table class="data-table" style="margin-top: 0.5rem;">
          <thead>
            <tr>
              <th>Course</th>
              <th>Instructor</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Score</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${student.enrollments.map(e => `
              <tr>
                <td>
                  <strong style="color:var(--primary);">${e.course_code}</strong>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${e.course_name}</div>
                </td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${e.instructor || 'Staff'}</td>
                <td><span class="badge" style="background:var(--bg-input);">${e.credits} Cr</span></td>
                <td>
                  <span class="badge ${e.grade.startsWith('A') ? 'badge-active' : e.grade.startsWith('B') ? 'badge-dept' : 'badge-inactive'}">
                    ${e.grade}
                  </span>
                </td>
                <td><span class="font-mono">${e.score}%</span></td>
                <td style="text-align: right;">
                  <button class="btn btn-danger btn-sm" onclick="StudentsModule.dropCourse(${e.enrollment_id})">Drop</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p style="padding: 1.5rem; text-align: center; color: var(--text-dim);">No courses enrolled currently.</p>`;

      const attendanceHistoryHtml = (student.recentAttendance && student.recentAttendance.length > 0) ? `
        <table class="data-table" style="margin-top: 0.5rem;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${student.recentAttendance.map(a => `
              <tr>
                <td class="font-mono" style="font-size:0.8rem;">${a.date}</td>
                <td><strong>${a.course_code}</strong></td>
                <td>${UI.getStatusBadge(a.status)}</td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${a.remarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p style="padding: 1.5rem; text-align: center; color: var(--text-dim);">No recent attendance entries recorded.</p>`;

      modalBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border-color);margin-bottom:1.25rem;">
          <img src="${student.avatar_url}" class="student-avatar" style="width:72px;height:72px;border:3px solid var(--primary);" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=student'"/>
          <div style="flex:1;">
            <div class="flex items-center gap-2">
              <h2 style="font-size:1.4rem;">${student.first_name} ${student.last_name}</h2>
              ${UI.getStatusBadge(student.status)}
            </div>
            <div style="display:flex;gap:1rem;margin-top:0.35rem;font-size:0.82rem;color:var(--text-muted);flex-wrap:wrap;">
              <span class="font-mono" style="color:var(--primary);font-weight:600;">ID: ${student.student_id}</span>
              <span>•</span>
              <span>${student.department}</span>
              <span>•</span>
              <span>Semester ${student.semester}</span>
              <span>•</span>
              <span>Cumulative GPA: <strong>${student.gpa.toFixed(2)}</strong></span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="StudentsModule.openEditModal(${student.id}); UI.closeModal('student-profile-modal');">
            Edit Details
          </button>
        </div>

        <div class="tabs-header">
          <button class="tab-btn active" onclick="StudentsModule.switchProfileTab(event, 'profile-tab-courses')">Enrolled Courses (${student.enrollments.length})</button>
          <button class="tab-btn" onclick="StudentsModule.switchProfileTab(event, 'profile-tab-attendance')">Attendance History</button>
          <button class="tab-btn" onclick="StudentsModule.switchProfileTab(event, 'profile-tab-contact')">Personal & Academic Info</button>
        </div>

        <div id="profile-tab-courses" class="profile-tab-pane">
          <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
            <h4 style="font-size: 0.95rem;">Registered Courses & Grades</h4>
            <button class="btn btn-primary btn-sm" onclick="CoursesModule.openEnrollModalForStudent(${student.id}, '${student.first_name} ${student.last_name}')">
              + Enroll Course
            </button>
          </div>
          ${enrollmentsHtml}
        </div>

        <div id="profile-tab-attendance" class="profile-tab-pane hidden">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Class Attendance Records</h4>
          ${attendanceHistoryHtml}
        </div>

        <div id="profile-tab-contact" class="profile-tab-pane hidden">
          <div class="form-grid" style="margin-top:0.5rem;">
            <div class="form-group">
              <span class="form-label">Email Address</span>
              <p style="color:var(--text-main);">${student.email}</p>
            </div>
            <div class="form-group">
              <span class="form-label">Phone</span>
              <p style="color:var(--text-main);">${student.phone || 'Not recorded'}</p>
            </div>
            <div class="form-group">
              <span class="form-label">Date of Birth</span>
              <p style="color:var(--text-main);">${student.dob || 'Not recorded'}</p>
            </div>
            <div class="form-group">
              <span class="form-label">Gender</span>
              <p style="color:var(--text-main);">${student.gender || 'Not specified'}</p>
            </div>
            <div class="form-group">
              <span class="form-label">Enrollment Date</span>
              <p style="color:var(--text-main);">${student.enrollment_date || 'N/A'}</p>
            </div>
            <div class="form-group">
              <span class="form-label">System Record Created</span>
              <p style="color:var(--text-main);">${student.created_at || 'N/A'}</p>
            </div>
          </div>
        </div>
      `;

      UI.openModal('student-profile-modal');
    } catch (err) {
      console.error(err);
      UI.showToast(`Failed to load student details: ${err.message}`, 'error');
    }
  },

  switchProfileTab(e, tabId) {
    document.querySelectorAll('.modal-body .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.profile-tab-pane').forEach(pane => pane.classList.add('hidden'));
    e.target.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
  },

  openAddModal() {
    const form = document.getElementById('add-student-form');
    if (form) form.reset();
    UI.openModal('add-student-modal');
  },

  async handleSaveStudent(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await API.createStudent(data);
      UI.showToast(`Student ${res.data.first_name} ${res.data.last_name} enrolled successfully!`, 'success');
      UI.closeModal('add-student-modal');
      form.reset();
      this.loadStudents();
      if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  async openEditModal(studentId) {
    try {
      const res = await API.getStudentById(studentId);
      const student = res.data;

      const form = document.getElementById('edit-student-form');
      if (!form) return;

      form.elements['id'].value = student.id;
      form.elements['first_name'].value = student.first_name;
      form.elements['last_name'].value = student.last_name;
      form.elements['email'].value = student.email;
      form.elements['phone'].value = student.phone || '';
      form.elements['department'].value = student.department;
      form.elements['semester'].value = student.semester;
      form.elements['status'].value = student.status;
      form.elements['gpa'].value = student.gpa;
      form.elements['dob'].value = student.dob || '';
      form.elements['gender'].value = student.gender || 'Female';

      UI.openModal('edit-student-modal');
    } catch (err) {
      UI.showToast(`Error opening edit form: ${err.message}`, 'error');
    }
  },

  async handleUpdateStudent(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const studentId = data.id;

    try {
      await API.updateStudent(studentId, data);
      UI.showToast('Student information updated successfully!', 'success');
      UI.closeModal('edit-student-modal');
      this.loadStudents();
      if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  confirmDelete(studentId, studentName) {
    const dialog = document.getElementById('confirm-delete-modal');
    const msg = document.getElementById('confirm-delete-message');
    const confirmBtn = document.getElementById('confirm-delete-btn');

    if (msg) msg.textContent = `Are you sure you want to delete ${studentName}? This will permanently remove their records, course enrollments, and attendance history.`;

    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        try {
          await API.deleteStudent(studentId);
          UI.showToast(`Student ${studentName} was deleted`, 'success');
          UI.closeModal('confirm-delete-modal');
          this.loadStudents();
          if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
        } catch (err) {
          UI.showToast(err.message, 'error');
        }
      };
    }

    UI.openModal('confirm-delete-modal');
  },

  async dropCourse(enrollmentId) {
    if (!confirm('Are you sure you want to drop this course enrollment?')) return;
    try {
      await API.dropEnrollment(enrollmentId);
      UI.showToast('Course enrollment dropped', 'success');
      if (this.state.selectedStudentId) {
        this.viewDetails(this.state.selectedStudentId);
      }
      this.loadStudents();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.StudentsModule = StudentsModule;
