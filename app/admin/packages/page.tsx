import { getPackages, getResources, getAddons } from '@/lib/db';
import PackagesClient from './PackagesClient';

// Force dynamic page rendering to ensure fresh db reads
export const dynamic = 'force-dynamic';

export default async function AdminPackagesPage() {
  const [packages, resources, addons] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-black text-admin-text">Predefined Wedding Packages</h2>
        <p className="text-admin-muted text-xs mt-1 max-w-xl">
          Build structured multi-day wedding photography packages, upload day-wise custom graphics, link add-on items, and override final pricing details.
        </p>
      </div>

      <PackagesClient
        initialPackages={packages}
        resources={resources}
        addonsList={addons}
      />
    </div>
  );
}
