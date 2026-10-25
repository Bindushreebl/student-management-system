/**
 * Courses Catalog & Enrollment Manager
 */

const CoursesModule = {
  state: {
    courses: []
  },

  init() {
    this.bindEvents();
    this.loadCourses();
  },

  bindEvents() {
    const courseForm = document.getElementById('add-course-form');
    if (courseForm) {
      courseForm.addEventListener('submit', (e) => this.handleSaveCourse(e));
    }

    const enrollForm = document.getElementById('enroll-student-form');
    if (enrollForm) {
      enrollForm.addEventListener('submit', (e) => this.handleEnrollment(e));
    }
  },

  async loadCourses() {
    try {
      const res = await API.getCourses();
      this.state.courses = res.data || [];
      this.renderCourses();
      this.populateCourseSelects();
    } catch (err) {
      console.error(err);
      UI.showToast(`Failed to load courses: ${err.message}`, 'error');
    }
  },

  renderCourses() {
    const container = document.getElementById('courses-grid-container');
    if (!container) return;

    if (this.state.courses.length === 0) {
      container.innerHTML = `<p style="color:var(--text-dim);text-align:center;padding:2rem;">No courses available.</p>`;
      return;
    }

    const cardsHtml = this.state.courses.map(c => {
      const capacityPercent = Math.min(100, Math.round(((c.enrolled_count || 0) / (c.capacity || 40)) * 100));
      return `
        <div class="student-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;">
            <span class="badge badge-dept" style="font-size:0.8rem;font-weight:700;">${c.course_code}</span>
            <span class="badge" style="background:var(--bg-input);">${c.credits} Credits</span>
          </div>
          <h3 style="font-size:1.1rem;margin-bottom:0.4rem;line-height:1.3;">${c.course_name}</h3>
          <p style="font-size:0.82rem;color:var(--accent-cyan);margin-bottom:0.85rem;">${c.department}</p>
          
          <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem;font-size:0.8rem;color:var(--text-muted);">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <svg style="width:16px;height:16px;color:var(--text-dim);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>${c.instructor || 'Staff Instructor'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <svg style="width:16px;height:16px;color:var(--text-dim);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${c.schedule || 'Flexible'}</span>
            </div>
          </div>

          <div style="margin-top:auto;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.35rem;color:var(--text-dim);">
              <span>Enrollment: <strong>${c.enrolled_count || 0} / ${c.capacity}</strong></span>
              <span>${capacityPercent}%</span>
            </div>
            <div style="width:100%;height:6px;background:var(--bg-input);border-radius:var(--radius-full);overflow:hidden;margin-bottom:1rem;">
              <div style="width:${capacityPercent}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent-cyan));border-radius:var(--radius-full);"></div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="CoursesModule.openEnrollModalForCourse(${c.id}, '${c.course_code}')">
              Enroll Student
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="student-grid">${cardsHtml}</div>`;
  },

  populateCourseSelects() {
    const selects = ['enroll-course-select', 'att-course-select'];
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;
      const currentVal = select.value;
      select.innerHTML = '<option value="">Select a Course...</option>' + 
        this.state.courses.map(c => `<option value="${c.id}">${c.course_code} - ${c.course_name}</option>`).join('');
      if (currentVal) select.value = currentVal;
    });
  },

  openAddCourseModal() {
    const form = document.getElementById('add-course-form');
    if (form) form.reset();
    UI.openModal('add-course-modal');
  },

  async handleSaveCourse(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await API.createCourse(data);
      UI.showToast(`Course ${data.course_code} created successfully!`, 'success');
      UI.closeModal('add-course-modal');
      form.reset();
      this.loadCourses();
      if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  },

  async openEnrollModalForStudent(studentId, studentName) {
    await this.populateStudentSelect(studentId);
    UI.openModal('enroll-student-modal');
  },

  async openEnrollModalForCourse(courseId, courseCode) {
    await this.populateStudentSelect();
    const courseSelect = document.getElementById('enroll-course-select');
    if (courseSelect) courseSelect.value = courseId;
    UI.openModal('enroll-student-modal');
  },

  async populateStudentSelect(selectedId = null) {
    const studentSelect = document.getElementById('enroll-student-select');
    if (!studentSelect) return;

    try {
      const res = await API.getStudents({ limit: 100 });
      studentSelect.innerHTML = '<option value="">Select Student...</option>' + 
        res.students.map(s => `<option value="${s.id}" ${s.id == selectedId ? 'selected' : ''}>${s.first_name} ${s.last_name} (${s.student_id})</option>`).join('');
    } catch (err) {
      console.error(err);
    }
  },

  async handleEnrollment(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await API.enrollStudent(data);
      UI.showToast('Student successfully enrolled in course!', 'success');
      UI.closeModal('enroll-student-modal');
      form.reset();
      this.loadCourses();
      if (window.StudentsModule) window.StudentsModule.loadStudents();
      if (window.AnalyticsModule) window.AnalyticsModule.refreshDashboard();
    } catch (err) {
      UI.showToast(err.message, 'error');
    }
  }
};

window.CoursesModule = CoursesModule;
