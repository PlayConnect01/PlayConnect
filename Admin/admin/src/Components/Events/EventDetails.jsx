import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventDetails.css';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/events/getById/${eventId}`);
        console.log('Event data:', response.data);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.response?.data?.error || 'Error fetching event details');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBack = () => {
    navigate('/admin/events');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-details">
      <div className="event-details-header">
      </div>

      <div className="event-details-grid">
        <div className="event-info-card">
          <h2>Event Information</h2>
          <div className="info-content">
          <div className="info-row">
              <span className="label">Name:</span>
              <span>
              {event.event_name}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Date:</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Time:</span>
              <span>
                {event.start_time} - {event.end_time}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Location:</span>
              <span>{event.location}</span>
            </div>
            <div className="info-row">
              <span className="label">Category:</span>
              <span>{event.category}</span>
            </div>
            <div className="info-row">
              <span className="label">Price:</span>
              <span>${event.price}</span>
            </div>
            <div className="info-row">
              <span className="label">Max Participants:</span>
              <span>{event.participants}</span>
            </div>
            <div className="info-row">
              <span className="label">Description:</span>
              <span>
              {event.description}
              </span>
            </div>
          </div>
        </div>

        <div className="event-creator-card">
          <h2>Creator Information</h2>
          <div className="creator-info">
            {event.creator && (
              <>
                <div className="creator-header">
                  <img 
                    src={event.creator.profile_picture || '/default-avatar.png'} 
                    alt="Creator" 
                    className="creator-avatar"
                  />
                  <div className="creator-details">
                    <h3>{event.creator.username}</h3>
                    <p>{event.creator.email}</p>
                  </div>
                </div>
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span>{event.creator.location || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="event-participants-card">
          <h2>Participants ({event.event_participants?.length || 0})</h2>
          <div className="participants-list">
            {event.event_participants && event.event_participants.length > 0 ? (
              event.event_participants.map((participant) => (
                <div key={participant.event_participant_id} className="participant-item">
                  <img 
                    src={participant.user?.profile_picture || '/default-avatar.png'} 
                    alt={participant.user?.username} 
                    className="participant-avatar"
                  />
                  <div className="participant-info">
                    <span className="participant-name">{participant.user?.username}</span>
                    <span className="participant-email">{participant.user?.email}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-participants">No participants yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;