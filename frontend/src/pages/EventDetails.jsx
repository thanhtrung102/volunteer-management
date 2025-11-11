// src/pages/EventDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import RegistrationModal from '../components/RegistrationModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    api.get(`/api/events/${id}`).then(r => setEvent(r.data)).catch(console.error);
  }, [id]);

  if (!event) return <div>Đang tải...</div>;

  const { organizer, participants = [], location } = event;

  return (
    <div className="container">
      <h1>{event.title}</h1>
      <img src={event.bannerUrl} alt={event.title} style={{maxWidth: '100%'}}/>
      <p>{event.description}</p>

      <div className="details-side">
        <h3>Thông tin tổ chức</h3>
        <p>{organizer?.name}</p>
        <p>{organizer?.contact}</p>

        <button onClick={() => setShowRegister(true)}>Đăng ký</button>

        {location?.lat && location?.lng && (
          <div style={{height: 300}}>
            <MapContainer center={[location.lat, location.lng]} zoom={13} style={{height: '100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.lat, location.lng]}>
                <Popup>{event.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <h4>Danh sách tham gia ({participants.length})</h4>
        <ul>
          {participants.map(p => <li key={p._id || p.id}>{p.name} {p.status && `(${p.status})`}</li>)}
        </ul>
      </div>

      {showRegister && <RegistrationModal eventId={id} onClose={() => setShowRegister(false)} onSuccess={() => { setShowRegister(false); /* refresh */ api.get(`/api/events/${id}`).then(r => setEvent(r.data)); }} />}
    </div>
  );
}
