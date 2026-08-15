import * as Icons from 'lucide-react';
import { Sparkles, Calendar, Users, Check } from 'lucide-react';
import { Resource, Addon, PackageDay } from '@/lib/db';

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
  actionBtnText = 'Enquire & Book Package',
  isPdfView = false,
}: PackageViewProps) {
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // Helper to render dynamic icon
  const renderResourceIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName] || Icons.Camera;
    return <IconComp className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />;
  };

  // Resolve resource details
  const getResourceName = (resId: string) => {
    const res = resources.find((r) => r.id === resId);
    return res ? res.name : 'Crew Member';
  };

  const getResourceIcon = (resId: string) => {
    const res = resources.find((r) => r.id === resId);
    return res ? res.icon : 'Camera';
  };

  // Resolve addon details
  const resolvedAddons = addonsList.filter((addon) => addons.includes(addon.id));

  return (
    <div className={`w-full max-w-5xl mx-auto ${isPdfView ? 'p-8 bg-white' : 'p-4 md:p-8'}`}>
      
      {/* Decorative Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-[1px] bg-amber-400" />
          <Sparkles className="h-5 w-5 text-amber-500 animate-spin-slow" />
          <div className="w-12 h-[1px] bg-amber-400" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          {name}
        </h1>
        <p className="text-sm text-gray-500 font-medium tracking-wide mt-2">
          EXQUISITE WEDDING PHOTOGRAPHY & FILMS QUOTE
        </p>
      </div>

      {/* Days Breakdown Section (Alternating Layout) */}
      <div className="space-y-12 md:space-y-16 mb-16">
        {days.map((day, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={idx}
              className={`flex flex-col gap-6 md:gap-10 items-center ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              } ${isPdfView ? 'md:flex-row md:gap-8' : ''}`}
            >
              {/* Event Image */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="relative aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-md border-4 border-white bg-gray-100">
                  {day.image ? (
                    <img
                      src={day.image}
                      alt={day.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-amber-100 to-amber-50 flex items-center justify-center text-amber-300">
                      <Icons.Image className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Box */}
              <div className="w-full md:w-1/2">
                <div className="bg-white rounded-3xl border-2 border-amber-200/60 p-6 md:p-8 shadow-xs relative">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-50 to-transparent rounded-tr-3xl -z-10" />

                  {/* Day Label Box */}
                  <div className="inline-block border border-amber-500 bg-amber-50/50 text-amber-700 font-bold uppercase tracking-wider text-xs md:text-sm px-4 py-1.5 rounded-xl mb-4">
                    {day.title}
                  </div>

                  <h3 className="text-lg md:text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-500" />
                    Creative Team Assigned:
                  </h3>

                  {/* Resource Crew List */}
                  <div className="space-y-3">
                    {day.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm md:text-base text-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {renderResourceIcon(getResourceIcon(item.resourceId))}
                          <span className="font-medium">{getResourceName(item.resourceId)}</span>
                        </div>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-0.5 rounded-lg text-xs md:text-sm">
                          Qty: {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliverables & Quote Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
        {/* Deliverables Included (Yellow Box) */}
        <div className="md:col-span-7 bg-amber-50/80 border border-amber-200 rounded-3xl p-6 md:p-8 shadow-xs">
          <h3 className="font-serif text-lg md:text-xl font-bold text-amber-900 flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
            Deliverables Included (Included Physical & Digital items)
          </h3>
          {resolvedAddons.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resolvedAddons.map((addon) => (
                <li
                  key={addon.id}
                  className="flex items-start gap-2 text-xs md:text-sm text-gray-800 font-medium"
                >
                  <div className="bg-emerald-100 text-emerald-700 rounded-full p-0.5 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{addon.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No additional physical deliverables selected.</p>
          )}
        </div>

        {/* Pricing Ribbon Box */}
        <div className="md:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col justify-center h-full">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Total Investment
          </span>
          
          <div className="flex flex-col gap-1 mb-6">
            {/* Price Ribbon element */}
            <div className="inline-flex bg-gradient-to-r from-red-600 to-rose-500 text-white font-serif text-2xl md:text-3xl font-black py-2.5 px-6 rounded-2xl shadow-md items-center gap-1.5 self-start">
              <span>₹{formatPrice(finalPrice)}/-</span>
              {finalPrice < autoPrice && (
                <span className="text-xs line-through text-red-200 font-sans font-normal">
                  ₹{formatPrice(autoPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1.5 block">
              Inclusive of all event services, editing, raw footage, and taxes.
            </span>
          </div>

          {showActionBtn && onAction && (
            <button
              onClick={onAction}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-sm md:text-base py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Icons.Send className="h-4.5 w-4.5" />
              {actionBtnText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
