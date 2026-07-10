const express = require('express');
const { bookTicket, getMyTickets, scanTicket } = require('../controllers/ticketController');
const { authorize, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/mine', protect, authorize('Attendee', 'Admin'), getMyTickets);
router.post('/scan', protect, authorize('Organizer', 'Admin'), scanTicket);
router.post('/book/:eventId', protect, authorize('Attendee', 'Admin'), bookTicket);

module.exports = router;
