import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import { ROUTES } from '../../constants/routes';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <main>
        {/* SECTION 2 - Hero */}
        <section className="hero">
          <div className="container hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Smart Campus Operations</h1>
              <h2 className="hero-title-highlight">Simplified.</h2>
              <p className="hero-subtitle">
                UniFolio brings together facility bookings, maintenance tracking, and campus resources into one powerful platform.
              </p>
              <div className="hero-actions">
                <Button label="Get Started" onClick={() => navigate(ROUTES.REGISTER)} />
                <Button label="Learn More" variant="outline" onClick={scrollToAbout} />
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="hero-abstract-card">
                <div className="floating-card float-1">
                  <div className="float-title">Campus Resources</div>
                  <div className="float-value">50+</div>
                </div>
                <div className="floating-card float-2">
                  <div className="float-title">Bookings Made</div>
                  <div className="float-value">500+</div>
                </div>
                <div className="floating-card float-3">
                  <div className="float-title">Issues Resolved</div>
                  <div className="float-value">200+</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - Features */}
        <section id="features" className="features section">
          <div className="container">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Manage your campus operations in one place</p>
            <div className="features-grid">
              <Card 
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="24" fill="var(--primary-lighter)" />
                    <text x="24" y="32" fontSize="20" fontWeight="bold" fill="var(--primary)" textAnchor="middle">R</text>
                  </svg>
                } 
                title="Campus Resources" 
                description="Browse and manage all university facilities including lecture halls, labs, and equipment." 
              />
              <Card 
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="24" fill="var(--primary-lighter)" />
                    <text x="24" y="32" fontSize="20" fontWeight="bold" fill="var(--primary)" textAnchor="middle">B</text>
                  </svg>
                } 
                title="Smart Bookings" 
                description="Request and manage resource bookings with instant approval workflows and conflict detection." 
              />
              <Card 
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="24" fill="var(--primary-lighter)" />
                    <text x="24" y="32" fontSize="20" fontWeight="bold" fill="var(--primary)" textAnchor="middle">M</text>
                  </svg>
                } 
                title="Maintenance Hub" 
                description="Report and track maintenance issues with real-time updates from technicians." 
              />
            </div>
          </div>
        </section>

        {/* SECTION 4 - About */}
        <section id="about" className="about section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2 className="section-title text-left">About UniFolio</h2>
                <p>
                  UniFolio is a modern campus operations platform designed to streamline the way universities manage their facilities, assets, and maintenance operations. Built for students, staff, and administrators alike.
                </p>
                <ul className="about-list">
                  <li>Role-based access for Students, Admins and Technicians</li>
                  <li>Real-time notifications and updates</li>
                  <li>Secure OAuth 2.0 authentication</li>
                </ul>
              </div>
              <div className="about-stats-card">
                <div className="stat-item">
                  <span className="stat-label">Campus Resources</span>
                  <span className="stat-number">50+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Bookings Made</span>
                  <span className="stat-number">500+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Issues Resolved</span>
                  <span className="stat-number">200+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-number">1000+</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;