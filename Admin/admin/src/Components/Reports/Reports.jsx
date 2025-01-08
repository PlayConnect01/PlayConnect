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
      await Swal.fire({
        title: 'Error',
        text: 'Failed to fetch reports. Please try again.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
        width: '400px',
        customClass: {
          popup: 'large-popup',
          title: 'large-title',
          content: 'large-content'
        }
      });
    }
  };

  const handleCheckUser = (userId, username) => {
    navigate(`/admin/users?highlight=${userId}`);
    sessionStorage.setItem('highlightedUser', username);
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      const result = await Swal.fire({
        title: `${action === 'approve' ? 'Resolve' : 'Dismiss'} Report`,
        text: `Are you sure you want to ${action === 'approve' ? 'resolve' : 'dismiss'} this report?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'approve' ? '#28a745' : '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: `Yes, ${action === 'approve' ? 'resolve' : 'dismiss'} it`,
        width: '400px',
        customClass: {
          popup: 'large-popup',
          title: 'large-title',
          content: 'large-content',
          confirmButton: 'large-button',
          cancelButton: 'large-button',
          actions: 'large-actions'
        }
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:3000/reports/${reportId}`, {
          status: action === 'approve' ? 'RESOLVED' : 'DISMISSED'
        });

        setReports(reports.map(report => 
          report.report_id === reportId 
            ? { ...report, status: action === 'approve' ? 'RESOLVED' : 'DISMISSED' } 
            : report
        ));

        await Swal.fire({
          title: `${action === 'approve' ? 'Resolved' : 'Dismissed'}!`,
          text: `Report has been ${action === 'approve' ? 'resolved' : 'dismissed'}.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          width: '400px',
          customClass: {
            popup: 'large-popup',
            title: 'large-title',
            content: 'large-content'
          }
        });
      }
    } catch (error) {
      console.error('Error updating report:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to update report status.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
        width: '400px',
        customClass: {
          popup: 'large-popup',
          title: 'large-title',
          content: 'large-content'
        }
      });
    }
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
                {report.status === 'PENDING' && (
                  <>
                    <button 
                      className="resolve-btn"
                      onClick={() => handleResolveReport(report.report_id, 'approve')}
                    >
                      <MdCheck /> Resolve
                    </button>
                    <button 
                      className="dismiss-btn"
                      onClick={() => handleResolveReport(report.report_id, 'dismiss')}
                    >
                      <MdClose /> Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
