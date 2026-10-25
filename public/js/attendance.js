/**
 * Attendance Tracking & Session Logging
 */

const AttendanceModule = {
  state: {
    selectedCourseId: '',
    selectedDate: new Date().toISOString().split('T')[0],
    roster: [],
    attendanceRecords: {}
  },

  init() {
    this.bindEvents();
    const dateInput = document.getElementById('att-date-input');
    if (dateInput) {
      dateInput.value = this.state.selectedDate;
    }
  },

  bindEvents() {
    const courseSelect = document.getElementById('att-course-select');
    if (courseSelect) {
      courseSelect.addEventListener('change', (e) => {
        this.state.selectedCourseId = e.target.value;
        this.loadRoster();
      });
    }

    const dateInput = document.getElementById('att-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.state.selectedDate = e.target.value;
        this.loadRoster();
      });
    }

    const markAllPresentBtn = document.getElementById('att-mark-all-present');
    if (markAllPresentBtn) {
      markAllPresentBtn.addEventListener('click', () => this.markAll('Present'));
    }

    const saveBtn = document.getElementById('att-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAttendance());
    }
  },

  async loadRoster() {
    const container = document.getElementById('att-roster-container');
    if (!container) return;

    if (!this.state.selectedCourseId) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-dim);border:1px dashed var(--border-color);border-radius:var(--radius-lg);">
          <svg style="width:40px;height:40px;margin-bottom:0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Please select a course to load the student attendance roster.</p>
        </div>
      `;
      return;
    }

    try {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-muted);">Fetching students roster...</p>';

      // Fetch all students and filter by enrollment in selected course
      const [studentsRes, existingAttRes] = await Promise.all([
        API.getStudents({ limit: 100 }),
        API.getAttendance({ courseId: this.state.selectedCourseId, date: this.state.selectedDate })
      ]);

      const existingMap = {};
      if (existingAttRes && existingAttRes.data) {
        existingAttRes.data.forEach(a => {
          existingMap[a.student_id] = { status: a.status, remarks: a.remarks };
        });
      }

      this.state.roster = studentsRes.students || [];
      this.state.attendanceRecords = {};

      const rows = this.state.roster.map(s => {
        const currentStatus = existingMap[s.id] ? existingMap[s.id].status : 'Present';
        const remarks = existingMap[s.id] ? existingMap[s.id].remarks : '';
        this.state.attendanceRecords[s.id] = { status: currentStatus, remarks: remarks };

        return `
          <tr id="att-row-${s.id}">
            <td>
              <div class="student-cell">
                <img src="${s.avatar_url}" class="student-avatar" style="width:36px;height:36px;" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=stu'"/>
                <div>
                  <div class="student-info-name">${s.first_name} ${s.last_name}</div>
                  <div class="student-info-meta">${s.student_id}</div>
                </div>
              </div>
            </td>
            <td>${UI.getDepartmentBadge(s.department)}</td>
            <td>
              <div class="flex items-center gap-1" id="att-btn-group-${s.id}">
                ${['Present', 'Late', 'Absent', 'Excused'].map(stat => `
                  <button type="button" class="attendance-status-btn ${currentStatus === stat ? 'selected-' + stat : ''}"
                    onclick="AttendanceModule.setStatus(${s.id}, '${stat}')">
                    ${stat}
                  </button>
                `).join('')}
              </div>
            </td>
            <td>
              <input type="text" placeholder="Optional remark (e.g. medical)" value="${remarks}"
                style="padding:0.4rem 0.6rem;font-size:0.8rem;width:100%;max-width:240px;"
                onchange="AttendanceModule.setRemarks(${s.id}, this.value)"/>
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div class="content-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Class Roster (${this.state.roster.length} Students)</h3>
              <p class="card-subtitle">Session Date: ${this.state.selectedDate}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-secondary btn-sm" id="att-mark-all-present" onclick="AttendanceModule.markAll('Present')">
                Mark All Present
              </button>
              <button class="btn btn-primary btn-sm" onclick="AttendanceModule.saveAttendance()">
                Save Attendance
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Attendance Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      console.error(err);
      UI.showToast(`Error loading roster: ${err.message}`, 'error');
    }
  },

  setStatus(studentId, status) {
    if (!this.state.attendanceRecords[studentId]) {
      this.state.attendanceRecords[studentId] = { status, remarks: '' };
    } else {
      this.state.attendanceRecords[studentId].status = status;
    }

    const group = document.getElementById(`att-btn-group-${studentId}`);
    if (group) {
      group.querySelectorAll('.attendance-status-btn').forEach(btn => {
        btn.className = 'attendance-status-btn';
        if (btn.textContent.trim() === status) {
          btn.classList.add(`selected-${status}`);
        }
      });
    }
  },

  setRemarks(studentId, remarks) {
    if (!this.state.attendanceRecords[studentId]) {
      this.state.attendanceRecords[studentId] = { status: 'Present', remarks };
    } else {
      this.state.attendanceRecords[studentId].remarks = remarks;
    }
  },

  markAll(status) {
    this.state.roster.forEach(s => {
      this.setStatus(s.id, status);
    });
    UI.showToast(`Marked all students as ${status}`, 'info', 1500);
  },

  async saveAttendance() {
    if (!this.state.selectedCourseId) {
      UI.showToast('Please select a course first', 'warning');
      return;
    }

    const records = Object.keys(this.state.attendanceRecords).map(studentId => ({
      student_id: Number(studentId),
      course_id: Number(this.state.selectedCourseId),
      date: this.state.selectedDate,
      status: this.state.attendanceRecords[studentId].status,
      remarks: this.state.attendanceRecords[studentId].remarks
    }));

    if (records.length === 0) {
      UI.showToast('No student attendance records to save', 'warning');
      return;
    }

    try {
      await API.recordAttendance(records);
      UI.showToast(`Saved attendance for ${records.length} students successfully!`, 'success');
      if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AttendanceModule = AttendanceModule;
