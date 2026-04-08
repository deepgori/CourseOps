import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = window.localStorage.getItem('courseops-sidebar');
    return saved ? JSON.parse(saved) : window.innerWidth < 1024;
  });
  const [toasts, setToasts] = useState([]);
  const [courseAssigneeFilter, setCourseAssigneeFilter] = useState('All');

  useEffect(() => {
    window.localStorage.setItem('courseops-sidebar', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((current) => !current),
      toasts,
      showToast,
      removeToast,
      courseAssigneeFilter,
      setCourseAssigneeFilter
    }),
    [courseAssigneeFilter, sidebarCollapsed, toasts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider.');
  }

  return context;
};

