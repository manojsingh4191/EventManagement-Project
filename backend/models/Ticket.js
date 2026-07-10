const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrCodeHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isScanned: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Paid',
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ eventId: 1, userId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
