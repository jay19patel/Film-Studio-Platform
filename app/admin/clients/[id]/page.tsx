import { getClients, getInquiries, getResources, getAddons } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientDetailClient from './ClientDetailClient';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const clients = await getClients();
  const client = clients.find(c => c.id === id);

  if (!client) {
    redirect('/admin/clients');
  }

  const [inquiries, resources, addons] = await Promise.all([
    getInquiries(),
    getResources(),
    getAddons()
  ]);

  const relatedInquiry = inquiries.find(inq => inq.email === client.email && inq.status === 'completed');

  return (
    <ClientDetailClient 
      initialClient={client} 
      inquiry={relatedInquiry || null}
      resources={resources}
      addons={addons}
    />
  );
}
