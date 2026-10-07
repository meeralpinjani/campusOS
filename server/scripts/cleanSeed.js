const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Channel = require('../models/Channel');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const AcademicCalendar = require('../models/AcademicCalendar');
const Notification = require('../models/Notification');
const MarketplaceListing = require('../models/MarketplaceListing');
const CommunityRequest = require('../models/CommunityRequest');
const Message = require('../models/Message');
const Poll = require('../models/Poll');

const FULL_TAXONOMY_CHANNELS = [
  // 1. Official Announcements
  {
    name: 'Announcements & Notices',
    slug: 'official-notices',
    description: 'Central official circulars, exam schedules, and administrative notices.',
    type: 'general',
    group: 'Official Announcements',
    isRestricted: true,
  },
  {
    name: 'General Campus Lounge',
    slug: 'general-lounge',
    description: 'Open discussions, campus events, and general student lounge.',
    type: 'general',
    group: 'Official Announcements',
    isRestricted: false,
  },

  // 2. Communities (Reddit-style)
  {
    name: 'r/Tech_Discussions',
    slug: 'r-tech-discussions',
    description: 'Tech trends, software engineering, AI, open source, and dev discussions.',
    type: 'interest',
    group: 'Communities (Reddit-style)',
    isRestricted: false,
  },
  {
    name: 'r/Research_Innovations',
    slug: 'r-research-innovations',
    description: 'Academic research papers, patent filings, grants, and technical innovations.',
    type: 'interest',
    group: 'Communities (Reddit-style)',
    isRestricted: false,
  },
  {
    name: 'r/Startup_Ideas',
    slug: 'r-startup-ideas',
    description: 'Entrepreneurship, pitch decks, startup incubators, and founder networking.',
    type: 'interest',
    group: 'Communities (Reddit-style)',
    isRestricted: false,
  },
  {
    name: 'r/Alumni_Network',
    slug: 'r-alumni-network',
    description: 'Connecting current students with KITCoEK alumni worldwide.',
    type: 'interest',
    group: 'Communities (Reddit-style)',
    isRestricted: false,
  },
  {
    name: 'r/Gaming_eSports',
    slug: 'r-gaming-esports',
    description: 'Gaming tournaments, Valorant, BGMI, LAN parties, and eSports teams.',
    type: 'interest',
    group: 'Communities (Reddit-style)',
    isRestricted: false,
  },

  // 3. Examination Cell & CoE
  {
    name: 'Exam Schedules & Timetables',
    slug: 'exam-schedules',
    description: 'Mid-term, End-semester exam timetables and official circulars.',
    type: 'general',
    group: 'Examination Cell & CoE',
    isRestricted: false,
  },
  {
    name: 'Hall Tickets & Seating',
    slug: 'hall-tickets',
    description: 'Hall ticket issuance, seating arrangements, and exam rules.',
    type: 'general',
    group: 'Examination Cell & CoE',
    isRestricted: false,
  },
  {
    name: 'Revaluation & Results',
    slug: 'exam-results',
    description: 'Grade sheets, revaluation applications, and result declarations.',
    type: 'general',
    group: 'Examination Cell & CoE',
    isRestricted: false,
  },
  {
    name: 'Exam Cell Inquiries & Support',
    slug: 'exam-inquiries',
    description: 'Student support for grade discrepancies, transcripts, and exam queries.',
    type: 'general',
    group: 'Examination Cell & CoE',
    isRestricted: false,
  },

  // 4. Engineering Departments
  {
    name: 'Computer Science & Engineering',
    slug: 'cse-dept',
    description: 'CSE department updates, lab notices, and project discussions.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'AI & Machine Learning (AIML)',
    slug: 'aiml-dept',
    description: 'AIML department projects, deep learning labs, and AI workshops.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'Biotechnology Engineering',
    slug: 'biotech-dept',
    description: 'Biotech lab schedules, research papers, and bio-engineering events.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'Civil Engineering',
    slug: 'civil-dept',
    description: 'Civil engineering structural design, site visits, and department news.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'Electronics & Telecomm (ENTC)',
    slug: 'entc-dept',
    description: 'ENTC circuit design, embedded systems, and communications labs.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'Electrical Engineering',
    slug: 'elec-dept',
    description: 'Electrical power systems, renewable energy, and department alerts.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },
  {
    name: 'Mechanical Engineering',
    slug: 'mech-dept',
    description: 'Mechanical workshop schedules, CAD/CAM, and automotive engineering.',
    type: 'branch',
    group: 'Engineering Departments',
    isRestricted: false,
  },

  // 5. Careers & Placements
  {
    name: 'Placement Drives & Schedules',
    slug: 'placement-drives',
    description: 'Upcoming company visits, recruitment schedules, and interview links.',
    type: 'interest',
    group: 'Careers & Placements',
    isRestricted: false,
  },
  {
    name: 'Training & Workshops',
    slug: 'training-and-workshops',
    description: 'Aptitude training, soft skills workshops, and resume review sessions.',
    type: 'interest',
    group: 'Careers & Placements',
    isRestricted: false,
  },
  {
    name: 'Job & Internship Opportunities',
    slug: 'job-opportunities-internships',
    description: 'Off-campus jobs, summer internships, and referral opportunities.',
    type: 'interest',
    group: 'Careers & Placements',
    isRestricted: false,
  },
  {
    name: 'Career Notices & Alerts',
    slug: 'career-notices',
    description: 'Higher studies guidance, GATE/GRE updates, and TPO announcements.',
    type: 'interest',
    group: 'Careers & Placements',
    isRestricted: false,
  },

  // 6. Official Campus Clubs (17 Clubs)
  {
    name: 'ISTE Student Chapter',
    slug: 'iste-club',
    description: 'Indian Society for Technical Education (ISTE) student chapter activities.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'E-Cell KITCoEK',
    slug: 'ecell-club',
    description: 'Entrepreneurship Cell promoting student startups and innovation.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Team Mavericks',
    slug: 'mavericks-club',
    description: 'BAJA SAE & Formula Student motorsports team of KITCoEK.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Software Development Club (SDC)',
    slug: 'sdc-club',
    description: 'Student coding club developing real-world projects and open source software.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Writers Club',
    slug: 'writers-club',
    description: 'Literature, poetry, campus magazine, and creative writing.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Ek Bharat Shreshtha Bharat (EBSB)',
    slug: 'ebsb-club',
    description: 'Cultural exchange initiatives under Ministry of Education EBSB scheme.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Cultural Club',
    slug: 'cultural-club',
    description: 'Music, dance, drama, and annual festival cultural performances.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'AURA Fine Arts Club',
    slug: 'aura-club',
    description: 'Painting, photography, sketch art, and design aesthetics club.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Shourya Sports Club',
    slug: 'shourya-club',
    description: 'Cricket, football, badminton, athletics, and inter-college sports.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Women Empowerment Cell',
    slug: 'womencell-club',
    description: 'Seminars, safety awareness, leadership, and women engineer mentorship.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Rotaract Club KITCoEK',
    slug: 'rotaract-club',
    description: 'Community service, blood donation drives, and youth leadership.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Society of Women Engineers (SWE)',
    slug: 'swe-club',
    description: 'SWE KITCoEK affiliate promoting female participation in STEM fields.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Walk With World Club',
    slug: 'walkwithworld-club',
    description: 'International student exposure, global scholarships, and foreign languages.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'NCC Cadets Chapter',
    slug: 'ncc-club',
    description: 'National Cadet Corps training camps, discipline, and parade drills.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'NSS Volunteer Corps',
    slug: 'nss-club',
    description: 'National Service Scheme village camps, environmental awareness, and social work.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Lead India Club',
    slug: 'leadindia-club',
    description: 'Youth leadership development, public speaking, and civic responsibility.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
  {
    name: 'Petrichor Green Club',
    slug: 'petrichor-club',
    description: 'Campus sustainability, tree plantation drives, and eco-friendly initiatives.',
    type: 'interest',
    group: 'Official Campus Clubs',
    isRestricted: false,
  },
];

const seedCleanDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kitcommunity';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const bcrypt = require('bcryptjs');

    console.log('Seeding / updating credentials...');
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@kitcoek.in' },
      {
        username: 'admin',
        email: 'admin@kitcoek.in',
        passwordHash: await bcrypt.hash('adminpassword123', 10),
        role: 'admin',
        branch: 'Computer Science & Engineering',
        year: 'N/A',
        bio: 'System Administrator & Academic Council Overseer',
        reputationScore: 500,
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'shekhar.jalane@kitcoek.in' },
      {
        username: 'Shekhar Jalane',
        email: 'shekhar.jalane@kitcoek.in',
        passwordHash: await bcrypt.hash('facultypassword123', 10),
        role: 'faculty',
        branch: 'Computer Science & Engineering',
        year: 'N/A',
        bio: 'Faculty Member, Department of Computer Science & Engineering',
        reputationScore: 250,
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'aarav.sharma@kitcoek.in' },
      {
        username: 'Aarav Sharma',
        email: 'aarav.sharma@kitcoek.in',
        passwordHash: await bcrypt.hash('modpassword123', 10),
        role: 'moderator',
        branch: 'Computer Science & Engineering',
        year: 'Final Year B.Tech',
        bio: 'Student Council Moderator',
        reputationScore: 150,
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'meeral.pinjani@kitcoek.in' },
      {
        username: 'Meeral Pinjani',
        email: 'meeral.pinjani@kitcoek.in',
        passwordHash: await bcrypt.hash('studentpassword123', 10),
        role: 'student',
        branch: 'Computer Science & Engineering',
        year: 'T.Y. B.Tech',
        bio: '3rd Year Computer Science Student',
        reputationScore: 50,
      },
      { upsert: true, new: true }
    );

    console.log(`Upserting full taxonomy of ${FULL_TAXONOMY_CHANNELS.length} campus channels (non-destructive)...`);
    for (const chData of FULL_TAXONOMY_CHANNELS) {
      await Channel.findOneAndUpdate(
        { slug: chData.slug },
        { ...chData, createdBy: adminUser._id },
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded/upserted ${FULL_TAXONOMY_CHANNELS.length} channels.`);

    console.log('Seeding 100% EXACT cell-by-cell replica Academic Calendar (matching image 100%)...');
    await AcademicCalendar.deleteMany({});
    const academicCalendar = await AcademicCalendar.create({
      title: 'S.Y.B.Tech, T.Y.B.Tech and Final Year B.Tech',
      semesterLabel: '(ODD SEMESTER, 2026-27)',
      academicYear: '2026-27',
      isActive: true,
      createdBy: adminUser._id,
      months: [
        // 1. July 2026 (14 Instruction Days)
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
                Tue: { date: 7, category: 'holiday' },
                Wed: { date: 8, category: 'holiday' },
                Thu: { date: 9, category: 'holiday' },
                Fri: { date: 10, category: 'holiday' },
                Sat: { date: 11, category: 'holiday' },
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

        // 2. August 2026 (19 Instruction Days)
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

        // 3. Sept. 2026 (22 Instruction Days)
        {
          monthLabel: 'Sept. 2026',
          instructionDaysThisMonth: 22,
          weeks: [
            {
              weekNumber: '8',
              days: {
                Mon: { date: null, category: 'none' },
                Tue: { date: 1, category: 'academic' },
                Wed: { date: 2, category: 'none' },
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
                Sun: { date: 13, category: 'holiday' },
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
                Sat: { date: 19, category: 'holiday' },
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
                Sun: { date: 27, category: 'holiday' },
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

        // 4. Oct. 2026 (21 Instruction Days)
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
                Tue: { date: 20, category: 'holiday' },
                Wed: { date: 21, category: 'none' },
                Thu: { date: 22, category: 'none' },
                Fri: { date: 23, category: 'student-activity' },
                Sat: { date: 24, category: 'student-activity' },
                Sun: { date: 25, category: 'holiday' },
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

        // 5. Nov. 2026 (20 Instruction Days)
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
                Wed: { date: 18, category: 'none' },
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
                Sun: { date: 29, category: 'holiday' },
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

        // 6. Dec. 2026 (15 Instruction Days)
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
                Sat: { date: 5, category: 'none' },
                Sun: { date: 6, category: 'holiday' },
              },
              eventsText: '',
            },
            {
              weekNumber: '22',
              days: {
                Mon: { date: 7, category: 'holiday' },
                Tue: { date: 8, category: 'none' },
                Wed: { date: 9, category: 'none' },
                Thu: { date: 10, category: 'none' },
                Fri: { date: 11, category: 'none' },
                Sat: { date: 12, category: 'none' },
                Sun: { date: 13, category: 'holiday' },
              },
              eventsText: '08-09 – Probable Date of Smart India Hackathon (SIH) 2026',
            },
            {
              weekNumber: '23',
              days: {
                Mon: { date: 14, category: 'holiday' },
                Tue: { date: 15, category: 'none' },
                Wed: { date: 16, category: 'none' },
                Thu: { date: 17, category: 'examination' },
                Fri: { date: 18, category: 'none' },
                Sat: { date: 19, category: 'none' },
                Sun: { date: 20, category: 'holiday' },
              },
              eventsText: '17 – Completion of End Semester Examination (Theory)',
            },
            {
              weekNumber: '24',
              days: {
                Mon: { date: 21, category: 'holiday' },
                Tue: { date: 22, category: 'none' },
                Wed: { date: 23, category: 'none' },
                Thu: { date: 24, category: 'none' },
                Fri: { date: 25, category: 'holiday' },
                Sat: { date: 26, category: 'none' },
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
          title: 'Commencement of Academics',
          description: 'Commencement of Academics',
          dateRange: '14th July, 2026',
        },
        {
          category: 'student-activity',
          title: 'End of Academic Activities',
          description: 'End of Academic Activities (Including Remedial Classes)',
          dateRange: '05th November, 2026',
        },
        {
          category: 'holiday',
          title: 'Mid Semester Examination',
          description: 'Mid Semester Examination',
          dateRange: '22nd to 29th September, 2026',
        },
        {
          category: 'examination',
          title: 'End Semester Examination',
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
    console.log('Seeded 100% EXACT cell-by-cell replica Academic Calendar:', academicCalendar.title);

    console.log('\n======================================================');
    console.log('SEED COMPLETE WITH FULL TAXONOMY & 100% EXACT CALENDAR!');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedCleanDatabase();
