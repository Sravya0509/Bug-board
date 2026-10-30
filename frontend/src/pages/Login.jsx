import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await loginUser(email, password);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@bugboard.com');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <h1 className="auth-title">Welcome to BugBoard</h1>
          <p className="auth-subtitle">Sign in with administrator credentials to manage projects & issues</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="admin@bugboard.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Button */}
        <div className="demo-credentials-box">
          <div className="demo-label">Local Testing Helper:</div>
          <div className="demo-buttons-group">
            <button
              type="button"
              className="btn-demo"
              onClick={fillDemoCredentials}
            >
              Autofill Administrator (admin@bugboard.com)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p className="text-sm text-muted">
            All team members share this administrator login. To inspect your assigned tasks, navigate to the <strong>Team Tasks</strong> tab after signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
