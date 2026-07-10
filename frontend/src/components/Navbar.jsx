import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-medium transition md:min-h-0 md:px-0 md:py-0 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 md:bg-transparent md:dark:bg-transparent'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white md:hover:bg-transparent md:dark:hover:bg-transparent'
    }`;

  const navLinks = (
    <>
      <NavLink to="/" className={linkClass} onClick={closeMenu}>
        Events
      </NavLink>

      {isAuthenticated ? (
        <>
          {(user.role === 'Attendee' || user.role === 'Admin') && (
            <NavLink to="/tickets" className={linkClass} onClick={closeMenu}>
              My Tickets
            </NavLink>
          )}
          {(user.role === 'Organizer' || user.role === 'Admin') && (
            <>
              <NavLink to="/organizer" className={linkClass} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/organizer/scanner" className={linkClass} onClick={closeMenu}>
                Scanner
              </NavLink>
            </>
          )}
        </>
      ) : (
        <NavLink to="/login" className={linkClass} onClick={closeMenu}>
          Login
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex min-h-11 items-center text-lg font-semibold text-slate-950 dark:text-white"
        >
          EventFlow
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {navLinks}

          {isAuthenticated && (
            <span className="max-w-44 truncate text-sm text-slate-500 dark:text-slate-400">
              {user.name} | {user.role}
            </span>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-11 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/register"
              className="flex min-h-11 items-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Register
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navLinks}

            {isAuthenticated && (
              <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                {user.name} | {user.role}
              </div>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 min-h-11 rounded-md bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/register"
                onClick={closeMenu}
                className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
