import Link from 'next/link';
import { Camera, Sparkles, Sliders, ChevronRight } from 'lucide-react';
import { getPackages, getResources, getAddons } from '@/lib/db';
import PackageCard from '@/components/PackageCard';

// Force dynamic page rendering to ensure fresh reads of local JSON db files
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [packages, resources, addons] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
  ]);

  // Filter only published packages
  const publishedPackages = packages.filter((pkg) => pkg.status === 'published');

  return (
    <div className="bg-gray-50/50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-white to-gray-50/50 py-20 md:py-28 border-b border-gray-100">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-amber-800 uppercase tracking-widest mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Voted Premium Wedding Photographer
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none max-w-4xl mx-auto mb-6">
            Capture the Magic of Your <span className="text-amber-500 underline decoration-amber-300 decoration-wavy underline-offset-8">Forever Story</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Explore our handcrafted wedding packages, featuring professional cinematic teams and premium photobooks. Customize any details or design your own package.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#packages-list"
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 text-base"
            >
              Browse Packages
            </a>
            <Link
              href="/build-your-own"
              className="w-full sm:w-auto bg-white border-2 border-amber-500 hover:bg-amber-50 text-amber-600 font-bold py-3.5 px-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-base flex items-center justify-center gap-2 group"
            >
              <Sliders className="h-4.5 w-4.5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              Build Your Own Package
            </Link>
          </div>
        </div>
      </section>

      {/* Predefined Packages Grid Section */}
      <section id="packages-list" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
              Ready-Made Packages
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Our Signature Packages
            </h2>
            <p className="text-gray-500 text-sm mt-1.5 max-w-xl font-medium">
              Carefully curated configurations designed to deliver full coverage for Indian and traditional wedding ceremonies.
            </p>
          </div>
          
          <Link
            href="/build-your-own"
            className="hidden md:inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 gap-0.5 group mt-4 md:mt-0"
          >
            Looking for something custom? Build your own
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {publishedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPackages.map((pkg) => (
              <div key={pkg.id}>
                <PackageCard pkg={pkg} resources={resources} addons={addons} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-sm max-w-md mx-auto">
            <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Packages Published</h3>
            <p className="text-gray-500 text-sm mb-6">
              Our studio packages are being updated. Check back shortly or design a custom build!
            </p>
            <Link
              href="/build-your-own"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all inline-block"
            >
              Build Custom Package
            </Link>
          </div>
        )}
      </section>

      {/* Why Choose CamBuddy Info */}
      <section className="bg-gray-950 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
              CamBuddy Advantage
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight">
              Why Wedding Couples Love CamBuddy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center">
              <div className="bg-amber-500/10 text-amber-400 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-serif">State-of-the-Art Gear</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We use top-tier mirrorless cameras, 4K drones, and cinematic gimbal systems to capture stunning details.
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center">
              <div className="bg-amber-500/10 text-amber-400 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-serif">Expert Color Grading</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our post-production team color-grades every film with custom LUTs, creating a breathtaking, premium cinema aesthetic.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center">
              <div className="bg-amber-500/10 text-amber-400 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-serif">Flexible Package Customizer</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We believe every love story is unique. Build your own package day-wise to perfectly match your budget and needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
