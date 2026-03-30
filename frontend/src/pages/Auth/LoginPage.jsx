import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button/Button';
import { ROUTES } from '../../constants/routes';
import { getRoleRedirect } from '../../utils/helpers';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
      
      // Centralized in AuthContext login function
      login(data, data.token);
      
      // Redirect based on role
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
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
    <div className="auth-page">
      <div className="auth-card login-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} />
          </div>

          <div className="form-submit">
            <Button type="submit" label={loading ? 'Signing in...' : 'Sign In'} disabled={loading} />
          </div>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          type="button" 
          className="btn-google-oauth"
          onClick={() => {
            window.location.href = 'http://localhost:8080/oauth2/authorization/google'
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

        <p className="auth-footer">
          Don't have an account? <Link to={ROUTES.REGISTER}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;