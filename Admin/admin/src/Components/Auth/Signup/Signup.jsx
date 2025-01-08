import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import Swal from 'sweetalert2';

const sweetAlertConfig = {
  width: '250px',
  padding: '0.8rem',
  customClass: {
    popup: 'small-popup',
    title: 'small-title',
    content: 'small-content',
    confirmButton: 'small-button'
  }
};

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/admin/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode
      });

      Swal.fire({
        ...sweetAlertConfig,
        icon: 'success',
        title: 'Success!',
        text: 'Registration successful',
        confirmButtonColor: '#4CAF50',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin/login');
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      Swal.fire({
        ...sweetAlertConfig,
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Registration failed',
        confirmButtonColor: '#F44336',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="admin-signup-container">
      <div className="admin-signup-card">
        <h2>Admin Registration</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Admin Registration Code</label>
            <input
              type="password"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              required
              placeholder="Enter special admin code"
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/admin/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
