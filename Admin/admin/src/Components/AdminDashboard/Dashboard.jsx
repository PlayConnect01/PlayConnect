import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCard from '../Cards/StatsCard';
import './Dashboard.css';

const Dashboard = () => {
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    events: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, eventsResponse , competetionResponse] = await Promise.all([
          axios.get('http://localhost:3000/users/count/total'),
          axios.get('http://localhost:3000/events/count/total'),
          axios.get('http://localhost:3000/competetion/count/total')
        ]);

        setStats({
          users: usersResponse.data.total,
          events: eventsResponse.data.total,
          competitions :competetionResponse.data.total
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchTomorrowEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/events/getTomorrowEvents');
        setTomorrowEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tomorrow events:', error);
        setLoading(false);
      }
    };

    fetchStats();
    fetchTomorrowEvents();
  }, []);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatsCard icon="👥" title="Total Users" value={stats.users} />
        <StatsCard icon="📅" title="Total Events" value={stats.events} />
        <StatsCard icon="🏆" title="Total Competitions" value={stats.competitions} />
        <StatsCard icon="💰" title="Total Sales" value="$1,234.56" />
      </div>
      
      <div className="dashboard-sections">
        <div className="events-section">
          <h2>Event of The Day</h2>
          <div className="events-content">
            {loading ? (
              <p>Loading events...</p>
            ) : tomorrowEvents.length > 0 ? (
              <div className="tomorrow-events-grid">
                {tomorrowEvents.map((event) => (
                  <div key={event.event_id} className="event-card">
                    <div className="event-time-label">{event.timeLabel}</div>
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
                      <p>
                        <span className="icon">⏰</span>
                        {event.start_time} - {event.end_time}
                      </p>
                      <p>
                        <span className="icon">📍</span>
                        {event.location}
                      </p>
                      <p>
                        <span className="icon">👤</span>
                        Created by: {event.creator?.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No events scheduled for tomorrow</p>
            )}
          </div>
        </div>
        
        <div className="competition-section">
          <h2>Competition of The Day</h2>
          <div className="competition-content">
            {/* Competition content will go here */}
          </div>
        </div>
        
        <div className="top-users-section">
          <h2>Top Users</h2>
          <div className="top-users-content">
            {/* Top users content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
