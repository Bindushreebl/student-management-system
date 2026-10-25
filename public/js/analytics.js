/**
 * Analytics, KPIs, Interactive SVG Charts, Announcements & Audit Logs
 */

const AnalyticsModule = {
  state: {
    stats: null,
    announcements: []
  },

  init() {
    this.bindEvents();
    this.refreshDashboard();
    this.loadAnnouncements();
  },

  bindEvents() {
    const annForm = document.getElementById('add-announcement-form');
    if (annForm) {
      annForm.addEventListener('submit', (e) => this.handleSaveAnnouncement(e));
    }
  },

  async refreshDashboard() {
    try {
      const res = await API.getStats();
      this.state.stats = res.data;
      this.renderKPIs();
      this.renderCharts();
      this.renderRecentStudents();
      this.renderAuditLogs();
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  },

  renderKPIs() {
    if (!this.state.stats || !this.state.stats.kpis) return;
    const { totalStudents, activeStudents, totalCourses, avgGpa, attendanceRate } = this.state.stats.kpis;

    const elTotal = document.getElementById('kpi-total-students');
    if (elTotal) elTotal.textContent = totalStudents;

    const elActive = document.getElementById('kpi-active-students');
    if (elActive) elActive.textContent = activeStudents;

    const elCourses = document.getElementById('kpi-total-courses');
    if (elCourses) elCourses.textContent = totalCourses;

    const elGpa = document.getElementById('kpi-avg-gpa');
    if (elGpa) elGpa.textContent = avgGpa.toFixed(2);

    const elAttendance = document.getElementById('kpi-attendance-rate');
    if (elAttendance) elAttendance.textContent = `${attendanceRate}%`;
  },

  renderCharts() {
    if (!this.state.stats) return;
    const { deptDistribution, gpaBrackets } = this.state.stats;

    // 1. Department Breakdown Bar Chart
    const deptContainer = document.getElementById('dept-chart-container');
    if (deptContainer && deptDistribution) {
      const maxCount = Math.max(...deptDistribution.map(d => d.count), 1);
      
      const barsHtml = deptDistribution.map(d => {
        const pct = Math.round((d.count / maxCount) * 100);
        return `
          <div style="margin-bottom: 0.85rem;">
            <div class="flex items-center justify-between" style="font-size:0.82rem;margin-bottom:0.3rem;">
              <span style="font-weight:600;color:var(--text-main);">${d.department}</span>
              <span style="color:var(--text-muted);font-family:var(--font-mono);">${d.count} Students (${d.avg_gpa ? d.avg_gpa.toFixed(2) + ' GPA' : 'N/A'})</span>
            </div>
            <div style="width:100%;height:8px;background:var(--bg-input);border-radius:var(--radius-full);overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);border-radius:var(--radius-full);transition:width 0.8s ease;"></div>
            </div>
          </div>
        `;
      }).join('');

      deptContainer.innerHTML = barsHtml;
    }

    // 2. GPA Brackets Radial / Progress
    const gpaContainer = document.getElementById('gpa-chart-container');
    if (gpaContainer && gpaBrackets) {
      const totalStudents = this.state.stats.kpis.totalStudents || 1;
      const colors = ['var(--accent-emerald)', 'var(--accent-cyan)', 'var(--accent-amber)', 'var(--accent-rose)'];

      const gpaHtml = gpaBrackets.map((b, i) => {
        const pct = Math.round((b.count / totalStudents) * 100);
        return `
          <div style="margin-bottom: 0.85rem;">
            <div class="flex items-center justify-between" style="font-size:0.82rem;margin-bottom:0.3rem;">
              <span style="font-weight:600;color:var(--text-main);">${b.label}</span>
              <span style="color:var(--text-muted);font-family:var(--font-mono);">${b.count} (${pct}%)</span>
            </div>
            <div style="width:100%;height:8px;background:var(--bg-input);border-radius:var(--radius-full);overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${colors[i % colors.length]};border-radius:var(--radius-full);transition:width 0.8s ease;"></div>
            </div>
          </div>
        `;
      }).join('');

      gpaContainer.innerHTML = gpaHtml;
    }
  },

  renderRecentStudents() {
    if (!this.state.stats || !this.state.stats.recentStudents) return;
    const container = document.getElementById('dashboard-recent-students');
    if (!container) return;

    const listHtml = this.state.stats.recentStudents.map(s => {
      return `
        <div class="flex items-center justify-between" style="padding:0.75rem 0;border-bottom:1px solid var(--border-color);">
          <div class="student-cell">
            <img src="${s.avatar_url}" class="student-avatar" style="width:36px;height:36px;" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=stu'"/>
            <div>
              <div class="student-info-name" style="font-size:0.88rem;">${s.first_name} ${s.last_name}</div>
              <div class="student-info-meta" style="font-size:0.72rem;">${s.student_id} • ${s.department}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${UI.getGpaBadge(s.gpa)}
            <button class="btn btn-outline btn-sm btn-icon-only" onclick="StudentsModule.viewDetails(${s.id})" title="View Profile">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = listHtml;
  },

  renderAuditLogs() {
    if (!this.state.stats || !this.state.stats.recentLogs) return;
    const container = document.getElementById('dashboard-audit-logs');
    if (!container) return;

    const logsHtml = this.state.stats.recentLogs.map(log => {
      return `
        <div style="padding:0.65rem 0;border-bottom:1px solid var(--border-color);display:flex;align-items:flex-start;gap:0.75rem;font-size:0.8rem;">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:0.4rem;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="color:var(--text-main);font-weight:500;">${log.details}</div>
            <div style="font-size:0.7rem;color:var(--text-dim);font-family:var(--font-mono);margin-top:0.15rem;">${log.timestamp}</div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = logsHtml;
  },

  async loadAnnouncements() {
    try {
      const res = await API.getAnnouncements();
      this.state.announcements = res.data || [];
      this.renderAnnouncements();
    } catch (err) {
      console.error(err);
    }
  },

  renderAnnouncements() {
    const container = document.getElementById('announcements-feed-container');
    if (!container) return;

    if (this.state.announcements.length === 0) {
      container.innerHTML = `<p style="color:var(--text-dim);text-align:center;padding:2rem;">No announcements posted.</p>`;
      return;
    }

    const html = this.state.announcements.map(a => {
      let priorityClass = 'badge-active';
      if (a.priority === 'High') priorityClass = 'badge-inactive' && 'gpa-low';
      else if (a.priority === 'Medium') priorityClass = 'gpa-warn';

      return `
        <div class="student-card" style="margin-bottom:1rem;padding:1.15rem;">
          <div class="flex items-center justify-between" style="margin-bottom:0.5rem;">
            <div class="flex items-center gap-2">
              <span class="badge badge-dept">${a.category}</span>
              <span class="badge ${a.priority === 'High' ? 'badge-inactive' : 'badge-active'}" style="font-size:0.7rem;">${a.priority} Priority</span>
            </div>
            <span style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">${a.created_at}</span>
          </div>
          <h4 style="font-size:0.98rem;margin-bottom:0.35rem;color:var(--text-main);">${a.title}</h4>
          <p style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${a.content}</p>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  openAnnouncementModal() {
    const form = document.getElementById('add-announcement-form');
    if (form) form.reset();
    UI.openModal('add-announcement-modal');
  },

  async handleSaveAnnouncement(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await API.createAnnouncement(data);
      UI.showToast('Announcement published successfully!', 'success');
      UI.closeModal('add-announcement-modal');
      form.reset();
      this.loadAnnouncements();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  async generateReportCard(studentId) {
    try {
      const res = await API.getStudentById(studentId);
      const student = res.data;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        UI.showToast('Please allow popups to print report card', 'warning');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Student Transcript - ${student.first_name} ${student.last_name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 25px; }
            .school-name { font-size: 24px; font-weight: bold; color: #4338ca; }
            .title { font-size: 18px; color: #64748b; margin-top: 5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .meta-item { font-size: 14px; }
            .meta-item strong { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .gpa-box { background: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; border-radius: 8px; text-align: right; }
            .gpa-num { font-size: 22px; font-weight: bold; color: #4338ca; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">EduPulse Academic Institute</div>
            <div class="title">Official Student Academic Performance & Grade Report</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><strong>Student Name:</strong> ${student.first_name} ${student.last_name}</div>
            <div class="meta-item"><strong>Student ID:</strong> ${student.student_id}</div>
            <div class="meta-item"><strong>Department:</strong> ${student.department}</div>
            <div class="meta-item"><strong>Current Semester:</strong> Semester ${student.semester}</div>
            <div class="meta-item"><strong>Email:</strong> ${student.email}</div>
            <div class="meta-item"><strong>Date of Generation:</strong> ${new Date().toLocaleDateString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Instructor</th>
                <th>Letter Grade</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${student.enrollments.map(e => `
                <tr>
                  <td><strong>${e.course_code}</strong></td>
                  <td>${e.course_name}</td>
                  <td>${e.credits}</td>
                  <td>${e.instructor || 'Faculty'}</td>
                  <td><strong>${e.grade}</strong></td>
                  <td>${e.score}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="gpa-box">
            Cumulative GPA: <span class="gpa-num">${student.gpa.toFixed(2)} / 4.00</span>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            This report is digitally generated by EduPulse Student Management System.
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background:#4f46e5; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Print Report</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.AnalyticsModule = AnalyticsModule;
