import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-12">
      <section className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Event Management & Ticket Booking
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
          Plan events, sell tickets, and validate entry from one MERN app.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Authentication is ready. Event management, booking, QR tickets, scanning, and analytics will be layered in the next phases.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <div className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700">
              Signed in as <span className="font-semibold text-slate-950">{user.name}</span> ({user.role})
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-50"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
