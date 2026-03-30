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
          <div className="container hero-content">
            <h1 className="hero-title">Smart Campus Operations, Simplified</h1>
            <p className="hero-subtitle">
              UniFolio brings together facility bookings, maintenance tracking, and campus resources into one powerful platform.
            </p>
            <div className="hero-actions">
              <Button label="Get Started" onClick={() => navigate(ROUTES.REGISTER)} />
              <Button label="Learn More" variant="outline" onClick={scrollToAbout} />
            </div>
          </div>
        </section>

        {/* SECTION 3 - Features */}
        <section className="features section">
          <div className="container">
            <h2 className="section-title">Everything You Need to Manage Your Campus</h2>
            <div className="features-grid">
              <Card 
                icon="🏛️" 
                title="Campus Resources" 
                description="Browse and manage all university facilities including lecture halls, labs, and equipment." 
              />
              <Card 
                icon="📅" 
                title="Smart Bookings" 
                description="Request and manage resource bookings with instant approval workflows and conflict detection." 
              />
              <Card 
                icon="🔧" 
                title="Maintenance Hub" 
                description="Report and track maintenance issues with real-time updates from technicians." 
              />
            </div>
          </div>
        </section>

        {/* SECTION 4 - About */}
        <section id="about" className="about section">
          <div className="container">
            <h2 className="section-title">About UniFolio</h2>
            <div className="about-content">
              <div className="about-text">
                <p>
                  UniFolio is a modern campus operations platform designed to streamline the way universities manage their facilities, assets, and maintenance operations. Built for students, staff, and administrators alike.
                </p>
                <ul className="about-list">
                  <li>✅ Role-based access for Students, Admins and Technicians</li>
                  <li>✅ Real-time notifications and updates</li>
                  <li>✅ Secure OAuth 2.0 authentication</li>
                </ul>
              </div>
              <div className="about-stats">
                <div className="stat-item">🏛️ 50+ Campus Resources</div>
                <div className="stat-item">📅 500+ Bookings Made</div>
                <div className="stat-item">🔧 200+ Issues Resolved</div>
                <div className="stat-item">👥 1000+ Active Users</div>
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