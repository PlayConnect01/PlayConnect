import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { FiLogOut } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/admin/login');
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="header">
      <div className="logo">
        <img 
          src="https://res.cloudinary.com/dc9siq9ry/image/upload/v1736030171/mbhphsb0xnrudayeykpa.png" 
          alt="Logo" 
          className="logo-image"
        />
        SportsMate
      </div>
      <div className="profile-menu">
        
        <div 
          className="profile-icon" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiSettings size={20} />
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={handleLogout}>
              <FiLogOut className="dropdown-icon" />
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
