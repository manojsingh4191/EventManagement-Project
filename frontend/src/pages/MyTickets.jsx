import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api/axios';
import { fadeUp, motionTransition, staggerContainer } from '../utils/animations';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets/mine');
        setTickets(data.tickets);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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
          Attendee
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">My tickets</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Keep these QR codes ready for event entry.</p>
      </motion.section>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 sm:p-6">
          Loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center sm:p-10">
          <h2 className="text-lg font-semibold text-slate-950">No tickets yet</h2>
          <p className="mt-2 text-sm text-slate-600">Book an event and your QR ticket will appear here.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {tickets.map((ticket) => (
            <motion.article
              key={ticket._id}
              variants={fadeUp}
              transition={motionTransition}
              whileHover={{ y: -3 }}
              className="grid min-w-0 gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:grid-cols-[1fr_auto] sm:p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-950">{ticket.eventId?.title}</h2>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {ticket.paymentStatus}
                  </span>
                  {ticket.isScanned && (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Scanned
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">{formatDateTime(ticket.eventId?.date)}</p>
                <p className="mt-1 text-sm text-slate-600">{ticket.eventId?.location}</p>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {formatCurrency(ticket.eventId?.price)}
                </p>
                <p className="mt-4 break-all rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  {ticket.qrCodeHash}
                </p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <div className="h-fit rounded-lg border border-slate-200 bg-white p-3">
                  <QRCodeCanvas value={ticket.qrCodeHash} size={144} includeMargin />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </main>
  );
}
