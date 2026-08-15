'use client';

import { useState, useRef } from 'react';
import { Plus, Trash, Sliders, Calendar, Users, CheckCircle2, ChevronRight, FileDown, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Resource, Addon, PackageDay, PackageDayItem } from '@/lib/db';
import PackageView from '@/components/PackageView';
import InquiryModal from '@/components/InquiryModal';

interface BuildYourOwnClientProps {
  resources: Resource[];
  addonsList: Addon[];
}

export default function BuildYourOwnClient({
  resources,
  addonsList,
}: BuildYourOwnClientProps) {
  // Initialize with one default event day
  const [packageName, setPackageName] = useState('My Custom Wedding Package');
  const [days, setDays] = useState<PackageDay[]>([
    {
      title: 'Day 1 - Main Wedding Ceremony',
      image: '',
      items: [
        { resourceId: resources[0]?.id || '', qty: 1 }
      ],
    },
  ]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Helper to dynamically match event images based on user's title
  const getEventImageByTitle = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('haldi') || t.includes('mehendi') || t.includes('henna') || t.includes('yellow')) {
      return '/uploads/haldi.png';
    }
    if (t.includes('sangeet') || t.includes('dance') || t.includes('ring') || t.includes('cocktail') || t.includes('music')) {
      return '/uploads/sangeet.png';
    }
    if (t.includes('pre-wedding') || t.includes('prewedding') || t.includes('shoot') || t.includes('couple')) {
      return '/uploads/prewedding.png';
    }
    if (t.includes('wedding') || t.includes('marriage') || t.includes('pheras') || t.includes('reception')) {
      return '/uploads/wedding_main.png';
    }
    return '/uploads/wedding.png'; // default fallback
  };

  // Map day data with default images resolved for preview/PDF render
  const daysWithImages = days.map((day) => ({
    ...day,
    image: getEventImageByTitle(day.title),
  }));

  // Calculations
  const calculateTotal = () => {
    let resourcesSum = 0;
    days.forEach((day) => {
      day.items.forEach((item) => {
        const res = resources.find((r) => r.id === item.resourceId);
        if (res) {
          resourcesSum += res.pricePerDay * item.qty;
        }
      });
    });

    let addonsSum = 0;
    selectedAddons.forEach((addonId) => {
      const addon = addonsList.find((a) => a.id === addonId);
      if (addon) {
        addonsSum += addon.price;
      }
    });

    return resourcesSum + addonsSum;
  };

  const totalPrice = calculateTotal();

  // Stepper handlers
  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      {
        title: `Day ${prev.length + 1} - New Event`,
        image: '',
        items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
      },
    ]);
  };

  const handleRemoveDay = (idx: number) => {
    if (days.length === 1) return; // Keep at least one day
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDayTitleChange = (idx: number, title: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[idx].title = title;
      return updated;
    });
  };

  const handleAddResourceToDay = (dayIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      // Pick first resource not already added, or just default to first resource
      const availableResource = resources[0]?.id || '';
      updated[dayIdx].items = [...updated[dayIdx].items, { resourceId: availableResource, qty: 1 }];
      return updated;
    });
  };

  const handleRemoveResourceFromDay = (dayIdx: number, itemIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIdx].items = updated[dayIdx].items.filter((_, i) => i !== itemIdx);
      return updated;
    });
  };

  const handleResourceChange = (dayIdx: number, itemIdx: number, resourceId: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIdx].items[itemIdx].resourceId = resourceId;
      return updated;
    });
  };

  const handleQtyChange = (dayIdx: number, itemIdx: number, change: number) => {
    setDays((prev) => {
      const updated = [...prev];
      const newQty = Math.max(1, updated[dayIdx].items[itemIdx].qty + change);
      updated[dayIdx].items[itemIdx].qty = newQty;
      return updated;
    });
  };

  // Addon handlers
  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Lead Modal success callback: Trigger PDF generation & download
  const handleLeadSuccess = () => {
    setIsPdfGenerating(true);
    setTimeout(async () => {
      try {
        const element = pdfTemplateRef.current;
        if (!element) return;

        // Generate canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 size
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`CamBuddy_Quote_${Date.now()}.pdf`);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsPdfGenerating(false);
      }
    }, 1200); // Small delay to let modal transition or success finish
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Builder Sidebar Panel */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Package General Settings */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Give Your Custom Package a Name
          </label>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="w-full text-lg md:text-xl font-serif font-bold text-gray-800 bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl px-4 py-3 outline-none transition-all"
            placeholder="e.g. My Dream Wedding Package"
          />
        </div>

        {/* Days & Events Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Event Days Schedule ({days.length})
            </h2>
            <button
              onClick={handleAddDay}
              className="bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1 border border-amber-200"
            >
              <Plus className="h-4 w-4" />
              Add Event Day
            </button>
          </div>

          {days.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative transition-all hover:border-amber-200"
            >
              {/* Day Delete Button */}
              {days.length > 1 && (
                <button
                  onClick={() => handleRemoveDay(dayIdx)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete event day"
                >
                  <Trash className="h-4.5 w-4.5" />
                </button>
              )}

              {/* Day Title */}
              <div className="mb-6 max-w-[85%]">
                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">
                  Event Day {dayIdx + 1} Title
                </label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                  className="w-full text-base md:text-lg font-serif font-bold text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-amber-500 pb-1 outline-none transition-all"
                  placeholder="e.g. Day 1 - Haldi Ceremony"
                />
              </div>

              {/* Resource list inside this day */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    Photography & Cinematic Crew
                  </span>
                  <button
                    onClick={() => handleAddResourceToDay(dayIdx)}
                    className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-0.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Crew Role
                  </button>
                </div>

                {day.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No crew roles assigned. Click "Add Crew Role" to select.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {day.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100"
                      >
                        {/* Resource Selector */}
                        <div className="flex-grow">
                          <select
                            value={item.resourceId}
                            onChange={(e) =>
                              handleResourceChange(dayIdx, itemIdx, e.target.value)
                            }
                            className="w-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                          >
                            <option value="" disabled>Select Role...</option>
                            {resources.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} (₹{formatPrice(r.pricePerDay)}/day)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Stepper & Delete */}
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleQtyChange(dayIdx, itemIdx, -1)}
                              className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 font-bold text-sm"
                            >
                              -
                            </button>
                            <span className="px-3 text-sm font-bold text-gray-800 min-w-[32px] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleQtyChange(dayIdx, itemIdx, 1)}
                              className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 font-bold text-sm"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveResourceFromDay(dayIdx, itemIdx)}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove role"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing and Deliverables Summary Panel */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        
        {/* Deliverables Checklist (Addons) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Add Deliverables
          </h2>
          <div className="space-y-3">
            {addonsList.map((addon) => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => handleToggleAddon(addon.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="mt-1 accent-amber-500 rounded h-4 w-4"
                  />
                  <div className="flex-grow">
                    <p className={`text-xs md:text-sm font-bold transition-colors ${
                      isChecked ? 'text-amber-800' : 'text-gray-700'
                    }`}>
                      {addon.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      + ₹{formatPrice(addon.price)} (One-time)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Running Total Calculator & Lead Submission */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-md relative overflow-hidden flex flex-col">
          {/* Header */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
            Running Quote Total
          </span>

          {/* Pricing ribbon container */}
          <div className="inline-flex bg-gradient-to-r from-red-600 to-rose-500 text-white font-serif text-2xl md:text-3xl font-black py-2.5 px-6 rounded-2xl shadow-md items-center gap-1 self-start mb-6">
            <span>₹{formatPrice(totalPrice)}/-</span>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-sm md:text-base py-4 px-6 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="h-5 w-5" />
              Download PDF Quote
            </button>
            <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
              * Generates a premium PDF quote and submits your configuration to the studio to secure availability.
            </p>
          </div>
        </div>
      </div>

      {/* Inquiry Capture Modal wrapper */}
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={packageName}
        type="custom"
        customDetails={{
          days,
          addons: selectedAddons,
          totalPrice,
        }}
        onSuccess={handleLeadSuccess}
      />

      {/* Hidden container specifically formatted for A4 PDF Quote capture */}
      <div className="absolute left-[-9999px] top-0 w-[800px] bg-white">
        <div ref={pdfTemplateRef} className="bg-white p-10 select-none">
          <PackageView
            name={packageName}
            days={daysWithImages}
            addons={selectedAddons}
            autoPrice={totalPrice}
            finalPrice={totalPrice}
            resources={resources}
            addonsList={addonsList}
            isPdfView={true}
          />
        </div>
      </div>

      {/* Loader Modal when PDF is rendering */}
      {isPdfGenerating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center max-w-xs border border-gray-100">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-serif font-bold text-gray-900 mb-1">Generating PDF Quote...</h3>
            <p className="text-xs text-gray-500 font-medium">
              Please wait while we render your custom wedding photography proposal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
