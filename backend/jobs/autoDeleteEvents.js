const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

const ONE_HOUR = 60 * 60 * 1000;

const runAutoDeleteEvents = async () => {
  const now = new Date();
  const expiredEvents = await Event.find({
    autoDeleteAt: { $ne: null, $lte: now },
  }).select('_id title autoDeleteAt');

  if (expiredEvents.length === 0) {
    return;
  }

  const eventIds = expiredEvents.map((event) => event._id);
  await Ticket.deleteMany({ eventId: { $in: eventIds } });
  await Event.deleteMany({ _id: { $in: eventIds } });

  console.log(`Auto-deleted ${expiredEvents.length} expired event(s).`);
};

const startAutoDeleteJob = () => {
  runAutoDeleteEvents().catch((error) => {
    console.error(`Initial auto-delete job failed: ${error.message}`);
  });

  const interval = setInterval(() => {
    runAutoDeleteEvents().catch((error) => {
      console.error(`Auto-delete job failed: ${error.message}`);
    });
  }, ONE_HOUR);

  interval.unref?.();
};

module.exports = {
  runAutoDeleteEvents,
  startAutoDeleteJob,
};
