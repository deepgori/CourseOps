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

export const qaReviewer = teamMembers.find((member) => member.role === 'QA Reviewer');

