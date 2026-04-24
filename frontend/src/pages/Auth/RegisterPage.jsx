import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ROUTES } from '../../constants/routes';
import './RegisterPage.css';
import '../Auth/LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    phone: '',
    department: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/auth/register', formData);
      setStatus({ type: 'success', message: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setStatus({ type: 'error', message: err.response.data.message });
      } else {
        setStatus({ type: 'error', message: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      {/* LEFT PANEL */}
      <div className="split-left">
        <div className="auth-form-container">
          <div className="auth-header" style={{ marginBottom: "20px" }}>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join UniFolio today</p>
          </div>

          {status.message && (
            <div className={`auth-alert auth-alert-${status.type}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form border-bottom-form">
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Student ID</label>
              <input type="text" name="studentId" required placeholder="e.g. IT21234567" value={formData.studentId} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group position-relative" style={{ marginBottom: "16px" }}>
              <label>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                required 
                minLength="6" 
                value={formData.password} 
                onChange={handleChange} 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} style={{ 
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #334155',
                color: 'white',
                padding: '8px 0',
                fontSize: '1rem',
                outline: 'none'
               }}>
                <option value="" style={{ color: "black" }}>Select Department</option>
                <option value="Information Technology" style={{ color: "black" }}>Information Technology</option>
                <option value="Computer Science" style={{ color: "black" }}>Computer Science</option>
                <option value="Software Engineering" style={{ color: "black" }}>Software Engineering</option>
                <option value="Cyber Security" style={{ color: "black" }}>Cyber Security</option>
                <option value="Data Science" style={{ color: "black" }}>Data Science</option>
                <option value="Other" style={{ color: "black" }}>Other</option>
              </select>
            </div>

            <button type="submit" className="btn-primary-full" disabled={loading || status.type === 'success'}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer text-white">
            Already have an account? <Link to={ROUTES.LOGIN} className="btn-outline-small">Login</Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="split-right">
        <div className="split-right-content">
          <h2 className="welcome-primary">Start your</h2>
          <h1 className="welcome-secondary">Journey</h1>
          <p className="welcome-subtitle">Create an account to access the campus portal</p>
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

export default RegisterPage;