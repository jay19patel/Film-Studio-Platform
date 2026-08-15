import { notFound } from 'next/navigation';
import { Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPackages, getResources, getAddons } from '@/lib/db';
import PackageDetailClient from './PackageDetailClient';

// Force dynamic page rendering to ensure fresh database reads
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [packages, resources, addons] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
  ]);

  const pkg = packages.find((p) => p.id === id);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-100/50 p-4 rounded-full text-amber-600 mb-6">
          <Camera className="h-12 w-12" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Package Not Found</h1>
        <p className="text-gray-500 max-w-md mb-8">
          The wedding package you are looking for does not exist or has been archived by the studio administrator.
        </p>
        <Link
          href="/"
          className="bg-gray-900 hover:bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button container */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 -mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Packages
        </Link>
      </div>

      <PackageDetailClient pkg={pkg} resources={resources} addons={addons} />
    </div>
  );
}
