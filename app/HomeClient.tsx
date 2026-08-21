'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Sliders, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { Package, Resource, Addon, PortfolioItem } from '@/lib/db';
import PackageCard from '@/components/PackageCard';

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
  },
  {
    id: '2',
    title: 'Sunset Pheras at Heritage Fort',
    category: 'Wedding',
    image: '/uploads/wedding.png',
    location: 'Jaipur, Rajasthan',
    tags: ['Candid', 'Editorial', 'Albums'],
  },
  {
    id: '3',
    title: 'Yellow Splendor Haldi Ceremony',
    category: 'Haldi',
    image: '/uploads/haldi.png',
    location: 'Ahmedabad',
    tags: ['Turmeric', 'Candid', 'Family'],
  },
  {
    id: '4',
    title: 'Electrifying Sangeet Stage Night',
    category: 'Sangeet',
    image: '/uploads/sangeet.png',
    location: 'Goa Beach Resort',
    tags: ['Stage Lights', 'Dance', 'Multi-Cam'],
  },
  {
    id: '5',
    title: 'Romantic Coastal Pre-Wedding',
    category: 'Pre-Wedding',
    image: '/uploads/prewedding.png',
    location: 'Diu Cliffs',
    tags: ['Sunset', 'Cinematic', 'Drone'],
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
  // Gallery Tab State
  const [activeTab, setActiveTab] = useState('All');

  // Testimonials Carousel State
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const isGujarati = dict?.header?.packages === 'પેકેજ';

  const heroDict = dict?.home?.hero || {};
  const propDict = dict?.home?.proposals || {};
  const advDict = dict?.home?.advantage || {};
  const ctaDict = dict?.home?.ctaBanner || {};

  const filteredGallery =
    activeTab === 'All'
      ? PORTFOLIO_GALLERY
      : PORTFOLIO_GALLERY.filter((item) => item.category === activeTab);

  return (
    <div className="bg-white min-h-screen relative overflow-hidden text-neutral-900">
      
      {/* 1. HD Background Video Hero Section (Full Viewport Height) */}
      <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        
        {/* Native Local HD Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center scale-105"
            src="/uploads/hero_video.mp4"
          />
          {/* Rich Dark Luxury Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/30 to-black/80" />
        </div>

        {/* Hero Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >


            {/* Main Title with Locale Font Switching */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-tight max-w-5xl mx-auto drop-shadow-2xl">
              <span className={`block text-white font-normal drop-shadow-lg mb-2 ${isGujarati ? 'font-shrikhand' : 'font-serif'}`}>
                {heroDict.title1 || 'Capturing the Pure Poetry of'}
              </span>
              <span className={`text-rose-300 text-5xl sm:text-7xl md:text-8xl lg:text-9xl block font-normal tracking-normal drop-shadow-lg ${isGujarati ? 'font-shrikhand' : 'font-caveat'}`}>
                {heroDict.title2 || 'your forever story'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-light tracking-wide drop-shadow-md">
              {heroDict.subtitle || 'Handcrafted wedding proposal packages, combining high-end cinematic teams and premium photobooks.'}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4.5 justify-center items-center">
            <a
              href="#packages-list"
              className="w-full sm:w-auto btn-maroon py-4 px-8 text-sm font-bold tracking-wide shadow-2xl flex items-center justify-center gap-2"
            >
              <span>{heroDict.cta || 'Explore Proposals'}</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <Link
              href="/build-your-own"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 py-4 px-8 rounded-full text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Sliders className="h-4 w-4" />
              <span>{heroDict.buildOwn || 'Build Your Own Package'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Interactive Portfolio Gallery */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2">
                {dict?.header?.portfolio || 'Portfolio'}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                {isGujarati ? 'અમારા ખાસ વેડિંગ શોકેસ' : 'Featured Wedding Stories & Moments'}
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {['All', 'Wedding', 'Haldi', 'Sangeet', 'Pre-Wedding'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-maroon text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {item.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] text-maroon-200 font-bold uppercase tracking-widest block mb-1">
                      📍 {item.location}
                    </span>
                    <h3 className="font-serif text-lg font-bold leading-snug">{item.title}</h3>
                  </div>
                </div>

                <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100">
                  <div className="flex gap-1.5">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/portfolio"
                    className="text-xs font-bold text-maroon hover:underline flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Predefined Packages Grid Section */}
      <section id="packages-list" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-2.5">
              {propDict.badge || 'Ready-Made Configs'}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              {propDict.title || 'Our Signature Proposals'}
            </h2>
            <p className="text-neutral-500 text-xs md:text-sm mt-2 max-w-xl font-medium leading-relaxed">
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
        </div>

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
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Camera className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
              {propDict.noPackagesTitle || 'No Packages Published'}
            </h3>
            <p className="text-gray-500 text-xs mb-6">
              {propDict.noPackagesDesc || 'Create a custom quote config!'}
            </p>
            <Link href="/build-your-own" className="btn-maroon text-xs uppercase tracking-wider inline-flex">
              {propDict.buildCustomBtn || 'Build Custom Quote'}
            </Link>
          </div>
        )}
      </section>

      {/* 5. Studio Advantage Section */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-maroon uppercase tracking-widest block mb-2.5">
              {advDict.badge || 'The CamBuddy Craft'}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900">
              {advDict.title || 'Why Couples Choose Our Lens'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center shadow-xs">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">
                {advDict.box1Title || 'State-of-the-Art Gear'}
              </h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {advDict.box1Desc || 'We capture in premium 4K HDR, utilizing mirrorless camera rigs.'}
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center shadow-xs">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">
                {advDict.box2Title || 'Fine Art Color Grading'}
              </h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {advDict.box2Desc || 'Every photo and film frame undergoes extensive editorial color grading.'}
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center shadow-xs">
              <div className="bg-maroon/10 text-maroon w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-maroon/20">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-3">
                {advDict.box3Title || 'Custom Timelines'}
              </h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light">
                {advDict.box3Desc || 'Our interactive quote tools grant you absolute flexibility.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Carousel */}
      <section className="bg-maroon-gradient text-white py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-300 fill-yellow-300" />
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
              <p className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed italic">
                &ldquo;{TESTIMONIALS[testimonialIdx].quote}&rdquo;
              </p>
              <div>
                <h4 className="font-bold text-base tracking-wide text-white">
                  {TESTIMONIALS[testimonialIdx].couple}
                </h4>
                <p className="text-xs text-white/80 font-medium">
                  {TESTIMONIALS[testimonialIdx].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-3 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIdx(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  testimonialIdx === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="relative py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            {ctaDict.title || 'Ready to Create Your'}{' '}
            <span className="text-maroon-gradient italic">{ctaDict.titleAccent || 'Dream Wedding'}</span>{' '}
            {ctaDict.titleEnd || 'Film?'}
          </h2>
          <p className="text-neutral-600 text-sm max-w-lg mx-auto mb-8 font-light leading-relaxed">
            {ctaDict.subtitle || 'Build a custom package in minutes with our interactive quote tool.'}
          </p>
          <Link href="/build-your-own" className="btn-maroon text-base py-4 px-10">
            <Sliders className="h-5 w-5" />
            <span>{ctaDict.btn || 'Start Building Your Package'}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
