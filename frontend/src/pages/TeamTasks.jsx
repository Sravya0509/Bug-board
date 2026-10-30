import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getIssues, getAssignees } from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';

export default function TeamTasks() {
  const [assigneesList, setAssigneesList] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssignee = searchParams.get('assignee') || '';

  const [selectedAssignee, setSelectedAssignee] = useState(initialAssignee);
  const [customInput, setCustomInput] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load assignees list on mount
  useEffect(() => {
    async function fetchAssignees() {
      try {
        const data = await getAssignees();
        setAssigneesList(data);
        if (!initialAssignee && data.length > 0) {
          // Default to first assignee if none in URL
          setSelectedAssignee(data[0].name);
          setSearchParams({ assignee: data[0].name });
        }
      } catch (err) {
        console.error('Failed to load assignees:', err);
      }
    }
    fetchAssignees();
  }, []);

  // Fetch issues for selected assignee
  useEffect(() => {
    if (!selectedAssignee) {
      setIssues([]);
      return;
    }

    async function loadAssigneeIssues() {
      try {
        setLoading(true);
        setError(null);
        const data = await getIssues({ assignee: selectedAssignee });
        setIssues(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch issues for this assignee.');
      } finally {
        setLoading(false);
      }
    }

    loadAssigneeIssues();
  }, [selectedAssignee]);

  const handleSelectAssignee = (name) => {
    setSelectedAssignee(name);
    setCustomInput('');
    setSearchParams({ assignee: name });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      setSelectedAssignee(customInput.trim());
      setSearchParams({ assignee: customInput.trim() });
    }
  };

  // Compute status summary for this assignee
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const completedCount = issues.filter((i) => i.status === 'Completed').length;
  const pendingCount = issues.filter((i) => i.status === 'Yet to Start' || i.status === 'In Review').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Tasks / Assignee View</h1>
          <p className="page-subtitle">
            Select or enter a team member's name to view their assigned work without separate accounts
          </p>
        </div>
        <Link to="/assignees" className="btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Manage Assignees</span>
        </Link>
      </div>

      {/* Assignee Selector Control Bar */}
      <div className="filters-card">
        <div className="filter-item" style={{ minWidth: '260px' }}>
          <label htmlFor="team-member-select" className="filter-label">Choose Assigned Member</label>
          <select
            id="team-member-select"
            className="form-select"
            value={selectedAssignee}
            onChange={(e) => handleSelectAssignee(e.target.value)}
          >
            <option value="">-- Select Team Member --</option>
            {assigneesList.map((a) => (
              <option key={a.id} value={a.name}>{a.name} ({a.assigned_issues_count || 0} tasks)</option>
            ))}
          </select>
        </div>

        <div className="filter-item" style={{ flex: 1, minWidth: '260px' }}>
          <label htmlFor="custom-member-input" className="filter-label">Or Type Any Name</label>
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="custom-member-input"
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Connor, David Miller..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!customInput.trim()}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Selected Assignee Summary Banner */}
      {selectedAssignee && (
        <div className="team-assignee-banner">
          <div className="assignee-banner-left">
            <div className="assignee-banner-avatar">
              {selectedAssignee.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="assignee-banner-name">{selectedAssignee}</h2>
              <span className="text-muted text-sm">Assigned Tasks View</span>
            </div>
          </div>
          <div className="assignee-banner-stats">
            <div className="banner-stat-chip">
              <span className="banner-stat-label">Total Assigned</span>
              <span className="banner-stat-num">{issues.length}</span>
            </div>
            <div className="banner-stat-chip">
              <span className="banner-stat-label">In Progress</span>
              <span className="banner-stat-num text-primary">{inProgressCount}</span>
            </div>
            <div className="banner-stat-chip">
              <span className="banner-stat-label">Completed</span>
              <span className="banner-stat-num text-success">{completedCount}</span>
            </div>
            <div className="banner-stat-chip">
              <span className="banner-stat-label">Pending Review/Start</span>
              <span className="banner-stat-num text-muted">{pendingCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {!selectedAssignee ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p className="empty-state-title">No Team Member Selected</p>
          <p className="empty-state-text">
            Choose a team member from the dropdown or type a name above to inspect assigned tasks.
          </p>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks for {selectedAssignee}...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p className="empty-state-title">No Tasks Assigned to {selectedAssignee}</p>
          <p className="empty-state-text">
            There are currently no issues assigned to "{selectedAssignee}" in the database.
          </p>
          <Link to="/issues" className="btn btn-primary btn-sm">
            Report or Assign an Issue
          </Link>
        </div>
      ) : (
        <div className="card-section">
          <div className="table-meta-bar">
            <span>Showing <strong>{issues.length}</strong> tasks assigned to <strong>{selectedAssignee}</strong></span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Issue Title</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(issue.updated_at || issue.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/issues/${issue.id}`} className="btn-action-view">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
