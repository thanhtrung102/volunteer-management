// src/pages/EventList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import EventCard from '../components/EventCard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [page, search, category, startDate, endDate]);

  async function fetchEvents() {
    const params = {
      page,
      limit: pageSize,
      q: search,
      category,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    };
    try {
      const { data } = await api.get('/api/events', { params });
      setEvents(data.items || data.events || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / pageSize));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container">
      <h1>Sự kiện</h1>
      <div className="filters">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm kiếm theo tên, địa điểm..." />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="">Tất cả chuyên mục</option>
          <option value="environment">Môi trường</option>
          <option value="education">Giáo dục</option>
          <option value="charity">Từ thiện</option>
        </select>
        <div className="date-range">
          <DatePicker selected={startDate} onChange={date => setStartDate(date)} placeholderText="Từ ngày" />
          <DatePicker selected={endDate} onChange={date => setEndDate(date)} placeholderText="Đến ngày" />
        </div>
      </div>

      <div className="grid-events">
        {events.length === 0 ? <p>Không có sự kiện</p> : events.map(ev => <EventCard key={ev._id || ev.id} event={ev} />)}
      </div>

      <div className="pagination">
        <button disabled={page<=1} onClick={() => setPage(p => p-1)}>Prev</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={() => setPage(p => p+1)}>Next</button>
      </div>
    </div>
  );
}
