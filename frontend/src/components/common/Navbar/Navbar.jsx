import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import Button from '../../ui/Button/Button';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to={ROUTES.HOME} className="navbar-logo">
          UniFolio
        </Link>
        
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to={ROUTES.LOGIN} className="nav-link">
            <Button label="Login" variant="outline" />
          </Link>
          <Link to={ROUTES.REGISTER} className="nav-link">
            <Button label="Get Started" variant="primary" />
          </Link>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;