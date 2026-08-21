import { getClients, getInquiries, getResources, getAddons } from '@/lib/db';
import ClientProposalView from './ClientProposalView';

export default async function ProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const [clients, inquiries, resources, addons] = await Promise.all([
    getClients(),
    getInquiries(),
    getResources(),
    getAddons(),
  ]);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 text-center shadow-lg">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Proposal Not Found</h2>
          <p className="text-xs text-gray-500 font-bold">This quotation link appears to be invalid or does not exist.</p>
        </div>
      </div>
    );
  }

  const relatedInquiry = inquiries.find(
    (inq) => inq.email === client.email && inq.status === 'completed'
  );

  return (
    <ClientProposalView
      client={client}
      inquiry={relatedInquiry || null}
      resources={resources}
      addonsList={addons}
      currentToken={token || ''}
    />
  );
}
