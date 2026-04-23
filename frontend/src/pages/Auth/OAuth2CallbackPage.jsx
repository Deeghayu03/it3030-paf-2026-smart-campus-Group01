import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import './OAuth2CallbackPage.css';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const newUser = searchParams.get('newUser');

    if (token && role && email) {
      login({ email, role, name: decodeURIComponent(name || '') }, token);

      if (newUser === 'true') {
        navigate('/complete-profile', { replace: true });
      } else if (role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (role === 'TECHNICIAN') {
        navigate(ROUTES.TECHNICIAN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } else {
      console.error('OAuth2 login failed: Missing parameters');
      navigate(`${ROUTES.LOGIN}?error=oauth2_failed`, { replace: true });
    }
  }, []);

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
