import Link from 'next/link';
import { Sparkles, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Package, Resource, Addon } from '@/lib/db';

interface PackageCardProps {
  pkg: Package;
  resources: Resource[];
  addons: Addon[];
}

export default function PackageCard({ pkg, resources, addons }: PackageCardProps) {
  // Resolve addon names included in this package
  const includedAddons = addons.filter((addon) => pkg.addons.includes(addon.id));

  // Get resources count and days count
  const daysCount = pkg.days.length;
  
  // Format price with comma
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col overflow-hidden h-full">
      {/* Price Ribbon */}
      <div className="absolute top-4 right-[-10px] z-10">
        <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold px-5 py-1.5 rounded-l-lg shadow-md text-sm tracking-wide flex items-center gap-1">
          <span>₹{formatPrice(pkg.finalPrice)}/-</span>
          {pkg.finalPrice < pkg.autoPrice && (
            <span className="text-[10px] line-through text-red-200">
              ₹{formatPrice(pkg.autoPrice)}
            </span>
          )}
        </div>
        <div className="absolute right-0 bottom-[-6px] w-[10px] h-[6px] bg-red-800 rounded-br-lg clip-triangle" />
      </div>

      {/* Package Header Image / Visual */}
      <div className="h-48 bg-gradient-to-tr from-amber-500/10 to-gold-500/5 relative overflow-hidden flex items-center justify-center p-6 border-b border-gray-50">
        {pkg.days[0]?.image ? (
          <img
            src={pkg.days[0].image}
            alt={pkg.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-4 left-4 text-white z-10">
          <span className="bg-amber-500/90 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block">
            {daysCount} {daysCount === 1 ? 'Event Day' : 'Event Days'}
          </span>
          <h3 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-md">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* Package Details */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Days Highlights */}
        <div className="space-y-2.5 mb-5 flex-grow">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Event Schedule
          </span>
          {pkg.days.map((day, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-800">{day.title}</span>
                <span className="text-gray-400 text-xs ml-1">
                  ({day.items.reduce((sum, item) => sum + item.qty, 0)} crew)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Deliverables Included (Yellow Box) */}
        {includedAddons.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              Deliverables Included
            </span>
            <ul className="space-y-1.5">
              {includedAddons.slice(0, 3).map((addon) => (
                <li key={addon.id} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{addon.name}</span>
                </li>
              ))}
              {includedAddons.length > 3 && (
                <li className="text-[11px] text-amber-700 font-semibold pl-5">
                  + {includedAddons.length - 3} more items included
                </li>
              )}
            </ul>
          </div>
        )}

        {/* View Details Button */}
        <Link
          href={`/package/${pkg.id}`}
          className="w-full bg-gray-900 hover:bg-amber-600 text-white font-semibold text-center text-sm py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm group hover:shadow-md"
        >
          <FileText className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors" />
          View Full Details
        </Link>
      </div>
    </div>
  );
}
