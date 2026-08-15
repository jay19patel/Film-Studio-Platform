import { getResources, getAddons } from '@/lib/db';
import BuildYourOwnClient from './BuildYourOwnClient';

// Force dynamic page rendering to ensure fresh reads of local JSON db files
export const dynamic = 'force-dynamic';

export default async function BuildYourOwnPage() {
  const [resources, addons] = await Promise.all([
    getResources(),
    getAddons(),
  ]);

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
            Interactive Quote Tool
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Build Your Custom Package
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xl font-medium">
            Design your wedding schedule day-by-day, choose resources, and pick deliverables. See live pricing and download your premium PDF proposal.
          </p>
        </div>

        <BuildYourOwnClient resources={resources} addonsList={addons} />
      </div>
    </div>
  );
}
