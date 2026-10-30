// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get authentication headers with JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('bugboard_token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Helper to handle API response and throw errors
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// Authentication APIs
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(response);
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(response);
}

export async function getAuthStatus() {
  const response = await fetch(`${API_BASE_URL}/auth/status`);
  return handleResponse(response);
}

export async function getCurrentUserProfile() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Dashboard APIs
export async function getDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Project APIs
export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getProjectById(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(response);
}

export async function updateProject(id, projectData) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(response);
}

export async function deleteProject(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Assignee Management APIs
export async function getAssignees() {
  const response = await fetch(`${API_BASE_URL}/assignees`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getAssigneeById(id) {
  const response = await fetch(`${API_BASE_URL}/assignees/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function createAssignee(name) {
  const response = await fetch(`${API_BASE_URL}/assignees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  return handleResponse(response);
}

export async function updateAssignee(id, name) {
  const response = await fetch(`${API_BASE_URL}/assignees/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  return handleResponse(response);
}

export async function deleteAssignee(id) {
  const response = await fetch(`${API_BASE_URL}/assignees/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Issue APIs
export async function getIssues(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.projectId) params.append('projectId', filters.projectId);
  if (filters.assignee) params.append('assignee', filters.assignee);
  if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/issues${queryString}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getDistinctAssignees() {
  const response = await fetch(`${API_BASE_URL}/issues/assignees`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getIssueById(id) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function createIssue(issueData) {
  const response = await fetch(`${API_BASE_URL}/issues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(issueData)
  });
  return handleResponse(response);
}

export async function updateIssue(id, issueData) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(issueData)
  });
  return handleResponse(response);
}

export async function reassignIssue(id, reassignmentData) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}/reassign`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(reassignmentData)
  });
  return handleResponse(response);
}

export async function updateIssueStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(response);
}

export async function deleteIssue(id) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Comments APIs
export async function getIssueComments(issueId) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function addIssueComment(issueId, comment_text) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ comment_text })
  });
  return handleResponse(response);
}
