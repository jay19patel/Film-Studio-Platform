'use client';

import { useState, useRef } from 'react';
import { Plus, Trash, Calendar, Users, FileDown, Sparkles, Award, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource, Addon, PackageDay } from '@/lib/db';
import PackageView from '@/components/PackageView';
import PdfProposalTemplate from '@/components/PdfProposalTemplate';
import InquiryModal from '@/components/InquiryModal';
import { en } from '@/dictionaries/en';
import { captureHtml2Canvas } from '@/lib/pdfHelper';

interface BuildYourOwnClientProps {
  resources: Resource[];
  addonsList: Addon[];
  dict?: typeof en;
}

export default function BuildYourOwnClient({
  resources,
  addonsList,
  dict = en,
}: BuildYourOwnClientProps) {
  const d = dict.buildYourOwnPage;

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
  const [shouldDownloadPdf, setShouldDownloadPdf] = useState(true);
  const [hasSubmittedInquiry, setHasSubmittedInquiry] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
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
        title: `Day ${prev.length + 1} - New Ceremony Event`,
        image: '',
        items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
      },
    ]);
  };

  const handleRemoveDay = (idx: number) => {
    if (days.length === 1) return; // Keep at least one day
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDayTitleChange = (idx: number, newTitle: string) => {
    setDays((prev) =>
      prev.map((day, i) => (i === idx ? { ...day, title: newTitle } : day))
    );
  };

  const handleAddResourceToDay = (dayIdx: number) => {
    const defaultResId = resources[0]?.id || '';
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIdx) return day;
        return {
          ...day,
          items: [...day.items, { resourceId: defaultResId, qty: 1 }],
        };
      })
    );
  };

  const handleRemoveResourceFromDay = (dayIdx: number, itemIdx: number) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIdx) return day;
        return {
          ...day,
          items: day.items.filter((_, j) => j !== itemIdx),
        };
      })
    );
  };

  const handleResourceChange = (dayIdx: number, itemIdx: number, resourceId: string) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIdx) return day;
        return {
          ...day,
          items: day.items.map((item, j) =>
            j === itemIdx ? { ...item, resourceId } : item
          ),
        };
      })
    );
  };

  const handleQtyChange = (dayIdx: number, itemIdx: number, change: number) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIdx) return day;
        return {
          ...day,
          items: day.items.map((item, j) => {
            if (j !== itemIdx) return item;
            const newQty = Math.max(1, item.qty + change);
            return { ...item, qty: newQty };
          }),
        };
      })
    );
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // PDF Generation function using safe captureHtml2Canvas
  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const element = pdfTemplateRef.current;
      if (!element) return;

      const canvas = await captureHtml2Canvas(element);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
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

      pdf.save(`CamBuddy_Custom_Proposal_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Trigger PDF download after filling out inquiry form if required
  const handlePdfButtonClick = () => {
    if (hasSubmittedInquiry) {
      handleDownloadPdf();
    } else {
      setDownloadPending(true);
      setIsModalOpen(true);
    }
  };

  const handleInquirySuccess = () => {
    setHasSubmittedInquiry(true);
    if (downloadPending) {
      setDownloadPending(false);
      setTimeout(() => {
        handleDownloadPdf();
      }, 500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative animate-fadeIn">

      {/* Builder Side Column */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Name Title card */}
        <div className="card-elevated rounded-3xl p-6 md:p-8">
          <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-2.5">
            {d.packageNameLabel}
          </label>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="w-full text-lg md:text-xl font-serif font-bold text-ink bg-transparent border-b-2 border-black/12 focus:border-maroon pb-2 outline-none transition-all"
            placeholder="e.g. My Dream Wedding Proposal"
          />
        </div>

        {/* Days timeline list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
              <Calendar className="h-5 w-5 text-maroon" />
              {d.eventDaysSection} ({days.length})
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddDay}
              className="bg-maroon/10 text-maroon hover:bg-maroon/20 font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 border border-maroon/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {d.addDayBtn}
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {days.map((day, dayIdx) => (
              <motion.div
                key={dayIdx}
                initial={{ opacity: 0, height: 0, y: 15 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="card-elevated rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-maroon/30 transition-colors"
              >
                {/* Remove day */}
                {days.length > 1 && (
                  <button
                    onClick={() => handleRemoveDay(dayIdx)}
                    className="absolute top-6 right-6 text-ink/40 hover:text-red-400 p-2 hover:bg-black/[0.02] rounded-lg transition-all"
                    title="Delete event day"
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                )}

                {/* Event Name */}
                <div className="mb-6 max-w-[80%]">
                  <label className="block text-[9px] font-bold text-maroon uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Event Ceremony {dayIdx + 1}
                  </label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                    className="w-full text-base md:text-lg font-serif font-bold text-ink bg-transparent border-b border-black/12 focus:border-maroon pb-1.5 outline-none transition-all"
                    placeholder="e.g. Day 1 - Haldi Ceremony"
                  />
                </div>

                {/* Team resources lists */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <span className="text-[10px] font-bold text-ink/50 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-ink/40" />
                      Assigned Creative Crew
                    </span>
                    <button
                      onClick={() => handleAddResourceToDay(dayIdx)}
                      className="text-maroon hover:text-maroon/80 font-bold text-xs flex items-center gap-0.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Crew Role
                    </button>
                  </div>

                  {day.items.length === 0 ? (
                    <p className="text-xs text-ink/50 italic py-2">
                      No crew roles assigned. Click &quot;Add Crew Role&quot; to select.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {day.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/[0.02] p-3 rounded-2xl border border-black/10"
                        >
                          {/* Resource Dropdown Selector */}
                          <div className="flex-grow">
                            <select
                              value={item.resourceId}
                              onChange={(e) =>
                                handleResourceChange(dayIdx, itemIdx, e.target.value)
                              }
                              className="w-full bg-charcoal border border-black/12 text-xs md:text-sm font-semibold text-ink rounded-xl px-3 py-2.5 outline-none focus:border-maroon"
                            >
                              <option value="" disabled>Select Role...</option>
                              {resources.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} (₹{formatPrice(r.pricePerDay)}/day)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantities steppers */}
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex items-center border border-black/12 bg-charcoal rounded-xl overflow-hidden">
                              <button
                                onClick={() => handleQtyChange(dayIdx, itemIdx, -1)}
                                className="px-3 py-1.5 text-ink/50 hover:bg-black/[0.04] font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-bold text-ink min-w-[28px] text-center border-x border-black/10">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => handleQtyChange(dayIdx, itemIdx, 1)}
                                className="px-3 py-1.5 text-ink/50 hover:bg-black/[0.04] font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveResourceFromDay(dayIdx, itemIdx)}
                              className="text-ink/40 hover:text-red-400 p-2 hover:bg-black/[0.02] rounded-lg transition-all"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pricing and Deliverables Summary Column */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        
        {/* Deliverables Checklist Addons */}
        <div className="card-elevated rounded-3xl p-6 md:p-8">
          <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-maroon" />
            {d.deliverablesSection}
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {addonsList.map((addon) => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => handleToggleAddon(addon.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'border-maroon bg-maroon/10 text-maroon'
                      : 'border-black/10 bg-black/[0.02] hover:border-maroon/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="mt-1 accent-maroon rounded h-4 w-4"
                  />
                  <div className="flex-grow">
                    <p className={`text-xs md:text-sm font-bold transition-colors ${
                      isChecked ? 'text-maroon' : 'text-ink/80'
                    }`}>
                      {addon.name}
                    </p>
                    <p className="text-[10px] text-ink/50 font-semibold mt-0.5">
                      + ₹{formatPrice(addon.price)} (One-time)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investment totals and action buttons */}
        <div className="card-elevated rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink/50 block mb-2">
            {d.totalEstimate}
          </span>

          {/* Pricing ribbon */}
          <div className="inline-flex bg-maroon-gradient text-ink font-serif text-2xl md:text-3xl font-black py-3 px-6 rounded-2xl shadow-md items-center gap-1.5 self-start mb-6">
            <span>₹{formatPrice(totalPrice)}/-</span>
          </div>

          <div className="space-y-3">
            {/* Checkbox for PDF Proposal Estimate Download */}
            <div className="bg-black/[0.02] border border-black/10 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-ink/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldDownloadPdf}
                  onChange={(e) => setShouldDownloadPdf(e.target.checked)}
                  className="w-4 h-4 rounded text-maroon focus:ring-maroon accent-maroon cursor-pointer"
                />
                <span>Download PDF Proposal Estimate</span>
              </label>
              <FileDown className="h-4 w-4 text-maroon flex-shrink-0" />
            </div>

            {/* Submit Inquiry Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="w-full btn-maroon py-4 text-sm font-bold tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-5 w-5" />
              Submit Custom Proposal Inquiry
            </motion.button>

            <p className="text-[10px] text-ink/50 text-center font-medium leading-relaxed">
              * Send your custom event coverage inquiry directly to CamBuddy Studios.
            </p>
          </div>
        </div>
      </div>

      {/* Inquiry Capture Modal */}
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
        onDownloadPdf={shouldDownloadPdf ? handleDownloadPdf : undefined}
        dict={dict.inquiryModal}
      />

      {/* Hidden container specifically formatted for Invoice-style A4 PDF Quote capture */}
      <div className="absolute left-[-9999px] top-0 bg-white">
        <div ref={pdfTemplateRef} className="bg-white select-none">
          <PdfProposalTemplate
            name={packageName}
            days={days}
            addons={selectedAddons}
            autoPrice={totalPrice}
            finalPrice={totalPrice}
            resources={resources}
            addonsList={addonsList}
          />
        </div>
      </div>

      {/* Loader Modal when PDF is rendering */}
      {isPdfGenerating && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-elevated p-8 rounded-3xl flex flex-col items-center justify-center text-center max-w-xs">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-serif font-medium text-ink mb-1">{d.downloadingPdf}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
