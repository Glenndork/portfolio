export const profile = {
  name: 'Glenn B. Viola',
  role: 'Software Developer',
  degree: 'BS Computer Science',
  location: 'Legazpi, Albay',
  email: 'glennviola32@gmail.com',
  phone: '0967 345 4221',
  phoneHref: 'tel:+639673454221',
  github: 'https://github.com/Glenndork',
  githubUser: 'Glenndork',
  linkedin: 'https://www.linkedin.com/in/glenn-viola-4b74962a8/',
  resume: `${import.meta.env.BASE_URL}assets/resume.pdf`,
} as const

export const about = {
  lead: "I'm a Computer Science graduate and software developer who enjoys breathing new life into legacy systems — modernizing old workflows without breaking what already works.",
  comment: 'turning coffee, curiosity, and clean queries into working software.',
}

export const experience = [
  {
    when: 'MAY 2025 — DECEMBER 2025',
    title: 'Information Systems Analyst',
    org: 'Philippine Business for Social Progress',
    points: [
      'Analyzed legacy clinic system workflows and documented requirements for system modernization.',
      'Mapped existing database structures to new application logic while ensuring data consistency.',
      'Coordinated testing, validation, and issue resolution to support a smooth system transition.',
    ],
  },
]

export const projects = [
  {
    path: '~/projects/iclinicsys',
    no: '01',
    name: 'iClinicSys',
    stack: ['Laravel', 'React', 'MySQL'],
    points: [
      'Modernized a legacy clinic information system using Laravel while retaining the existing database structure.',
      'Implemented patient records, administrative dashboards, and reference data modules.',
      'Fixed legacy data issues, optimized queries, and ensured secure, role-based access to patient information.',
    ],
  },
  {
    path: '~/projects/vawc',
    no: '02',
    name: 'VAWC',
    stack: ['Laravel', 'React', 'MySQL'],
    points: [
      'Refactored an existing EMR VAWC module into a standalone information system.',
      'Preserved and adapted legacy data structures while separating core system logic.',
      'Implemented case records and administrative dashboards.',
    ],
  },
  {
    path: '~/projects/bastion',
    no: '03',
    name: 'Bastion',
    stack: ['SVM', 'Vonage API', 'Desktop'],
    points: [
      'Built a desktop malware detection application using support vector machines.',
      'Added real-time scanning with SMS alerts through the Vonage API.',
      'Kept a complete scan history for ongoing security monitoring.',
    ],
  },
  {
    path: '~/projects/nio',
    no: '04',
    name: 'NIO',
    stack: ['Speech analysis', 'AI', 'Flutter'],
    points: [
      'Created a speech-analysis app that helps students and public speakers improve fluency.',
      'Delivered focused feedback and practice tools for clearer speaking habits.',
      'Packaged resources for building confidence before real presentations.',
    ],
  },
]

export const skillRows = [
  ['Java', 'C', 'C++', 'HTML/CSS', 'JavaScript', 'PHP'],
  ['Flutter', 'React', 'Laravel', 'MySQL', 'VS Code', 'Git', 'GitHub'],
]

export const education = [
  {
    when: 'AUGUST 2020 — JULY 2024',
    title: 'Bachelor of Science in Computer Science',
    org: 'Bicol University',
    extra: ['Legazpi, Albay'],
  },
  {
    when: 'JUNE 2014 — MARCH 2020',
    title: 'TVL — Information & Communications Technology',
    org: 'Camarines Sur National High School',
    extra: ['Naga City'],
    honors: 'With Honors',
  },
]

export const navLinks = [
  { href: '#about', label: 'about', optional: true },
  { href: '#experience', label: 'work' },
  { href: '#projects', label: 'projects' },
  { href: '#contributions', label: 'activity', optional: true },
  { href: '#skills', label: 'skills', optional: true },
  { href: '#contact', label: 'contact' },
]
