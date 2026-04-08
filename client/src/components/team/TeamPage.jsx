import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Users } from 'lucide-react';
import { MemberCard } from './MemberCard';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonBlock } from '../common/SkeletonBlock';
import { useCourses } from '../../hooks/useCourses';
import { teamMembers } from '../../utils/constants';

const getCourseWeight = (course) => {
  const priorityWeight = { Low: 1, Medium: 2, High: 3 }[course.priority] || 1;
  const statusWeight = {
    Draft: 1,
    'In Development': 2,
    'In Review': 3,
    Published: 0
  }[course.status] || 0;
  const riskWeight = {
    Low: 0,
    Medium: 1,
    High: 2
  }[course.metrics?.riskLevel] || 0;

  return priorityWeight + statusWeight + riskWeight + (course.metrics?.isOverdue ? 2 : 0);
};

const getCapacityLabel = (utilization) => {
  if (utilization >= 100) {
    return 'Overloaded';
  }

  if (utilization >= 75) {
    return 'Stretched';
  }

  if (utilization >= 45) {
    return 'Balanced';
  }

  return 'Available';
};

export const TeamPage = () => {
  const navigate = useNavigate();
  const { courses, loading } = useCourses({
    search: '',
    status: 'All',
    department: 'All',
    assignee: 'All',
    priority: 'All'
  });

  const members = useMemo(
    () =>
      teamMembers.map((member) => {
        const assignedCourses = courses.filter((course) => course.assignee.name === member.name);
        const workloadScore = assignedCourses.reduce((sum, course) => sum + getCourseWeight(course), 0);
        const utilization = Math.min(100, Math.round((workloadScore / 12) * 100));
        const atRiskCount = assignedCourses.filter((course) => course.metrics?.riskLevel === 'High').length;
        const overdueCount = assignedCourses.filter((course) => course.metrics?.isOverdue).length;

        return {
          ...member,
          courseCount: assignedCourses.length,
          workloadScore,
          utilization,
          atRiskCount,
          overdueCount,
          capacityLabel: getCapacityLabel(utilization)
        };
      }),
    [courses]
  );

  const plannerSummary = useMemo(
    () => ({
      available: members.filter((member) => member.capacityLabel === 'Available').length,
      balanced: members.filter((member) => member.capacityLabel === 'Balanced').length,
      stretched: members.filter((member) => member.capacityLabel === 'Stretched').length,
      overloaded: members.filter((member) => member.capacityLabel === 'Overloaded').length
    }),
    [members]
  );

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[280px]" />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <EmptyState
        icon={Users}
        title="No team members available"
        description="Add team assignments to courses to populate the directory."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel animate-fade-in p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="label-small">Capacity Planner</p>
            <h3 className="mt-2 text-[16px] font-semibold text-copy">{members.length} active collaborators</h3>
            <p className="mt-2 text-copyMuted">
              Click any team member to jump into their assigned courses and triage workload.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge tone="success">{plannerSummary.available} available</Badge>
            <Badge tone="brand">{plannerSummary.balanced} balanced</Badge>
            <Badge tone="warning">{plannerSummary.stretched} stretched</Badge>
            <Badge tone="danger">{plannerSummary.overloaded} overloaded</Badge>
          </div>
        </div>
      </div>

      <div className="panel animate-fade-in flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-card bg-brand/10 text-brand">
          <Gauge className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-copy">Workload is capacity-weighted</p>
          <p className="mt-1 text-copyMuted">
            High-priority, in-review, overdue, and high-risk courses contribute more load to each teammate.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <MemberCard
            key={member.email}
            member={member}
            courseCount={member.courseCount}
            workloadScore={member.workloadScore}
            utilization={member.utilization}
            atRiskCount={member.atRiskCount}
            overdueCount={member.overdueCount}
            capacityLabel={member.capacityLabel}
            onSelect={() => navigate(`/courses?assignee=${encodeURIComponent(member.name)}`)}
          />
        ))}
      </div>
    </div>
  );
};
