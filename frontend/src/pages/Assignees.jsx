import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignees, createAssignee, updateAssignee, deleteAssignee } from '../api';

export default function Assignees() {
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentAssigneeId, setCurrentAssigneeId] = useState(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAssignees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignees();
      setAssignees(data);
    } catch (err) {
      setError(err.message || 'Failed to load assignees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignees();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setAssigneeName('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (assignee) => {
    setModalMode('edit');
    setCurrentAssigneeId(assignee.id);
    setAssigneeName(assignee.name);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setAssigneeName('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!assigneeName.trim()) {
      setModalError('Assignee name cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await createAssignee(assigneeName.trim());
        setSuccessMessage('Assignee added successfully!');
      } else {
        await updateAssignee(currentAssigneeId, assigneeName.trim());
        setSuccessMessage('Assignee name updated successfully!');
      }

      closeModal();
      await loadAssignees();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete "${name}". There are ${count} issue(s) assigned to this person. Please reassign those issues first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete assignee "${name}"?`)) {
      return;
    }

    try {
      await deleteAssignee(id);
      setSuccessMessage(`Assignee "${name}" deleted successfully.`);
      await loadAssignees();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete assignee.');
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignee Management</h1>
          <p className="page-subtitle">
            Create, view, edit, and organize team members available for issue assignments
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add New Assignee</span>
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
          <button onClick={loadAssignees} className="btn-link">Retry</button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team assignees...</p>
        </div>
      ) : assignees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p className="empty-state-title">No Assignees Configured</p>
          <p className="empty-state-text">
            Add your team members here so they can be assigned to issues and tracked in Team Tasks.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            Add First Assignee
          </button>
        </div>
      ) : (
        <div className="card-section">
          <div className="table-meta-bar">
            <span>Total Assignees: <strong>{assignees.length}</strong></span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Assignee Name</th>
                  <th>Active Assigned Issues</th>
                  <th>Created On</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignees.map((assignee) => (
                  <tr key={assignee.id}>
                    <td className="text-muted font-mono">#{assignee.id}</td>
                    <td>
                      <div className="assignee-display">
                        <span className="assignee-avatar">
                          {assignee.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="assignee-name" style={{ fontSize: '0.95rem' }}>
                          {assignee.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${assignee.assigned_issues_count > 0 ? 'badge-status-in-progress' : 'badge-prio-low'}`}>
                        {assignee.assigned_issues_count} {assignee.assigned_issues_count === 1 ? 'Task' : 'Tasks'}
                      </span>
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(assignee.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(assignee.updated_at || assignee.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-action-group">
                        <Link
                          to={`/team-tasks?assignee=${encodeURIComponent(assignee.name)}`}
                          className="btn-action-view"
                          title="View tasks assigned to this person"
                        >
                          View Tasks
                        </Link>
                        <button
                          onClick={() => openEditModal(assignee)}
                          className="btn-action-edit"
                          title="Edit Assignee Name"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assignee.id, assignee.name, assignee.assigned_issues_count)}
                          className="btn-action-delete"
                          title="Delete Assignee"
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

      {/* Modal for Create / Edit Assignee */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Add New Assignee' : 'Edit Assignee Name'}
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
                <label htmlFor="modal-assignee-name">Team Member Name *</label>
                <input
                  id="modal-assignee-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson, Sarah Connor..."
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  autoFocus
                  required
                />
                <span className="text-muted text-sm mt-1" style={{ display: 'block' }}>
                  Assignees can be assigned issues and view their personal workload under Team Tasks.
                </span>
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
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Add Assignee' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
