import React from 'react';

export function StatusBadge({ status }) {
  let badgeClass = 'badge-default';

  switch (status) {
    case 'Yet to Start':
      badgeClass = 'badge-status-yet-to-start';
      break;
    case 'In Progress':
      badgeClass = 'badge-status-in-progress';
      break;
    case 'In Review':
      badgeClass = 'badge-status-in-review';
      break;
    case 'Yet to Merge':
      badgeClass = 'badge-status-yet-to-merge';
      break;
    case 'Completed':
      badgeClass = 'badge-status-completed';
      break;
    case 'Incompleted':
      badgeClass = 'badge-status-incompleted';
      break;
    case 'Query':
      badgeClass = 'badge-status-query';
      break;
    default:
      badgeClass = 'badge-default';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  let badgeClass = 'badge-default';

  switch (priority) {
    case 'Critical':
      badgeClass = 'badge-prio-critical';
      break;
    case 'High':
      badgeClass = 'badge-prio-high';
      break;
    case 'Medium':
      badgeClass = 'badge-prio-medium';
      break;
    case 'Low':
      badgeClass = 'badge-prio-low';
      break;
    default:
      badgeClass = 'badge-default';
  }

  return <span className={`badge ${badgeClass}`}>{priority}</span>;
}

export function RoleBadge({ role }) {
  return <span className="badge badge-admin">{role || 'Administrator'}</span>;
}
