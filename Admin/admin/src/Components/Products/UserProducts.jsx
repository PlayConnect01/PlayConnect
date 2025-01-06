import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProducts.css';
import { MdCheckCircle, MdCancel, MdVisibility } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const UserProducts = () => {
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const fetchUserProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/userproduct');
      setUserProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user products:', err);
      setError('Error fetching user products. Please try again later.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `${newStatus === 'ACCEPTED' ? 'Accept' : 'Reject'} Product`,
        text: `Are you sure you want to ${newStatus.toLowerCase()} this product?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'ACCEPTED' ? '#4caf50' : '#f44336',
        cancelButtonColor: '#3085d6',
        confirmButtonText: `Yes, ${newStatus.toLowerCase()} it!`
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:3000/userproduct/${productId}`, {
          status: newStatus
        });

        setUserProducts(userProducts.map(product => 
          product.id === productId ? { ...product, status: newStatus } : product
        ));

        Swal.fire(
          `${newStatus}!`,
          `Product has been ${newStatus.toLowerCase()}.`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      Swal.fire('Error', 'Failed to update product status.', 'error');
    }
  };

  const filteredProducts = userProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller?.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      product.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-products-container">
      <div className="user-products-header">
        <h1>User Products Management</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search products or sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="user-products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`product-card ${product.status.toLowerCase()}`}>
            <div className="product-image">
              <img 
                src={product.image_url} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/default-product.png';
                }}
              />
              <span className={`status-badge ${product.status.toLowerCase()}`}>
                {product.status}
              </span>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="seller">Seller: {product.seller?.username}</p>
              <p className="sport">{product.sport?.name}</p>
            </div>
            <div className="product-actions">
              <button 
                className="view-btn"
                title="View details"
                onClick={() => navigate(`/admin/user-products/${product.id}`)}
              >
                <MdVisibility />
              </button>
              {product.status === 'PENDING' && (
                <>
                  <button 
                    className="accept-btn"
                    title="Accept product"
                    onClick={() => handleUpdateStatus(product.id, 'ACCEPTED')}
                  >
                    <MdCheckCircle />
                  </button>
                  <button 
                    className="reject-btn"
                    title="Reject product"
                    onClick={() => handleUpdateStatus(product.id, 'REJECTED')}
                  >
                    <MdCancel />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProducts;
