import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, LogOut, User } from 'lucide-react';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Volunteer Management
                </h1>
                <p className="text-sm text-gray-500">Quản lý sự kiện</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Briefcase className="w-10 h-10 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng, {user?.name}! 👨‍💼
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Bạn đã đăng nhập thành công với vai trò <strong>Quản lý sự kiện</strong>.
            <br />
            Dashboard quản lý sẽ được xây dựng trong Phase 3.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Phase 1.1 hoàn thành - Authentication đang hoạt động!</span>
          </div>

          <div className="mt-8 max-w-md mx-auto card bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Thông tin tài khoản:
            </h3>
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="badge badge-info">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;