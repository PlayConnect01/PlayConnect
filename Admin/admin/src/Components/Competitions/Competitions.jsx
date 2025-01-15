import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Competitions.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MdEmojiEvents, MdPerson, MdCalendarToday, MdGroup, MdAdd } from 'react-icons/md';

const Competitions = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/competetion/Teams');
      setTournaments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError('Error fetching tournaments. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (tournamentId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Tournament',
        text: 'Are you sure you want to delete this tournament?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it',
        width: '400px',
        customClass: {
          popup: 'large-popup',
          title: 'large-title',
          content: 'large-content',
          confirmButton: 'large-button',
          cancelButton: 'large-button',
          actions: 'large-actions'
        }
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3000/tournaments/${tournamentId}`);
        setTournaments(tournaments.filter(t => t.tournament_id !== tournamentId));
        await Swal.fire({
          title: 'Deleted!',
          text: 'Tournament has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          width: '400px',
          customClass: {
            popup: 'large-popup',
            title: 'large-title',
            content: 'large-content'
          }
        });
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to delete tournament',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
        width: '400px',
        customClass: {
          popup: 'large-popup',
          title: 'large-title',
          content: 'large-content'
        }
      });
    }
  };

  const handleViewDetails = (tournamentId) => {
    navigate(`/admin/competitions/details/${tournamentId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tournaments-container">
      <div className="tournaments-header">
        <h1>Tournaments Management</h1>
        <button 
          className="add-tournament-button"
          onClick={() => navigate('/admin/competitions/create')}
        >
          <MdAdd /> New Tournament
        </button>
      </div>
      <div className="tournaments-grid">
        {tournaments.map((tournament) => (
          <div key={tournament.tournament_id} className="tournament-card">
            <div className="tournament-header">
              <div className="sport-badge">
                {tournament.sport?.name || 'No Sport'}
              </div>
              <div className="point-reward">
                <MdEmojiEvents style={{ color: '#FFD700' }} />
                {tournament.point_reward} Points
              </div>
            </div>
            <div className="tournament-info">
              <h3>{tournament.tournament_name}</h3>
              <div className="info-row">
                <span className="icon"><MdPerson style={{ color: '#333' }} /></span>
                <span>Organizer: {tournament.creator?.username}</span>
              </div>
              <div className="info-row">
                <span className="icon"><MdCalendarToday style={{ color: '#333' }} /></span>
                <span>
                  {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="info-row">
                <span className="icon"><MdGroup style={{ color: '#333' }} /></span>
                <span>Teams: {tournament.teams?.length || 0}</span>
              </div>
            </div>
            <div className="tournament-actions">
              <button
                className="action-button view"
                onClick={() => handleViewDetails(tournament.tournament_id)}
              >
                Details
              </button>
              <button
                className="action-button delete"
                onClick={() => handleDelete(tournament.tournament_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Competitions;
