const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Textbooks & Notes',
        'Electronics & Gadgets',
        'Drawing & Drafting Tools',
        'Lab Equipment',
        'Hostel Essentials',
        'Vehicles & Cycles',
        'Other',
      ],
      default: 'Other',
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Used'],
      default: 'Good',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPurchaseDate: {
      type: String,
      default: '',
    },
    sellerContactPreference: {
      type: String,
      enum: ['In-App DM', 'Phone Call', 'WhatsApp', 'Email'],
      default: 'In-App DM',
    },
    contactDetail: {
      type: String,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'removed', 'flagged'],
      default: 'active',
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flags: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

marketplaceListingSchema.index({ status: 1, createdAt: -1 });
marketplaceListingSchema.index({ category: 1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
