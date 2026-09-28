const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      default: 0,
      min: [0, 'Value cannot be negative'],
    },
    stage: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
        message: '{VALUE} is not a valid stage',
      },
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Deal', dealSchema);
