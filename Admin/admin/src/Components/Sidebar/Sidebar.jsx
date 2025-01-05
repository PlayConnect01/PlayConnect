import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdPeople, MdEvent, MdEmojiEvents, 
         MdShoppingCart, MdReport, MdAdminPanelSettings } from 'react-icons/md';
import './Sidebar.css';

const Sidebar = ({ onPageChange }) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const admin = JSON.parse(adminData);
      setAdminName(admin.username || 'Admin');
    }
  }, []);

  const menuItems = [
    { title: 'Dashboard', page: 'dashboard', icon: <MdDashboard className="menu-icon" /> },
    { title: 'Users', page: 'users', icon: <MdPeople className="menu-icon" /> },
    { title: 'Events', page: 'events', icon: <MdEvent className="menu-icon" /> },
    { title: 'Competitions', page: 'competitions', icon: <MdEmojiEvents className="menu-icon" /> },
    { title: 'Products', page: 'products', icon: <MdShoppingCart className="menu-icon" /> },
    { title: 'Reports', page: 'reports', icon: <MdReport className="menu-icon" /> },
    { title: 'Admins', page: 'admins', icon: <MdAdminPanelSettings className="menu-icon" /> },
  ];

  const handleMenuClick = (page) => {
    onPageChange(page);
    if (page === 'competitions') {
      navigate('/admin/competitions');
    }
  };

  return (
    <div className="sidebar">
      <div className="admin-profile">
        <div className="admin-avatar">
          <img 
            src="https://res.cloudinary.com/dc9siq9ry/image/upload/v1735947226/q7bgfgeynm3euadym3tg.png" 
            alt="Admin" 
          />
        </div>
        <div className="admin-info">
          <span className="admin-name">{adminName}</span>
          <span className="admin-role">(Admin)</span>
        </div>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className="menu-item"
            onClick={() => handleMenuClick(item.page)}
          >
            {item.icon}
            <span className="menu-title">{item.title}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
