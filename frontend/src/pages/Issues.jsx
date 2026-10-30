import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getIssues,
  getProjects,
  getAssignees,
  createAssignee,
  createIssue,
  updateIssue,
  deleteIssue
} from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';

const STATUS_OPTIONS = [
  'Yet to Start',
  'In Progress',
  'In Review',
  'Yet to Merge',
  'Completed',
  'Incompleted',
  'Query'
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assigneesList, setAssigneesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialAssignee = searchParams.get('assignee') || '';

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(initialProjectId);
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssignee);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentIssueId, setCurrentIssueId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    priority: 'Medium',
    status: 'Yet to Start'
  });

  // Inline "Add New Assignee" toggle within the modal workflow
  const [isAddingNewAssignee, setIsAddingNewAssignee] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [isCreatingAssignee, setIsCreatingAssignee] = useState(false);

  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load auxiliary data: projects & assignees
  const loadAuxData = async () => {
    try {
      const [projectsData, assigneesData] = await Promise.all([
        getProjects(),
        getAssignees()
      ]);
      setProjects(projectsData);
      setAssigneesList(assigneesData);
    } catch (err) {
      console.error('Aux data error:', err);
    }
  };

  useEffect(() => {
    loadAuxData();
  }, []);

  // Sync filters if URL params change
  useEffect(() => {
    if (initialProjectId) setProjectFilter(initialProjectId);
    if (initialAssignee) setAssigneeFilter(initialAssignee);
  }, [initialProjectId, initialAssignee]);

  // Load issues based on active filters
  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIssues({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        projectId: projectFilter,
        assignee: assigneeFilter
      });
      setIssues(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [searchQuery, statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
    setAssigneeFilter('');
    setSearchParams({});
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      project_id: projects[0]?.id || '',
      assignee_id: '',
      priority: 'Medium',
      status: 'Yet to Start'
    });
    setIsAddingNewAssignee(false);
    setNewAssigneeName('');
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (issue) => {
    setModalMode('edit');
    setCurrentIssueId(issue.id);
    setFormData({
      title: issue.title,
      description: issue.description || '',
      project_id: issue.project_id,
      assignee_id: issue.assignee_id || '',
      priority: issue.priority,
      status: issue.status
    });
    setIsAddingNewAssignee(false);
    setNewAssigneeName('');
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setIsAddingNewAssignee(false);
    setNewAssigneeName('');
  };

  // Handle quick inline creation of a new assignee without leaving the issue workflow
  const handleQuickCreateAssignee = async (e) => {
    e.preventDefault();
    if (!newAssigneeName.trim()) return;

    try {
      setIsCreatingAssignee(true);
      const res = await createAssignee(newAssigneeName.trim());
      // Refresh assignees list
      const updatedAssignees = await getAssignees();
      setAssigneesList(updatedAssignees);
      // Select the newly created assignee
      setFormData({ ...formData, assignee_id: res.assignee.id });
      setIsAddingNewAssignee(false);
      setNewAssigneeName('');
    } catch (err) {
      setModalError(err.message || 'Failed to create assignee.');
    } finally {
      setIsCreatingAssignee(false);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title.trim()) {
      setModalError('Issue title is required.');
      return;
    }

    if (!formData.project_id) {
      setModalError('Please select a project.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await createIssue({
          title: formData.title,
          description: formData.description,
          project_id: formData.project_id,
          assignee_id: formData.assignee_id || null,
          priority: formData.priority,
          status: formData.status
        });
        setSuccessMessage('Issue reported successfully!');
      } else {
        await updateIssue(currentIssueId, {
          title: formData.title,
          description: formData.description,
          project_id: formData.project_id,
          assignee_id: formData.assignee_id || null,
          priority: formData.priority,
          status: formData.status
        });
        setSuccessMessage('Issue updated successfully!');
      }

      closeModal();
      await loadIssues();
      await loadAuxData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete issue "${title}"?`)) {
      return;
    }

    try {
      await deleteIssue(id);
      setSuccessMessage(`Issue #${id} deleted successfully.`);
      await loadIssues();
      await loadAuxData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete issue.');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Issues Tracker</h1>
          <p className="page-subtitle">Search, filter, report, and monitor bug resolution</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Report Issue</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={loadIssues} className="btn-link">Retry</button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="filters-card">
        <div className="filter-item filter-search">
          <label htmlFor="search-input" className="filter-label">Search</label>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="search-input"
              type="text"
              className="form-input search-input"
              placeholder="Search title, description, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-project" className="filter-label">Project</label>
          <select
            id="filter-project"
            className="form-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-assignee" className="filter-label">Assignee</label>
          <select
            id="filter-assignee"
            className="form-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            {assigneesList.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-status" className="filter-label">Status</label>
          <select
            id="filter-status"
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-priority" className="filter-label">Priority</label>
          <select
            id="filter-priority"
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((pr) => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </select>
        </div>

        {(searchQuery || statusFilter || priorityFilter || projectFilter || assigneeFilter) && (
          <div className="filter-item filter-reset">
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading issues list...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p className="empty-state-title">No issues found</p>
          <p className="empty-state-text">
            {searchQuery || statusFilter || priorityFilter || projectFilter || assigneeFilter
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'There are no reported issues yet.'}
          </p>
          {(searchQuery || statusFilter || priorityFilter || projectFilter || assigneeFilter) ? (
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          ) : (
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Report First Issue
            </button>
          )}
        </div>
      ) : (
        <div className="card-section">
          <div className="table-meta-bar">
            <span>Showing <strong>{issues.length}</strong> {issues.length === 1 ? 'issue' : 'issues'}</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="text-muted font-mono">#{issue.id}</td>
                    <td>
                      <Link to={`/issues/${issue.id}`} className="table-title-link">
                        {issue.title}
                      </Link>
                    </td>
                    <td>
                      <span className="project-tag">{issue.project_name}</span>
                    </td>
                    <td>
                      <span className="assignee-text">
                        {issue.assignee_name ? (
                          <Link
                            to={`/team-tasks?assignee=${encodeURIComponent(issue.assignee_name)}`}
                            className="assignee-link"
                          >
                            {issue.assignee_name}
                          </Link>
                        ) : (
                          <span className="text-muted italic">Unassigned</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(issue.updated_at || issue.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-action-group">
                        <Link to={`/issues/${issue.id}`} className="btn-action-view">
                          Details
                        </Link>
                        <button
                          onClick={() => openEditModal(issue)}
                          className="btn-action-edit"
                          title="Edit Issue"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(issue.id, issue.title)}
                          className="btn-action-delete"
                          title="Delete Issue"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit Issue */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Report New Issue' : 'Edit Issue Details'}
              </h2>
              <button onClick={closeModal} className="modal-close-btn">&times;</button>
            </div>

            {modalError && (
              <div className="alert alert-error modal-alert">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="issue-title">Issue Title *</label>
                <input
                  id="issue-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Navigation bar collapse bug"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="issue-project">Project *</label>
                  <select
                    id="issue-project"
                    className="form-select"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label htmlFor="issue-assignee-select" style={{ margin: 0 }}>Assignee</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAssignee(!isAddingNewAssignee)}
                      className="btn-link"
                      style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                    >
                      {isAddingNewAssignee ? 'Cancel' : '+ New Assignee'}
                    </button>
                  </div>

                  {!isAddingNewAssignee ? (
                    <select
                      id="issue-assignee-select"
                      className="form-select"
                      value={formData.assignee_id}
                      onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {assigneesList.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="New person's name..."
                        value={newAssigneeName}
                        onChange={(e) => setNewAssigneeName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleQuickCreateAssignee}
                        className="btn btn-secondary btn-sm"
                        disabled={isCreatingAssignee || !newAssigneeName.trim()}
                      >
                        {isCreatingAssignee ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="issue-priority">Priority</label>
                  <select
                    id="issue-priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((pr) => (
                      <option key={pr} value={pr}>{pr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="issue-status">Status</label>
                  <select
                    id="issue-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="issue-desc">Description</label>
                <textarea
                  id="issue-desc"
                  rows="4"
                  className="form-textarea"
                  placeholder="Provide bug description, error logs, or acceptance criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Report Issue' : 'Update Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
