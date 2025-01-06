import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/product/products');
      let sortedProducts = [...response.data];
      
      switch (sortBy) {
        case 'newest':
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          sortedProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'price-high':
          sortedProducts.sort((a, b) => b.price - a.price);
          break;
        case 'price-low':
          sortedProducts.sort((a, b) => a.price - b.price);
          break;
        default:
          break;
      }
      
      setProducts(sortedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products. Please try again later.');
      setLoading(false);
    }
  };


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products Management</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price High to Low</option>
            <option value="price-low">Price Low to High</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div 
            key={product.product_id} 
            className="product-card"
            onClick={() => navigate(`/admin/products/${product.product_id}`)}
          >
            <div className="product-image">
              <img 
                src={product.image_url} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/default-product.png';
                }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="sport">{product.sport?.name}</p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
