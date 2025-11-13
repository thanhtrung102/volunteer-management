// ==================== frontend/src/components/events/EventCard.jsx ====================
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate, formatNumber } from '@/utils/formatters';
import { getCategoryInfo } from '@/utils/constants';

const EventCard = ({ event, onClick }) => {
  const category = getCategoryInfo(event.category);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const fillPercentage = (event.currentParticipants / event.maxParticipants) * 100;

  return (
    <div 
      onClick={() => onClick(event)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      {/* Image/Icon */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
        <div className="text-7xl group-hover:scale-110 transition-transform">
          {category.icon}
        </div>
        {isFull && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Đã đầy
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {category.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span>{formatDate(event.startDate, 'short')}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span className="truncate">{event.location?.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span>
              {formatNumber(event.currentParticipants)}/{formatNumber(event.maxParticipants)} người
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Đã đăng ký</span>
            <span>{Math.round(fillPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                fillPercentage >= 100 
                  ? 'bg-red-500' 
                  : fillPercentage >= 80 
                  ? 'bg-yellow-500' 
                  : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full mt-4 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default EventCard;
