// ==================== frontend/src/components/events/EventFilters.jsx ====================
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES } from '@/utils/constants';

const EventFilters = ({ filters, onFilterChange, onClear }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setLocalFilters(prev => ({ ...prev, search }));
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange({ search });
    }, 500);
  };

  const handleCategoryChange = (category) => {
    setLocalFilters(prev => ({ ...prev, category }));
    onFilterChange({ category });
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const hasActiveFilters = localFilters.search || localFilters.category;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sự kiện..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition ${
            showFilters || hasActiveFilters
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Lọc</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition"
            title="Xóa bộ lọc"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Danh mục</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  localFilters.category === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
