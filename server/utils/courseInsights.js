const getAccessibilityProgress = (accessibility = {}) => {
  const values = [
    accessibility.captions ?? 0,
    accessibility.altText ?? 0,
    accessibility.documents ?? 0,
    accessibility.checklist ?? 0
  ];

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getUnresolvedBlockers = (blockers = []) => blockers.filter((blocker) => !blocker.resolved);

const getBlockerPenalty = (blockers = []) =>
  blockers.reduce((penalty, blocker) => {
    if (blocker.resolved) {
      return penalty;
    }

    if (blocker.severity === 'High') {
      return penalty + 14;
    }

    if (blocker.severity === 'Medium') {
      return penalty + 9;
    }

    return penalty + 5;
  }, 0);

export const getCourseTarget = (course) => `${course.code} - ${course.title}`;

export const getCourseMetrics = (course) => {
  const accessibilityProgress = getAccessibilityProgress(course.accessibility);
  const unresolvedBlockers = getUnresolvedBlockers(course.blockers);
  const isOverdue =
    course.status !== 'Published' &&
    course.dueDate &&
    new Date(course.dueDate).getTime() < Date.now();

  const assetPenalty = (course.assets?.length || 0) === 0 ? 15 : (course.assets?.length || 0) < 2 ? 8 : 0;
  const accessibilityPenalty = Math.max(0, Math.round((80 - accessibilityProgress) / 3));
  const duePenalty = isOverdue ? 22 : 0;
  const draftPenalty = course.status === 'Draft' ? 8 : 0;
  const inReviewBoost = course.status === 'In Review' && course.automation?.reviewAutoAssigned ? 4 : 0;

  const healthScore = Math.max(
    18,
    Math.min(
      99,
      100 - getBlockerPenalty(unresolvedBlockers) - assetPenalty - accessibilityPenalty - duePenalty - draftPenalty + inReviewBoost
    )
  );

  const riskLevel = healthScore < 50 ? 'High' : healthScore < 75 ? 'Medium' : 'Low';

  let recommendation = 'Ready for the next production handoff.';

  if (isOverdue) {
    recommendation = 'Reconfirm timeline and clear overdue work before the next milestone.';
  } else if (unresolvedBlockers.length) {
    recommendation = 'Resolve blockers to keep the production path clear.';
  } else if (accessibilityProgress < 80) {
    recommendation = 'Complete accessibility remediation before final approval.';
  } else if ((course.assets?.length || 0) < 2) {
    recommendation = 'Link more supporting assets to reduce launch risk.';
  }

  return {
    healthScore,
    riskLevel,
    accessibilityProgress,
    unresolvedBlockerCount: unresolvedBlockers.length,
    unresolvedBlockers,
    isOverdue,
    recommendation
  };
};

export const decorateCourse = (courseRecord) => {
  const course = typeof courseRecord.toObject === 'function' ? courseRecord.toObject() : { ...courseRecord };

  return {
    ...course,
    metrics: getCourseMetrics(course)
  };
};
