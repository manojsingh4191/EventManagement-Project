const express = require('express');
const {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getOrganizerAnalytics,
  getOrganizerEvents,
  updateEvent,
} = require('../controllers/eventController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.get('/mine', protect, authorize('Organizer', 'Admin'), getOrganizerEvents);
router.get('/mine/analytics', protect, authorize('Organizer', 'Admin'), getOrganizerAnalytics);
router.get('/:id', getEventById);
router.post('/', protect, authorize('Organizer', 'Admin'), createEvent);
router.put('/:id', protect, authorize('Organizer', 'Admin'), updateEvent);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteEvent);

module.exports = router;
