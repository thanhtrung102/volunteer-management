// src/components/EventCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <img src={event.bannerUrl || '/placeholder.jpg'} alt={event.title} />
      <div className="body">
        <h3><Link to={`/events/${event._id || event.id}`}>{event.title}</Link></h3>
        <p>{event.shortDescription || event.description?.slice(0,120)}</p>
        <div className="meta">
          <span>{new Date(event.startDate).toLocaleString()}</span>
          <span>{event.location?.name || event.locationAddress}</span>
        </div>
      </div>
    </div>
  );
}
