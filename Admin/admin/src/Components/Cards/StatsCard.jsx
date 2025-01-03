import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon, title, value }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-info">
        <div className="stats-title">{title}</div>
        <div className="stats-value">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
