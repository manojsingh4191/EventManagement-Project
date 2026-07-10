import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import useAuth from '../hooks/useAuth';
import { fadeUp, motionTransition } from '../utils/animations';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setBooking(true);

    try {
      const { data } = await api.post(`/tickets/book/${id}`);
      setEvent(data.event);
      setSuccess('Ticket booked successfully. You can view it in My Tickets.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to book ticket.');
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setDeleting(true);

    try {
      await api.delete(`/events/${id}`);
      navigate('/organizer');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete event.');
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 sm:p-6">
          Loading event...
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <p className="text-sm text-red-700">{error || 'Event not found.'}</p>
          <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-600">
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  const organizerId = event.organizerId?._id || event.organizerId;
  const canManageEvent = user && (user.role === 'Admin' || organizerId === user.id);
  const canBook = event.ticketsAvailable > 0 && (!user || user.role === 'Attendee' || user.role === 'Admin');

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <ArrowLeft size={18} />
        Back to events
      </Link>

      <motion.section
        className="mt-4 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={motionTransition}
      >
        <motion.div
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          whileHover={{ y: -2 }}
          transition={motionTransition}
        >
          <div className="aspect-[16/9] bg-slate-200">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-indigo-50 text-lg font-semibold text-indigo-600">
                EventFlow
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <h1 className="break-words text-2xl font-bold text-slate-950 sm:text-3xl">{event.title}</h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">{event.description}</p>
          </div>
        </motion.div>

        <motion.aside
          className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          whileHover={{ y: -2 }}
          transition={motionTransition}
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-950">Date</dt>
              <dd className="mt-1 text-slate-600">{formatDateTime(event.date)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Location</dt>
              <dd className="mt-1 text-slate-600">{event.location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Organizer</dt>
              <dd className="mt-1 text-slate-600">{event.organizerId?.name || 'Organizer'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Availability</dt>
              <dd className="mt-1 text-slate-600">
                {event.ticketsAvailable} of {event.totalCapacity} tickets left
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Price</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-950">{formatCurrency(event.price)}</dd>
            </div>
            {event.autoDeleteAt && (
              <div>
                <dt className="font-semibold text-slate-950">Auto-delete</dt>
                <dd className="mt-1 text-slate-600">{formatDateTime(event.autoDeleteAt)}</dd>
              </div>
            )}
          </dl>

          {error && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {canManageEvent ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to={`/organizer/events/${event._id}/edit`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
              >
                <Pencil size={18} />
                Edit Event
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-red-500 hover:shadow-md active:scale-[0.98]"
              >
                <Trash2 size={18} />
                Delete Event
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleBook}
              disabled={!canBook || booking}
              className="mt-6 min-h-11 w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100 disabled:hover:shadow-sm"
            >
              {booking ? 'Booking...' : event.ticketsAvailable > 0 ? 'Book Ticket' : 'Sold Out'}
            </button>
          )}

          {success && (
            <Link
              to="/tickets"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              View My Tickets
            </Link>
          )}
        </motion.aside>
      </motion.section>

      {isDeleteModalOpen && (
        <ConfirmModal
          title="Delete event?"
          message="Are you sure you want to delete this event? This will also remove all tickets associated with it."
          confirmLabel="Delete Event"
          isLoading={deleting}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
