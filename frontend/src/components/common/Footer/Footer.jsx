import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col">
          <h2 className="footer-logo">UniFolio</h2>
          <p className="footer-tagline">Smart Campus Operations, Simplified.</p>
        </div>
        
        <div className="footer-col">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to={ROUTES.HOME}>Home</Link></li>
            <li><Link to={ROUTES.LOGIN}>Login</Link></li>
            <li><Link to={ROUTES.REGISTER}>Register</Link></li>
          </ul>
        </div>
        
        <div className="footer-col footer-rights">
          <p>&copy; 2026 UniFolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;