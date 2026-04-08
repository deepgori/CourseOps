import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { subDays, subWeeks } from 'date-fns';
import { Activity } from '../models/Activity.js';
import { Asset } from '../models/Asset.js';
import { Course } from '../models/Course.js';
import { teamMembers } from '../utils/teamMembers.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uploadsDir = path.resolve(process.cwd(), 'uploads');

const imageBuffers = {
  png: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WkMZbUAAAAASUVORK5CYII=',
    'base64'
  ),
  jpg: Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEA8PEA8PDw8PDw8QDw8QDw8QFREWFhURFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAJ8BPgMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAABv/EABYBAQEBAAAAAAAAAAAAAAAAAAECA//aAAwDAQACEAMQAAAByVQf/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAR/9oACAEBAAEFAjKf/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEh/9oACAEDAQE/AYf/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAgBAgEBPwGn/8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQAGPwJf/8QAFhABAQEAAAAAAAAAAAAAAAAAARAR/9oACAEBAAE/IVb/xAAWEQEBAQAAAAAAAAAAAAAAAAABEBH/2gAIAQMBAT8QBn//xAAVEQEBAAAAAAAAAAAAAAAAAAAQEf/aAAgBAgEBPxBh/8QAFhABAQEAAAAAAAAAAAAAAAAAARAR/9oACAEBAAE/EG4P/9k=',
    'base64'
  ),
  pdf: Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
  )
};

const ensureSeedFile = (filePath, contents) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contents);
  }
};

const localFiles = [
  ['bio-ecosystem-reference.png', imageBuffers.png],
  ['cs-algorithms-map.png', imageBuffers.png],
  ['nursing-lab-photo.jpg', imageBuffers.jpg],
  ['business-capstone-board.jpg', imageBuffers.jpg],
  ['psy-research-framework.png', imageBuffers.png],
  ['engineering-lab-checklist.pdf', imageBuffers.pdf],
  ['bio201-lecture-slides.pptx', 'Seed placeholder deck for BIO 201'],
  ['nur310-assessment-guide.docx', 'Seed placeholder document for NUR 310'],
  ['man4720-case-study.pdf', imageBuffers.pdf],
  ['cop3530-recursion-notes.pdf', imageBuffers.pdf],
  ['psy320-discussion-prompts.docx', 'Seed placeholder document for PSY 320'],
  ['egn4101-lab-handout.pdf', imageBuffers.pdf],
  ['data-structures-diagram.png', imageBuffers.png],
  ['engr-safety-brief.pdf', imageBuffers.pdf],
  ['course-outline-template.docx', 'Seed placeholder document'],
  ['assessment-rubric.pdf', imageBuffers.pdf],
  ['qa-review-checklist.docx', 'Seed placeholder document']
];

const assetSeeds = [
  { originalName: 'bio-ecosystem-reference.png', type: 'image', metadata: { resolution: '1600x900', duration: 'Not available' } },
  { originalName: 'cs-algorithms-map.png', type: 'image', metadata: { resolution: '1440x810', duration: 'Not available' } },
  { originalName: 'nursing-lab-photo.jpg', type: 'image', metadata: { resolution: '1280x720', duration: 'Not available' } },
  { originalName: 'business-capstone-board.jpg', type: 'image', metadata: { resolution: '1920x1080', duration: 'Not available' } },
  { originalName: 'psy-research-framework.png', type: 'image', metadata: { resolution: '1600x900', duration: 'Not available' } },
  { originalName: 'engineering-lab-checklist.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'bio201-lecture-slides.pptx', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'nursing-sim-walkthrough.mp4', type: 'video', url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', metadata: { resolution: '1920x1080', duration: '00:05' } },
  { originalName: 'course-onboarding-overview.mov', type: 'video', url: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', metadata: { resolution: '1280x720', duration: '00:10' } },
  { originalName: 'nur310-assessment-guide.docx', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'man4720-case-study.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'cop3530-recursion-notes.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'data-structures-diagram.png', type: 'image', metadata: { resolution: '1500x844', duration: 'Not available' } },
  { originalName: 'engr-safety-brief.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'psy320-discussion-prompts.docx', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'egn4101-lab-handout.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'bio-field-footage.mp4', type: 'video', url: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4', metadata: { resolution: '1920x1080', duration: '00:15' } },
  { originalName: 'course-outline-template.docx', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'assessment-rubric.pdf', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } },
  { originalName: 'qa-review-checklist.docx', type: 'document', metadata: { resolution: 'Not available', duration: 'Not available' } }
];

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

const courseSeeds = [
  { code: 'BIO 201', title: 'Marine Ecosystem Analysis', description: 'Rebuild the online lab sequence and scenario-based assessments for marine habitats and biodiversity trends.', department: 'Biology', status: 'In Review', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), 2), notes: 'Faculty requested an additional coral bleaching case study before publishing.' },
  { code: 'COP 3530', title: 'Data Structures & Algorithms', description: 'Refresh lecture media, coding labs, and weekly problem sets for the next accelerated term.', department: 'Computer Science', status: 'In Development', priority: 'High', assignee: teamMembers[1], dueDate: subDays(new Date(), -10), notes: 'Animation assets still need QA sign-off.' },
  { code: 'NUR 310', title: 'Clinical Assessment Methods', description: 'Package patient simulation walkthroughs and formative checks for remote clinical readiness.', department: 'Nursing', status: 'Draft', priority: 'Medium', assignee: teamMembers[2], dueDate: subDays(new Date(), 14), notes: 'Waiting on revised faculty narration script.' },
  { code: 'MAN 4720', title: 'Strategic Management Capstone', description: 'Finalize capstone milestones, board presentation assets, and leadership reflection rubrics.', department: 'Business', status: 'Published', priority: 'High', assignee: teamMembers[4], dueDate: subDays(new Date(), -30), notes: 'Published for the spring capstone cohort.' },
  { code: 'PSY 320', title: 'Cognitive Research Design', description: 'Align research design activities with new department accessibility guidelines and review workflow.', department: 'Psychology', status: 'In Development', priority: 'Medium', assignee: teamMembers[5], dueDate: subDays(new Date(), -6), notes: 'Design pack needs caption updates before QA.' },
  { code: 'EGN 4101', title: 'Applied Systems Engineering Lab', description: 'Convert on-campus lab activities into video-supported digital simulations and safety modules.', department: 'Engineering', status: 'Draft', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), 5), notes: 'Safety compliance review scheduled with lab coordinator.' },
  { code: 'BIO 340', title: 'Genetics and Society', description: 'Update policy debate assignments and faculty mini-lectures for the summer term.', department: 'Biology', status: 'Published', priority: 'Low', assignee: teamMembers[0], dueDate: subDays(new Date(), -40), notes: 'Completed and handed off to faculty support.' },
  { code: 'CEN 4020', title: 'Software Engineering Studio', description: 'Refactor sprint templates, rubrics, and project onboarding for distributed student teams.', department: 'Computer Science', status: 'In Review', priority: 'Medium', assignee: teamMembers[3], dueDate: subDays(new Date(), 1), notes: 'Awaiting QA notes on peer review flow.' },
  { code: 'NUR 402', title: 'Community Health Interventions', description: 'Launch community case simulations with updated voiceover and downloadable field packets.', department: 'Nursing', status: 'In Development', priority: 'Medium', assignee: teamMembers[2], dueDate: subDays(new Date(), -12), notes: 'Video intro is in final edit.' },
  { code: 'FIN 3403', title: 'Managerial Finance', description: 'Replace dated examples with current market scenarios and new problem walkthrough videos.', department: 'Business', status: 'Draft', priority: 'Low', assignee: teamMembers[4], dueDate: subDays(new Date(), 18), notes: 'Budget visualization module still in storyboard.' },
  { code: 'PSY 450', title: 'Applied Behavioral Analytics', description: 'Consolidate analytics dashboards, faculty notes, and learner feedback improvements.', department: 'Psychology', status: 'Published', priority: 'Medium', assignee: teamMembers[5], dueDate: subDays(new Date(), -25), notes: 'Strong student adoption in the pilot run.' },
  { code: 'EEL 3008', title: 'Circuit Design Fundamentals', description: 'Produce new lab capture media and streamline weekly build submission instructions.', department: 'Engineering', status: 'In Review', priority: 'High', assignee: teamMembers[3], dueDate: subDays(new Date(), -1), notes: 'Lab camera footage approved; waiting on accessibility pass.' },
  { code: 'BIO 410', title: 'Wetlands Field Methods', description: 'Create field observation journals and satellite imagery walkthroughs for hybrid learners.', department: 'Biology', status: 'Draft', priority: 'Medium', assignee: teamMembers[0], dueDate: subDays(new Date(), 9), notes: 'Photography assets are already linked.' },
  { code: 'CAP 4630', title: 'Artificial Intelligence Systems', description: 'Rework assessment banks and simulation labs for the AI systems sequence.', department: 'Computer Science', status: 'Published', priority: 'High', assignee: teamMembers[1], dueDate: subDays(new Date(), -60), notes: 'Published after accelerated QA cycle.' },
  { code: 'NUR 215', title: 'Foundations of Patient Care', description: 'Refresh clinical orientation content and add new downloadable bedside checklists.', department: 'Nursing', status: 'In Development', priority: 'Low', assignee: teamMembers[2], dueDate: subDays(new Date(), 12), notes: 'Pilot feedback showed strong engagement with short-form clips.' }
];

const activityTemplates = ['moved to In Review', 'moved to In Development', 'uploaded asset', 'created', 'linked asset', 'published'];

const seedDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to server/.env before seeding.');
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  localFiles.forEach(([fileName, contents]) => {
    ensureSeedFile(path.join(uploadsDir, fileName), contents);
  });

  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Activity.deleteMany({}), Asset.deleteMany({}), Course.deleteMany({})]);

  const assets = await Asset.insertMany(
    assetSeeds.map((asset, index) => {
      const localPath = path.join(uploadsDir, asset.originalName);
      const hasLocalFile = fs.existsSync(localPath);
      const extension = path.extname(asset.originalName).replace('.', '').toUpperCase();

      return {
        fileName: asset.originalName,
        originalName: asset.originalName,
        type: asset.type,
        extension,
        mimeType:
          asset.type === 'image'
            ? 'image/png'
            : asset.type === 'video'
              ? 'video/mp4'
              : 'application/octet-stream',
        size: hasLocalFile ? fs.statSync(localPath).size : 1024 * (index + 4),
        url: asset.url || `http://localhost:5000/uploads/${asset.originalName}`,
        path: hasLocalFile ? localPath : '',
        metadata: asset.metadata,
        createdAt: subDays(new Date(), 20 - index),
        updatedAt: subDays(new Date(), 20 - index)
      };
    })
  );

  const courses = await Course.insertMany(
    courseSeeds.map((course, index) => ({
      ...course,
      blockers: blockerProfiles[index],
      accessibility: {
        ...accessibilityProfiles[index],
        lastAuditedAt: subDays(new Date(), 2 + index)
      },
      automation:
        course.status === 'In Review'
          ? {
              reviewAutoAssigned: true,
              lastAutoAssignedAt: subDays(new Date(), index + 1)
            }
          : {
              reviewAutoAssigned: false,
              lastAutoAssignedAt: null
            },
      createdAt: subWeeks(new Date(), 10 - Math.min(index, 9)),
      updatedAt: subDays(new Date(), index),
      publishedAt: course.status === 'Published' ? subDays(new Date(), 15 + index) : null
    }))
  );

  await Promise.all(
    courses.map((course, index) => {
      course.assets = assets.slice(index % 5, (index % 5) + 3).map((asset) => asset._id);
      return course.save();
    })
  );

  await Promise.all(
    assets.map((asset) => {
      asset.linkedCourses = courses
        .filter((course) => course.assets.some((assetId) => assetId.toString() === asset._id.toString()))
        .map((course) => course._id);
      return asset.save();
    })
  );

  await Activity.insertMany(
    Array.from({ length: 30 }).map((_, index) => {
      const course = courses[index % courses.length];
      return {
        action: activityTemplates[index % activityTemplates.length],
        target: `${course.code} - ${course.title}`,
        targetId: course._id,
        targetType: 'course',
        user: course.assignee.name,
        timestamp: subDays(new Date(), 29 - index)
      };
    })
  );

  console.log('Seed complete: courses, assets, and activity loaded.');
  await mongoose.disconnect();
};

seedDatabase().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
