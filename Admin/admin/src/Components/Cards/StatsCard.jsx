import React from 'react';
import { MdPeople, MdEvent, MdEmojiEvents, MdAttachMoney } from 'react-icons/md';
import './StatsCard.css';

const StatsCard = ({ title, value }) => {
  const getIcon = () => {
    switch (title) {
      case 'Total Users':
        return <MdPeople className="stats-icon" />;
      case 'Total Events':
        return <MdEvent className="stats-icon" />;
      case 'Total Competitions':
        return <MdEmojiEvents className="stats-icon" />;
      case 'Total Sales':
        return <MdAttachMoney className="stats-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="stats-card">
      <div className="stats-info">
        <div className="title-row">
          {getIcon()}
          <h3>{title}</h3>
        </div>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
