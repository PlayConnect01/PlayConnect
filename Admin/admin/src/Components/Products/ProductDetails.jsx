import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';
import { MdArrowBack, MdEdit, MdDelete, MdLocalOffer, MdStar, MdSave, MdClose } from 'react-icons/md';
import Swal from 'sweetalert2';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/product/products/${id}`);
      setProduct(response.data);
      setEditedValues(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Error fetching product details. Please try again later.');
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditedValues(prev => ({ ...prev, [field]: product[field] }));
  };

  const handleChange = (field, value) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      const response = await axios.put(`http://localhost:3000/product/products/${id}`, {
        [field]: editedValues[field]
      });
      
      setProduct(response.data);
      setEditMode(prev => ({ ...prev, [field]: false }));
      Swal.fire('Success', 'Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire('Error', 'Failed to update product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'Delete Product',
        text: 'Are you sure you want to delete this product?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3000/product/products/${id}`);
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire('Error', 'Failed to delete product.', 'error');
    }
  };

  const renderEditableField = (field, label, type = 'text') => {
    return (
      <div className="details-row">
        <label>{label}:</label>
        {editMode[field] ? (
          <div className="edit-field">
            <input
              type={type}
              value={editedValues[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="edit-input"
            />
            <button className="icon-btn" onClick={() => handleSave(field)}>
              <MdSave size={16} color="#333" />
            </button>
            <button className="icon-btn" onClick={() => handleCancel(field)}>
              <MdClose size={16} color="#333" />
            </button>
          </div>
        ) : (
          <div className="view-field">
            <span>{type === 'number' ? parseFloat(product[field]).toFixed(2) : product[field]}</span>
            <button className="icon-btn" onClick={() => handleEdit(field)}>
              <MdEdit size={16} color="#333" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-details-container">
      <div className="product-details-content">
        <div className="product-image-section">
          <img 
            src={product.image_url} 
            alt={product.name}
            onError={(e) => {
              e.target.src = '/default-product.png';
            }}
          />
        </div>

        <div className="product-info-section">
          {renderEditableField('name', 'Name')}
          {renderEditableField('price', 'Price', 'number')}
          {renderEditableField('discount', 'Discount', 'number')}
          {renderEditableField('description', 'Description')}
          {renderEditableField('rating', 'Rating', 'number')}

          <div className="details-row">
            <label>Sport:</label>
            <span>{product.sport?.name}</span>
          </div>

          <div className="details-row">
            <label>Rating:</label>
            <span className="rating">
              <MdStar className="star-icon" />
              {product.rating}/5
            </span>
          </div>

          {product.seller && (
            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="details-row">
                <label>Name:</label>
                <span>{product.seller.username}</span>
              </div>
              <div className="details-row">
                <label>Email:</label>
                <span>{product.seller.email}</span>
              </div>
            </div>
          )}

          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description || 'No description available'}</p>
          </div>

          <div className="delete-container">
            <button className="delete-btn" onClick={handleDelete}>
              Delete <MdDelete size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
