// ============= src/layouts/MainLayout.jsx =============
import { Header } from '@components/common/Header';
import { Sidebar } from '@components/common/Sidebar';
import { BottomNav } from '@components/common/BottomNav';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default MainLayout;
