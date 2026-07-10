import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';

export default function TicketScanner() {
  const scannerRef = useRef(null);
  const scanLockRef = useRef(false);
  const [manualHash, setManualHash] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: 'Ready to scan.' });
  const [ticket, setTicket] = useState(null);

  const validateTicket = async (qrCodeHash) => {
    if (!qrCodeHash || scanLockRef.current) {
      return;
    }

    scanLockRef.current = true;
    setStatus({ type: 'loading', message: 'Validating ticket...' });

    try {
      const { data } = await api.post('/tickets/scan', { qrCodeHash });
      setTicket(data.ticket);
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setTicket(err.response?.data?.ticket || null);
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Ticket validation failed.',
      });
    } finally {
      window.setTimeout(() => {
        scanLockRef.current = false;
      }, 1500);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        validateTicket(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  const handleManualSubmit = (event) => {
    event.preventDefault();
    validateTicket(manualHash.trim());
  };

  const statusClass = {
    idle: 'border-slate-200 bg-white text-slate-700',
    loading: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-red-200 bg-red-50 text-red-700',
  }[status.type];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Gate validation
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">QR scanner</h1>
        <p className="mt-2 text-slate-600">Scan attendee tickets and mark them as used.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div id="qr-reader" className="overflow-hidden rounded-md" />
        </section>

        <aside className="space-y-5">
          <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${statusClass}`}>
            {status.message}
          </div>

          {ticket && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{ticket.eventId?.title}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-950">Attendee</dt>
                  <dd className="mt-1 text-slate-600">
                    {ticket.userId?.name} ({ticket.userId?.email})
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">Location</dt>
                  <dd className="mt-1 text-slate-600">{ticket.eventId?.location}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">Status</dt>
                  <dd className="mt-1 text-slate-600">
                    {ticket.isScanned ? 'Scanned' : 'Not scanned'}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <form
            onSubmit={handleManualSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Manual QR hash</span>
              <textarea
                value={manualHash}
                onChange={(event) => setManualHash(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Validate Ticket
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
