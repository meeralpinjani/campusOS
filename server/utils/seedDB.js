const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Channel = require('../models/Channel');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const MarketplaceListing = require('../models/MarketplaceListing');
const CommunityRequest = require('../models/CommunityRequest');
const AcademicCalendar = require('../models/AcademicCalendar');
const Poll = require('../models/Poll');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const DEFAULT_HIERARCHICAL_CHANNELS = [
  // 1. OFFICIAL ANNOUNCEMENTS
  {
    name: 'Announcements & Notices',
    slug: 'official-notices',
    description: 'Central official circulars, exam schedules, and administrative notices.',
    type: 'general',
    group: 'Official Announcements',
    icon: 'Megaphone',
  },
  {
    name: 'General Campus Lounge',
    slug: 'general-lounge',
    description: 'Open discussions, campus events, and general student lounge.',
    type: 'general',
    group: 'Official Announcements',
    icon: 'MessageSquare',
  },

  // 2. COMMUNITIES (PROFESSIONAL SUBREDDITS)
  {
    name: 'r/Tech_Discussions',
    slug: 'r-tech-discussions',
    description: 'Software development, AI breakthroughs, and technology discussions.',
    type: 'interest',
    group: 'Communities (Reddit-Style)',
    icon: 'Code',
  },
  {
    name: 'r/Research_Innovations',
    slug: 'r-research-innovations',
    description: 'Research papers, patents, capstone projects, & technical showcases.',
    type: 'interest',
    group: 'Communities (Reddit-Style)',
    icon: 'FlaskConical',
  },
  {
    name: 'r/Startup_Ideas',
    slug: 'r-startup-ideas',
    description: 'Pitch raw startup ideas, find co-founders, & get feedback.',
    type: 'interest',
    group: 'Communities (Reddit-Style)',
    icon: 'Zap',
  },
  {
    name: 'r/Alumni_Network',
    slug: 'r-alumni-network',
    description: 'Alumni mentorship, higher studies prep, & industry networking.',
    type: 'interest',
    group: 'Communities (Reddit-Style)',
    icon: 'GraduationCap',
  },
  {
    name: 'r/Gaming_eSports',
    slug: 'r-gaming-esports',
    description: 'Valorant, BGMI, CS2 tournaments, & gaming squads.',
    type: 'interest',
    group: 'Communities (Reddit-Style)',
    icon: 'Terminal',
  },

  // 3. EXAMINATION CELL & CONTROLLER OF EXAMS (EXAM DEPT)
  {
    name: 'Exam Schedules & Timetables',
    slug: 'exam-schedules',
    description: 'Mid-term, End-semester exam timetables and official circulars.',
    type: 'general',
    group: 'Examination Cell & CoE (Exam Dept)',
    icon: 'Calendar',
  },
  {
    name: 'Hall Tickets & Seating',
    slug: 'hall-tickets',
    description: 'Hall ticket issuance, seating arrangements, and exam rules.',
    type: 'general',
    group: 'Examination Cell & CoE (Exam Dept)',
    icon: 'FileText',
  },
  {
    name: 'Revaluation & Results',
    slug: 'exam-results',
    description: 'Grade sheets, revaluation applications, and result declarations.',
    type: 'general',
    group: 'Examination Cell & CoE (Exam Dept)',
    icon: 'Award',
  },
  {
    name: 'Exam Cell Inquiries',
    slug: 'exam-inquiries',
    description: 'Student helpline for transcript requests and exam queries.',
    type: 'general',
    group: 'Examination Cell & CoE (Exam Dept)',
    icon: 'HelpCircle',
  },

  // 4. COMPUTER SCIENCE & ENGINEERING (CSE)
  {
    name: 'CSE Announcements',
    slug: 'cse-announcements',
    description: 'Official department announcements for CSE.',
    type: 'branch',
    group: 'Computer Science & Engineering (CSE)',
    icon: 'Bell',
  },
  {
    name: 'CSE Academics & Notes',
    slug: 'cse-academics-notes',
    description: 'Syllabus, lecture notes, exam prep, and study material.',
    type: 'branch',
    group: 'Computer Science & Engineering (CSE)',
    icon: 'BookOpen',
  },
  {
    name: 'CSE Projects & Research',
    slug: 'cse-projects-research',
    description: 'Capstone projects, research papers, and software development.',
    type: 'branch',
    group: 'Computer Science & Engineering (CSE)',
    icon: 'Code',
  },
  {
    name: 'CSE Discussion Lounge',
    slug: 'cse-discussion',
    description: 'General discussion for CSE students and faculty.',
    type: 'branch',
    group: 'Computer Science & Engineering (CSE)',
    icon: 'MessageCircle',
  },

  // 5. CSE - AI & MACHINE LEARNING (AIML)
  {
    name: 'AIML Announcements',
    slug: 'aiml-announcements',
    description: 'Official department announcements for CSE (AIML).',
    type: 'branch',
    group: 'CSE - AI & Machine Learning (AIML)',
    icon: 'Bell',
  },
  {
    name: 'AIML Academics & Notes',
    slug: 'aiml-academics-notes',
    description: 'Math, Neural Networks, Deep Learning notes and coursework.',
    type: 'branch',
    group: 'CSE - AI & Machine Learning (AIML)',
    icon: 'BookOpen',
  },
  {
    name: 'AIML AI Projects & Labs',
    slug: 'aiml-ai-projects',
    description: 'Machine Learning models, PyTorch, TensorFlow, LLM research.',
    type: 'branch',
    group: 'CSE - AI & Machine Learning (AIML)',
    icon: 'Cpu',
  },
  {
    name: 'AIML Discussion Lounge',
    slug: 'aiml-discussion',
    description: 'General discussion for AIML students and faculty.',
    type: 'branch',
    group: 'CSE - AI & Machine Learning (AIML)',
    icon: 'MessageCircle',
  },

  // 6. BIOTECHNOLOGY
  {
    name: 'Biotech Announcements',
    slug: 'biotech-announcements',
    description: 'Official announcements for Biotechnology.',
    type: 'branch',
    group: 'Biotechnology',
    icon: 'Bell',
  },
  {
    name: 'Biotech Lab & Academics',
    slug: 'biotech-lab-academics',
    description: 'Lab protocols, bioinformatics, research notes.',
    type: 'branch',
    group: 'Biotechnology',
    icon: 'FlaskConical',
  },
  {
    name: 'Biotech Discussion',
    slug: 'biotech-discussion',
    description: 'Biotechnology discussions and study lounge.',
    type: 'branch',
    group: 'Biotechnology',
    icon: 'MessageCircle',
  },

  // 7. CIVIL ENGINEERING
  {
    name: 'Civil Announcements',
    slug: 'civil-announcements',
    description: 'Official announcements for Civil Engineering.',
    type: 'branch',
    group: 'Civil Engineering',
    icon: 'Bell',
  },
  {
    name: 'Civil Projects & CAD',
    slug: 'civil-projects',
    description: 'Structural designs, AutoCAD, surveying, and site projects.',
    type: 'branch',
    group: 'Civil Engineering',
    icon: 'Building2',
  },
  {
    name: 'Civil Discussion',
    slug: 'civil-discussion',
    description: 'Civil Engineering student discussions.',
    type: 'branch',
    group: 'Civil Engineering',
    icon: 'MessageCircle',
  },

  // 8. ELECTRONICS & TELECOMM (ENTC)
  {
    name: 'ENTC Announcements',
    slug: 'entc-announcements',
    description: 'Official announcements for ENTC.',
    type: 'branch',
    group: 'Electronics & Telecomm (ENTC)',
    icon: 'Bell',
  },
  {
    name: 'ENTC Robotics & IoT',
    slug: 'entc-lab-projects',
    description: 'Microcontrollers, Embedded Systems, Circuit designs.',
    type: 'branch',
    group: 'Electronics & Telecomm (ENTC)',
    icon: 'Radio',
  },
  {
    name: 'ENTC Discussion',
    slug: 'entc-discussion',
    description: 'ENTC discussions and hardware lounge.',
    type: 'branch',
    group: 'Electronics & Telecomm (ENTC)',
    icon: 'MessageCircle',
  },

  // 9. ELECTRICAL ENGINEERING
  {
    name: 'Electrical Announcements',
    slug: 'electrical-announcements',
    description: 'Official announcements for Electrical Engineering.',
    type: 'branch',
    group: 'Electrical Engineering',
    icon: 'Bell',
  },
  {
    name: 'Electrical Academics & Labs',
    slug: 'electrical-academics',
    description: 'Power systems, electric drives, and lab experiments.',
    type: 'branch',
    group: 'Electrical Engineering',
    icon: 'Zap',
  },
  {
    name: 'Electrical Discussion',
    slug: 'electrical-discussion',
    description: 'Electrical Engineering discussions.',
    type: 'branch',
    group: 'Electrical Engineering',
    icon: 'MessageCircle',
  },

  // 10. MECHANICAL ENGINEERING
  {
    name: 'Mechanical Announcements',
    slug: 'mech-announcements',
    description: 'Official announcements for Mechanical Engineering.',
    type: 'branch',
    group: 'Mechanical Engineering',
    icon: 'Bell',
  },
  {
    name: 'Mechanical Projects & Workshops',
    slug: 'mech-projects-workshops',
    description: 'CAD/CAM modeling, thermodynamics, and workshop projects.',
    type: 'branch',
    group: 'Mechanical Engineering',
    icon: 'Wrench',
  },
  {
    name: 'Mechanical Discussion',
    slug: 'mech-discussion',
    description: 'Mechanical Engineering discussions.',
    type: 'branch',
    group: 'Mechanical Engineering',
    icon: 'MessageCircle',
  },

  // 11. CAREERS & PLACEMENTS
  {
    name: 'Placement Drives & Schedules',
    slug: 'placement-drives',
    description: 'Upcoming company visits, recruitment schedules, and interview links.',
    type: 'interest',
    group: 'Careers & Placements',
    icon: 'Briefcase',
  },
  {
    name: 'Training & Skill Workshops',
    slug: 'training-and-workshops',
    description: 'Aptitude training, mock interviews, and resume building.',
    type: 'interest',
    group: 'Careers & Placements',
    icon: 'GraduationCap',
  },
  {
    name: 'Job Opportunities & Internships',
    slug: 'job-opportunities-internships',
    description: 'Off-campus openings, summer internships, and referral posts.',
    type: 'interest',
    group: 'Careers & Placements',
    icon: 'Award',
  },
  {
    name: 'Career Notices & Circulars',
    slug: 'career-notices',
    description: 'Official T&P cell notices and eligibility updates.',
    type: 'interest',
    group: 'Careers & Placements',
    icon: 'FileText',
  },

  // 12. EXACT 17 CAMPUS CLUBS & SOCIETIES
  {
    name: 'ISTE Student Chapter',
    slug: 'iste-student-chapter',
    description: 'Indian Society for Technical Education (ISTE) student chapter activities.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Sparkles',
  },
  {
    name: 'Entrepreneurship Cell (E-Cell)',
    slug: 'e-cell-kitcoek',
    description: 'E-Cell KITCoEK startup ecosystem, pitch fests, and founder workshops.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Zap',
  },
  {
    name: 'Team Mavericks',
    slug: 'team-mavericks',
    description: 'Team Mavericks technical automotive & engineering competition guild.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Wrench',
  },
  {
    name: 'Student Developers Club (SDC)',
    slug: 'student-developers-club',
    description: 'SDC hackathons, coding workshops, and software development projects.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Code',
  },
  {
    name: 'Amateur Writers Club',
    slug: 'amateur-writers-club',
    description: 'Literary discussions, poetry, magazine articles, and creative writing.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'BookOpen',
  },
  {
    name: 'Ek Bharat Shreshtha Bharat',
    slug: 'ek-bharat-shreshtha-bharat',
    description: 'National cultural integration & inter-state student exchange initiatives.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Award',
  },
  {
    name: 'Cultural Club',
    slug: 'cultural-club',
    description: 'Annual day events, dance, drama, and cultural festival coordination.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Sparkles',
  },
  {
    name: 'The Art Club ‘AURA’',
    slug: 'aura-art-club',
    description: 'Painting, sketching, digital illustration, and campus decor team.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Sparkles',
  },
  {
    name: 'Shourya',
    slug: 'shourya-club',
    description: 'Shourya student sports & physical fitness initiative.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Trophy',
  },
  {
    name: 'Women Development & Equality Cell',
    slug: 'women-development-cell',
    description: 'Women empowerment, gender equality workshops, and safety seminars.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Award',
  },
  {
    name: 'Rotaract Club Of KIT SUNSHINE',
    slug: 'rotaract-kit-sunshine',
    description: 'Community service, blood donation drives, and social youth leadership.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Award',
  },
  {
    name: 'Society Of Women Engineers (SWE)',
    slug: 'society-of-women-engineers',
    description: 'SWE campus chapter supporting women leaders in STEM & Engineering.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Code',
  },
  {
    name: 'Walk With World',
    slug: 'walk-with-world',
    description: 'Global awareness, environmental walks, and international education.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Sparkles',
  },
  {
    name: 'National Cadet Corps (NCC)',
    slug: 'ncc-kit',
    description: 'NCC training, parades, Republic Day camps, and national service.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Trophy',
  },
  {
    name: 'National Service Scheme (NSS)',
    slug: 'nss-kit',
    description: 'NSS rural development camps, tree plantation, and social welfare.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'Award',
  },
  {
    name: 'Lead India',
    slug: 'lead-india',
    description: 'Youth leadership development, public speaking, and civic projects.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'GraduationCap',
  },
  {
    name: 'Petrichor - Green Club',
    slug: 'petrichor-green-club',
    description: 'Campus sustainability, recycling drives, and environmental conservation.',
    type: 'interest',
    group: 'Campus Clubs & Societies',
    icon: 'FlaskConical',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kitcommunity';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Database Reset & Seeding...');

    // Clear all existing data across all collections
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await User.deleteMany({});
    await Channel.deleteMany({});
    await MarketplaceListing.deleteMany({});
    await CommunityRequest.deleteMany({});
    await AcademicCalendar.deleteMany({});
    await Poll.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared all previous posts, comments, users, channels, listings, requests, calendars, polls, notifications, and messages! [DB PURGED]');

    // Seed Master Admin, Faculty Shekhar Jalane, and Student Meeral Pinjani ONLY
    const adminUser = await User.create({
      username: 'Master Admin',
      email: 'admin@kit.edu',
      passwordHash: 'Admin@123',
      role: 'admin',
      branch: 'Computer Science & Engineering',
      year: 'N/A',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MasterAdmin',
      bio: 'System Master Administrator for KITCommunity.',
      reputationScore: 100,
    });

    await User.create({
      username: 'Shekhar Jalane',
      email: 'shekhar.jalane@kitcoek.edu',
      passwordHash: 'Faculty@123',
      role: 'faculty',
      branch: 'Computer Science & Engineering',
      year: 'N/A',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShekharJalane',
      bio: 'Senior Faculty Member, Department of Computer Science & Engineering.',
      reputationScore: 80,
    });

    await User.create({
      username: 'Meeral Pinjani',
      email: 'meeral.pinjani@kit.edu',
      passwordHash: 'Student@123',
      role: 'student',
      branch: 'Computer Science & Engineering',
      year: 'Final Year',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeralPinjani',
      bio: 'Verified Student, Computer Science & Engineering.',
      reputationScore: 50,
    });

    console.log('Seeded Master Test Accounts: Master Admin, Shekhar Jalane (Faculty), and Meeral Pinjani (Student).');

    // Seed Hierarchical Groups & Channels
    const seededChannels = DEFAULT_HIERARCHICAL_CHANNELS.map((ch) => ({
      ...ch,
      createdBy: adminUser._id,
    }));

    await Channel.insertMany(seededChannels);
    console.log('Seeded Professional Communities, Exam Dept, Department Groups & 17 Campus Clubs successfully!');

    // Seed Official Institutional Academic Calendar (July - Dec 2026)
    await AcademicCalendar.create({
      title: 'S.Y.B.Tech, T.Y.B.Tech and Final Year B.Tech',
      semesterLabel: '(ODD SEMESTER, 2026-27)',
      academicYear: '2026-27',
      isActive: true,
      createdBy: adminUser._id,
      months: [
        {
          monthLabel: 'July 2026',
          instructionDaysThisMonth: 14,
          weeks: [
            {
              weekNumber: '-',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: null, category: 'none' },
                Wed: { date: 1, category: 'none' },
                Thu: { date: 2, category: 'none' },
                Fri: { date: 3, category: 'none' },
                Sat: { date: 4, category: 'academic' },
                Sun: { date: 5, category: 'holiday' },
              },
              eventsText: 'KIT Foundation Day',
            },
            {
              weekNumber: '-',
              days: {
                Mon: { date: 6, category: 'holiday' },
                Tue: { date: 7, category: 'none' },
                Wed: { date: 8, category: 'none' },
                Thu: { date: 9, category: 'none' },
                Fri: { date: 10, category: 'none' },
                Sat: { date: 11, category: 'none' },
                Sun: { date: 12, category: 'holiday' },
              },
              eventsText: '',
            },
            {
              weekNumber: '1',
              days: {
                Mon: { date: 13, category: 'holiday' },
                Tue: { date: 14, category: 'academic' },
                Wed: { date: 15, category: 'academic' },
                Thu: { date: 16, category: 'academic' },
                Fri: { date: 17, category: 'academic' },
                Sat: { date: 18, category: 'none' },
                Sun: { date: 19, category: 'holiday' },
              },
              eventsText: '14 – Commencement of Academic Sem-I, 14-17 – Declaration of Theory and Lab ISE Components, Updating ERP and LMS',
            },
            {
              weekNumber: '2',
              days: {
                Mon: { date: 20, category: 'holiday' },
                Tue: { date: 21, category: 'student-activity' },
                Wed: { date: 22, category: 'student-activity' },
                Thu: { date: 23, category: 'student-activity' },
                Fri: { date: 24, category: 'student-activity' },
                Sat: { date: 25, category: 'student-activity' },
                Sun: { date: 26, category: 'student-activity' },
              },
              eventsText: '21-26 – S.Y.B.Tech Induction Program',
            },
            {
              weekNumber: '3',
              days: {
                Mon: { date: 27, category: 'holiday' },
                Tue: { date: 28, category: 'none' },
                Wed: { date: 29, category: 'none' },
                Thu: { date: 30, category: 'none' },
                Fri: { date: 31, category: 'academic' },
                Sat: { date: null, category: 'none' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '31 – PEC Meeting',
            },
          ],
        },
        {
          monthLabel: 'August 2026',
          instructionDaysThisMonth: 19,
          weeks: [
            {
              weekNumber: '3',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: null, category: 'none' },
                Wed: { date: null, category: 'none' },
                Thu: { date: null, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: 1, category: 'none' },
                Sun: { date: 2, category: 'holiday' },
              },
              eventsText: '',
            },
            {
              weekNumber: '4',
              days: {
                Mon: { date: 3, category: 'holiday' },
                Tue: { date: 4, category: 'academic' },
                Wed: { date: 5, category: 'academic' },
                Thu: { date: 6, category: 'none' },
                Fri: { date: 7, category: 'none' },
                Sat: { date: 8, category: 'none' },
                Sun: { date: 9, category: 'holiday' },
              },
              eventsText: '04-05 – Display of Attendance and Counseling of Defaulters for the Month of July',
            },
            {
              weekNumber: '5',
              days: {
                Mon: { date: 10, category: 'holiday' },
                Tue: { date: 11, category: 'none' },
                Wed: { date: 12, category: 'none' },
                Thu: { date: 13, category: 'none' },
                Fri: { date: 14, category: 'none' },
                Sat: { date: 15, category: 'holiday' },
                Sun: { date: 16, category: 'holiday' },
              },
              eventsText: '15 – Independence Day and Parsi New Year, 16 – Student Activity Slot',
            },
            {
              weekNumber: '6',
              days: {
                Mon: { date: 17, category: 'holiday' },
                Tue: { date: 18, category: 'none' },
                Wed: { date: 19, category: 'none' },
                Thu: { date: 20, category: 'none' },
                Fri: { date: 21, category: 'none' },
                Sat: { date: 22, category: 'none' },
                Sun: { date: 23, category: 'holiday' },
              },
              eventsText: '',
            },
            {
              weekNumber: '7',
              days: {
                Mon: { date: 24, category: 'holiday' },
                Tue: { date: 25, category: 'none' },
                Wed: { date: 26, category: 'holiday' },
                Thu: { date: 27, category: 'none' },
                Fri: { date: 28, category: 'none' },
                Sat: { date: 29, category: 'academic' },
                Sun: { date: 30, category: 'holiday' },
              },
              eventsText: '26 – Eid-E-Milad, 29– PEC Meeting',
            },
            {
              weekNumber: '8',
              days: {
                Mon: { date: 31, category: 'holiday' },
                Tue: { date: null, category: 'none' },
                Wed: { date: null, category: 'none' },
                Thu: { date: null, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: null, category: 'none' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '',
            },
          ],
        },
        {
          monthLabel: 'Sept. 2026',
          instructionDaysThisMonth: 22,
          weeks: [
            {
              weekNumber: '8',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: 1, category: 'academic' },
                Wed: { date: 2, category: 'academic' },
                Thu: { date: 3, category: 'none' },
                Fri: { date: 4, category: 'none' },
                Sat: { date: 5, category: 'academic' },
                Sun: { date: 6, category: 'holiday' },
              },
              eventsText: '01-02 – Display of Attendance and Counseling of Defaulters for the Month of August, 05 – Submission of ISE-I Marks',
            },
            {
              weekNumber: '9',
              days: {
                Mon: { date: 7, category: 'holiday' },
                Tue: { date: 8, category: 'academic' },
                Wed: { date: 9, category: 'academic' },
                Thu: { date: 10, category: 'none' },
                Fri: { date: 11, category: 'none' },
                Sat: { date: 12, category: 'none' },
                Sun: { date: 13, category: 'student-activity' },
              },
              eventsText: '08-09 – Formative Feedback, 08-09 – Academic Audit – I, 13 – Student Activity Slot',
            },
            {
              weekNumber: '10',
              days: {
                Mon: { date: 14, category: 'holiday' },
                Tue: { date: 15, category: 'none' },
                Wed: { date: 16, category: 'none' },
                Thu: { date: 17, category: 'none' },
                Fri: { date: 18, category: 'none' },
                Sat: { date: 19, category: 'none' },
                Sun: { date: 20, category: 'holiday' },
              },
              eventsText: '14 – Ganesh Chaturthi, 19– Gauri-Ganapati Visarjan',
            },
            {
              weekNumber: '11',
              days: {
                Mon: { date: 21, category: 'holiday' },
                Tue: { date: 22, category: 'examination' },
                Wed: { date: 23, category: 'examination' },
                Thu: { date: 24, category: 'examination' },
                Fri: { date: 25, category: 'holiday' },
                Sat: { date: 26, category: 'examination' },
                Sun: { date: 27, category: 'examination' },
              },
              eventsText: '22-29 – Mid Semester Examination, 25 – Anant Chaturdashi (Declared Holiday)',
            },
            {
              weekNumber: '12',
              days: {
                Mon: { date: 28, category: 'holiday' },
                Tue: { date: 29, category: 'examination' },
                Wed: { date: 30, category: 'academic' },
                Thu: { date: null, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: null, category: 'none' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '30 – PEC Meeting',
            },
          ],
        },
        {
          monthLabel: 'Oct. 2026',
          instructionDaysThisMonth: 21,
          weeks: [
            {
              weekNumber: '12',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: null, category: 'none' },
                Wed: { date: null, category: 'none' },
                Thu: { date: 1, category: 'academic' },
                Fri: { date: 2, category: 'holiday' },
                Sat: { date: 3, category: 'academic' },
                Sun: { date: 4, category: 'holiday' },
              },
              eventsText: '01-03 – Display of Attendance and Counseling of Defaulters for the Month of September, 02 – Mahatma Gandhi Jayanti',
            },
            {
              weekNumber: '13',
              days: {
                Mon: { date: 5, category: 'holiday' },
                Tue: { date: 6, category: 'none' },
                Wed: { date: 7, category: 'none' },
                Thu: { date: 8, category: 'none' },
                Fri: { date: 9, category: 'none' },
                Sat: { date: 10, category: 'examination' },
                Sun: { date: 11, category: 'holiday' },
              },
              eventsText: '10 – Mid Semester Examination Result Declaration',
            },
            {
              weekNumber: '14',
              days: {
                Mon: { date: 12, category: 'holiday' },
                Tue: { date: 13, category: 'none' },
                Wed: { date: 14, category: 'none' },
                Thu: { date: 15, category: 'none' },
                Fri: { date: 16, category: 'none' },
                Sat: { date: 17, category: 'none' },
                Sun: { date: 18, category: 'student-activity' },
              },
              eventsText: '18 – Student Activity Slot',
            },
            {
              weekNumber: '15',
              days: {
                Mon: { date: 19, category: 'holiday' },
                Tue: { date: 20, category: 'student-activity' },
                Wed: { date: 21, category: 'student-activity' },
                Thu: { date: 22, category: 'student-activity' },
                Fri: { date: 23, category: 'student-activity' },
                Sat: { date: 24, category: 'student-activity' },
                Sun: { date: 25, category: 'student-activity' },
              },
              eventsText: '20 – Dasara, 21 – Internal Evaluation of PBL Activities, 24 – KIT PBL Day',
            },
            {
              weekNumber: '16',
              days: {
                Mon: { date: 26, category: 'holiday' },
                Tue: { date: 27, category: 'none' },
                Wed: { date: 28, category: 'academic' },
                Thu: { date: 29, category: 'academic' },
                Fri: { date: 30, category: 'none' },
                Sat: { date: 31, category: 'academic' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '28-29 – Summative Feedback, 28-29 – Academic Audit – II, 31 – PEC Meeting, 31 – End of Academic Activities',
            },
          ],
        },
        {
          monthLabel: 'Nov. 2026',
          instructionDaysThisMonth: 20,
          weeks: [
            {
              weekNumber: '16',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: null, category: 'none' },
                Wed: { date: null, category: 'none' },
                Thu: { date: null, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: null, category: 'none' },
                Sun: { date: 1, category: 'student-activity' },
              },
              eventsText: '01 – Abhigyan 2026',
            },
            {
              weekNumber: '17',
              days: {
                Mon: { date: 2, category: 'holiday' },
                Tue: { date: 3, category: 'academic' },
                Wed: { date: 4, category: 'academic' },
                Thu: { date: 5, category: 'academic' },
                Fri: { date: 6, category: 'none' },
                Sat: { date: 7, category: 'none' },
                Sun: { date: 8, category: 'holiday' },
              },
              eventsText: '03-05 – Remedial Classes, 04 – Submission of ISE-II Marks, 04 – Display of Attendance and Defaulters in the Semester, Finalization of List of Detained Students and Submission to the Office of Dean Academics cc to Dean E&E and Registrar, 05 – Freezing of Attendance and ISE (Theory and Lab) Marks, 08 – Diwali (Laxmipujan)',
            },
            {
              weekNumber: '18',
              days: {
                Mon: { date: 9, category: 'holiday' },
                Tue: { date: 10, category: 'holiday' },
                Wed: { date: 11, category: 'holiday' },
                Thu: { date: 12, category: 'examination' },
                Fri: { date: 13, category: 'examination' },
                Sat: { date: 14, category: 'examination' },
                Sun: { date: 15, category: 'examination' },
              },
              eventsText: '10 – Diwali (Balipratipada), 11 – Bhaubij, 12 – Start of Lab POE/ OE (End Semester Examination)',
            },
            {
              weekNumber: '19',
              days: {
                Mon: { date: 16, category: 'holiday' },
                Tue: { date: 17, category: 'examination' },
                Wed: { date: 18, category: 'examination' },
                Thu: { date: 19, category: 'none' },
                Fri: { date: 20, category: 'examination' },
                Sat: { date: 21, category: 'examination' },
                Sun: { date: 22, category: 'examination' },
              },
              eventsText: '18 – Completion of Lab POE/ OE (End Semester Examination), 20 – Start of End Semester Examination (Theory)',
            },
            {
              weekNumber: '20',
              days: {
                Mon: { date: 23, category: 'holiday' },
                Tue: { date: 24, category: 'holiday' },
                Wed: { date: 25, category: 'none' },
                Thu: { date: 26, category: 'examination' },
                Fri: { date: 27, category: 'examination' },
                Sat: { date: 28, category: 'examination' },
                Sun: { date: 29, category: 'examination' },
              },
              eventsText: '24 – Gurunanak Jayanti',
            },
            {
              weekNumber: '21',
              days: {
                Mon: { date: 30, category: 'holiday' },
                Tue: { date: null, category: 'none' },
                Wed: { date: null, category: 'none' },
                Thu: { date: null, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: null, category: 'none' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '',
            },
          ],
        },
        {
          monthLabel: 'Dec. 2026',
          instructionDaysThisMonth: 15,
          weeks: [
            {
              weekNumber: '21',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: 1, category: 'examination' },
                Wed: { date: 2, category: 'examination' },
                Thu: { date: 3, category: 'examination' },
                Fri: { date: 4, category: 'examination' },
                Sat: { date: 5, category: 'examination' },
                Sun: { date: 6, category: 'examination' },
              },
              eventsText: '',
            },
            {
              weekNumber: '22',
              days: {
                Mon: { date: 7, category: 'holiday' },
                Tue: { date: 8, category: 'examination' },
                Wed: { date: 9, category: 'examination' },
                Thu: { date: 10, category: 'examination' },
                Fri: { date: 11, category: 'examination' },
                Sat: { date: 12, category: 'examination' },
                Sun: { date: 13, category: 'examination' },
              },
              eventsText: '08-09 – Probable Date of Smart India Hackathon (SIH) 2026',
            },
            {
              weekNumber: '23',
              days: {
                Mon: { date: 14, category: 'examination' },
                Tue: { date: 15, category: 'examination' },
                Wed: { date: 16, category: 'examination' },
                Thu: { date: 17, category: 'examination' },
                Fri: { date: 18, category: 'examination' },
                Sat: { date: 19, category: 'examination' },
                Sun: { date: 20, category: 'examination' },
              },
              eventsText: '17 – Completion of End Semester Examination (Theory)',
            },
            {
              weekNumber: '24',
              days: {
                Mon: { date: 21, category: 'examination' },
                Tue: { date: 22, category: 'examination' },
                Wed: { date: 23, category: 'examination' },
                Thu: { date: 24, category: 'examination' },
                Fri: { date: 25, category: 'holiday' },
                Sat: { date: 26, category: 'holiday' },
                Sun: { date: 27, category: 'holiday' },
              },
              eventsText: '25 – Christmas',
            },
            {
              weekNumber: '25',
              days: {
                Mon: { date: 28, category: 'holiday' },
                Tue: { date: 29, category: 'none' },
                Wed: { date: 30, category: 'none' },
                Thu: { date: 31, category: 'none' },
                Fri: { date: null, category: 'none' },
                Sat: { date: null, category: 'none' },
                Sun: { date: null, category: 'none' },
              },
              eventsText: '',
            },
          ],
        },
      ],
      summary: {
        totalInstructionDays: 111,
        notes: [
          'Commencement of Academic Year 2026-27 Sem – II (Even Semester): 01st January, 2027',
          'Probable Date of Result Declaration of End Semester Examination (Odd Semester): 07th January, 2027',
        ],
      },
      legend: [
        {
          category: 'academic',
          title: 'Academic Activities',
          description: 'Commencement of Academics',
          dateRange: '14th July, 2026',
        },
        {
          category: 'student-activity',
          title: 'Student Activities',
          description: 'End of Academic Activities (Including Remedial Classes)',
          dateRange: '05th November, 2026',
        },
        {
          category: 'holiday',
          title: 'Holidays/ Public Holidays',
          description: 'Mid Semester Examination',
          dateRange: '22nd to 29th September, 2026',
        },
        {
          category: 'examination',
          title: 'Examination',
          description: 'End Semester Examination (Theory + Lab)',
          dateRange: '12th November to 17th December, 2026',
        },
      ],
      approvals: [
        { role: 'Academic Council' },
        { role: 'Dean-Academics' },
        { role: 'Dean-Examination & Evaluation' },
        { role: 'Dean Quality Assurance' },
      ],
    });
    console.log('Seeded Official Institutional Academic Calendar (July-Dec 2026) successfully!');

    console.log('\n======================================================');
    console.log('✅ DATABASE RESET & SEEDING COMPLETE!');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
