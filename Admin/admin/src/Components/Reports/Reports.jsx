import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Reports.css';
import { MdPerson, MdCheck, MdClose } from 'react-icons/md';
import Swal from 'sweetalert2';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:3000/reports');
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleCheckUser = (userId, username) => {
    // Navigate to users page with query parameter
    navigate(`/admin/users?highlight=${userId}`);
    
    // Store the username in sessionStorage for the animation
    sessionStorage.setItem('highlightedUser', username);
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="reports-container">
      <h1>User Reports</h1>
      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.report_id} className="report-card">
            <div className="report-header">
              <span className={`status ${report.status.toLowerCase()}`}>
                {report.status}
              </span>
              <span className="date">
                {new Date(report.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="report-content">
              <div className="reported-user">
                <h3>Reported User</h3>
                <div className="user-info">
                  <img 
                    src={report.reported_user?.profile_picture || 'https://res.cloudinary.com/dc9siq9ry/image/upload/v1736126260/b9yxzz71wazs1hrefao6.png'} 
                    alt={report.reported_user?.username}
                    className="user-avatar"
                  />
                  <span>{report.reported_user?.username}</span>
                </div>
              </div>

              <div className="reporter">
                <h3>Reported By</h3>
                <div className="user-info">
                  <img 
                    src={report.reporter?.profile_picture || 'https://res.cloudinary.com/dc9siq9ry/image/upload/v1736126260/b9yxzz71wazs1hrefao6.png'} 
                    alt={report.reporter?.username}
                    className="user-avatar"
                  />
                  <span>{report.reporter?.username}</span>
                </div>
              </div>

              <div className="reason">
                <h3>Reason</h3>
                <p>{report.reason}</p>
              </div>

              <div className="report-actions">
                <button 
                  className="check-user-btn"
                  onClick={() => handleCheckUser(report.reported_user_id, report.reported_user?.username)}
                >
                  <MdPerson /> Check User
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
