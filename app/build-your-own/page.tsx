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
    <div className="bg-white min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2.5">
            Interactive Quote Tool
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Build Your <span className="text-maroon-gradient">Custom Package</span>
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm mt-2 max-w-xl font-medium leading-relaxed">
            Design your wedding schedule day-by-day, choose resources, and pick deliverables. See live pricing and download your premium PDF proposal.
          </p>
        </div>

        <BuildYourOwnClient resources={resources} addonsList={addons} />
      </div>
    </div>
  );
}
