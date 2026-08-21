'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Client, Inquiry, Resource, Addon, PackageDay } from '@/lib/db';
import { ArrowLeft, Plus, Trash2, Calendar, Users, Sparkles, Send, Save, IndianRupee, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuotationEditorClientProps {
  client: Client;
  inquiry: Inquiry | null;
  resources: Resource[];
  addons: Addon[];
}

export default function QuotationEditorClient({
  client,
  inquiry,
  resources,
  addons,
}: QuotationEditorClientProps) {
  const router = useRouter();

  const isConfirmed = client.proposalStatus === 'confirmed';
  const effectiveCustomDetails = client.customDetails || inquiry?.customDetails;

  // Initialize form state
  const [packageName, setPackageName] = useState(
    client.packageName || inquiry?.packageName || 'My Custom Wedding Package'
  );

  const defaultDays: PackageDay[] = [
    {
      title: 'Day 1 - Main Wedding Ceremony',
      image: '',
      items: [
        { resourceId: resources[0]?.id || '', qty: 1 },
        { resourceId: resources[1]?.id || '', qty: 1 },
      ],
    },
  ];

  const [days, setDays] = useState<PackageDay[]>(
    effectiveCustomDetails?.days && effectiveCustomDetails.days.length > 0
      ? effectiveCustomDetails.days
      : defaultDays
  );

  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    effectiveCustomDetails?.addons || []
  );

  // Price calculations
  const calcAutoPrice = (currentDays: PackageDay[], currentAddons: string[]) => {
    let crewTotal = 0;
    currentDays.forEach((day) => {
      day.items.forEach((item) => {
        const res = resources.find((r) => r.id === item.resourceId);
        const price = res?.pricePerDay || 0;
        crewTotal += price * item.qty;
      });
    });

    let addonsTotal = 0;
    currentAddons.forEach((addonId) => {
      const addon = addons.find((a) => a.id === addonId);
      addonsTotal += addon?.price || 0;
    });

    return crewTotal + addonsTotal;
  };

  const initialAutoPrice = calcAutoPrice(days, selectedAddons);
  const [totalAmount, setTotalAmount] = useState<number>(
    client.totalAmount || effectiveCustomDetails?.totalPrice || initialAutoPrice
  );

  const [isSaving, setIsSaving] = useState(false);

  // Handlers for Days & Items
  const handleAddDay = () => {
    const newDay: PackageDay = {
      title: `Day ${days.length + 1} - Celebrations`,
      image: '',
      items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
    };
    const updated = [...days, newDay];
    setDays(updated);
    setTotalAmount(calcAutoPrice(updated, selectedAddons));
  };

  const handleRemoveDay = (dayIdx: number) => {
    const updated = days.filter((_, idx) => idx !== dayIdx);
    setDays(updated);
    setTotalAmount(calcAutoPrice(updated, selectedAddons));
  };

  const handleDayTitleChange = (dayIdx: number, title: string) => {
    const updated = [...days];
    updated[dayIdx].title = title;
    setDays(updated);
  };

  const handleAddCrewItem = (dayIdx: number) => {
    const updated = [...days];
    updated[dayIdx].items.push({ resourceId: resources[0]?.id || '', qty: 1 });
    setDays(updated);
    setTotalAmount(calcAutoPrice(updated, selectedAddons));
  };

  const handleRemoveCrewItem = (dayIdx: number, itemIdx: number) => {
    const updated = [...days];
    updated[dayIdx].items = updated[dayIdx].items.filter((_, idx) => idx !== itemIdx);
    setDays(updated);
    setTotalAmount(calcAutoPrice(updated, selectedAddons));
  };

  const handleCrewItemChange = (dayIdx: number, itemIdx: number, field: 'resourceId' | 'qty', val: any) => {
    const updated = [...days];
    updated[dayIdx].items[itemIdx] = {
      ...updated[dayIdx].items[itemIdx],
      [field]: val,
    };
    setDays(updated);
    setTotalAmount(calcAutoPrice(updated, selectedAddons));
  };

  const handleToggleAddon = (addonId: string) => {
    const updated = selectedAddons.includes(addonId)
      ? selectedAddons.filter((id) => id !== addonId)
      : [...selectedAddons, addonId];
    setSelectedAddons(updated);
    setTotalAmount(calcAutoPrice(days, updated));
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  // Save Quotation
  const handleSave = async (shouldSend = false) => {
    setIsSaving(true);
    try {
      const autoPrice = calcAutoPrice(days, selectedAddons);
      const customDetails = {
        days,
        addons: selectedAddons,
        autoPrice,
        totalPrice: totalAmount,
      };

      const updateData: any = {
        id: client.id,
        packageName,
        totalAmount,
        customDetails,
        proposalStatus: isConfirmed ? 'confirmed' : shouldSend ? 'sent' : 'draft',
      };

      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error('Failed to update client quotation');

      if (shouldSend && !isConfirmed) {
        // Generate Link
        const linkRes = await fetch('/api/proposals/generate-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: client.id }),
        });
        const linkData = await linkRes.json();
        if (linkRes.ok) {
          await navigator.clipboard.writeText(linkData.shareUrl);
          toast.success('Quotation saved & proposal link copied to clipboard!');
        } else {
          toast.success('Quotation saved successfully!');
        }
      } else {
        toast.success('Quotation saved successfully!');
      }

      router.push(`/admin/clients/${client.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quotation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text font-sans pb-16">
      {/* Top Sticky Header */}
      <header className="bg-admin-surface border-b border-admin-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/clients/${client.id}`}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-admin-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight text-admin-text">
                Customize Proposal Quotation
              </h1>
              <p className="text-xs font-semibold text-admin-muted">
                Client: <strong className="text-admin-text">{client.name}</strong> ({client.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || isConfirmed}
              className="bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || isConfirmed}
              className="bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Save & Send Proposal</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Status Alert Banner */}
        {isConfirmed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>This quotation has been confirmed & locked by the client and cannot be edited.</span>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-2xl text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-maroon flex-shrink-0" />
              <span>Configure coverage days, crew quantities, deliverables, and final quotation price.</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {client.proposalStatus || 'draft'}
            </span>
          </div>
        )}

        {/* Section 1: Package Title */}
        <div className="bg-admin-surface rounded-3xl p-6 border border-admin-border space-y-4">
          <h3 className="font-serif text-base font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-5 w-5 text-maroon" /> Proposal Package Title
          </h3>
          <div>
            <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
              Package Display Name
            </label>
            <input
              type="text"
              disabled={isConfirmed}
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none placeholder-admin-muted/50 focus:border-maroon transition-colors"
              placeholder="e.g. Royal Wedding Package / Premium Custom Package"
            />
          </div>
        </div>

        {/* Section 2: Coverage Days & Creative Crew Allocation */}
        <div className="bg-admin-surface rounded-3xl p-6 border border-admin-border space-y-6">
          <div className="flex items-center justify-between border-b border-admin-border pb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-5 w-5 text-maroon" /> Event Days & Creative Crew Config ({days.length})
              </h3>
              <p className="text-xs text-admin-muted font-medium mt-0.5">
                Add coverage ceremonies and allocate crew roles per day.
              </p>
            </div>
            {!isConfirmed && (
              <button
                onClick={handleAddDay}
                className="bg-maroon/10 hover:bg-maroon hover:text-ink text-maroon font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all border border-maroon/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Event Day
              </button>
            )}
          </div>

          <div className="space-y-6">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="bg-white/[0.02] border border-admin-border p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1">
                      Ceremony Title (Day {dayIdx + 1})
                    </label>
                    <input
                      type="text"
                      disabled={isConfirmed}
                      value={day.title}
                      onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                      className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-2.5 px-3.5 font-bold text-sm outline-none placeholder-admin-muted/50 focus:border-maroon transition-colors"
                    />
                  </div>
                  {days.length > 1 && !isConfirmed && (
                    <button
                      onClick={() => handleRemoveDay(dayIdx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-4 cursor-pointer"
                      title="Remove Day"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-maroon" /> Assigned Creative Crew
                    </span>
                    {!isConfirmed && (
                      <button
                        onClick={() => handleAddCrewItem(dayIdx)}
                        className="text-[11px] font-bold text-maroon hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Crew Role
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {day.items.map((item, itemIdx) => {
                      const selectedResource = resources.find((r) => r.id === item.resourceId);
                      const dailyRate = selectedResource?.pricePerDay || 0;
                      const subtotal = dailyRate * item.qty;

                      return (
                        <div
                          key={itemIdx}
                          className="bg-admin-surface border border-admin-border p-3 rounded-xl flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-[200px]">
                            <select
                              disabled={isConfirmed}
                              value={item.resourceId}
                              onChange={(e) => handleCrewItemChange(dayIdx, itemIdx, 'resourceId', e.target.value)}
                              className="w-full bg-white/5 border border-admin-border text-admin-text rounded-lg py-2 px-3 text-xs font-bold outline-none focus:border-maroon"
                            >
                              {resources.map((res) => (
                                <option key={res.id} value={res.id}>
                                  {res.name} (₹{formatMoney(res.pricePerDay)}/day)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 border border-admin-border rounded-lg p-1">
                              <button
                                type="button"
                                disabled={isConfirmed || item.qty <= 1}
                                onClick={() => handleCrewItemChange(dayIdx, itemIdx, 'qty', Math.max(1, item.qty - 1))}
                                className="w-6 h-6 bg-admin-surface hover:bg-white/10 rounded text-admin-text font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-admin-text px-1">{item.qty}</span>
                              <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => handleCrewItemChange(dayIdx, itemIdx, 'qty', item.qty + 1)}
                                className="w-6 h-6 bg-admin-surface hover:bg-white/10 rounded text-admin-text font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-black text-maroon min-w-[80px] text-right">
                              ₹{formatMoney(subtotal)}
                            </span>

                            {day.items.length > 1 && !isConfirmed && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCrewItem(dayIdx, itemIdx)}
                                className="text-admin-muted hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Physical Deliverables Add-ons */}
        <div className="bg-admin-surface rounded-3xl p-6 border border-admin-border space-y-4">
          <h3 className="font-serif text-base font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-maroon" /> Physical Deliverables & Fine Art Albums
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {addons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => !isConfirmed && handleToggleAddon(addon.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    isSelected
                      ? 'bg-maroon/10 border-maroon text-maroon'
                      : 'bg-white/5 border-admin-border text-admin-muted hover:border-admin-border/80 hover:bg-white/[0.07]'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isConfirmed}
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-maroon focus:ring-maroon accent-maroon mt-0.5 cursor-pointer"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-admin-text">{addon.name}</h5>
                    <p className="text-[11px] font-extrabold text-maroon mt-0.5">
                      +₹{formatMoney(addon.price)} <span className="text-[9px] font-normal text-admin-muted">({addon.type})</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Final Pricing Summary */}
        <div className="bg-admin-surface rounded-3xl p-6 border border-admin-border space-y-4">
          <h3 className="font-serif text-base font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-400" /> Quotation Price Summary
          </h3>

          <div className="bg-white/[0.02] border border-admin-border p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-admin-muted border-b border-admin-border pb-3">
              <span>Calculated Rate (Crew + Deliverables)</span>
              <span className="text-admin-text font-extrabold text-sm">₹{formatMoney(calcAutoPrice(days, selectedAddons))}/-</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Final Quotation Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-admin-muted font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  disabled={isConfirmed}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-admin-border text-admin-text font-black text-lg rounded-xl py-3 pl-8 pr-4 outline-none focus:border-maroon transition-colors"
                />
              </div>
              <p className="text-[11px] text-admin-muted font-medium mt-1">
                You can adjust this amount to apply custom discounts or special packages.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
