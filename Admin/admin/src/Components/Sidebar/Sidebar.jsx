import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onPageChange }) => {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Menu', icon: '📋', page: 'dashboard' },
    { title: ' Users', icon: '👥', page: 'users' },
    { title: ' Events', icon: '📅', page: 'events' },
    { title: ' Competitions', icon: '🏆', page: 'competitions' },
    { title: ' Products', icon: '🛍️', page: 'products' },
    { title: ' Reports', icon: '📊', page: 'reports' },
    { title: ' Admins', icon: '👤', page: 'admins' },
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
          <img src="/admin-avatar.png" alt="Admin" />
        </div>
        <span className="admin-name">Name Admin</span>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className="menu-item"
            onClick={() => handleMenuClick(item.page)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-title">{item.title}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
