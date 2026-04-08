import { useEffect, useState } from 'react';
import { mockOverview, mockCompletion, mockDepartments, mockActivity } from '../utils/mockData';

export const useReports = () => {
  const [data, setData] = useState({
    overview: null,
    completion: [],
    departments: { breakdown: [], summary: [] },
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        overview: mockOverview,
        completion: mockCompletion,
        departments: mockDepartments,
        activity: mockActivity.slice(0, 10)
      });
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const exportCsv = async () => {
    const rows = mockDepartments.summary.map((s) =>
      [s.department, s.totalCourses, s.completed, s.inProgress, s.overdue, `${s.completionRate}%`, s.averageHealth, `${s.averageAccessibility}%`].join(',')
    );
    const csv = ['Department,Total Courses,Completed,In Progress,Overdue,Completion Rate,Average Health,Accessibility Progress', ...rows].join('\n');
    return new Blob([csv], { type: 'text/csv' });
  };

  return {
    ...data,
    loading,
    error,
    refetch: () => {},
    exportCsv
  };
};
