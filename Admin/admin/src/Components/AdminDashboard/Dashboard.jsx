import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdAccessTime, MdLocationOn, MdPerson, MdSportsSoccer, MdEmojiEvents } from 'react-icons/md';
import { BsCalendarEvent } from 'react-icons/bs';
import StatsCard from '../Cards/StatsCard';
import './Dashboard.css';

const Dashboard = () => {
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    competitions: 0
  });
  const [todayTournaments, setTodayTournaments] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, eventsResponse, competetionResponse] = await Promise.all([
          axios.get('http://localhost:3000/users/count/total'),
          axios.get('http://localhost:3000/events/count/total'),
          axios.get('http://localhost:3000/competetion/count/total')
        ]);

        setStats({
          users: usersResponse.data.total,
          events: eventsResponse.data.total,
          competitions: competetionResponse.data.total
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

    const fetchTodayTournaments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/competetion/today');
        setTodayTournaments(response.data);
      } catch (error) {
        console.error('Error fetching today tournaments:', error);
      }
    };

    const fetchTopPlayers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/AllUsers');
        console.log('Raw users data:', response.data.users); // Debug log

        const sortedUsers = response.data.users
          .filter(user => !user.is_banned && !user.is_blocked)
          .sort((a, b) => {
            // Convert points to numbers and handle null/undefined
            const pointsA = Number(a.points) || 0;
            const pointsB = Number(b.points) || 0;
            return pointsB - pointsA;
          })
          .slice(0, 5)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            points: Number(user.points) || 0 // Ensure points is a number
          }));

        console.log('Sorted users:', sortedUsers); // Debug log
        setTopPlayers(sortedUsers);
      } catch (error) {
        console.error('Error fetching top players:', error);
      }
    };

    fetchStats();
    fetchTomorrowEvents();
    fetchTodayTournaments();
    fetchTopPlayers();
  }, []);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatsCard title="Total Users" value={stats.users} />
        <StatsCard title="Total Events" value={stats.events} />
        <StatsCard title="Total Competitions" value={stats.competitions} />
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
                        <div className="event-image-placeholder">
                          <BsCalendarEvent size={24} />
                        </div>
                      )}
                    </div>
                    <div className="event-info">
                      <h3>{event.event_name}</h3>
                      <p>
                        <MdAccessTime className="event-icon" />
                        {event.start_time} - {event.end_time}
                      </p>
                      <p>
                        <MdLocationOn className="event-icon" />
                        {event.location}
                      </p>
                      <p>
                        <MdPerson className="event-icon" />
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
            {todayTournaments.length > 0 ? (
              <div className="tournament-grid">
                {todayTournaments.map((tournament) => (
                  <div key={tournament.tournament_id} className="tournament-card">
                    <div className="tournament-time-label">{tournament.timeLabel}</div>
                    <div className="tournament-info">
                      <h3>{tournament.tournament_name}</h3>
                      <p>
                        <MdSportsSoccer className="tournament-icon" />
                        {tournament.sport?.name}
                      </p>
                      <p>
                        <MdAccessTime className="tournament-icon" />
                        {new Date(tournament.start_date).toLocaleTimeString()}
                      </p>
                      <p>
                        <MdPerson className="tournament-icon" />
                        Created by: {tournament.creator?.username}
                      </p>
                      <p>
                        <MdEmojiEvents className="tournament-icon" />
                        Points: {tournament.point_reward}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tournaments scheduled for today</p>
            )}
          </div>
        </div>
        
        <div className="top-users-section">
          <h2>Top Players</h2>
          <div className="top-players-list">
            {topPlayers.map((player) => (
              <div key={player.user_id} className="player-card">
                <div className="player-rank">#{player.rank}</div>
                <div className="player-avatar">
                  <img 
                    src={player.profile_picture || '/default-avatar.png'} 
                    alt={player.username}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <div className="player-info">
                  <h3>{player.username}</h3>
                  <p>{player.points} points</p>
                  {player.achievements && player.achievements.length > 0 && (
                    <div className="achievements">
                      <small>Recent achievement: {player.achievements[0].achievement_name}</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;