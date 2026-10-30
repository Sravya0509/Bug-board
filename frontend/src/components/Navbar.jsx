import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badge';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 2 1.88 1.88"></path>
              <path d="M14.12 3.88 16 2"></path>
              <rect width="8" height="14" x="8" y="6" rx="4"></rect>
              <path d="M4 10h4"></path>
              <path d="M16 10h4"></path>
              <path d="m4 19 3.5-3.5"></path>
              <path d="m20 19-3.5-3.5"></path>
              <path d="m4 6 3.5 3.5"></path>
              <path d="m20 6-3.5 3.5"></path>
            </svg>
          </div>
          <span className="brand-title">BugBoard</span>
          <span className="brand-badge">Mini</span>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-profile-menu">
            <div className="user-avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role-label">
                <RoleBadge role={user.role} />
              </span>
            </div>
            <button onClick={logout} className="logout-btn" title="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
