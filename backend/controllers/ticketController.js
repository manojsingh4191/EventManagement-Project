const crypto = require('crypto');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

const createQrCodeHash = () => {
  return crypto.randomBytes(24).toString('hex');
};

const bookTicket = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, ticketsAvailable: { $gt: 0 } },
      { $inc: { ticketsAvailable: -1 } },
      { new: true }
    );

    if (!event) {
      return res.status(400).json({ message: 'Event is sold out or does not exist' });
    }

    const ticket = await Ticket.create({
      eventId: event._id,
      userId: req.user._id,
      qrCodeHash: createQrCodeHash(),
      paymentStatus: 'Paid',
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('eventId', 'title date location price imageUrl')
      .populate('userId', 'name email');

    return res.status(201).json({
      message: 'Ticket booked successfully',
      ticket: populatedTicket,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to book ticket', error: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate('eventId', 'title description date location price imageUrl')
      .sort({ createdAt: -1 });

    return res.json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

const scanTicket = async (req, res) => {
  try {
    const { qrCodeHash } = req.body;

    if (!qrCodeHash) {
      return res.status(400).json({ message: 'QR code hash is required' });
    }

    const ticket = await Ticket.findOne({ qrCodeHash })
      .populate('eventId', 'title date location organizerId')
      .populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const organizerId = ticket.eventId?.organizerId?.toString();
    const isOwner = organizerId === req.user._id.toString();

    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You can only scan tickets for your own events' });
    }

    if (ticket.isScanned) {
      return res.status(409).json({
        message: 'Ticket has already been scanned',
        ticket,
      });
    }

    ticket.isScanned = true;
    await ticket.save();

    return res.json({
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to validate ticket', error: error.message });
  }
};

module.exports = {
  bookTicket,
  getMyTickets,
  scanTicket,
};
