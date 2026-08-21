'use client';

import Link from 'next/link';
import { Sparkles, FileText, CheckCircle2, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import { Package, Resource, Addon } from '@/lib/db';
import { en } from '@/dictionaries/en';

interface PackageCardProps {
  pkg: Package;
  resources: Resource[];
  addons: Addon[];
  dict?: typeof en.packageCard;
}

export default function PackageCard({ pkg, resources, addons, dict = en.packageCard }: PackageCardProps) {
  // Resolve addon names included in this package
  const includedAddons = addons.filter((addon) => pkg.addons.includes(addon.id));

  // Get resources count and days count
  const daysCount = pkg.days.length;
  
  // Format price with comma
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative card-elevated rounded-3xl flex flex-col overflow-hidden h-full transition-all duration-500"
    >
      {/* Luxury Red Price Ribbon */}
      <div className="absolute top-5 right-[-10px] z-10">
        <div className="bg-maroon-gradient text-white font-extrabold px-6 py-2 rounded-l-xl shadow-md text-sm tracking-widest flex items-center gap-1.5 border-l border-t border-maroon-light">
          <span>₹{formatPrice(pkg.finalPrice)}/-</span>
          {pkg.finalPrice < pkg.autoPrice && (
            <span className="text-[10px] line-through text-red-200 font-medium">
              ₹{formatPrice(pkg.autoPrice)}
            </span>
          )}
        </div>
        {/* Ribbon triangle fold */}
        <div className="absolute right-0 bottom-[-6px] w-[10px] h-[6px] bg-maroon-dark clip-triangle" />
      </div>

      {/* Package Header Image with zoom */}
      <div className="h-52 relative overflow-hidden flex items-end p-6 border-b border-black/5">
        {pkg.days[0]?.image ? (
          <img
            src={pkg.days[0].image}
            alt={pkg.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-black/[0.03]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 space-y-1">
          <span className="bg-white/90 text-neutral-900 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-md inline-block shadow-sm">
            {daysCount} {daysCount === 1 ? dict.eventDay : dict.eventDays}
          </span>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* Package Details */}
      <div className="p-6 md:p-7 flex flex-col flex-grow">
        
        {/* Days Highlights Timeline */}
        <div className="space-y-3.5 mb-6 flex-grow relative pl-4 border-l border-black/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-1">
            {dict.programTimeline}
          </span>
          {pkg.days.map((day, i) => (
            <div key={i} className="relative group/item">
              {/* Timeline Node Dot */}
              <div className="absolute left-[-21px] top-1.5 w-2 h-2 rounded-full bg-charcoal border-2 border-black/15 group-hover:border-maroon transition-colors" />
              <div className="flex items-start gap-1 text-xs md:text-sm text-ink/60">
                <div>
                  <span className="font-bold text-ink">{day.title}</span>
                  <span className="text-ink/40 text-[10px] ml-1.5">
                    ({day.items.reduce((sum, item) => sum + item.qty, 0)} {dict.crew})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deliverables Included */}
        {includedAddons.length > 0 && (
          <div className="bg-black/[0.02] border border-black/10 rounded-2xl p-4.5 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              {dict.physicalDeliverables}
            </span>
            <ul className="space-y-2">
              {includedAddons.slice(0, 3).map((addon) => (
                <li key={addon.id} className="text-xs text-ink/70 flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-maroon mt-0.5 flex-shrink-0" />
                  <span className="truncate">{addon.name}</span>
                </li>
              ))}
              {includedAddons.length > 3 && (
                <li className="text-[11px] text-maroon font-bold pl-5.5">
                  + {includedAddons.length - 3} {dict.moreItems}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            href={`/package/${pkg.id}`}
            className="w-full btn-maroon flex items-center justify-center gap-1.5 shadow-md group"
          >
            <FileText className="h-4 w-4" />
            {dict.viewProposal}
          </Link>
          <Link
            href="/build-your-own"
            className="w-full btn-outline flex items-center justify-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            {dict.customizePackage}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
