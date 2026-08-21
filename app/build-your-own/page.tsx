import { getResources, getAddons } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import BuildYourOwnClient from './BuildYourOwnClient';

// Force dynamic page rendering to ensure fresh reads of local JSON db files
export const dynamic = 'force-dynamic';

export default async function BuildYourOwnPage() {
  const [resources, addons, dict] = await Promise.all([
    getResources(),
    getAddons(),
    getDictionary(),
  ]);

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2.5">
            {dict.buildYourOwnPage.badge}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
            {dict.buildYourOwnPage.title} <span className="text-maroon-gradient">{dict.buildYourOwnPage.titleAccent}</span>
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm mt-2 max-w-xl font-medium leading-relaxed">
            {dict.buildYourOwnPage.subtitle}
          </p>
        </div>

        <BuildYourOwnClient resources={resources} addonsList={addons} dict={dict} />
      </div>
    </div>
  );
}
