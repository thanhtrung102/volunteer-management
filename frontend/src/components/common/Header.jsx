// ============= src/components/common/Header.jsx =============
import { Heart, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useNotifications } from '@context/NotificationContext';

export const Header = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Volunteer</h1>
              <p className="text-xs text-gray-600">Tình nguyện vì cộng đồng</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden sm:block">
              Xin chào, <strong>{user?.name}</strong>
            </span>

            <Link to="/notifications" className="relative">
              <Bell className="w-6 h-6 text-gray-600 hover:text-primary-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="w-10 h-10 bg-gradient-to-br from-primary-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:opacity-90 transition"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};