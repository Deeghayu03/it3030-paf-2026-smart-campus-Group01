import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import Button from '../../ui/Button/Button';
import logo from '../../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (id) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === ROUTES.HOME) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to={ROUTES.HOME} className="navbar-logo">
          <img src={logo} alt="UniFolio Logo" className="logo-icon-img" />
          <span>UniFolio</span>
        </Link>
        
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-items">
            <Link to={ROUTES.HOME} className="nav-item-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <a href="#about" className="nav-item-link" onClick={() => handleNavClick('about')}>About</a>
            <a href="#features" className="nav-item-link" onClick={() => handleNavClick('features')}>Features</a>
            <a href="#contact" className="nav-item-link" onClick={() => handleNavClick('contact')}>Contact</a>
          </div>
          
          <div className="nav-actions">
            <Link to={ROUTES.LOGIN} className="nav-link">
              <Button label="Login" variant="outline" />
            </Link>
            <Link to={ROUTES.REGISTER} className="nav-link">
              <Button label="Get Started" variant="primary" />
            </Link>
          </div>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;