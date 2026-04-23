import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosConfig from "../../api/axiosConfig";
import "./CompleteProfilePage.css";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: localStorage.getItem('name') || '',
    studentId: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    "Select Department",
    "Information Technology",
    "Computer Science",
    "Software Engineering",
    "Cyber Security",
    "Data Science",
    "Other"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosConfig.post('/auth/complete-profile', formData);
      localStorage.setItem('name', formData.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-left">
        <div className="complete-profile-form-container">
          <h1>Complete Your Profile</h1>
          <p className="subtitle">
            Just a few more details to get you started
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. IT21234567"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept === "Select Department" ? "" : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>

      <div className="complete-profile-right">
        <div className="right-content">
          <h2>Almost there!</h2>
          <p>Complete your profile to access all UniFolio features</p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">R</div>
              <span>Browse Campus Resources</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">B</div>
              <span>Make Bookings</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">M</div>
              <span>Report Maintenance Issues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
