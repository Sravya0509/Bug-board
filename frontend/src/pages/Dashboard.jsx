import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badge';

const STATUS_CONFIG = [
  {
    key: 'Yet to Start',
    label: 'Yet to Start',
    colorClass: 'card-status-yet-to-start',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    )
  },
  {
    key: 'In Progress',
    label: 'In Progress',
    colorClass: 'card-status-progress',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>
    )
  },
  {
    key: 'In Review',
    label: 'In Review',
    colorClass: 'card-status-review',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    key: 'Yet to Merge',
    label: 'Yet to Merge',
    colorClass: 'card-status-merge',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="18" r="3"></circle>
        <circle cx="6" cy="6" r="3"></circle>
        <path d="M6 21V9a9 9 0 0 0 9 9"></path>
      </svg>
    )
  },
  {
    key: 'Completed',
    label: 'Completed',
    colorClass: 'card-status-completed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    )
  },
  {
    key: 'Incompleted',
    label: 'Incompleted',
    colorClass: 'card-status-incompleted',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    )
  },
  {
    key: 'Query',
    label: 'Query',
    colorClass: 'card-status-query',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
];

const PRIORITY_CONFIG = [
  {
    key: 'Low',
    label: 'Low',
    colorClass: 'card-prio-low',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 19 19 12"></polyline>
      </svg>
    )
  },
  {
    key: 'Medium',
    label: 'Medium',
    colorClass: 'card-prio-med',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    )
  },
  {
    key: 'High',
    label: 'High',
    colorClass: 'card-prio-high',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 5 5 12"></polyline>
      </svg>
    )
  },
  {
    key: 'Critical',
    label: 'Critical',
    colorClass: 'card-prio-critical',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  }
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_projects: 0,
    total_issues: 0,
    status_counts: {
      'Yet to Start': 0,
      'In Progress': 0,
      'In Review': 0,
      'Yet to Merge': 0,
      'Completed': 0,
      'Incompleted': 0,
      'Query': 0
    },
    priority_counts: {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    },
    recent_issues: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">BugBoard Dashboard</h1>
          <p className="page-subtitle">Real-time database metrics across software projects and team issues</p>
        </div>
        <div className="page-actions">
          <Link to="/issues" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Report Issue</span>
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchStats} className="btn-link">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Retrieving dashboard metrics from database...</p>
        </div>
      ) : (
        <>
          {/* Top Level Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Projects</span>
                <span className="stat-value">{stats.total_projects}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-open">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Issues</span>
                <span className="stat-value">{stats.total_issues}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-progress">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">In Progress Issues</span>
                <span className="stat-value">{stats.status_counts['In Progress'] || 0}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-resolved">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Completed Issues</span>
                <span className="stat-value">{stats.status_counts['Completed'] || 0}</span>
              </div>
            </div>
          </div>

          {/* Section: Issues Grouped by Status */}
          <div className="card-section dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Issues Grouped by Status</h2>
                <p className="section-subtitle">Real-time status breakdown across 7 workflow stages</p>
              </div>
            </div>
            <div className="status-cards-grid">
              {STATUS_CONFIG.map((item) => {
                const count = stats.status_counts[item.key] || 0;
                return (
                  <div key={item.key} className={`category-metric-card ${item.colorClass}`}>
                    <div className="category-card-header">
                      <span className="category-icon-wrapper">
                        {item.icon}
                      </span>
                      <span className="category-indicator-dot"></span>
                    </div>
                    <div className="category-card-body">
                      <div className="category-count-row">
                        <span className="category-count">{count}</span>
                        <span className="category-unit">{count === 1 ? 'issue' : 'issues'}</span>
                      </div>
                      <span className="category-name">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Issues Grouped by Priority */}
          <div className="card-section dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Issues Grouped by Priority</h2>
                <p className="section-subtitle">Categorized by severity and urgency</p>
              </div>
            </div>
            <div className="priority-cards-grid">
              {PRIORITY_CONFIG.map((item) => {
                const count = stats.priority_counts[item.key] || 0;
                return (
                  <div key={item.key} className={`category-metric-card ${item.colorClass}`}>
                    <div className="category-card-header">
                      <span className="category-icon-wrapper">
                        {item.icon}
                      </span>
                      <span className="category-indicator-dot"></span>
                    </div>
                    <div className="category-card-body">
                      <div className="category-count-row">
                        <span className="category-count">{count}</span>
                        <span className="category-unit">{count === 1 ? 'issue' : 'issues'}</span>
                      </div>
                      <span className="category-name">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Updated Issues Table */}
          <div className="card-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Recently Updated Issues</h2>
                <p className="section-subtitle">Latest issue updates and activity</p>
              </div>
              <Link to="/issues" className="section-link">
                View All Issues &rarr;
              </Link>
            </div>

            {stats.recent_issues && stats.recent_issues.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_issues.map((issue) => (
                      <tr key={issue.id}>
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
                            {issue.assignee_name || <span className="text-muted italic">Unassigned</span>}
                          </span>
                        </td>
                        <td>
                          <PriorityBadge priority={issue.priority} />
                        </td>
                        <td>
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="text-muted text-sm">
                          {new Date(issue.updated_at || issue.created_at).toLocaleString()}
                        </td>
                        <td>
                          <Link to={`/issues/${issue.id}`} className="btn-action-view">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">No issues created yet</p>
                <p className="empty-state-text">Your database is reset and clean. Start by creating a project and logging your first issue.</p>
                <Link to="/issues" className="btn btn-primary btn-sm">
                  Create First Issue
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
