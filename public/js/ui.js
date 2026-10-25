/**
 * UI Utilities, Modals, Toasts, and Theme Manager
 */

const UI = {
  // Toast notifications
  toastContainer: null,

  init() {
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
    this.initTheme();
  },

  showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = 'toast';

    let color = 'var(--primary)';
    let iconSvg = `
      <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;

    if (type === 'success') {
      color = 'var(--accent-emerald)';
      iconSvg = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else if (type === 'error') {
      color = 'var(--accent-rose)';
      iconSvg = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else if (type === 'warning') {
      color = 'var(--accent-amber)';
      iconSvg = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      `;
    }

    toast.style.setProperty('--toast-color', color);
    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-message">${message}</div>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Modals
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  },

  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem('sms-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sms-theme', newTheme);
    this.updateThemeIcon(newTheme);
    this.showToast(`Switched to ${newTheme} theme`, 'info', 2000);
  },

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;
    if (theme === 'dark') {
      themeBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
      themeBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
      themeBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
      themeBtn.setAttribute('title', 'Switch to Dark Mode');
    }
  },

  // Formatting helpers
  getGpaBadge(gpa) {
    const num = Number(gpa) || 0;
    let className = 'gpa-low';
    if (num >= 3.8) className = 'gpa-elite';
    else if (num >= 3.5) className = 'gpa-good';
    else if (num >= 3.0) className = 'gpa-warn';
    return `<span class="gpa-pill ${className}">${num.toFixed(2)}</span>`;
  },

  getStatusBadge(status) {
    let cls = 'badge-active';
    let dot = '<span class="status-dot-pulse"></span>';
    if (status === 'Inactive') {
      cls = 'badge-inactive';
      dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#94a3b8"></span>';
    } else if (status === 'Graduated') {
      cls = 'badge-graduated';
      dot = '🎓';
    }
    return `<span class="badge ${cls}">${dot} ${status}</span>`;
  },

  getDepartmentBadge(dept) {
    return `<span class="badge badge-dept">${dept}</span>`;
  }
};

window.UI = UI;
