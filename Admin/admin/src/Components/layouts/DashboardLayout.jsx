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
import CreateCompetition from '../Competitions/CreateCompetition';
import Products from '../Products/Products';
import UserProducts from '../Products/UserProducts';
import ProductDetails from '../Products/ProductDetails';
import Reports from '../Reports/Reports';

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
      case 'products':
        navigate('/admin/products');
        break;
      case 'userProducts':
        navigate('/admin/user-products');
        break;
      case 'reports':
        navigate('/admin/reports');
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
        <div className="content-area">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/details/:eventId" element={<EventDetails />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/competitions/details/:id" element={<CompetitionsDetails />} />
            <Route path="/competitions/create" element={<CreateCompetition />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/user-products" element={<UserProducts />} />
            <Route path="/user-products/:id" element={<ProductDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
