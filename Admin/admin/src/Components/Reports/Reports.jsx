import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Reports.css';
import { MdPerson, MdCheck, MdClose, MdSearch, MdExpandMore, MdExpandLess, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import Swal from 'sweetalert2';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    timeFrame: 'all',
    search: ''
  });
  const [expandedUsers, setExpandedUsers] = useState(new Set());
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
        showConfirmButton: false
      });
    }
  };

  const handleCheckUser = (userId, username) => {
    navigate(`/admin/users?highlight=${userId}`);
    sessionStorage.setItem('highlightedUser', username);
  };

  const handleResolveReport = async (reportId, action, reporterId) => {
    try {
      const result = await Swal.fire({
        title: `${action === 'approve' ? 'Resolve' : 'Dismiss'} Report`,
        text: `Are you sure you want to ${action === 'approve' ? 'resolve' : 'dismiss'} this report?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${action === 'approve' ? 'resolve' : 'dismiss'} it`
      });

      if (result.isConfirmed) {
        const response = await axios.put(`http://localhost:3000/reports/${reportId}`, {
          status: action === 'approve' ? 'RESOLVED' : 'DISMISSED',
          adminId: 1,
          reporterId: reporterId
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
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating report:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to update report status.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const toggleUserExpanded = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const groupReportsByUser = () => {
    const grouped = {};
    reports.forEach(report => {
      if (!grouped[report.reported_user_id]) {
        grouped[report.reported_user_id] = {
          user: report.reported_user,
          reports: []
        };
      }
      grouped[report.reported_user_id].reports.push(report);
    });
    return grouped;
  };

  const filterReports = (groupedReports) => {
    return Object.entries(groupedReports).filter(([_, userData]) => {
      const matchesStatus = filters.status === 'all' || 
        userData.reports.some(report => report.status.toLowerCase() === filters.status);
      
      const matchesSearch = filters.search === '' || 
        userData.user.username.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTimeFrame = filters.timeFrame === 'all' || 
        userData.reports.some(report => {
          const reportDate = new Date(report.created_at);
          const now = new Date();
          switch (filters.timeFrame) {
            case 'today':
              return reportDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
              return reportDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return reportDate >= monthAgo;
            default:
              return true;
          }
        });

      return matchesStatus && matchesSearch && matchesTimeFrame;
    });
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  const groupedReports = groupReportsByUser();
  const filteredReports = filterReports(groupedReports);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>User Reports</h1>
        <div className="filters">
          <div className="search-box">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by username..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            className="filter-select"
            value={filters.timeFrame}
            onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="reports-grid">
        {filteredReports.map(([userId, userData]) => (
          <div key={userId} className="user-reports-group">
            <div 
              className="group-header"
              onClick={() => toggleUserExpanded(userId)}
            >
              <div className="user-summary">
                <img 
                  src={userData.user?.profile_picture || 'https://res.cloudinary.com/dc9siq9ry/image/upload/v1736126260/b9yxzz71wazs1hrefao6.png'} 
                  alt={userData.user?.username}
                  className="user-avatar"
                />
                <span>{userData.user?.username}</span>
                <span className="reports-count">{userData.reports.length} reports</span>
              </div>
              {expandedUsers.has(userId) ? <MdExpandLess /> : <MdExpandMore />}
            </div>

            <div className={`report-cards ${expandedUsers.has(userId) ? 'expanded' : ''}`}>
              {userData.reports.map((report) => (
                <div key={report.report_id} className="report-card">
                  <div className="report-metadata">
                    <span className={`status ${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                    <span className="date">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="report-info">
                    <div className="reporter-info">
                      <img 
                        src={report.reporter?.profile_picture || 'https://res.cloudinary.com/dc9siq9ry/image/upload/v1736126260/b9yxzz71wazs1hrefao6.png'} 
                        alt={report.reporter?.username}
                        className="user-avatar"
                      />
                      <span>{report.reporter?.username}</span>
                    </div>

                    <p className="reason">{report.reason}</p>

                    <div className="report-actions">
                      <button 
                        className="action-btn check-user-btn"
                        onClick={() => handleCheckUser(report.reported_user_id, report.reported_user?.username)}
                      >
                        <MdPerson /> Check
                      </button>
                      {report.status === 'PENDING' && (
                        <>
                          <button 
                            className="action-btn resolve-btn"
                            onClick={() => handleResolveReport(report.report_id, 'approve', report.reported_by)}
                          >
                            <MdCheck />
                          </button>
                          <button 
                            className="action-btn dismiss-btn"
                            onClick={() => handleResolveReport(report.report_id, 'dismiss', report.reported_by)}
                          >
                            <MdClose />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;