// ==================== frontend/src/pages/Events.jsx ====================
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useEvent } from '@/hooks/useEvents';
import EventFilters from '@/components/events/EventFilters';
import EventCard from '@/components/events/EventCard';
import EventDetail from '@/components/events/EventDetail';
import { Calendar } from 'lucide-react';

const Events = () => {
  const { events, loading, filters, updateFilters, clearFilters } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const { event: selectedEvent, registerEvent } = useEvent(selectedEventId);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEventClick = (event) => {
    setSelectedEventId(event._id);
  };

  const handleCloseDetail = () => {
    setSelectedEventId(null);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    const result = await registerEvent('Rất mong được tham gia!');
    setIsRegistering(false);
    
    if (result.success) {
      handleCloseDetail();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sự kiện</h1>
        <p className="text-gray-600 mt-1">
          Khám phá và đăng ký các hoạt động tình nguyện
        </p>
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClear={clearFilters}
      />

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sự kiện...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy sự kiện nào
          </h3>
          <p className="text-gray-600 mb-4">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </p>
          {(filters.search || filters.category) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onClick={handleEventClick}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-600">
            Hiển thị {events.length} sự kiện
          </p>
        </>
      )}

      {/* Event Detail Modal */}
      {selectedEventId && selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={handleCloseDetail}
          onRegister={handleRegister}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
};

export default Events;