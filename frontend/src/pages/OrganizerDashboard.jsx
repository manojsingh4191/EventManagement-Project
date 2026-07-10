import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { fadeUp, motionTransition, staggerContainer } from '../utils/animations';
import { formatCurrency } from '../utils/formatters';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({ totals: { ticketsSold: 0, revenue: 0 }, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [eventsResponse, analyticsResponse] = await Promise.all([
          api.get('/events/mine'),
          api.get('/events/mine/analytics'),
        ]);

        setEvents(eventsResponse.data.events);
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load organizer events.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const analyticsByEvent = new Map(
    analytics.events.map((event) => [String(event.eventId), event])
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <motion.div
        className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={motionTransition}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Organizer
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Your events</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Create and monitor events you own.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
          <Link
            to="/organizer/scanner"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
          >
            Open Scanner
          </Link>
          <Link
            to="/organizer/events/new"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-[0.98]"
          >
            Create Event
          </Link>
        </div>
      </motion.div>

      {error && (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <motion.section
        className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} transition={motionTransition} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
          <p className="text-sm font-medium text-slate-500">Total events</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{events.length}</p>
        </motion.div>
        <motion.div variants={fadeUp} transition={motionTransition} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
          <p className="text-sm font-medium text-slate-500">Tickets sold</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{analytics.totals.ticketsSold}</p>
        </motion.div>
        <motion.div variants={fadeUp} transition={motionTransition} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
          <p className="text-sm font-medium text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            {formatCurrency(analytics.totals.revenue)}
          </p>
        </motion.div>
      </motion.section>

      <motion.section
        className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={motionTransition}
      >
        {loading ? (
          <div className="p-4 text-sm text-slate-500 sm:p-6">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center sm:p-10">
            <h2 className="text-lg font-semibold text-slate-950">No events yet</h2>
            <p className="mt-2 text-sm text-slate-600">Create your first event to start selling tickets.</p>
            <Link
              to="/organizer/events/new"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-[0.98]"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:hidden">
            {events.map((event) => {
              const eventAnalytics = analyticsByEvent.get(event._id) || { ticketsSold: 0, revenue: 0 };

              return (
                <motion.article
                  key={event._id}
                  variants={fadeUp}
                  transition={motionTransition}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="break-words text-base font-semibold text-slate-950">{event.title}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{event.description}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Date</dt>
                      <dd className="mt-1 font-medium text-slate-700">{formatDate(event.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Location</dt>
                      <dd className="mt-1 font-medium text-slate-700">{event.location}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Tickets</dt>
                      <dd className="mt-1 font-medium text-slate-700">
                        {event.ticketsAvailable} / {event.totalCapacity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Sold</dt>
                      <dd className="mt-1 font-medium text-slate-700">{eventAnalytics.ticketsSold}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Revenue</dt>
                      <dd className="mt-1 font-medium text-slate-700">{formatCurrency(eventAnalytics.revenue)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Price</dt>
                      <dd className="mt-1 font-medium text-slate-700">{formatCurrency(event.price)}</dd>
                    </div>
                  </dl>
                </motion.article>
              );
            })}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Tickets</th>
                  <th className="px-5 py-3 font-semibold">Sold</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => {
                  const eventAnalytics = analyticsByEvent.get(event._id) || { ticketsSold: 0, revenue: 0 };

                  return (
                    <tr key={event._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-950">{event.title}</div>
                        <div className="mt-1 max-w-xs truncate text-slate-500">
                          {event.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{event.location}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {event.ticketsAvailable} / {event.totalCapacity}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {eventAnalytics.ticketsSold}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatCurrency(eventAnalytics.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatCurrency(event.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </main>
  );
}
