import { ChevronLeft, ChevronRight, Grid2x2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../utils/api';
import { navigationItems, secondaryNavItem } from '../../utils/constants';

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();
  const [activeCourseCount, setActiveCourseCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const overview = await api.get('/reports/overview');
        setActiveCourseCount(overview.stats.activeCourses);
      } catch {
        setActiveCourseCount(0);
      }
    };

    fetchCount();
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/55 bg-white/62 backdrop-blur-2xl transition-all duration-150 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/50 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-brand to-[#8c9cff] text-white shadow-float">
          <Grid2x2 className="h-4 w-4" />
        </div>
        {!sidebarCollapsed ? (
          <div>
            <span className="block text-[18px] font-semibold tracking-[-0.02em] text-copy">CourseOps</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-copyMuted">Operations Canvas</span>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            collapsed={sidebarCollapsed}
            badge={item.label === 'Courses' ? activeCourseCount : null}
          />
        ))}
      </nav>

      <div className="border-t border-white/50 px-3 py-4">
        <div className="mb-3 flex h-10 items-center rounded-control px-3 text-copyMuted transition hover:bg-white/65">
          <secondaryNavItem.icon className="h-4 w-4" />
          {!sidebarCollapsed ? <span className="ml-3 text-[14px] font-medium">{secondaryNavItem.label}</span> : null}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-full items-center rounded-control px-3 text-copyMuted transition hover:bg-white/65 hover:text-copy"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!sidebarCollapsed ? <span className="ml-3 text-[14px] font-medium">Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ item, collapsed, badge }) => (
  <NavLink
    to={item.path}
    end={item.path === '/'}
    className={({ isActive }) =>
      `flex h-10 items-center rounded-control px-3 transition ${
        isActive
          ? 'bg-white/78 text-brand shadow-[0_12px_34px_-24px_rgba(59,91,219,0.45)]'
          : 'text-copyMuted hover:bg-white/62 hover:text-copy'
      }`
    }
  >
    <item.icon className="h-4 w-4 shrink-0" />
    {!collapsed ? <span className="ml-3 text-[14px] font-medium">{item.label}</span> : null}
    {!collapsed && badge ? (
      <span className="ml-auto rounded-control border border-white/60 bg-white/55 px-2 py-0.5 text-[12px] font-medium text-copyMuted">
        {badge}
      </span>
    ) : null}
  </NavLink>
);

SidebarLink.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired
  }).isRequired,
  collapsed: PropTypes.bool.isRequired,
  badge: PropTypes.number
};
