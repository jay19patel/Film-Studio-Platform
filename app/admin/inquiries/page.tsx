import { getInquiries, getResources, getAddons } from '@/lib/db';
import InquiriesClient from './InquiriesClient';

// Force dynamic page rendering to ensure fresh db reads
export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
  const [inquiries, resources, addons] = await Promise.all([
    getInquiries(),
    getResources(),
    getAddons(),
  ]);

  // Sort inquiries: newest first
  inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-gray-900">Client Inquiries & Leads</h2>
        <p className="text-gray-500 text-xs mt-1 max-w-xl">
          Track captured customer leads, view their chosen predefined configurations, expand client custom builds, and update lead follow-up status.
        </p>
      </div>

      <InquiriesClient
        initialInquiries={inquiries}
        resources={resources}
        addonsList={addons}
      />
    </div>
  );
}
