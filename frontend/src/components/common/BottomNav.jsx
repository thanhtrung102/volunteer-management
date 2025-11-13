// ============= src/components/common/BottomNav.jsx =============
import { Home, Calendar, Clock, Bell, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/events', label: 'Sự kiện', icon: Calendar },
  { to: '/registrations', label: 'Lịch sử', icon: Clock },
  { to: '/notifications', label: 'Thông báo', icon: Bell },
  { to: '/profile', label: 'Cá nhân', icon: User },
];

export const BottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-2 ${
                  isActive ? 'text-primary-600' : 'text-gray-600'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
