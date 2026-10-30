import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAdmin } = useAuth();

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setCurrentProjectId(project.id);
    setFormData({ name: project.name, description: project.description || '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setFormData({ name: '', description: '' });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Project name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await createProject(formData);
        setSuccessMessage('Project created successfully!');
      } else {
        await updateProject(currentProjectId, formData);
        setSuccessMessage('Project updated successfully!');
      }
      closeModal();
      await loadProjects();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All associated issues will also be removed.`)) {
      return;
    }

    try {
      await deleteProject(id);
      setSuccessMessage(`Project "${name}" deleted successfully.`);
      await loadProjects();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Management</h1>
          <p className="page-subtitle">Organize and monitor software development initiatives</p>
        </div>
        {isAdmin && (
          <button onClick={openCreateModal} className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="alert alert-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
          <button onClick={loadProjects} className="btn-link">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p className="empty-state-title">No projects found</p>
          <p className="empty-state-text">
            {isAdmin
              ? 'Click "Create Project" above to create your team\'s first project.'
              : 'No projects have been set up by an administrator yet.'}
          </p>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                  </svg>
                </div>
                <div className="project-meta-right">
                  <span className="badge badge-issues-count">
                    {project.total_issues} {project.total_issues === 1 ? 'Issue' : 'Issues'}
                  </span>
                </div>
              </div>

              <h2 className="project-title">{project.name}</h2>
              <p className="project-desc">
                {project.description || <span className="text-muted italic">No description provided.</span>}
              </p>

              <div className="project-footer">
                <div className="project-meta-info">
                  <span className="creator-text">By {project.creator_name || 'Admin'}</span>
                  <span className="meta-separator">•</span>
                  <span className="date-text">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="project-actions">
                  <Link
                    to={`/issues?projectId=${project.id}`}
                    className="btn-action-view"
                    title="Filter issues for this project"
                  >
                    View Issues
                  </Link>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(project)}
                        className="btn-action-edit"
                        title="Edit Project"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="btn-action-delete"
                        title="Delete Project"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit Project */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create New Project' : 'Edit Project Details'}
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
                <label htmlFor="project-name">Project Name *</label>
                <input
                  id="project-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile Banking App"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-desc">Description</label>
                <textarea
                  id="project-desc"
                  rows="4"
                  className="form-textarea"
                  placeholder="Summarize the scope, architecture, or goals for this project..."
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
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
