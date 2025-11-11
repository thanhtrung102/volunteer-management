import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/dashboardService';
import { 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getVolunteerDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError('Không thể tải dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      tree_planting: 'bg-green-100 text-green-700',
      cleanup: 'bg-blue-100 text-blue-700',
      charity: 'bg-pink-100 text-pink-700',
      education: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      tree_planting: 'Trồng cây',
      cleanup: 'Dọn rác',
      charity: 'Từ thiện',
      education: 'Giáo dục',
      other: 'Khác',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-12 h-12 border-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={loadDashboard} className="btn btn-primary mt-4">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Xin chào, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Cùng nhau tạo nên sự thay đổi tích cực cho cộng đồng
            </p>
          </div>
          {dashboard?.stats?.unreadNotifications > 0 && (
            <Link
              to="/volunteer/notifications"
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">
                {dashboard.stats.unreadNotifications} thông báo mới
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Tổng đăng ký</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">
                {dashboard?.stats?.totalRegistrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Đã hoàn thành</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {dashboard?.stats?.completedEvents || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Sắp diễn ra</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {dashboard?.stats?.upcomingCount || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Hoạt động mới</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {dashboard?.eventsWithActivity?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Sự kiện mới công bố
            </h2>
            <Link to="/volunteer/events" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.newEvents?.length > 0 ? (
              dashboard.newEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/volunteer/events/${event._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.startDate), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.currentParticipants}/{event.maxParticipants}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${getCategoryColor(event.category)}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có sự kiện mới</p>
            )}
          </div>
        </div>

        {/* Trending Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Sự kiện thu hút
            </h2>
            <Link to="/volunteer/events" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.trendingEvents?.length > 0 ? (
              dashboard.trendingEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/volunteer/events/${event._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.startDate), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.currentParticipants}/{event.maxParticipants}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {event.stats?.recentActivityCount || 0}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có sự kiện nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Sự kiện sắp diễn ra
            </h2>
            <Link to="/volunteer/registrations" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.upcomingEvents?.length > 0 ? (
              dashboard.upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/volunteer/events/${event._id}`}
                  className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {event.location?.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 mt-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(event.startDate), 'dd/MM/yyyy - HH:mm', { locale: vi })}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Bạn chưa đăng ký sự kiện nào
              </p>
            )}
          </div>
        </div>

        {/* Events with Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Có hoạt động mới
            </h2>
          </div>

          <div className="space-y-3">
            {dashboard?.eventsWithActivity?.length > 0 ? (
              dashboard.eventsWithActivity.map((event) => (
                <Link
                  key={event._id}
                  to={`/volunteer/events/${event._id}`}
                  className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.stats?.totalPosts || 0} bài viết · {event.stats?.totalComments || 0} bình luận
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-600" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có hoạt động mới
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;