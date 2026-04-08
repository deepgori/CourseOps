/* ─── Static mock data for the CourseOps demo deployment ────────────────
   Mirrors the structures produced by server/seed/seedData.js,
   server/controllers/reportController.js  and  courseInsights.js
   so every UI surface renders realistically with zero backend.
   ────────────────────────────────────────────────────────────────────── */

import { subDays, subWeeks, format, startOfMonth, subMonths } from 'date-fns';
import { teamMembers } from './constants';

// ── helpers ──────────────────────────────────────────────────────────
const id = (index) => `mock-${String(index).padStart(4, '0')}`;

const getAccessibilityProgress = (a = {}) =>
  Math.round(((a.captions ?? 0) + (a.altText ?? 0) + (a.documents ?? 0) + (a.checklist ?? 0)) / 4);

const getBlockerPenalty = (blockers = []) =>
  blockers.reduce((p, b) => {
    if (b.resolved) return p;
    if (b.severity === 'High') return p + 14;
    if (b.severity === 'Medium') return p + 9;
    return p + 5;
  }, 0);

const decorateCourse = (course) => {
  const accessibilityProgress = getAccessibilityProgress(course.accessibility);
  const unresolvedBlockers = (course.blockers || []).filter((b) => !b.resolved);
  const isOverdue =
    course.status !== 'Published' && course.dueDate && new Date(course.dueDate).getTime() < Date.now();

  const assetPenalty = (course.assets?.length || 0) === 0 ? 15 : (course.assets?.length || 0) < 2 ? 8 : 0;
  const accessibilityPenalty = Math.max(0, Math.round((80 - accessibilityProgress) / 3));
  const duePenalty = isOverdue ? 22 : 0;
  const draftPenalty = course.status === 'Draft' ? 8 : 0;
  const inReviewBoost = course.status === 'In Review' && course.automation?.reviewAutoAssigned ? 4 : 0;
  const healthScore = Math.max(
    18,
    Math.min(99, 100 - getBlockerPenalty(unresolvedBlockers) - assetPenalty - accessibilityPenalty - duePenalty - draftPenalty + inReviewBoost)
  );
  const riskLevel = healthScore < 50 ? 'High' : healthScore < 75 ? 'Medium' : 'Low';

  let recommendation = 'Ready for the next production handoff.';
  if (isOverdue) recommendation = 'Reconfirm timeline and clear overdue work before the next milestone.';
  else if (unresolvedBlockers.length) recommendation = 'Resolve blockers to keep the production path clear.';
  else if (accessibilityProgress < 80) recommendation = 'Complete accessibility remediation before final approval.';
  else if ((course.assets?.length || 0) < 2) recommendation = 'Link more supporting assets to reduce launch risk.';

  return {
    ...course,
    metrics: {
      healthScore,
      riskLevel,
      accessibilityProgress,
      unresolvedBlockerCount: unresolvedBlockers.length,
      unresolvedBlockers,
      isOverdue,
      recommendation
    }
  };
};

// ── accessibility profiles ──────────────────────────────────────────
const accessibilityProfiles = [
  { captions: 78, altText: 64, documents: 56, checklist: 72, flaggedIssues: ['Missing alt text on estuary image set'] },
  { captions: 68, altText: 82, documents: 74, checklist: 70, flaggedIssues: ['Transcript review still pending'] },
  { captions: 24, altText: 18, documents: 36, checklist: 28, flaggedIssues: ['Narration script not yet caption-ready'] },
  { captions: 100, altText: 94, documents: 92, checklist: 98, flaggedIssues: [] },
  { captions: 52, altText: 61, documents: 40, checklist: 55, flaggedIssues: ['Two diagrams need long descriptions'] },
  { captions: 31, altText: 44, documents: 48, checklist: 37, flaggedIssues: ['Lab PDF remediation in progress'] },
  { captions: 100, altText: 96, documents: 100, checklist: 96, flaggedIssues: [] },
  { captions: 84, altText: 73, documents: 79, checklist: 82, flaggedIssues: ['Peer review rubric needs table headers'] },
  { captions: 59, altText: 66, documents: 63, checklist: 61, flaggedIssues: ['Voiceover captions under revision'] },
  { captions: 22, altText: 48, documents: 34, checklist: 29, flaggedIssues: ['Finance worksheet not remediated yet'] },
  { captions: 94, altText: 90, documents: 88, checklist: 92, flaggedIssues: [] },
  { captions: 76, altText: 62, documents: 71, checklist: 69, flaggedIssues: ['Accessibility audit follow-up requested'] },
  { captions: 28, altText: 52, documents: 60, checklist: 35, flaggedIssues: ['Field journal template needs heading structure'] },
  { captions: 98, altText: 95, documents: 91, checklist: 97, flaggedIssues: [] },
  { captions: 71, altText: 68, documents: 73, checklist: 70, flaggedIssues: ['Bedside checklist PDF awaiting final pass'] }
];

const blockerProfiles = [
  [{ label: 'Awaiting faculty coral bleaching case approval', severity: 'High', resolved: false }],
  [{ label: 'Animation asset package needs QA review', severity: 'Medium', resolved: false }],
  [{ label: 'Narration script revision from faculty is late', severity: 'High', resolved: false }],
  [],
  [{ label: 'Caption file for motion graphic needs remastering', severity: 'Medium', resolved: false }],
  [{ label: 'Safety compliance checklist requires dean sign-off', severity: 'High', resolved: false }],
  [],
  [{ label: 'Peer review workflow still needs final rubric copy', severity: 'Low', resolved: false }],
  [{ label: 'Simulation intro video is still rendering', severity: 'Medium', resolved: false }],
  [{ label: 'Market scenario storyboard is not approved yet', severity: 'Medium', resolved: false }],
  [],
  [{ label: 'Accessibility pass for lab video is still open', severity: 'High', resolved: false }],
  [{ label: 'Satellite imagery rights confirmation pending', severity: 'Medium', resolved: false }],
  [],
  [{ label: 'One downloadable bedside form is missing alt text', severity: 'Low', resolved: false }]
];

// ── raw course seeds ────────────────────────────────────────────────
const courseSeeds = [
  { code: 'BIO 201', title: 'Marine Ecosystem Analysis', description: 'Rebuild the online lab sequence and scenario-based assessments for marine habitats and biodiversity trends.', department: 'Biology', status: 'In Review', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), 2).toISOString(), notes: 'Faculty requested an additional coral bleaching case study before publishing.' },
  { code: 'COP 3530', title: 'Data Structures & Algorithms', description: 'Refresh lecture media, coding labs, and weekly problem sets for the next accelerated term.', department: 'Computer Science', status: 'In Development', priority: 'High', assignee: teamMembers[1], dueDate: subDays(new Date(), -10).toISOString(), notes: 'Animation assets still need QA sign-off.' },
  { code: 'NUR 310', title: 'Clinical Assessment Methods', description: 'Package patient simulation walkthroughs and formative checks for remote clinical readiness.', department: 'Nursing', status: 'Draft', priority: 'Medium', assignee: teamMembers[2], dueDate: subDays(new Date(), 14).toISOString(), notes: 'Waiting on revised faculty narration script.' },
  { code: 'MAN 4720', title: 'Strategic Management Capstone', description: 'Finalize capstone milestones, board presentation assets, and leadership reflection rubrics.', department: 'Business', status: 'Published', priority: 'High', assignee: teamMembers[4], dueDate: subDays(new Date(), -30).toISOString(), notes: 'Published for the spring capstone cohort.' },
  { code: 'PSY 320', title: 'Cognitive Research Design', description: 'Align research design activities with new department accessibility guidelines and review workflow.', department: 'Psychology', status: 'In Development', priority: 'Medium', assignee: teamMembers[5], dueDate: subDays(new Date(), -6).toISOString(), notes: 'Design pack needs caption updates before QA.' },
  { code: 'EGN 4101', title: 'Applied Systems Engineering Lab', description: 'Convert on-campus lab activities into video-supported digital simulations and safety modules.', department: 'Engineering', status: 'Draft', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), 5).toISOString(), notes: 'Safety compliance review scheduled with lab coordinator.' },
  { code: 'BIO 340', title: 'Genetics and Society', description: 'Update policy debate assignments and faculty mini-lectures for the summer term.', department: 'Biology', status: 'Published', priority: 'Low', assignee: teamMembers[0], dueDate: subDays(new Date(), -40).toISOString(), notes: 'Completed and handed off to faculty support.' },
  { code: 'CEN 4020', title: 'Software Engineering Studio', description: 'Refactor sprint templates, rubrics, and project onboarding for distributed student teams.', department: 'Computer Science', status: 'In Review', priority: 'Medium', assignee: teamMembers[3], dueDate: subDays(new Date(), 1).toISOString(), notes: 'Awaiting QA notes on peer review flow.' },
  { code: 'NUR 402', title: 'Community Health Interventions', description: 'Launch community case simulations with updated voiceover and downloadable field packets.', department: 'Nursing', status: 'In Development', priority: 'Medium', assignee: teamMembers[2], dueDate: subDays(new Date(), -12).toISOString(), notes: 'Video intro is in final edit.' },
  { code: 'FIN 3403', title: 'Managerial Finance', description: 'Replace dated examples with current market scenarios and new problem walkthrough videos.', department: 'Business', status: 'Draft', priority: 'Low', assignee: teamMembers[4], dueDate: subDays(new Date(), 18).toISOString(), notes: 'Budget visualization module still in storyboard.' },
  { code: 'PSY 450', title: 'Applied Behavioral Analytics', description: 'Consolidate analytics dashboards, faculty notes, and learner feedback improvements.', department: 'Psychology', status: 'Published', priority: 'Medium', assignee: teamMembers[5], dueDate: subDays(new Date(), -25).toISOString(), notes: 'Strong student adoption in the pilot run.' },
  { code: 'EEL 3008', title: 'Circuit Design Fundamentals', description: 'Produce new lab capture media and streamline weekly build submission instructions.', department: 'Engineering', status: 'In Review', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), -1).toISOString(), notes: 'Lab camera footage approved; waiting on accessibility pass.' },
  { code: 'BIO 410', title: 'Wetlands Field Methods', description: 'Create field observation journals and satellite imagery walkthroughs for hybrid learners.', department: 'Biology', status: 'Draft', priority: 'Medium', assignee: teamMembers[0], dueDate: subDays(new Date(), 9).toISOString(), notes: 'Photography assets are already linked.' },
  { code: 'CAP 4630', title: 'Artificial Intelligence Systems', description: 'Rework assessment banks and simulation labs for the AI systems sequence.', department: 'Computer Science', status: 'Published', priority: 'High', assignee: teamMembers[1], dueDate: subDays(new Date(), -60).toISOString(), notes: 'Published after accelerated QA cycle.' },
  { code: 'NUR 215', title: 'Foundations of Patient Care', description: 'Refresh clinical orientation content and add new downloadable bedside checklists.', department: 'Nursing', status: 'In Development', priority: 'Low', assignee: teamMembers[2], dueDate: subDays(new Date(), 12).toISOString(), notes: 'Pilot feedback showed strong engagement with short-form clips.' }
];

// ── asset seeds ─────────────────────────────────────────────────────
const assetSeeds = [
  { originalName: 'bio-ecosystem-reference.png', type: 'image', extension: 'PNG', metadata: { resolution: '1600x900', duration: 'Not available' } },
  { originalName: 'cs-algorithms-map.png', type: 'image', extension: 'PNG', metadata: { resolution: '1440x810', duration: 'Not available' } },
  { originalName: 'nursing-lab-photo.jpg', type: 'image', extension: 'JPG', metadata: { resolution: '1280x720', duration: 'Not available' } },
  { originalName: 'business-capstone-board.jpg', type: 'image', extension: 'JPG', metadata: { resolution: '1920x1080', duration: 'Not available' } },
  { originalName: 'psy-research-framework.png', type: 'image', extension: 'PNG', metadata: { resolution: '1600x900', duration: 'Not available' } },
  { originalName: 'engineering-lab-checklist.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'bio201-lecture-slides.pptx', type: 'document', extension: 'PPTX', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'nursing-sim-walkthrough.mp4', type: 'video', extension: 'MP4', url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', metadata: { resolution: '1920x1080', duration: '00:05' } },
  { originalName: 'course-onboarding-overview.mov', type: 'video', extension: 'MOV', url: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', metadata: { resolution: '1280x720', duration: '00:10' } },
  { originalName: 'nur310-assessment-guide.docx', type: 'document', extension: 'DOCX', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'man4720-case-study.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'cop3530-recursion-notes.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'data-structures-diagram.png', type: 'image', extension: 'PNG', metadata: { resolution: '1500x844', duration: 'Not available' } },
  { originalName: 'engr-safety-brief.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'psy320-discussion-prompts.docx', type: 'document', extension: 'DOCX', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'egn4101-lab-handout.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'bio-field-footage.mp4', type: 'video', extension: 'MP4', url: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4', metadata: { resolution: '1920x1080', duration: '00:15' } },
  { originalName: 'course-outline-template.docx', type: 'document', extension: 'DOCX', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'assessment-rubric.pdf', type: 'document', extension: 'PDF', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'qa-review-checklist.docx', type: 'document', extension: 'DOCX', metadata: { resolution: 'Not available', duration: 'Not available' } }
];

// ── build assets ────────────────────────────────────────────────────
export const mockAssets = assetSeeds.map((seed, index) => ({
  _id: id(100 + index),
  fileName: seed.originalName,
  originalName: seed.originalName,
  type: seed.type,
  extension: seed.extension,
  mimeType: seed.type === 'image' ? 'image/png' : seed.type === 'video' ? 'video/mp4' : 'application/octet-stream',
  size: 1024 * (index + 4),
  url: seed.url || '',
  metadata: seed.metadata,
  linkedCourses: [],
  createdAt: subDays(new Date(), 20 - index).toISOString(),
  updatedAt: subDays(new Date(), 20 - index).toISOString()
}));

// ── build courses ───────────────────────────────────────────────────
const rawCourses = courseSeeds.map((seed, index) => {
  const courseAssets = mockAssets.slice(index % 5, (index % 5) + 3);
  return {
    _id: id(index),
    ...seed,
    blockers: blockerProfiles[index],
    accessibility: {
      ...accessibilityProfiles[index],
      lastAuditedAt: subDays(new Date(), 2 + index).toISOString()
    },
    automation:
      seed.status === 'In Review'
        ? { reviewAutoAssigned: true, lastAutoAssignedAt: subDays(new Date(), index + 1).toISOString() }
        : { reviewAutoAssigned: false, lastAutoAssignedAt: null },
    assets: courseAssets,
    createdAt: subWeeks(new Date(), 10 - Math.min(index, 9)).toISOString(),
    updatedAt: subDays(new Date(), index).toISOString(),
    publishedAt: seed.status === 'Published' ? subDays(new Date(), 15 + index).toISOString() : null
  };
});

// Link assets back to courses
rawCourses.forEach((course) => {
  course.assets.forEach((asset) => {
    const target = mockAssets.find((a) => a._id === asset._id);
    if (target && !target.linkedCourses.some((lc) => lc._id === course._id)) {
      target.linkedCourses.push({ _id: course._id, code: course.code, title: course.title });
    }
  });
});

export const mockCourses = rawCourses.map((c) => decorateCourse(c));

// ── activity feed ───────────────────────────────────────────────────
const activityTemplates = ['moved to In Review', 'moved to In Development', 'uploaded asset', 'created', 'linked asset', 'published'];

export const mockActivity = Array.from({ length: 30 }).map((_, index) => {
  const course = mockCourses[index % mockCourses.length];
  return {
    _id: id(200 + index),
    action: activityTemplates[index % activityTemplates.length],
    target: `${course.code} - ${course.title}`,
    targetId: course._id,
    targetType: 'course',
    user: course.assignee.name,
    timestamp: subDays(new Date(), 29 - index).toISOString()
  };
});

// ── report: overview ────────────────────────────────────────────────
const STATUSES = ['Draft', 'In Review', 'In Development', 'Published'];
const DEPARTMENTS = ['Biology', 'Computer Science', 'Nursing', 'Business', 'Psychology', 'Engineering'];

const buildOverview = () => {
  const courses = mockCourses;
  const total = courses.length;
  const active = courses.filter((c) => c.status !== 'Published').length;
  const inProduction = courses.filter((c) => ['Draft', 'In Development', 'In Review'].includes(c.status)).length;
  const overdue = courses.filter((c) => c.metrics.isOverdue).length;
  const atRisk = courses.filter((c) => c.metrics.riskLevel === 'High').length;
  const autoRouted = courses.filter((c) => c.automation?.reviewAutoAssigned).length;
  const accessAvg = total ? Math.round(courses.reduce((s, c) => s + c.metrics.accessibilityProgress, 0) / total) : 0;

  const pipeline = STATUSES.map((status) => ({
    status,
    total: courses.filter((c) => c.status === status).length
  }));

  const assetUploadTrend = Array.from({ length: 12 }).map((_, index) => {
    const d = subWeeks(new Date(), 11 - index);
    return { label: `W${format(d, 'I')}`, total: Math.floor(Math.random() * 4) + 1 };
  });

  const atRiskSnapshot = [...courses]
    .sort((a, b) => a.metrics.healthScore - b.metrics.healthScore)
    .slice(0, 4)
    .map((c) => ({
      _id: c._id,
      code: c.code,
      title: c.title,
      assignee: c.assignee.name,
      healthScore: c.metrics.healthScore,
      riskLevel: c.metrics.riskLevel,
      recommendation: c.metrics.recommendation
    }));

  return {
    stats: {
      totalCourses: total,
      activeCourses: active,
      inProduction,
      inProductionPercent: total ? Math.round((inProduction / total) * 100) : 0,
      completedThisQuarter: courses.filter((c) => c.status === 'Published').length,
      completedDelta: 1,
      overdue,
      atRiskCourses: atRisk,
      accessibilityAverage: accessAvg,
      automatedReviews: autoRouted
    },
    pipeline,
    statusDistribution: pipeline,
    assetUploadTrend,
    atRiskSnapshot
  };
};

// ── report: completion ──────────────────────────────────────────────
const buildCompletion = () =>
  Array.from({ length: 12 }).map((_, index) => {
    const d = startOfMonth(subMonths(new Date(), 11 - index));
    return { label: format(d, 'MMM'), total: [0, 0, 1, 0, 1, 0, 0, 2, 0, 1, 1, 0][index] };
  });

// ── report: departments ─────────────────────────────────────────────
const buildDepartments = () => {
  const courses = mockCourses;

  const summary = DEPARTMENTS.map((dept) => {
    const items = courses.filter((c) => c.department === dept);
    const total = items.length;
    const completed = items.filter((c) => c.status === 'Published').length;
    const inProgress = items.filter((c) => c.status !== 'Published').length;
    const overdueCount = items.filter((c) => c.metrics.isOverdue).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const avgHealth = total ? Math.round(items.reduce((s, c) => s + c.metrics.healthScore, 0) / total) : 0;
    const avgAccess = total ? Math.round(items.reduce((s, c) => s + c.metrics.accessibilityProgress, 0) / total) : 0;

    const statusCounts = STATUSES.reduce((acc, status) => {
      acc[status] = items.filter((c) => c.status === status).length;
      return acc;
    }, {});

    return {
      department: dept,
      totalCourses: total,
      completed,
      inProgress,
      overdue: overdueCount,
      completionRate,
      averageHealth: avgHealth,
      averageAccessibility: avgAccess,
      ...statusCounts
    };
  });

  return {
    breakdown: summary.map((s) => ({
      department: s.department,
      Draft: s.Draft,
      'In Development': s['In Development'],
      'In Review': s['In Review'],
      Published: s.Published
    })),
    summary
  };
};

// ── public façades ──────────────────────────────────────────────────
export const mockOverview = buildOverview();
export const mockCompletion = buildCompletion();
export const mockDepartments = buildDepartments();
