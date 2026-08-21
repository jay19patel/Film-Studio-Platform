import Link from 'next/link';
import { Camera, Sparkles, Sliders, ChevronRight, Film, Heart, Star } from 'lucide-react';
import { getPackages, getResources, getAddons } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import PackageCard from '@/components/PackageCard';

// Force dynamic page rendering to ensure fresh db reads
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [packages, resources, addons, dict] = await Promise.all([
    getPackages(),
    getResources(),
    getAddons(),
    getDictionary(),
  ]);

  // Filter only published packages
  const publishedPackages = packages.filter((pkg) => pkg.status === 'published');

  return (
    <div className="bg-white min-h-screen relative overflow-hidden text-neutral-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 border-b border-gray-100">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] animate-float opacity-10">
          <Camera className="h-8 w-8 text-maroon" />
        </div>
        <div className="absolute bottom-24 left-[10%] animate-float opacity-10" style={{ animationDelay: '1.5s' }}>
          <Film className="h-6 w-6 text-maroon" />
        </div>
        <div className="absolute top-[40%] right-[8%] animate-float opacity-10" style={{ animationDelay: '2.5s' }}>
          <Heart className="h-5 w-5 text-maroon" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-maroon/5 border border-maroon/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-maroon uppercase tracking-widest mb-8 animate-slideDown">
            <Sparkles className="h-3.5 w-3.5" />
            {dict.home.hero.badge}
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-neutral-900 tracking-tight leading-tight max-w-5xl mx-auto mb-6 animate-slideUp">
            {dict.home.hero.title1} <br/><span className="font-caveat text-maroon text-6xl sm:text-7xl md:text-8xl lg:text-9xl -mt-4 block font-normal tracking-normal lowercase">{dict.home.hero.title2}</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide animate-slideUp stagger-2">
            {dict.home.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4.5 justify-center items-center animate-slideUp stagger-3">
            <a
              href="#packages-list"
              className="w-full sm:w-auto btn-maroon"
            >
              {dict.home.hero.cta}
            </a>
            <Link
              href="/build-your-own"
              className="w-full sm:w-auto btn-outline flex items-center justify-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              {dict.home.hero.buildOwn}
            </Link>
          </div>
        </div>
      </section>

      {/* Predefined Packages Grid Section */}
      <section id="packages-list" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2.5">
              {dict.home.proposals.badge}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              {dict.home.proposals.title}
            </h2>
            <p className="text-neutral-500 text-xs md:text-sm mt-2 max-w-xl font-medium leading-relaxed">
              {dict.home.proposals.subtitle}
            </p>
          </div>
          
          <Link
            href="/build-your-own"
            className="hidden md:inline-flex items-center text-xs font-bold text-maroon hover:text-maroon-dark tracking-widest uppercase gap-1 group mt-4 md:mt-0"
          >
            {dict.home.proposals.customBtn}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {publishedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPackages.map((pkg) => (
              <div key={pkg.id}>
                <PackageCard pkg={pkg} resources={resources} addons={addons} dict={dict.packageCard} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Camera className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">{dict.home.proposals.noPackagesTitle}</h3>
            <p className="text-gray-500 text-xs mb-6">
              {dict.home.proposals.noPackagesDesc}
            </p>
            <Link
              href="/build-your-own"
              className="btn-maroon text-xs uppercase tracking-wider inline-flex"
            >
              {dict.home.proposals.buildCustomBtn}
            </Link>
          </div>
        )}
      </section>

      {/* Why Choose CamBuddy (Advantage) */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-[10px] font-bold text-maroon uppercase tracking-widest block mb-2.5">
              {dict.home.advantage.badge}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900">
              {dict.home.advantage.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center card-elevated">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Camera className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">{dict.home.advantage.box1Title}</h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {dict.home.advantage.box1Desc}
              </p>
            </div>
            
            {/* Box 2 */}
            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center card-elevated">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Sparkles className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">{dict.home.advantage.box2Title}</h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {dict.home.advantage.box2Desc}
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center card-elevated">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Sliders className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">{dict.home.advantage.box3Title}</h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {dict.home.advantage.box3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Before Footer */}
      <section className="relative py-20 z-10">
        <div className="absolute inset-0 bg-maroon/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-1.5 mb-6">
            <Star className="h-4 w-4 text-maroon fill-maroon" />
            <Star className="h-4 w-4 text-maroon fill-maroon" />
            <Star className="h-4 w-4 text-maroon fill-maroon" />
            <Star className="h-4 w-4 text-maroon fill-maroon" />
            <Star className="h-4 w-4 text-maroon fill-maroon" />
          </div>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            {dict.home.ctaBanner.title} <span className="text-maroon-gradient italic">{dict.home.ctaBanner.titleAccent}</span> {dict.home.ctaBanner.titleEnd}
          </h2>
          <p className="text-neutral-600 text-sm max-w-lg mx-auto mb-8 font-light leading-relaxed">
            {dict.home.ctaBanner.subtitle}
          </p>
          <Link
            href="/build-your-own"
            className="btn-maroon text-base py-4 px-10"
          >
            <Sliders className="h-5 w-5" />
            {dict.home.ctaBanner.btn}
          </Link>
        </div>
      </section>
    </div>
  );
}
