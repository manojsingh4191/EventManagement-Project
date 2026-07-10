const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

const getValidationMessage = (error, fallback) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  return error.message || fallback;
};

const normalizeEventPayload = (body) => {
  const totalCapacity = Number(body.totalCapacity);
  const price = Number(body.price);
  const date = body.date ? new Date(body.date) : null;
  const autoDeleteAt = body.autoDeleteAt ? new Date(body.autoDeleteAt) : null;

  return {
    title: body.title?.trim(),
    description: body.description?.trim(),
    date,
    location: body.location?.trim(),
    totalCapacity,
    price,
    imageUrl: body.imageUrl?.trim() || '',
    autoDeleteAt,
  };
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizerId', 'name email')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your events', error: error.message });
  }
};

const getOrganizerAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).select('title totalCapacity ticketsAvailable price');
    const eventIds = events.map((event) => event._id);

    const ticketCounts = await Ticket.aggregate([
      { $match: { eventId: { $in: eventIds }, paymentStatus: 'Paid' } },
      { $group: { _id: '$eventId', sold: { $sum: 1 } } },
    ]);

    const soldByEvent = new Map(ticketCounts.map((item) => [item._id.toString(), item.sold]));

    const eventBreakdown = events.map((event) => {
      const ticketsSold = soldByEvent.get(event._id.toString()) || 0;
      const revenue = ticketsSold * event.price;

      return {
        eventId: event._id,
        title: event.title,
        ticketsSold,
        revenue,
        capacity: event.totalCapacity,
        ticketsAvailable: event.ticketsAvailable,
      };
    });

    const totals = eventBreakdown.reduce(
      (summary, event) => ({
        ticketsSold: summary.ticketsSold + event.ticketsSold,
        revenue: summary.revenue + event.revenue,
      }),
      { ticketsSold: 0, revenue: 0 }
    );

    return res.json({
      totals,
      events: eventBreakdown,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json({ event });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const eventPayload = normalizeEventPayload(req.body);

    if (!Number.isFinite(eventPayload.totalCapacity) || eventPayload.totalCapacity < 1) {
      return res.status(400).json({ message: 'Total capacity must be at least 1' });
    }

    if (!Number.isFinite(eventPayload.price) || eventPayload.price < 0) {
      return res.status(400).json({ message: 'Ticket price cannot be negative' });
    }

    if (!eventPayload.date || Number.isNaN(eventPayload.date.getTime())) {
      return res.status(400).json({ message: 'Please choose a valid event date and time' });
    }

    if (eventPayload.autoDeleteAt && Number.isNaN(eventPayload.autoDeleteAt.getTime())) {
      return res.status(400).json({ message: 'Please choose a valid auto-delete date and time' });
    }

    const event = await Event.create({
      organizerId: req.user._id,
      ...eventPayload,
      ticketsAvailable: eventPayload.totalCapacity,
    });

    res.status(201).json({ event });
  } catch (error) {
    res.status(400).json({
      message: getValidationMessage(error, 'Failed to create event'),
      error: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You can only update your own events' });
    }

    const eventPayload = normalizeEventPayload({ ...event.toObject(), ...req.body });
    const previousCapacity = event.totalCapacity;
    const soldTickets = previousCapacity - event.ticketsAvailable;
    const nextCapacity = req.body.totalCapacity !== undefined ? eventPayload.totalCapacity : previousCapacity;

    if (nextCapacity < soldTickets) {
      return res.status(400).json({
        message: `Total capacity cannot be less than tickets already sold (${soldTickets})`,
      });
    }

    event.title = eventPayload.title;
    event.description = eventPayload.description;
    event.date = eventPayload.date;
    event.location = eventPayload.location;
    event.price = eventPayload.price;
    event.imageUrl = eventPayload.imageUrl;

    if (req.body.totalCapacity !== undefined) {
      event.totalCapacity = nextCapacity;
      event.ticketsAvailable = nextCapacity - soldTickets;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'autoDeleteAt')) {
      if (eventPayload.autoDeleteAt && Number.isNaN(eventPayload.autoDeleteAt.getTime())) {
        return res.status(400).json({ message: 'Please choose a valid auto-delete date and time' });
      }

      event.autoDeleteAt = eventPayload.autoDeleteAt;
    }

    const updatedEvent = await event.save();
    return res.json({ event: updatedEvent });
  } catch (error) {
    return res.status(400).json({
      message: getValidationMessage(error, 'Failed to update event'),
      error: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    const deletedTickets = await Ticket.deleteMany({ eventId: event._id });
    await event.deleteOne();

    return res.json({
      message: 'Event deleted successfully',
      deletedTickets: deletedTickets.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

module.exports = {
  getEvents,
  getOrganizerEvents,
  getOrganizerAnalytics,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
