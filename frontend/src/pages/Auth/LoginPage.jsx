import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const data = response.data;

      const roleText = String(data.role || '').toUpperCase();

      login(data, data.token);

      if (roleText.includes('ADMIN')) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (roleText.includes('TECHNICIAN')) {
        navigate(ROUTES.TECHNICIAN_DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="split-layout">
        <div className="split-left">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2 className="auth-title">Login</h2>
              <p className="auth-subtitle">Enter your account details</p>
            </div>

            {error && (
                <div className="auth-alert auth-alert-error">
                  {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form border-bottom-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group position-relative">
                <label>Password</label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="form-links">
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="btn-primary-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
                type="button"
                className="btn-google-oauth-dark"
                onClick={() => {
                  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
                }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91a8.78 8.78 0 0 0 2.69-6.62z" fill="#4285F4"/>
                <path d="M9 18c2.37 0 4.37-.79 5.82-2.13l-2.91-2.26c-.8.54-1.83.86-2.91.86-2.25 0-4.14-1.52-4.82-3.59H1.18v2.33A8.99 8.99 0 0 0 9 18z" fill="#34A853"/>
                <path d="M4.18 10.88A5.41 5.41 0 0 1 3.9 9c0-.66.11-1.29.31-1.88V4.79H1.18A8.99 8.99 0 0 0 0 9c0 1.54.39 3 1.07 4.29l2.73-2.13z" fill="#FBBC05"/>
                <path d="M9 3.58c1.3 0 2.45.45 3.37 1.32l2.53-2.53C13.38.89 11.39 0 9 0 5.48 0 2.44 2.02 1.07 4.96l2.73 2.13C4.86 5.1 6.75 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="auth-footer text-white">
              Don't have an account? <Link to={ROUTES.REGISTER} className="btn-outline-small">Sign up</Link>
            </p>
          </div>
        </div>

        <div className="split-right">
          <div className="split-right-content">
            <h2 className="welcome-primary">Welcome to</h2>
            <h1 className="welcome-secondary">UniFolio</h1>
            <p className="welcome-subtitle">Login to access your campus portal</p>
          </div>

          <div className="abstract-art">
            <div className="art-card">
              <div className="art-figure">
                <div className="art-head"></div>
                <div className="art-body"></div>
              </div>
              <div className="art-figure art-figure-2">
                <div className="art-head"></div>
                <div className="art-body"></div>
              </div>
            </div>
            <div className="art-circle-1"></div>
            <div className="art-circle-2"></div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;