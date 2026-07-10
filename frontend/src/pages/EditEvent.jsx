import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { toDateTimeLocalValue } from '../utils/dateInputs';

const initialFormState = {
  title: '',
  description: '',
  date: '',
  location: '',
  totalCapacity: '',
  price: '0',
  imageUrl: '',
  autoDeleteEnabled: false,
  autoDeleteAt: '',
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const event = data.event;

        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: toDateTimeLocalValue(event.date),
          location: event.location || '',
          totalCapacity: String(event.totalCapacity || ''),
          price: String(event.price ?? 0),
          imageUrl: event.imageUrl || '',
          autoDeleteEnabled: Boolean(event.autoDeleteAt),
          autoDeleteAt: toDateTimeLocalValue(event.autoDeleteAt),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const totalCapacity = Number(formData.totalCapacity);
    const price = Number(formData.price || 0);

    if (!Number.isFinite(totalCapacity) || totalCapacity < 1) {
      setError('Total capacity must be at least 1.');
      setSubmitting(false);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Ticket price cannot be negative.');
      setSubmitting(false);
      return;
    }

    try {
      await api.put(`/events/${id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        location: formData.location.trim(),
        totalCapacity,
        price,
        imageUrl: formData.imageUrl.trim(),
        autoDeleteAt: formData.autoDeleteEnabled ? formData.autoDeleteAt : '',
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Unable to update event. Please check the event details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 sm:p-6">
          Loading event...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <Link to={`/events/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Back to event
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Edit event</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Update event details and auto-delete settings.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md sm:p-6">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input name="title" value={formData.title} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} required className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date and time</span>
              <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input name="location" value={formData.location} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Total capacity</span>
              <input name="totalCapacity" type="number" min="1" value={formData.totalCapacity} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Ticket price</span>
              <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Image URL</span>
            <input name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/event.jpg" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-start gap-3">
              <input
                name="autoDeleteEnabled"
                type="checkbox"
                checked={formData.autoDeleteEnabled}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    autoDeleteEnabled: event.target.checked,
                    autoDeleteAt: event.target.checked ? current.autoDeleteAt : '',
                  }))
                }
                className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950">Set Auto-Delete Timer</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">Automatically remove this event and its tickets at a specific date and time.</span>
              </span>
            </label>

            {formData.autoDeleteEnabled && (
              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Auto-delete at</span>
                <input name="autoDeleteAt" type="datetime-local" value={formData.autoDeleteAt} onChange={handleChange} required={formData.autoDeleteEnabled} className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </label>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link to={`/events/${id}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98]">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:hover:scale-100 disabled:hover:shadow-sm">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
