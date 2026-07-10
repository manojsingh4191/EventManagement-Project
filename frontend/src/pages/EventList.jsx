import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { fadeUp, motionTransition, staggerContainer } from '../utils/animations';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data.events);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <motion.section
        className="mb-6 sm:mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={motionTransition}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Discover events
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl lg:text-4xl">
          Book your next experience
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Browse upcoming events, check availability, and reserve a QR-enabled ticket.
        </p>
      </motion.section>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 sm:p-6">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center sm:p-10">
          <h2 className="text-lg font-semibold text-slate-950">No events available</h2>
          <p className="mt-2 text-sm text-slate-600">Organizer-created events will appear here.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {events.map((event) => (
            <motion.article
              key={event._id}
              variants={fadeUp}
              transition={motionTransition}
              whileHover={{ y: -4 }}
              className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg"
            >
              <div className="aspect-[16/9] bg-slate-200">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-indigo-50 text-sm font-semibold text-indigo-600">
                    EventFlow
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h2 className="break-words text-base font-semibold text-slate-950 sm:text-lg">{event.title}</h2>
                  <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {formatCurrency(event.price)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{formatDateTime(event.date)}</p>
                <p className="mt-1 text-sm text-slate-600">{event.location}</p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{event.description}</p>
                <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {event.ticketsAvailable} tickets left
                  </span>
                  <Link
                    to={`/events/${event._id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-[0.98]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </main>
  );
}
