import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { title: 'Menu', icon: '📋' },
    { title: 'All User', icon: '👥' },
    { title: 'All Event', icon: '📅' },
    { title: 'All Competition', icon: '🏆' },
    { title: 'All Product', icon: '🛍️' },
    { title: 'All Report', icon: '📊' },
    { title: 'All Admin', icon: '👤' },
  ];

  return (
    <div className="sidebar">
      <div className="admin-profile">
        <div className="admin-avatar">
          <img src="/avatar-placeholder.png" alt="Admin" />
        </div>
        <span className="admin-name">Name Admin</span>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item">
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-title">{item.title}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
