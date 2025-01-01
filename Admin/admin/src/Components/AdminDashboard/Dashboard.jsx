import React from 'react';
import StatsCard from '../Cards/StatsCard';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatsCard icon="👥" title="Total Users" value="64" />
        <StatsCard icon="📅" title="Total Events" value="12" />
        <StatsCard icon="🏆" title="Total Competitions" value="8" />
        <StatsCard icon="💰" title="Total Sales" value="$1,234.56" />
      </div>
      
      <div className="dashboard-sections">
        <div className="events-section">
          <h2>Events of Day</h2>
          <div className="events-content">
            {/* Events content will go here */}
          </div>
        </div>
        
        <div className="competition-section">
          <h2>Competition of Day</h2>
          <div className="competition-content">
            {/* Competition content will go here */}
          </div>
        </div>
        
        <div className="top-users-section">
          <h2>Top Users</h2>
          <div className="top-users-content">
            {/* Top users content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
