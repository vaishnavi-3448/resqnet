const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  victim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['food', 'water', 'medical', 'shelter', 'rescue', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      default: ''
    }
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  images: [{
    type: String // image URLs from cloudinary
  }],
  peopleCount: {
    type: Number,
    default: 1 // how many people need help
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);