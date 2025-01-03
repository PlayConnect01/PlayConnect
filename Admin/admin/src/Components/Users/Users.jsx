import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import Swal from 'sweetalert2';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [banFilter, setBanFilter] = useState('all'); // 'all', 'banned', 'notBanned'
  const banReasons = [
    "Inappropriate behavior",
    "Spam",
    "Fake account",
    "Harassment",
    "Violation of terms",
    "Other"
  ];

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/AllUsers');
      const userData = Array.isArray(response.data) ? response.data : response.data.users || [];
      console.log('Fetched users:', userData);
      setUsers(userData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users. Please try again later.');
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, username) => {
    try {
      const { value: result } = await Swal.fire({
        title: 'Ban User',
        html: `
          <div style="width: 100%;">
            <select id="banReason" class="swal2-select" style="width: 100%; margin-bottom: 10px;">
              <option value="">Select a reason</option>
              ${banReasons.map(reason => `<option value="${reason}">${reason}</option>`).join('')}
              <option value="custom">Custom reason...</option>
            </select>
            <input id="customReason" class="swal2-input" placeholder="Enter custom reason..." style="display: none;">
          </div>
        `,
        width: '320px',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ban User',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'no-scroll-popup'
        },
        didOpen: () => {
          // Show/hide custom reason input based on selection
          const select = document.getElementById('banReason');
          const customInput = document.getElementById('customReason');
          
          select.addEventListener('change', (e) => {
            customInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
            if (e.target.value === 'custom') {
              customInput.focus();
            }
          });
        },
        preConfirm: () => {
          const select = document.getElementById('banReason');
          const customInput = document.getElementById('customReason');
          const selectedReason = select.value;
          
          if (!selectedReason) {
            Swal.showValidationMessage('Please select a reason');
            return false;
          }
          
          if (selectedReason === 'custom') {
            if (!customInput.value.trim()) {
              Swal.showValidationMessage('Please enter a custom reason');
              return false;
            }
            return customInput.value.trim();
          }
          
          return selectedReason;
        }
      });

      if (result) {
        const finalReason = result.value;

        // Confirmation dialog
        const confirmResult = await Swal.fire({
          title: 'Confirm Ban',
          html: `
            Are you sure you want to ban ${username}?<br>
            <b>Reason:</b> ${finalReason}
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, ban user',
          cancelButtonText: 'Cancel'
        });

        if (confirmResult.isConfirmed) {
          const response = await axios.put(`http://localhost:3000/users/ban/${userId}`, {
            banReason: finalReason
          });
          
          if (response.status === 200) {
            setUsers(users.map(user => 
              user.user_id === userId 
                ? { ...user, is_banned: true, ban_reason: finalReason }
                : user
            ));

            await Swal.fire(
              'Banned!',
              `${username} has been banned successfully.`,
              'success'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error banning user:', error);
      await Swal.fire(
        'Error',
        'Failed to ban user. Please try again.',
        'error'
      );
    }
  };

  const handleUnbanUser = async (userId, username) => {
    try {
      const result = await Swal.fire({
        title: 'Unban User',
        text: `Are you sure you want to unban ${username}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, unban user',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await axios.put(`http://localhost:3000/users/unban/${userId}`);
        console.log('Unban response:', response.data);
        
        if (response.status === 200) {
          setUsers(users.map(user => 
            user.user_id === userId 
              ? { ...user, is_banned: false }
              : user
          ));

          await Swal.fire(
            'Unbanned!',
            `${username} has been unbanned successfully.`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      await Swal.fire(
        'Error',
        'Failed to unban user. Please try again.',
        'error'
      );
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBanFilterChange = (event) => {
    setBanFilter(event.target.value);
  };

  const handleDeleteUser = async (userId, username) => {
    try {
      const result = await Swal.fire({
        title: 'Delete User',
        html: `
          <div style="min-width: 300px;">
            <p>This will permanently delete ${username} and all their data.</p>
            <p>This action cannot be undone!</p>
          </div>
        `,
        icon: 'warning',
        width: 'auto',
        grow: false,
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete permanently',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`http://localhost:3000/users/delete/${userId}`);
        
        if (response.status === 200) {
          setUsers(users.filter(user => user.user_id !== userId));
          
          await Swal.fire(
            'Deleted!',
            `${username} has been permanently deleted.`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await Swal.fire(
        'Error',
        'Failed to delete user. Please try again.',
        'error'
      );
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBanFilter = 
      banFilter === 'all' ? true :
      banFilter === 'banned' ? user.is_banned :
      banFilter === 'notBanned' ? !user.is_banned : true;
    
    return matchesSearch && matchesBanFilter;
  }) : [];

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users Management</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <select
            value={banFilter}
            onChange={handleBanFilterChange}
            className="ban-filter"
          >
            <option value="all">All Users</option>
            <option value="banned">Banned Users</option>
            <option value="notBanned">Active Users</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className={user.is_banned ? 'banned-user' : ''}>
                <td>{user.user_id}</td>
                <td className="user-info">
                  <img 
                    src={user.profile_picture || '/default-avatar.png'} 
                    alt={user.username}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span>{user.username}</span>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`status ${user.is_banned ? 'banned' : 'active'}`}>
                    {user.is_banned ? (
                      <>
                        Banned
                        {user.ban_reason && (
                          <span className="ban-reason" title={user.ban_reason}>
                            
                          </span>
                        )}
                      </>
                    ) : 'Active'}
                  </span>
                </td>
                <td className="action-buttons">
                  {user.is_banned ? (
                    <button 
                      onClick={() => handleUnbanUser(user.user_id, user.username)}
                      className="unban-btn"
                      title="Unban user"
                    >
                      🔓
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleBanUser(user.user_id, user.username)}
                        className="ban-btn"
                        title="Ban user"
                      >
                        ⛔
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.user_id, user.username)}
                        className="delete-btn"
                        title="Delete user permanently"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
