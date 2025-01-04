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
      </Routes>
    </Router>
  );
}

export default App;
