import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Events.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/events/getAll');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error fetching events. Please try again later.');
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (statusFilter === 'all') return true;
    return event.status === statusFilter;
  });

  const handleDelete = async (eventId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Event',
        text: 'Are you sure you want to delete this event? This will also remove all participants.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`http://localhost:3000/events/delete-event/${eventId}`);
        
        if (response.status === 200) {
          setEvents(events.filter(event => event.event_id !== eventId));
          await Swal.fire(
            'Deleted!',
            'Event has been deleted successfully.',
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      await Swal.fire(
        'Error',
        'Failed to delete event. Please try again.',
        'error'
      );
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/admin/events/details/${eventId}`);
  };

  const handleApprove = async (eventId) => {
    try {
      const result = await Swal.fire({
        title: 'Approve Event',
        text: 'Are you sure you want to approve this event?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, approve it'
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:3000/events/approve/${eventId}`);
        setEvents(events.map(event => 
          event.event_id === eventId 
            ? { ...event, status: 'approved' }
            : event
        ));
        Swal.fire('Approved!', 'The event has been approved.', 'success');
      }
    } catch (error) {
      console.error('Error approving event:', error);
      Swal.fire('Error', 'Failed to approve event', 'error');
    }
  };

  const handleReject = async (eventId) => {
    try {
      const result = await Swal.fire({
        title: 'Reject Event',
        text: 'Are you sure you want to reject this event?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, reject it'
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:3000/events/reject/${eventId}`);
        setEvents(events.map(event => 
          event.event_id === eventId 
            ? { ...event, status: 'rejected' }
            : event
        ));
        Swal.fire('Rejected!', 'The event has been rejected.', 'success');
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      Swal.fire('Error', 'Failed to reject event', 'error');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Events Management</h1>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Events</option>
            <option value="pending">Pending Events</option>
            <option value="approved">Approved Events</option>
            <option value="rejected">Rejected Events</option>
          </select>
        </div>
      </div>
      <div className="events-grid">
        {filteredEvents.map((event) => (
          <div key={event.event_id} className={`event-card ${event.status}`}>
            <div className="event-status-badge">
              {event.status.toUpperCase()}
            </div>
            <div className="event-image">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.event_name} 
                  onError={(e) => {
                    e.target.src = '/event-placeholder.png';
                  }}
                />
              ) : (
                <div className="event-image-placeholder">📅</div>
              )}
            </div>
            <div className="event-info">
              <h3>{event.event_name}</h3>
              <p className="event-date">
                <span className="icon">📆</span>
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="event-time">
                <span className="icon">⏰</span>
                {event.start_time || 'N/A'} - {event.end_time || 'N/A'}
              </p>
              <p className="event-location">
                <span className="icon">📍</span>
                {event.location || 'No location specified'}
              </p>
              <p className="event-creator">
                <span className="icon">👤</span>
                Created by: {event.creator?.username}
              </p>
            </div>
            <div className="event-actions">
              <button
                className="action-button view"
                onClick={() => handleViewDetails(event.event_id)}
              >
                Details
              </button>
              {event.status === 'pending' && (
                <>
                  <button
                    className="action-button approve"
                    onClick={() => handleApprove(event.event_id)}
                  >
                    Approve
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => handleReject(event.event_id)}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                className="action-button delete"
                onClick={() => handleDelete(event.event_id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
