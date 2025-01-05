import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CompeitionsDetails.css';

const CompetitionsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/competetion/${id}`);
        setTournament(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching tournament details');
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tournament) return <div className="error">Tournament not found</div>;

  return (
    <div className="tournament-details-container">
      <div className="tournament-details-header">
        <button className="back-button" onClick={() => navigate('/admin/competitions')}>
          ← Back to Tournaments
        </button>
        <h1>{tournament.tournament_name}</h1>
      </div>

      <div className="tournament-details-content">
        <div className="tournament-info-section">
          <h2>Tournament Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Sport</label>
              <span>{tournament.sport?.name}</span>
            </div>
            <div className="info-item">
              <label>Organizer</label>
              <span>{tournament.creator?.username}</span>
            </div>
            <div className="info-item">
              <label>Start Date</label>
              <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>End Date</label>
              <span>{new Date(tournament.end_date).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Point Reward</label>
              <span>{tournament.point_reward} Points</span>
            </div>
          </div>
        </div>

        <div className="teams-section">
          <h2>Participating Teams</h2>
          <div className="teams-grid">
            {tournament.teams?.map((teamEntry) => (
              <div key={teamEntry.team.team_id} className="team-card">
                <h3>{teamEntry.team.team_name}</h3>
                <div className="members-list">
                  <h4>Team Members</h4>
                  {teamEntry.team.members.map((member) => (
                    <div key={member.team_member_id} className="member-item">
                      <span className="member-name">{member.user?.username}</span>
                      <span className="member-role">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionsDetails;
