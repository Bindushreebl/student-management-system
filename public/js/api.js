/**
 * REST API Client for Student Management System
 */

const API = {
  async get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `${url}?${query}` : url;
    const response = await fetch(endpoint);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json;
  },

  async post(url, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json;
  },

  async put(url, data = {}) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json;
  },

  async delete(url) {
    const response = await fetch(url, { method: 'DELETE' });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json;
  },

  // API Endpoints
  getStats: () => API.get('/api/stats'),
  getStudents: (params) => API.get('/api/students', params),
  getStudentById: (id) => API.get(`/api/students/${id}`),
  createStudent: (data) => API.post('/api/students', data),
  updateStudent: (id, data) => API.put(`/api/students/${id}`, data),
  deleteStudent: (id) => API.delete(`/api/students/${id}`),
  getCourses: () => API.get('/api/courses'),
  createCourse: (data) => API.post('/api/courses', data),
  enrollStudent: (data) => API.post('/api/enrollments', data),
  updateEnrollmentGrade: (id, data) => API.put(`/api/enrollments/${id}`, data),
  dropEnrollment: (id) => API.delete(`/api/enrollments/${id}`),
  getAttendance: (params) => API.get('/api/attendance', params),
  recordAttendance: (records) => API.post('/api/attendance', records),
  getAnnouncements: () => API.get('/api/announcements'),
  createAnnouncement: (data) => API.post('/api/announcements', data),
  resetDatabase: () => API.post('/api/reset-data')
};

window.API = API;
