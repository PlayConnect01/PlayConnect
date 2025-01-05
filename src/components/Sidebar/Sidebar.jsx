import React from 'react';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faCalendarAlt, 
  faTrophy, 
  faShoppingCart, 
  faChartBar, 
  faUserShield 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="profile">
        <img src="/admin-avatar.png" alt="Admin" className="profile-img" />
        <h3>Name Admin</h3>
      </div>
      
      <nav className="nav-menu">
        <Link to="/" className="nav-item">
          <FontAwesomeIcon icon={faHome} />
          <span>Menu</span>
        </Link>
        <Link to="/users" className="nav-item">
          <FontAwesomeIcon icon={faUsers} />
          <span>All Users</span>
        </Link>
        <Link to="/events" className="nav-item">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>All Events</span>
        </Link>
        <Link to="/competitions" className="nav-item">
          <FontAwesomeIcon icon={faTrophy} />
          <span>All Competition</span>
        </Link>
        <Link to="/products" className="nav-item">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>All Products</span>
        </Link>
        <Link to="/reports" className="nav-item">
          <FontAwesomeIcon icon={faChartBar} />
          <span>All Reports</span>
        </Link>
        <Link to="/admins" className="nav-item">
          <FontAwesomeIcon icon={faUserShield} />
          <span>All Admin</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 