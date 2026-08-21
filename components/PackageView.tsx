'use client';

import * as Icons from 'lucide-react';
import { Sparkles, Calendar, Users, Check, Send, Award, Film, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Resource, Addon, PackageDay } from '@/lib/db';
import { en } from '@/dictionaries/en';

interface PackageViewProps {
  name: string;
  days: PackageDay[];
  addons: string[];
  autoPrice: number;
  finalPrice: number;
  resources: Resource[];
  addonsList: Addon[];
  showActionBtn?: boolean;
  onAction?: () => void;
  actionBtnText?: string;
  isPdfView?: boolean;
  dict?: typeof en.packageView;
}

export default function PackageView({
  name,
  days,
  addons,
  autoPrice,
  finalPrice,
  resources,
  addonsList,
  showActionBtn = false,
  onAction,
  actionBtnText,
  isPdfView = false,
  dict = en.packageView,
}: PackageViewProps) {
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // Helper to render dynamic icon
  const renderResourceIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName] || Icons.Camera;
    return <IconComp className="h-5 w-5 text-maroon flex-shrink-0" />;
  };

  // Resolve resource details
  const getResourceName = (resId: string) => {
    const res = resources.find((r) => r.id === resId);
    return res ? res.name : dict.crewMember;
  };

  const getResourceIcon = (resId: string) => {
    const res = resources.find((r) => r.id === resId);
    return res ? res.icon : 'Camera';
  };

  // Resolve addon details
  const resolvedAddons = addonsList.filter((addon) => addons.includes(addon.id));

  // Visual Theme mapping based on PDF mode vs Light mode
  const textPrimary = 'text-neutral-900';
  const textSecondary = 'text-neutral-600';
  const bgCard = 'bg-white border border-gray-200';
  const bgTimelineDot = 'bg-white border-maroon';
  const timelineLine = 'bg-gray-200';
  const accentBox = 'bg-gray-50 border border-gray-200 text-neutral-800';

  const defaultBtnText = actionBtnText || dict.enquireBook;

  return (
    <div className={`w-full max-w-5xl mx-auto relative ${isPdfView ? 'p-10 bg-white' : 'p-4 md:p-8'}`}>

      {/* Cinematic Decorative Header */}
      <div className="text-center mb-16 relative">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center gap-2 mb-3"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-maroon" />
          <Sparkles className="h-5 w-5 text-maroon animate-pulse" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-maroon" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${textPrimary} tracking-tight leading-tight`}
        >
          {name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xs font-extrabold tracking-widest text-maroon uppercase mt-3"
        >
          {dict.subtitle}
        </motion.p>
      </div>

      {/* Days Breakdown Section with Timeline Track */}
      <div className="relative mb-20">
        
        {/* Central Vertical Timeline Path (Desktop only) */}
        {!isPdfView && (
          <div className={`absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-[1px] ${timelineLine} hidden md:block`} />
        )}

        <div className="space-y-12 md:space-y-20">
          {days.map((day, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={isPdfView ? {} : { opacity: 0, y: 40 }}
                whileInView={isPdfView ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col gap-6 md:gap-12 items-center ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                } relative`}
              >
                {/* Timeline center node indicator */}
                {!isPdfView && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-[50%] -translate-y-1/2 hidden md:flex items-center justify-center z-10">
                    <div className="w-8 h-8 rounded-full border border-maroon/20 flex items-center justify-center bg-white shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-maroon" />
                    </div>
                  </div>
                )}

                {/* Event Image */}
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <div className={`relative aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 bg-gray-50 group`}>
                    {day.image ? (
                      <img
                        src={day.image}
                        alt={day.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Icons.Image className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Details Card */}
                <div className="w-full md:w-1/2">
                  <div className={`${bgCard} rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden group`}>

                    {/* Day Title badge */}
                    <div className={`inline-flex items-center gap-1.5 border border-maroon/20 bg-maroon/5 text-maroon font-extrabold uppercase tracking-widest text-xs px-4 py-2 rounded-xl mb-6 shadow-sm`}>
                      <Award className="h-3.5 w-3.5" />
                      {day.title}
                    </div>

                    <h3 className={`text-base md:text-lg font-serif font-bold ${textPrimary} mb-5 flex items-center gap-2 border-b border-gray-100 pb-3`}>
                      <Users className="h-4.5 w-4.5 text-maroon" />
                      Assigned Creative Crew
                    </h3>

                    {/* Resource crew elements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {day.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 transition-all hover:bg-white"
                        >
                          <div className="p-2 rounded-xl bg-white border border-gray-100 flex-shrink-0">
                            {renderResourceIcon(getResourceIcon(item.resourceId))}
                          </div>
                          <div>
                            <p className={`text-xs md:text-sm font-bold ${textPrimary} truncate max-w-[120px]`}>
                              {getResourceName(item.resourceId)}
                            </p>
                            <p className={`text-[10px] ${textSecondary} font-semibold mt-0.5`}>
                              {dict.resourceQty}: {item.qty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Box and Deliverables Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Deliverables Box */}
        <div className={`md:col-span-7 ${accentBox} rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-center`}>
          <h3 className="font-serif text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-neutral-900">
            <Sparkles className="h-5 w-5 text-maroon" />
            {dict.deliverablesTitle}
          </h3>
          {resolvedAddons.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {resolvedAddons.map((addon) => (
                <li
                  key={addon.id}
                  className="flex items-start gap-2.5 text-xs md:text-sm font-bold text-neutral-700"
                >
                  <div className="bg-maroon/10 text-maroon rounded-full p-0.5 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{addon.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500 italic">No additional physical deliverables configured.</p>
          )}
        </div>

        {/* Total Investment Card */}
        <div className="md:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-center relative overflow-hidden">
          
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 block mb-2">
            Investment Quote
          </span>
          
          <div className="flex flex-col gap-1.5 mb-6">
            <div className="inline-flex bg-maroon-gradient text-white font-serif text-2xl md:text-3xl font-black py-3 px-6 rounded-2xl shadow-md items-center gap-2 self-start border-l border-t border-maroon-light">
              <span>₹{formatPrice(finalPrice)}/-</span>
              {finalPrice < autoPrice && (
                <span className="text-xs line-through text-red-200 font-sans font-medium">
                  ₹{formatPrice(autoPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 mt-2 block font-medium">
              Comprehensive quote: includes cinematography, editing, raw pendrive deliverables, and taxes.
            </span>
          </div>

          {showActionBtn && onAction && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAction}
              className="w-full btn-maroon"
            >
              <Send className="h-4.5 w-4.5" />
              {defaultBtnText}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
