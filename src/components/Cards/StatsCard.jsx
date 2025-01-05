import React from 'react';
import './StatsCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ icon, title, value, color }) => {
  return (
    <div className="stats-card" style={{ borderColor: color }}>
      <div className="stats-icon" style={{ backgroundColor: color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stats-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard; 