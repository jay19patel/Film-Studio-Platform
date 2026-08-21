import { getResources, getAddons } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import BuildYourOwnClient from './BuildYourOwnClient';
import PageHero from '@/components/PageHero';

// Force dynamic page rendering to ensure fresh reads of local JSON db files
export const dynamic = 'force-dynamic';

export default async function BuildYourOwnPage() {
  const [resources, addons, dict] = await Promise.all([
    getResources(),
    getAddons(),
    getDictionary(),
  ]);

  return (
    <div className="bg-paper min-h-screen pb-20 relative overflow-hidden">
      <PageHero
        eyebrow="Custom Quote Builder"
        title={dict.buildYourOwnPage.title}
        accent={dict.buildYourOwnPage.titleAccent}
        subtitle={dict.buildYourOwnPage.subtitle}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <BuildYourOwnClient resources={resources} addonsList={addons} dict={dict} />
      </div>
    </div>
  );
}
