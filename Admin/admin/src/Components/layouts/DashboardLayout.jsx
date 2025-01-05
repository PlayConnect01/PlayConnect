import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Dashboard from '../AdminDashboard/Dashboard';
import Users from '../Users/Users';
import Events from '../Events/Events';
import EventDetails from '../Events/EventDetails';
import Competitions from '../Competitions/Competitions';
import CompetitionsDetails from '../Competitions/CompetitionsDetails';

const DashboardLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setCurrentPage(page);
    switch (page) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'events':
        navigate('/admin/events');
        break;
      case 'competitions':
        navigate('/admin/competitions');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar onPageChange={handlePageChange} />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/details/:eventId" element={<EventDetails />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/competitions/details/:id" element={<CompetitionsDetails />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
