import { Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toast } from '../common/Toast';

export const AppShell = () => {
  const { sidebarCollapsed } = useAppContext();

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-copy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#ffd9b7]/55 blur-3xl" />
        <div className="absolute right-[-80px] top-[120px] h-[300px] w-[300px] rounded-full bg-[#d9e4ff]/70 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[26%] h-[280px] w-[280px] rounded-full bg-[#f4d7ff]/45 blur-3xl" />
      </div>
      <Sidebar />
      <div className={`relative transition-all duration-150 ease-in-out ${sidebarCollapsed ? 'ml-16' : 'ml-[260px]'}`}>
        <TopBar />
        <main className="mx-auto w-full max-w-[1280px] px-8 py-8">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};
