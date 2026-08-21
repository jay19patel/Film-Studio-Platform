import { getPackages, getResources, getAddons, getPortfolio } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import HomeClient from './HomeClient';

// Force dynamic page rendering to ensure fresh db reads
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [packages, resources, addons, portfolio, dict] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
    getPortfolio(),
    getDictionary(),
  ]);

  return (
    <HomeClient
      packages={packages}
      resources={resources}
      addons={addons}
      portfolio={portfolio}
      dict={dict}
    />
  );
}
