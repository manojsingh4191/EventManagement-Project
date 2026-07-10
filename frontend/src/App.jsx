import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import EventList from './pages/EventList';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Register from './pages/Register';
import TicketScanner from './pages/TicketScanner';

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute roles={['Attendee', 'Admin']}>
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/new"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/scanner"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <TicketScanner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
