import {
  BarChart3,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';

export const statusOptions = [
  { label: 'Draft', dotColor: 'bg-draft', tone: 'draft' },
  { label: 'In Development', dotColor: 'bg-brand', tone: 'brand' },
  { label: 'In Review', dotColor: 'bg-warning', tone: 'warning' },
  { label: 'Published', dotColor: 'bg-success', tone: 'success' }
];

export const priorityOptions = [
  { label: 'Low', color: 'border-l-brand' },
  { label: 'Medium', color: 'border-l-warning' },
  { label: 'High', color: 'border-l-danger' }
];

export const departmentOptions = [
  'Biology',
  'Computer Science',
  'Nursing',
  'Business',
  'Psychology',
  'Engineering'
];

export const teamMembers = [
  {
    name: 'Sarah Patel',
    initials: 'SP',
    role: 'Instructional Designer',
    email: 'sarah.patel@courseops.edu',
    phone: '(561) 555-0121',
    avatarColor: '#4F8CFF'
  },
  {
    name: 'Marcus Lee',
    initials: 'ML',
    role: 'Course Developer',
    email: 'marcus.lee@courseops.edu',
    phone: '(561) 555-0144',
    avatarColor: '#34D399'
  },
  {
    name: 'Jasmine Rivera',
    initials: 'JR',
    role: 'Video Producer',
    email: 'jasmine.rivera@courseops.edu',
    phone: '(561) 555-0168',
    avatarColor: '#FBBF24'
  },
  {
    name: 'Olivia Chen',
    initials: 'OC',
    role: 'QA Reviewer',
    email: 'olivia.chen@courseops.edu',
    phone: '(561) 555-0185',
    avatarColor: '#A78BFA'
  },
  {
    name: 'Daniel Brooks',
    initials: 'DB',
    role: 'Project Manager',
    email: 'daniel.brooks@courseops.edu',
    phone: '(561) 555-0203',
    avatarColor: '#F87171'
  },
  {
    name: 'Avery Nelson',
    initials: 'AN',
    role: 'Graphic Designer',
    email: 'avery.nelson@courseops.edu',
    phone: '(561) 555-0227',
    avatarColor: '#60A5FA'
  }
];

export const navigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Assets', path: '/assets', icon: FolderKanban },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Team', path: '/team', icon: Users }
];

export const secondaryNavItem = { label: 'Settings', icon: Settings };

export const courseViewModes = ['kanban', 'list'];

export const assetFilterTypes = ['All', 'Videos', 'Images', 'Documents', 'Audio'];

export const assetSortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Largest', value: 'largest' }
];

export const reportRanges = ['This Quarter', 'This Month', 'This Year', 'Custom'];

export const pageMeta = {
  '/': {
    title: 'Department Dashboard',
    subtitle: 'Track course production health, review recent activity, and jump into critical workflows.'
  },
  '/courses': {
    title: 'Course Tracker',
    subtitle: 'Manage production status, due dates, assignments, and linked materials.'
  },
  '/assets': {
    title: 'Asset Library',
    subtitle: 'Upload and organize media, documents, and reusable course materials.'
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'Review operational trends, departmental performance, and export summary data.'
  },
  '/team': {
    title: 'Team Directory',
    subtitle: 'See workload distribution and filter into assigned course work.'
  }
};

