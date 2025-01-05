import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateCompetition.css';
import { MdArrowBack, MdSportsSoccer } from 'react-icons/md';

const CreateCompetition = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [formData, setFormData] = useState({
    tournament_name: '',
    sport_id: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    point_reward: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get('http://localhost:3000/sports');
        setSports(response.data);
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    };
    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminData = localStorage.getItem('adminData');
      if (!adminData) {
        throw new Error('Admin data not found. Please login again.');
      }
      const admin = JSON.parse(adminData);
      
      console.log('Admin data from localStorage:', admin);
      
      if (!admin.admin_id) {
        throw new Error('Admin ID not found. Please login again.');
      }

      const startDateTime = `${formData.start_date}T${formData.start_time}`;
      const endDateTime = `${formData.end_date}T${formData.end_time}`;

      const requestData = {
        tournament_name: formData.tournament_name,
        sport_id: parseInt(formData.sport_id),
        created_by: parseInt(admin.admin_id),
        start_date: startDateTime,
        end_date: endDateTime,
        point_reward: parseInt(formData.point_reward)
      };

      console.log('Request data being sent:', requestData);

      const response = await axios.post('http://localhost:3000/competetion/create', requestData);

      navigate('/admin/competitions');
    } catch (error) {
      console.error('Error creating tournament:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tournament-container">
      <div className="create-tournament-header">
        <button className="back-button" onClick={() => navigate('/admin/competitions')}>
          <MdArrowBack /> Back
        </button>
        <h1>Create New Tournament</h1>
      </div>

      <form className="tournament-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Tournament Name</label>
            <input
              type="text"
              name="tournament_name"
              value={formData.tournament_name}
              onChange={handleChange}
              required
              placeholder="Enter tournament name"
            />
          </div>

          <div className="form-group">
            <label>Sport</label>
            <select
              name="sport_id"
              value={formData.sport_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a sport</option>
              {sports.map(sport => (
                <option key={sport.sport_id} value={sport.sport_id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <div className="date-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Point Reward</label>
            <input
              type="number"
              name="point_reward"
              value={formData.point_reward}
              onChange={handleChange}
              required
              placeholder="Enter point reward"
              min="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompetition;
