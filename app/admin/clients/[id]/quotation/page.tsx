import { getClients, getResources, getAddons, getInquiries } from '@/lib/db';
import QuotationEditorClient from './QuotationEditorClient';
import { notFound } from 'next/navigation';

export default async function QuotationEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [clients, resources, addons, inquiries] = await Promise.all([
    getClients(),
    getResources(),
    getAddons(),
    getInquiries(),
  ]);

  const client = clients.find((c) => c.id === id);
  if (!client) {
    notFound();
  }

  const relatedInquiry = inquiries.find(
    (inq) => inq.email === client.email && inq.status === 'completed'
  );

  return (
    <QuotationEditorClient
      client={client}
      inquiry={relatedInquiry || null}
      resources={resources}
      addons={addons}
    />
  );
}
