const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Total capacity must be at least 1'],
    },
    ticketsAvailable: {
      type: Number,
      min: [0, 'Available tickets cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    autoDeleteAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ autoDeleteAt: 1 });

eventSchema.pre('validate', function setTicketsAvailable() {
  if (this.isNew && this.ticketsAvailable === undefined) {
    this.ticketsAvailable = this.totalCapacity;
  }
});

module.exports = mongoose.model('Event', eventSchema);
