const MarketplaceListing = require('../models/MarketplaceListing');

/**
 * @desc    Get paginated/filtered marketplace listings
 * @route   GET /api/marketplace
 * @access  Public
 */
const getListings = async (req, res) => {
  try {
    const { category, condition, search, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (condition && condition !== 'All') {
      query.condition = condition;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await MarketplaceListing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sellerId', 'username avatarUrl branch year role reputationScore email');

    const totalListings = await MarketplaceListing.countDocuments(query);

    return res.status(200).json({
      listings,
      page: parseInt(page),
      totalPages: Math.ceil(totalListings / parseInt(limit)),
      totalListings,
    });
  } catch (error) {
    console.error('[Get Marketplace Listings Error]:', error);
    return res.status(500).json({ message: 'Server error fetching marketplace listings' });
  }
};

/**
 * @desc    Create a new marketplace listing
 * @route   POST /api/marketplace
 * @access  Private
 */
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      price,
      originalPurchaseDate,
      sellerContactPreference,
      contactDetail,
      images,
    } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ message: 'Title, description, and price are required' });
    }

    const listing = await MarketplaceListing.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      condition: condition || 'Good',
      price: parseFloat(price),
      originalPurchaseDate: originalPurchaseDate || '',
      sellerContactPreference: sellerContactPreference || 'In-App DM',
      contactDetail: contactDetail || '',
      images: Array.isArray(images) ? images : [],
      sellerId: req.user._id,
      status: 'active',
    });

    const populatedListing = await MarketplaceListing.findById(listing._id).populate(
      'sellerId',
      'username avatarUrl branch year role reputationScore email'
    );

    return res.status(201).json({
      message: 'Marketplace listing published successfully',
      listing: populatedListing,
    });
  } catch (error) {
    console.error('[Create Listing Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error creating listing' });
  }
};

/**
 * @desc    Get single marketplace listing by ID
 * @route   GET /api/marketplace/:id
 * @access  Public
 */
const getListingById = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id).populate(
      'sellerId',
      'username avatarUrl branch year role reputationScore email'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.status(200).json({ listing });
  } catch (error) {
    console.error('[Get Listing By ID Error]:', error);
    return res.status(500).json({ message: 'Server error fetching listing' });
  }
};

/**
 * @desc    Update listing (or mark as sold)
 * @route   PUT /api/marketplace/:id
 * @access  Private (Seller or Admin)
 */
const updateListing = async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const isOwner = listing.sellerId.toString() === req.user._id.toString();
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Forbidden: You cannot modify this listing' });
    }

    const { status, title, description, price, condition, category } = req.body;
    if (status) listing.status = status;
    if (title) listing.title = title.trim();
    if (description) listing.description = description.trim();
    if (price !== undefined) listing.price = parseFloat(price);
    if (condition) listing.condition = condition;
    if (category) listing.category = category;

    await listing.save();

    const updatedListing = await MarketplaceListing.findById(listing._id).populate(
      'sellerId',
      'username avatarUrl branch year role reputationScore email'
    );

    return res.status(200).json({ message: 'Listing updated successfully', listing: updatedListing });
  } catch (error) {
    console.error('[Update Listing Error]:', error);
    return res.status(500).json({ message: 'Server error updating listing' });
  }
};

/**
 * @desc    Flag a listing for moderation review
 * @route   POST /api/marketplace/:id/flag
 * @access  Private
 */
const flagListing = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Please provide a reason for flagging this listing' });
    }

    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const alreadyFlagged = listing.flags.some((f) => f.reportedBy.toString() === req.user._id.toString());
    if (alreadyFlagged) {
      return res.status(400).json({ message: 'You have already reported this listing' });
    }

    listing.flags.push({
      reportedBy: req.user._id,
      reason: reason.trim(),
      createdAt: new Date(),
    });
    listing.isFlagged = true;

    await listing.save();

    return res.status(200).json({ message: 'Listing reported for moderation review', listing });
  } catch (error) {
    console.error('[Flag Listing Error]:', error);
    return res.status(500).json({ message: 'Server error reporting listing' });
  }
};

/**
 * @desc    Get moderation queue of flagged / review listings
 * @route   GET /api/marketplace/moderation/queue
 * @access  Private (Faculty / Moderator / Admin)
 */
const getModerationQueue = async (req, res) => {
  try {
    if (!['faculty', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted to Moderators and Faculty' });
    }

    const listings = await MarketplaceListing.find({
      $or: [{ isFlagged: true }, { status: 'flagged' }],
    })
      .sort({ updatedAt: -1 })
      .populate('sellerId', 'username avatarUrl branch year role reputationScore email')
      .populate('flags.reportedBy', 'username email role');

    return res.status(200).json({ listings });
  } catch (error) {
    console.error('[Get Moderation Queue Error]:', error);
    return res.status(500).json({ message: 'Server error fetching moderation queue' });
  }
};

/**
 * @desc    Moderate listing (approve / clear flags or remove)
 * @route   POST /api/marketplace/:id/moderate
 * @access  Private (Faculty / Moderator / Admin)
 */
const moderateListing = async (req, res) => {
  try {
    if (!['faculty', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted to Moderators and Faculty' });
    }

    const { action } = req.body; // 'approve' (clear flags) or 'remove'
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (action === 'remove') {
      listing.status = 'removed';
      listing.isFlagged = false;
    } else if (action === 'approve') {
      listing.status = 'active';
      listing.isFlagged = false;
      listing.flags = [];
    } else {
      return res.status(400).json({ message: 'Invalid moderation action. Must be approve or remove' });
    }

    await listing.save();

    return res.status(200).json({
      message: action === 'remove' ? 'Listing removed by moderator' : 'Listing flags cleared & approved',
      listing,
    });
  } catch (error) {
    console.error('[Moderate Listing Error]:', error);
    return res.status(500).json({ message: 'Server error moderating listing' });
  }
};

module.exports = {
  getListings,
  createListing,
  getListingById,
  updateListing,
  flagListing,
  getModerationQueue,
  moderateListing,
};
