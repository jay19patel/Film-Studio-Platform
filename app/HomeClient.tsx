'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight,
  Volume2,
  VolumeX,
  X,
  MapPin,
} from 'lucide-react';
import { Package, Resource, Addon, PortfolioItem } from '@/lib/db';
import PackageCard from '@/components/PackageCard';
import Reveal from '@/components/Reveal';

interface HomeClientProps {
  packages: Package[];
  resources: Resource[];
  addons: Addon[];
  portfolio: PortfolioItem[];
  dict: any;
}

const PORTFOLIO_GALLERY = [
  {
    id: '1',
    title: 'Royal Udaipur Heritage Wedding',
    category: 'Wedding',
    image: '/uploads/wedding_main.png',
    location: 'Udaipur Palace',
    tags: ['Traditional', 'Drone', '4K Film'],
    aspect: 'aspect-[4/5]',
  },
  {
    id: '2',
    title: 'Sunset Pheras at Heritage Fort',
    category: 'Wedding',
    image: '/uploads/wedding.png',
    location: 'Jaipur, Rajasthan',
    tags: ['Candid', 'Editorial', 'Albums'],
    aspect: 'aspect-square',
  },
  {
    id: '3',
    title: 'Yellow Splendor Haldi Ceremony',
    category: 'Haldi',
    image: '/uploads/haldi.png',
    location: 'Ahmedabad',
    tags: ['Turmeric', 'Candid', 'Family'],
    aspect: 'aspect-[4/5]',
  },
  {
    id: '4',
    title: 'Electrifying Sangeet Stage Night',
    category: 'Sangeet',
    image: '/uploads/sangeet.png',
    location: 'Goa Beach Resort',
    tags: ['Stage Lights', 'Dance', 'Multi-Cam'],
    aspect: 'aspect-[3/4]',
  },
  {
    id: '5',
    title: 'Romantic Coastal Pre-Wedding',
    category: 'Pre-Wedding',
    image: '/uploads/prewedding.png',
    location: 'Diu Cliffs',
    tags: ['Sunset', 'Cinematic', 'Drone'],
    aspect: 'aspect-square',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'CamBuddy Studios brought our wedding story to life in ways we could never have imagined. The video trailer brings tears to our eyes every single time!',
    couple: 'Rohan & Ananya',
    location: 'Udaipur Destination Wedding',
  },
  {
    id: 2,
    quote: 'Extremely professional team. Their custom package builder let us configure our exact crew requirements for 4 days without any hidden costs.',
    couple: 'Karan & Pooja',
    location: 'Ahmedabad Heritage Wedding',
  },
  {
    id: 3,
    quote: 'The photo quality and fine art album prints are top notch. Their candid photographer captured moments we did not even realize happened!',
    couple: 'Vikram & Radhika',
    location: 'Jaipur Palace Pheras',
  },
];

export default function HomeClient({
  packages,
  resources,
  addons,
  portfolio,
  dict,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<typeof PORTFOLIO_GALLERY[number] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const isGujarati = dict?.header?.packages === 'પેકેજ';

  const heroDict = dict?.home?.hero || {};
  const propDict = dict?.home?.proposals || {};
  const advDict = dict?.home?.advantage || {};
  const ctaDict = dict?.home?.ctaBanner || {};

  const filteredGallery = useMemo(
    () =>
      activeTab === 'All'
        ? PORTFOLIO_GALLERY
        : PORTFOLIO_GALLERY.filter((item) => item.category === activeTab),
    [activeTab]
  );

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const goToTestimonial = (idx: number) => {
    setTestimonialIdx((idx + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="bg-paper min-h-screen relative overflow-hidden text-ink">

      {/* 1. HD Background Video Hero — full-bleed, Ken Burns, sound toggle */}
      <section className="relative min-h-screen h-screen flex items-end overflow-hidden bg-ink text-cream cinematic-overlay cinematic-vignette">

        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center animate-kenburns"
            src="/uploads/hero_video.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-ink/20 to-ink/80" />
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute background video' : 'Mute background video'}
          className="absolute top-24 right-4 sm:right-8 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cream hover:bg-white/20 hover:border-maroon-light/50 transition-all"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-maroon-light/70" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-maroon-light">
                  Cinematic Wedding Films &amp; Photography
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium text-cream tracking-tight leading-[1.02] drop-shadow-2xl">
                <span className={`block font-normal ${isGujarati ? 'font-shrikhand' : 'font-serif'}`}>
                  {heroDict.title1 || 'Capturing the Pure Poetry of'}
                </span>
                <span className={`text-maroon-light text-5xl sm:text-7xl md:text-8xl block font-normal tracking-normal mt-1 ${isGujarati ? 'font-shrikhand' : 'font-caveat'}`}>
                  {heroDict.title2 || 'your forever story'}
                </span>
              </h1>

              <p className="mt-6 text-sm sm:text-base md:text-lg text-cream/70 max-w-xl leading-relaxed font-light tracking-wide">
                {heroDict.subtitle || 'Handcrafted wedding proposal packages, combining high-end cinematic teams and premium photobooks.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col sm:flex-row gap-4.5 items-start"
            >
              <a
                href="#packages-list"
                className="w-full sm:w-auto btn-maroon py-4 px-8 text-sm font-bold tracking-wide shadow-2xl flex items-center justify-center gap-2"
              >
                <span>{heroDict.cta || 'Explore Proposals'}</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                href="/build-your-own"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-cream backdrop-blur-md border border-white/20 py-4 px-8 rounded-full text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Sliders className="h-4 w-4" />
                <span>{heroDict.buildOwn || 'Build Your Own Package'}</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-8 w-px bg-gradient-to-b from-maroon-light/70 to-transparent animate-float" />
        </div>
      </section>

      {/* 2. Masonry Portfolio Gallery */}
      <section className="py-24 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2">
                {dict?.header?.portfolio || 'Portfolio'}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink tracking-tight">
                {isGujarati ? 'અમારા ખાસ વેડિંગ શોકેસ' : 'Featured Wedding Stories & Moments'}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {['All', 'Wedding', 'Haldi', 'Sangeet', 'Pre-Wedding'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-maroon text-ink shadow-md'
                      : 'bg-black/[0.03] text-ink/60 hover:bg-black/[0.06] border border-black/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Masonry Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div layout className="masonry-columns">
              {filteredGallery.map((item, idx) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => setLightboxItem(item)}
                  className="masonry-item group relative w-full block rounded-2xl overflow-hidden border border-black/5 bg-charcoal text-left cursor-pointer"
                >
                  <div className={`relative w-full ${item.aspect} overflow-hidden`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-cream text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                      {item.category}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[10px] text-maroon-light font-bold uppercase tracking-widest flex items-center gap-1 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <MapPin className="h-3 w-3" /> {item.location}
                      </span>
                      <h3 className="font-serif text-lg font-medium leading-snug text-cream">{item.title}</h3>
                      <div className="flex gap-1.5 mt-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                        {item.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-white/10 text-cream/80 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          <Reveal className="mt-10 flex justify-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-xs font-bold text-maroon hover:text-maroon-dark tracking-widest uppercase group"
            >
              View Full Portfolio
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
            onClick={() => setLightboxItem(null)}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-cream hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-video">
                <Image src={lightboxItem.image} alt={lightboxItem.title} fill sizes="90vw" className="object-cover" />
              </div>
              <div className="p-5 bg-charcoal border-t border-black/10">
                <span className="text-[10px] text-maroon font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" /> {lightboxItem.location}
                </span>
                <h3 className="font-serif text-xl text-ink">{lightboxItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Predefined Packages Grid Section */}
      <section id="packages-list" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2.5">
              {propDict.badge || 'Ready-Made Configs'}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-ink tracking-tight">
              {propDict.title || 'Our Signature Proposals'}
            </h2>
            <p className="text-ink/50 text-xs md:text-sm mt-2 max-w-xl font-light leading-relaxed">
              {propDict.subtitle || 'Exquisite multi-day packages designed to deliver full coverage.'}
            </p>
          </div>

          <Link
            href="/build-your-own"
            className="hidden md:inline-flex items-center text-xs font-bold text-maroon hover:text-maroon-dark tracking-widest uppercase gap-1 group mt-4 md:mt-0"
          >
            {propDict.customBtn || 'Design a custom proposal'}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {packages.filter((p) => p.status === 'published').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages
              .filter((p) => p.status === 'published')
              .map((pkg) => (
                <div key={pkg.id}>
                  <PackageCard pkg={pkg} resources={resources} addons={addons} dict={dict.packageCard} />
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-black/[0.02] border border-black/10 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Camera className="h-10 w-10 text-ink/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-medium text-ink mb-1">
              {propDict.noPackagesTitle || 'No Packages Published'}
            </h3>
            <p className="text-ink/50 text-xs mb-6">
              {propDict.noPackagesDesc || 'Create a custom quote config!'}
            </p>
            <Link href="/build-your-own" className="btn-maroon text-xs uppercase tracking-wider inline-flex">
              {propDict.buildCustomBtn || 'Build Custom Quote'}
            </Link>
          </div>
        )}
      </section>

      {/* 4. Studio Advantage — asymmetric editorial layout, no icon grid */}
      <section className="border-y border-black/5 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-20">
            <Reveal>
              <span className="text-[10px] font-bold text-maroon uppercase tracking-widest block mb-4">
                {advDict.badge || 'The CamBuddy Craft'}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-[1.1]">
                {advDict.title || 'Why Couples Choose Our Lens'}
              </h2>
              <p className="mt-6 text-ink/50 text-sm leading-relaxed font-light max-w-md">
                Every frame is treated as a keepsake, not a deliverable — from gear to grade to the final cut.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-maroon hover:text-maroon-dark tracking-widest uppercase group"
              >
                More About Our Studio
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <div className="divide-y divide-black/10 border-t border-black/10">
              {[
                { n: '01', title: advDict.box1Title || 'State-of-the-Art Gear', desc: advDict.box1Desc || 'We capture in premium 4K HDR, utilizing mirrorless camera rigs.' },
                { n: '02', title: advDict.box2Title || 'Fine Art Color Grading', desc: advDict.box2Desc || 'Every photo and film frame undergoes extensive editorial color grading.' },
                { n: '03', title: advDict.box3Title || 'Custom Timelines', desc: advDict.box3Desc || 'Our interactive quote tools grant you absolute flexibility.' },
              ].map((item, i) => (
                <Reveal key={item.n} delay={i * 0.08} className="flex gap-6 sm:gap-10 py-8 items-start">
                  <span className="font-serif text-3xl sm:text-4xl text-maroon/50 font-medium">{item.n}</span>
                  <div>
                    <h3 className="text-lg font-serif font-medium text-ink mb-2">{item.title}</h3>
                    <p className="text-ink/50 text-sm leading-relaxed font-light max-w-lg">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials — film-credit style */}
      <section className="py-24 relative overflow-hidden border-b border-black/5 cinematic-overlay">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(180,134,58,0.10),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-maroon block mb-6">
            In Their Own Words
          </span>

          <div className="inline-flex items-center gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-maroon fill-maroon" />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed italic text-ink">
                &ldquo;{TESTIMONIALS[testimonialIdx].quote}&rdquo;
              </p>
              <div>
                <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-maroon">
                  {TESTIMONIALS[testimonialIdx].couple}
                </h4>
                <p className="text-xs text-ink/50 font-medium mt-1">
                  {TESTIMONIALS[testimonialIdx].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-5 mt-10">
            <button
              onClick={() => goToTestimonial(testimonialIdx - 1)}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center text-ink/50 hover:text-ink hover:border-maroon/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIdx(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    testimonialIdx === idx ? 'w-8 bg-maroon' : 'w-1.5 bg-ink/20'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => goToTestimonial(testimonialIdx + 1)}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center text-ink/50 hover:text-ink hover:border-maroon/50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action — asymmetric split */}
      <section className="relative py-20 overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 font-serif text-[16rem] leading-none text-maroon/[0.08] italic select-none" aria-hidden="true">
          Film
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink mb-4 tracking-tight leading-tight">
                {ctaDict.title || 'Ready to Create Your'}{' '}
                <span className="text-maroon-gradient italic">{ctaDict.titleAccent || 'Dream Wedding'}</span>{' '}
                {ctaDict.titleEnd || 'Film?'}
              </h2>
              <p className="text-ink/50 text-sm max-w-lg font-light leading-relaxed">
                {ctaDict.subtitle || 'Build a custom package in minutes with our interactive quote tool.'}
              </p>
            </div>
            <Link href="/build-your-own" className="btn-maroon text-base py-4 px-10 flex-shrink-0">
              <Sliders className="h-5 w-5" />
              <span>{ctaDict.btn || 'Start Building Your Package'}</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
