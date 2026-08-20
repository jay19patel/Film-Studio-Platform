import { getEvents } from '@/lib/db';
import CalendarClient from './CalendarClient';

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage() {
  const initialEvents = await getEvents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-gray-900">Event Scheduler</h2>
        <p className="text-gray-500 text-xs mt-1 max-w-xl">
          Manage your client shoots, pre-weddings, and main events in a simple monthly calendar view.
        </p>
      </div>

      <CalendarClient initialEvents={initialEvents} />
    </div>
  );
}
