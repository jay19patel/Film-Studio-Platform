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
    <div className="bg-white min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Hero Section matching Portfolio / Equipment header */}
        <div className="text-center mb-16 animate-slideUp">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
            {dict.buildYourOwnPage.title}{' '}
            <span className="font-caveat text-maroon font-normal lowercase tracking-normal">
              {dict.buildYourOwnPage.titleAccent}
            </span>
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            {dict.buildYourOwnPage.subtitle}
          </p>
        </div>

        <BuildYourOwnClient resources={resources} addonsList={addons} dict={dict} />
      </div>
    </div>
  );
}
