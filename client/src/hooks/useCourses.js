import { useEffect, useMemo, useState } from 'react';
import { mockCourses } from '../utils/mockData';

const applyClientFilters = (courses, filters) => {
  let result = [...courses];

  if (filters.status && filters.status !== 'All') {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.department && filters.department !== 'All') {
    result = result.filter((c) => c.department === filters.department);
  }

  if (filters.assignee && filters.assignee !== 'All') {
    result = result.filter((c) => c.assignee.name === filters.assignee);
  }

  if (filters.priority && filters.priority !== 'All') {
    result = result.filter((c) => c.priority === filters.priority);
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    result = result.filter((c) => regex.test(c.title) || regex.test(c.code));
  }

  return result;
};

export const useCourses = (filters = {}) => {
  const [allCourses, setAllCourses] = useState(() => structuredClone(mockCourses));
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const courses = useMemo(
    () => applyClientFilters(allCourses, filters),
    [allCourses, filters.assignee, filters.department, filters.priority, filters.search, filters.status]
  );

  const getCourse = async (courseId) => {
    const course = allCourses.find((c) => c._id === courseId);
    if (!course) throw new Error('Course not found.');
    return structuredClone(course);
  };

  const createCourse = async (payload) => {
    const newCourse = {
      _id: `mock-${Date.now()}`,
      ...payload,
      blockers: [],
      accessibility: { captions: 0, altText: 0, documents: 0, checklist: 0, flaggedIssues: [] },
      automation: { reviewAutoAssigned: false, lastAutoAssignedAt: null },
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      metrics: { healthScore: 55, riskLevel: 'Medium', accessibilityProgress: 0, unresolvedBlockerCount: 0, unresolvedBlockers: [], isOverdue: false, recommendation: 'Link supporting assets to reduce launch risk.' }
    };
    setAllCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = async (courseId, payload) => {
    let updated;
    setAllCourses((prev) =>
      prev.map((c) => {
        if (c._id === courseId) {
          updated = { ...c, ...payload, updatedAt: new Date().toISOString() };
          return updated;
        }
        return c;
      })
    );
    return updated;
  };

  const deleteCourse = async (courseId) => {
    setAllCourses((prev) => prev.filter((c) => c._id !== courseId));
    return { message: 'Course deleted successfully.' };
  };

  const updateCourseStatus = async (courseId, status) => {
    let updated;
    setAllCourses((prev) =>
      prev.map((c) => {
        if (c._id === courseId) {
          updated = { ...c, status, updatedAt: new Date().toISOString() };
          return updated;
        }
        return c;
      })
    );
    return updated;
  };

  return {
    courses,
    loading,
    error,
    refetch: () => {},
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus
  };
};
