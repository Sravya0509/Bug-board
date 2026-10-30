import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getIssueById,
  updateIssueStatus,
  reassignIssue,
  deleteIssue,
  getIssueComments,
  addIssueComment,
  getAssignees,
  createAssignee
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

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [assigneesList, setAssigneesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Reassignment state
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);
  const [isAddingNewAssignee, setIsAddingNewAssignee] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [isCreatingAssignee, setIsCreatingAssignee] = useState(false);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const loadIssueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [issueData, commentsData, assigneesData] = await Promise.all([
        getIssueById(id),
        getIssueComments(id),
        getAssignees()
      ]);

      setIssue(issueData);
      setNewStatus(issueData.status);
      setSelectedAssigneeId(issueData.assignee_id ? String(issueData.assignee_id) : '');
      setComments(commentsData);
      setAssigneesList(assigneesData);
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssueData();
  }, [id]);

  // Handle status update
  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (newStatus === issue.status) return;

    try {
      setIsUpdatingStatus(true);
      await updateIssueStatus(id, newStatus);
      setSuccessMessage(`Status updated to "${newStatus}".`);
      setIssue({ ...issue, status: newStatus });
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle quick inline creation of a new assignee in details page
  const handleCreateNewAssignee = async (e) => {
    e.preventDefault();
    if (!newAssigneeName.trim()) return;

    try {
      setIsCreatingAssignee(true);
      const res = await createAssignee(newAssigneeName.trim());
      const updatedAssignees = await getAssignees();
      setAssigneesList(updatedAssignees);
      setSelectedAssigneeId(String(res.assignee.id));
      setIsAddingNewAssignee(false);
      setNewAssigneeName('');
    } catch (err) {
      setError(err.message || 'Failed to create new assignee.');
    } finally {
      setIsCreatingAssignee(false);
    }
  };

  // Handle reassignment to another person
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingAssignee(true);
      const targetId = selectedAssigneeId ? Number(selectedAssigneeId) : null;
      await reassignIssue(id, { assignee_id: targetId });

      // Find the name for feedback
      const targetAssignee = assigneesList.find((a) => a.id === targetId);
      const targetName = targetAssignee ? targetAssignee.name : 'Unassigned';

      setSuccessMessage(`Issue successfully reassigned to ${targetName}.`);
      await loadIssueData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to reassign issue.');
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  // Handle posting a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');

    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
      setIsPostingComment(true);
      await addIssueComment(id, commentText);
      setCommentText('');
      const updatedComments = await getIssueComments(id);
      setComments(updatedComments);
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment.');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Handle delete issue
  const handleDeleteIssue = async () => {
    if (!window.confirm(`Are you sure you want to delete issue #${id}: "${issue.title}"?`)) {
      return;
    }

    try {
      await deleteIssue(id);
      navigate('/issues');
    } catch (err) {
      setError(err.message || 'Failed to delete issue.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <Link to="/issues" className="btn btn-secondary">
          &larr; Back to Issues
        </Link>
      </div>
    );
  }

  const isAssigneeChanged = String(issue.assignee_id || '') !== selectedAssigneeId;

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar">
        <Link to="/issues" className="breadcrumb-link">&larr; Back to Issues</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Issue #{issue.id}</span>
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
        </div>
      )}

      {/* Main Issue Header */}
      <div className="issue-detail-header">
        <div className="issue-title-block">
          <div className="issue-tag-group">
            <span className="issue-id-tag">#{issue.id}</span>
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
          <h1 className="issue-main-title">{issue.title}</h1>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="issue-content-layout">
        {/* Left Column: Description & Comments */}
        <div className="issue-main-column">
          {/* Description Card */}
          <div className="card-section">
            <h2 className="section-title">Description</h2>
            <div className="issue-description-box">
              {issue.description ? (
                <p className="description-text">{issue.description}</p>
              ) : (
                <p className="text-muted italic">No detailed description provided for this issue.</p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card-section">
            <div className="section-header">
              <h2 className="section-title">
                Discussion & Activity ({comments.length})
              </h2>
            </div>

            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-comments">
                  <p>No comments on this issue yet. Use the form below to post updates or findings.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-bubble">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <span className="comment-avatar">
                          {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                        <span className="comment-author-name">{comment.user_name}</span>
                      </div>
                      <span className="comment-timestamp">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-body">
                      {comment.comment_text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="add-comment-wrapper">
              <h3 className="add-comment-heading">Add a Comment</h3>
              {commentError && (
                <div className="alert alert-error">
                  <span>{commentError}</span>
                </div>
              )}
              <form onSubmit={handleAddComment}>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Share status updates, technical solutions, or verification notes..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                ></textarea>
                <div className="add-comment-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPostingComment || !commentText.trim()}
                  >
                    {isPostingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Metadata */}
        <div className="issue-sidebar-column">
          {/* Clear Reassignment Card */}
          <div className="meta-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 className="meta-card-title" style={{ margin: 0 }}>Assignee & Reassign</h3>
              <button
                type="button"
                onClick={() => setIsAddingNewAssignee(!isAddingNewAssignee)}
                className="btn-link"
                style={{ fontSize: '0.75rem', textDecoration: 'none' }}
              >
                {isAddingNewAssignee ? 'Cancel' : '+ New Assignee'}
              </button>
            </div>

            <div className="current-status-display" style={{ marginBottom: '0.75rem' }}>
              <span className="meta-label">Currently Assigned:</span>
              <span className="assignee-text" style={{ fontWeight: 600 }}>
                {issue.assignee_name || <span className="text-muted italic">Unassigned</span>}
              </span>
            </div>

            {isAddingNewAssignee ? (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label className="meta-label">Create Team Member:</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter name..."
                    value={newAssigneeName}
                    onChange={(e) => setNewAssigneeName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewAssignee}
                    className="btn btn-primary btn-sm"
                    disabled={isCreatingAssignee || !newAssigneeName.trim()}
                  >
                    {isCreatingAssignee ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleReassignSubmit}>
              <label htmlFor="reassign-select" className="meta-label">
                Reassign to:
              </label>
              <select
                id="reassign-select"
                className="form-select mb-2"
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {assigneesList.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-sm mt-2"
                disabled={isUpdatingAssignee || !isAssigneeChanged}
              >
                {isUpdatingAssignee ? 'Saving Reassignment...' : 'Confirm Reassignment'}
              </button>
            </form>
          </div>

          {/* Status Updater Card */}
          <div className="meta-card">
            <h3 className="meta-card-title">Status Management</h3>
            <div className="current-status-display">
              <span className="meta-label">Current:</span>
              <StatusBadge status={issue.status} />
            </div>

            <form onSubmit={handleStatusChange} className="status-update-form">
              <label htmlFor="quick-status-select" className="meta-label">
                Update Status:
              </label>
              <div className="status-select-group">
                <select
                  id="quick-status-select"
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={isUpdatingStatus || newStatus === issue.status}
                >
                  {isUpdatingStatus ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>

          {/* Issue Attributes */}
          <div className="meta-card">
            <h3 className="meta-card-title">Issue Attributes</h3>
            <ul className="meta-attributes-list">
              <li>
                <span className="meta-attr-label">Project:</span>
                <Link to={`/issues?projectId=${issue.project_id}`} className="meta-attr-link">
                  {issue.project_name}
                </Link>
              </li>
              <li>
                <span className="meta-attr-label">Priority:</span>
                <PriorityBadge priority={issue.priority} />
              </li>
              <li>
                <span className="meta-attr-label">Reported by:</span>
                <span className="meta-attr-value">{issue.created_by_name || 'Admin'}</span>
              </li>
              <li>
                <span className="meta-attr-label">Created on:</span>
                <span className="meta-attr-value">
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </li>
              <li>
                <span className="meta-attr-label">Last Updated:</span>
                <span className="meta-attr-value">
                  {new Date(issue.updated_at || issue.created_at).toLocaleString()}
                </span>
              </li>
            </ul>
          </div>

          {/* Danger Zone */}
          <div className="meta-card danger-card">
            <h3 className="meta-card-title text-danger">Manage Issue</h3>
            <p className="text-sm text-muted mb-3">
              Permanently remove this issue and all its comments.
            </p>
            <button
              onClick={handleDeleteIssue}
              className="btn btn-danger btn-block"
            >
              Delete Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
