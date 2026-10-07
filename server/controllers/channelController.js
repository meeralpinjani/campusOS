const Channel = require('../models/Channel');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const DEFAULT_CHANNELS = [
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

const getChannels = async (req, res) => {
  try {
    let channels = await Channel.find().sort({ createdAt: 1 });

    if (channels.length === 0) {
      console.log('[Seeding KITCOEK Categorized Channels...]');
      const defaultUserId = req.user ? req.user._id : '000000000000000000000000';
      const seeded = DEFAULT_CHANNELS.map((ch) => ({
        ...ch,
        createdBy: defaultUserId,
      }));
      channels = await Channel.insertMany(seeded);
    }

    return res.status(200).json({ channels });
  } catch (error) {
    console.error('[Get Channels Error]:', error);
    return res.status(500).json({ message: 'Server error fetching channels' });
  }
};

const getChannelBySlug = async (req, res) => {
  try {
    const channel = await Channel.findOne({ slug: req.params.slug });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    return res.status(200).json({ channel });
  } catch (error) {
    console.error('[Get Channel By Slug Error]:', error);
    return res.status(500).json({ message: 'Server error fetching channel details' });
  }
};

const createChannel = async (req, res) => {
  try {
    const { name, description, type, category, group, icon, isRestricted } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const slug = slugify(name);

    const existingChannel = await Channel.findOne({ slug });
    if (existingChannel) {
      return res.status(400).json({ message: 'A channel with this name or slug already exists' });
    }

    const channel = await Channel.create({
      name: name.trim(),
      slug,
      description: description || '',
      type: type || 'general',
      category: category || 'Engineering Departments',
      group: group || 'Campus Clubs & Societies',
      icon: icon || 'Hash',
      isRestricted: !!isRestricted,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: 'Channel created successfully',
      channel,
    });
  } catch (error) {
    console.error('[Create Channel Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error creating channel' });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isStaff = ['moderator', 'admin'].includes(req.user.role);
    if (!isStaff) {
      return res.status(403).json({ message: 'Only Admins or Moderators can delete channels' });
    }

    await Channel.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Channel deleted successfully', channelId: id });
  } catch (error) {
    console.error('[Delete Channel Error]:', error);
    return res.status(500).json({ message: 'Server error deleting channel' });
  }
};

module.exports = {
  getChannels,
  getChannelBySlug,
  createChannel,
  deleteChannel,
};
