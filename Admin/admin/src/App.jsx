<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Auth/Login';
import Signup from './Components/Auth/Signup';

function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('admin_token') !== null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div>Dashboard</div> // Replace with your Dashboard component
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
=======
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './Components/layouts/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* All admin routes */}
        <Route path="/admin/*" element={<DashboardLayout />} />
>>>>>>> 4a222e247eafc640dd5884c9d060431d7faa0613
      </Routes>
    </Router>
  );
}

export default App;
