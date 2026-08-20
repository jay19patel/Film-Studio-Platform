import { getClients } from '@/lib/db';
import ClientManager from './ClientManager';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const initialClients = await getClients();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-gray-900">Client Management</h2>
        <p className="text-gray-500 text-xs mt-1 max-w-xl">
          Manage active clients, track project status, and schedule event dates.
        </p>
      </div>

      <ClientManager initialClients={initialClients} />
    </div>
  );
}
