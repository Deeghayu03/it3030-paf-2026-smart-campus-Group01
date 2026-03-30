import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './OAuth2CallbackPage.css';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth2Login = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const role = params.get('role');
      const email = params.get('email');
      const name = params.get('name');

      if (token && role && email && name) {
        // Store in localStorage (5 keys rule)
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('email', email);
        localStorage.setItem('name', decodeURIComponent(name));
        localStorage.setItem('isAuthenticated', 'true');

        // Update auth context
        login({ email, role, name: decodeURIComponent(name) }, token);

        // Redirect based on role
        if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('OAuth2 login failed: Missing parameters');
        navigate('/login?error=oauth2_failed');
      }
    };

    processOAuth2Login();
  }, [navigate, login]);

  return (
    <div className="oauth2-callback-container">
      <div className="oauth2-callback-content">
        <div className="spinner"></div>
        <h2>Signing you in with Google...</h2>
        <p>Please wait a moment while we process your request.</p>
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
