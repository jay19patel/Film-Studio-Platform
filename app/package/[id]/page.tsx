import { notFound } from 'next/navigation';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPackages, getResources, getAddons } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import PackageDetailClient from './PackageDetailClient';

// Force dynamic page rendering to ensure fresh database reads
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [packages, resources, addons, dict] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
    getDictionary(),
  ]);

  const pkg = packages.find((p) => p.id === id);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-maroon/10 p-4 rounded-full text-maroon mb-6 border border-maroon/20">
          <Camera className="h-12 w-12" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-ink mb-2">Package Not Found</h1>
        <p className="text-ink/50 max-w-md mb-8 text-sm">
          The wedding package you are looking for does not exist or has been archived by the studio administrator.
        </p>
        <Link
          href="/"
          className="btn-maroon py-3 px-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      {/* Back button container */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 -mb-4 relative z-20">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-maroon hover:text-maroon-dark gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>
      </div>

      <PackageDetailClient pkg={pkg} resources={resources} addons={addons} dict={dict} />
    </div>
  );
}
