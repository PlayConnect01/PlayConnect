import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './Components/layouts/DashboardLayout';
import Login from './Components/Auth/Login/Login';
import Signup from './Components/Auth/Signup/Signup';

function App() {
  const isAuthenticated = localStorage.getItem('adminToken') !== null;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/admin/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" />} 
        />
        <Route 
          path="/admin/signup" 
          element={!isAuthenticated ? <Signup /> : <Navigate to="/admin/dashboard" />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/admin/login" />} 
        />
        
        {/* Redirect root to login */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
