const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Channel = require('../models/Channel');

const EXPECTED_TAXONOMY_SLUGS = [
  'official-notices',
  'general-lounge',
  'r-tech-discussions',
  'r-research-innovations',
  'r-startup-ideas',
  'r-alumni-network',
  'r-gaming-esports',
  'exam-schedules',
  'hall-tickets',
  'exam-results',
  'exam-inquiries',
  'cse-dept',
  'aiml-dept',
  'biotech-dept',
  'civil-dept',
  'entc-dept',
  'elec-dept',
  'mech-dept',
  'placement-drives',
  'training-and-workshops',
  'job-opportunities-internships',
  'career-notices',
  'iste-club',
  'ecell-club',
  'mavericks-club',
  'sdc-club',
  'writers-club',
  'ebsb-club',
  'cultural-club',
  'aura-club',
  'shourya-club',
  'womencell-club',
  'rotaract-club',
  'swe-club',
  'walkwithworld-club',
  'ncc-club',
  'nss-club',
  'leadindia-club',
  'petrichor-club',
];

const verifyTaxonomy = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kitcommunity';
    await mongoose.connect(mongoUri);

    const channels = await Channel.find({});
    const actualSlugs = channels.map((c) => c.slug);
    const actualSlugSet = new Set(actualSlugs);
    const expectedSlugSet = new Set(EXPECTED_TAXONOMY_SLUGS);

    console.log(`[Taxonomy Guard] Found ${channels.length} channels in MongoDB.`);

    // 1. Check for missing required taxonomy channels
    const missingSlugs = EXPECTED_TAXONOMY_SLUGS.filter((slug) => !actualSlugSet.has(slug));
    if (missingSlugs.length > 0) {
      throw new Error(`[Taxonomy Guard Failed] Missing required taxonomy channels (${missingSlugs.length}): ${missingSlugs.join(', ')}`);
    }

    // 2. Check for unexpected / unverified extra channel slugs
    const unexpectedSlugs = actualSlugs.filter((slug) => !expectedSlugSet.has(slug));
    if (unexpectedSlugs.length > 0) {
      console.warn(`[Taxonomy Guard Warning] Found ${unexpectedSlugs.length} custom/extra channel(s) outside base taxonomy: ${unexpectedSlugs.join(', ')}`);
    }

    // 3. Exact taxonomy slug assertion
    const isExactMatch = EXPECTED_TAXONOMY_SLUGS.every((slug) => actualSlugSet.has(slug));
    if (!isExactMatch) {
      throw new Error('[Taxonomy Guard Failed] Taxonomy slug match validation failed.');
    }

    console.log(`✅ [Taxonomy Guard Passed] All ${EXPECTED_TAXONOMY_SLUGS.length} official taxonomy channels are 100% verified intact.`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

verifyTaxonomy();
