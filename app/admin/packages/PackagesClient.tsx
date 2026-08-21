'use client';

import { useState } from 'react';
import {
  Plus,
  Trash,
  Edit2,
  Trash2,
  Save,
  X,
  Package,
  Calendar,
  Users,
  Image as ImageIcon,
  Upload,
  Eye,
  CheckCircle2,
  Lock,
  Globe,
} from 'lucide-react';
import { Package as DBPackage, Resource, Addon, PackageDay } from '@/lib/db';
import PackageView from '@/components/PackageView';

interface PackagesClientProps {
  initialPackages: DBPackage[];
  resources: Resource[];
  addonsList: Addon[];
}

export default function PackagesClient({
  initialPackages,
  resources,
  addonsList,
}: PackagesClientProps) {
  const [packages, setPackages] = useState<DBPackage[]>(initialPackages);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [previewPkg, setPreviewPkg] = useState<DBPackage | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [days, setDays] = useState<PackageDay[]>([
    {
      title: 'Day 1 - Ceremony',
      image: '',
      items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
    },
  ]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [finalPrice, setFinalPrice] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');

  // Success message helper
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Stepper/Pricing calculations
  const calculateAutoPrice = (currentDays: PackageDay[], currentAddons: string[]) => {
    let resourcesSum = 0;
    currentDays.forEach((day) => {
      day.items.forEach((item) => {
        const res = resources.find((r) => r.id === item.resourceId);
        if (res) {
          resourcesSum += res.pricePerDay * item.qty;
        }
      });
    });

    let addonsSum = 0;
    currentAddons.forEach((addonId) => {
      const addon = addonsList.find((a) => a.id === addonId);
      if (addon) {
        addonsSum += addon.price;
      }
    });

    return resourcesSum + addonsSum;
  };

  const autoPrice = calculateAutoPrice(days, selectedAddons);

  // Image Upload handler
  const handleImageUpload = async (dayIdx: number, file: File) => {
    setUploadingIdx(dayIdx);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image');
      }

      const data = await res.json();
      if (data.url) {
        setDays((prev) => {
          const updated = [...prev];
          updated[dayIdx].image = data.url;
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Try again.');
    } finally {
      setUploadingIdx(null);
    }
  };

  // CRUD actions
  const handleOpenCreate = () => {
    setName('');
    setDays([{
      title: 'Day 1 - Haldi Ceremony',
      image: '',
      items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
    }]);
    setSelectedAddons([]);
    setFinalPrice('');
    setStatus('draft');
    setIsEditingId(null);
    setIsFormOpen(true);
    setError('');
  };

  const handleOpenEdit = (pkg: DBPackage) => {
    setName(pkg.name);
    setDays(JSON.parse(JSON.stringify(pkg.days))); // deep copy
    setSelectedAddons(pkg.addons);
    setFinalPrice(String(pkg.finalPrice));
    setStatus(pkg.status);
    setIsEditingId(pkg.id);
    setIsFormOpen(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || days.length === 0) {
      setError('Package name and at least one day are required.');
      return;
    }

    // Validate days have resources
    for (let i = 0; i < days.length; i++) {
      if (days[i].items.length === 0) {
        setError(`Please assign at least one crew role to Day ${i + 1} (${days[i].title}).`);
        return;
      }
    }

    const payload = {
      name,
      days,
      addons: selectedAddons,
      autoPrice,
      finalPrice: finalPrice !== '' ? Number(finalPrice) : autoPrice,
      status,
    };

    try {
      let res;
      if (isEditingId) {
        res = await fetch('/api/packages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: isEditingId, ...payload }),
        });
      } else {
        res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save package');
      }

      showSuccess(isEditingId ? 'Package updated successfully!' : 'Package created successfully!');
      setIsFormOpen(false);
      
      // Refresh list
      const fetchRes = await fetch('/api/packages');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setPackages(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save package.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this predefined wedding package?')) return;
    setError('');

    try {
      const res = await fetch(`/api/packages?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete package');
      }

      showSuccess('Package deleted successfully!');
      
      // Refresh list
      const fetchRes = await fetch('/api/packages');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setPackages(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete package.');
    }
  };

  // Day builder steppers
  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      {
        title: `Day ${prev.length + 1} - Event Name`,
        image: '',
        items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
      },
    ]);
  };

  const handleRemoveDay = (idx: number) => {
    if (days.length === 1) return;
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
      updated[dayIdx].items = [...updated[dayIdx].items, { resourceId: resources[0]?.id || '', qty: 1 }];
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

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="space-y-6">
      
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-2xl font-semibold">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {!isFormOpen ? (
        /* List Predefined Packages Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-admin-text">Current Predefined Packages</h3>
            <button
              onClick={handleOpenCreate}
              className="bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl shadow-black/20 shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              Build Predefined Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-20 bg-admin-surface border border-admin-border rounded-3xl">
              <Package className="h-12 w-12 text-admin-muted/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-admin-text mb-1">No Packages Created Yet</h3>
              <p className="text-admin-muted text-sm mb-6">Create predefined packages so clients can view them on the website.</p>
              <button
                onClick={handleOpenCreate}
                className="bg-maroon text-ink font-semibold py-2 px-6 rounded-xl text-sm"
              >
                Create First Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-admin-surface rounded-3xl border border-admin-border shadow-black/20 shadow-sm hover:border-maroon/30 transition-all flex flex-col overflow-hidden relative"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    {pkg.status === 'published' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] uppercase flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="bg-white/5 text-admin-muted font-bold border border-admin-border px-2 py-0.5 rounded-md text-[10px] uppercase flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="h-44 bg-white/5 relative">
                    {pkg.days[0]?.image ? (
                      <img src={pkg.days[0].image} alt={pkg.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-maroon/20 to-maroon/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <h4 className="absolute bottom-4 left-4 font-serif text-lg font-bold text-white drop-shadow-sm">
                      {pkg.name}
                    </h4>
                  </div>

                  {/* Details summary */}
                  <div className="p-5 flex-grow space-y-4">
                    <div className="flex items-center justify-between text-xs text-admin-muted font-medium">
                      <span>{pkg.days.length} Days / Events</span>
                      <span className="font-bold text-admin-text bg-white/5 px-2 py-0.5 rounded-lg border border-admin-border">
                        {pkg.addons.length} Add-ons
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-admin-border pt-3">
                      <span className="text-xs text-admin-muted font-bold uppercase tracking-wider">Final Price:</span>
                      <span className="text-lg font-black text-admin-text">₹{formatPrice(pkg.finalPrice)}/-</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2 border-t border-admin-border pt-4 mt-2">
                      <button
                        onClick={() => setPreviewPkg(pkg)}
                        className="bg-white/5 hover:bg-white/10 text-admin-muted font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 border border-admin-border cursor-pointer"
                        title="Preview details layout"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="bg-maroon/10 hover:bg-maroon/20 text-maroon font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 border border-maroon/20 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 border border-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Form view: Create or Edit Predefined Package */
        <div className="bg-admin-surface border border-admin-border rounded-3xl p-6 md:p-8 shadow-black/20 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-admin-border mb-6">
            <h3 className="font-serif text-lg md:text-xl font-bold text-admin-text flex items-center gap-2">
              <Package className="h-5 w-5 text-maroon" />
              {isEditingId ? 'Edit Wedding Package' : 'Create Custom Wedding Package'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-admin-muted hover:text-admin-text p-1.5 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left columns - Package Details & Days */}
            <div className="lg:col-span-8 space-y-6">

              {/* Package name input */}
              <div>
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  Package Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Wedding Package (Basic)"
                  className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.02] focus:border-maroon rounded-xl px-4 py-3 text-sm md:text-base font-bold outline-none transition-all text-admin-text placeholder-admin-muted/50"
                />
              </div>

              {/* Day Events schedule list */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-admin-border pb-2">
                  <h4 className="font-serif text-base font-bold text-admin-text flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-maroon" />
                    Day Schedule Builder ({days.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="text-xs font-bold text-maroon hover:text-maroon-dark flex items-center gap-0.5"
                  >
                    <Plus className="h-4 w-4" /> Add Event Day
                  </button>
                </div>

                {days.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="border border-admin-border rounded-2xl p-5 md:p-6 bg-white/[0.02] relative"
                  >
                    {/* Remove day */}
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(dayIdx)}
                        className="absolute top-4 right-4 text-admin-muted hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}

                    {/* Day Title and Image Upload row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5 items-end">
                      <div className="md:col-span-8">
                        <label className="block text-[9px] font-bold text-maroon uppercase tracking-widest mb-1">
                          Day {dayIdx + 1} Event Title
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                          placeholder="e.g. Day 1 - Haldi Ceremony"
                          className="w-full bg-white/5 border border-admin-border focus:border-maroon rounded-xl px-3 py-2 text-xs md:text-sm font-semibold outline-none transition-all text-admin-text placeholder-admin-muted/50"
                        />
                      </div>

                      <div className="md:col-span-4 flex items-center gap-3">
                        <div className="flex-grow">
                          <label className="block text-[9px] font-bold text-admin-muted uppercase tracking-widest mb-1 flex items-center gap-0.5">
                            <ImageIcon className="h-3 w-3" /> Event Image
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              id={`file-day-${dayIdx}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(dayIdx, file);
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={`file-day-${dayIdx}`}
                              className="w-full bg-white/5 border border-admin-border hover:border-maroon rounded-xl px-3 py-2 text-xs font-semibold text-admin-muted flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              {uploadingIdx === dayIdx ? (
                                <div className="w-3.5 h-3.5 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </label>
                          </div>
                        </div>

                        {/* Image Thumbnail Preview */}
                        {day.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-admin-border bg-white/5 flex-shrink-0">
                            <img src={day.image} alt="day preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resources list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-admin-muted uppercase tracking-wider pb-1 border-b border-admin-border">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Crew Assignment
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddResourceToDay(dayIdx)}
                          className="text-[10px] text-maroon hover:text-maroon-dark flex items-center gap-0.5"
                        >
                          <Plus className="h-3 w-3" /> Add Crew
                        </button>
                      </div>

                      {day.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2 items-center">
                          <div className="flex-grow">
                            <select
                              value={item.resourceId}
                              onChange={(e) => handleResourceChange(dayIdx, itemIdx, e.target.value)}
                              className="w-full bg-white/5 border border-admin-border text-xs font-semibold text-admin-text rounded-xl px-3 py-1.5 outline-none"
                            >
                              {resources.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} (₹{formatPrice(r.pricePerDay)}/day)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center border border-admin-border bg-white/5 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dayIdx, itemIdx, -1)}
                              className="px-2.5 py-1 text-admin-muted hover:bg-white/10 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-admin-text min-w-[24px] text-center">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dayIdx, itemIdx, 1)}
                              className="px-2.5 py-1 text-admin-muted hover:bg-white/10 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveResourceFromDay(dayIdx, itemIdx)}
                            className="text-admin-muted hover:text-red-400 p-1"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Right column - Addons & Pricing details */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Addons Checklist */}
              <div className="border border-admin-border rounded-2xl p-5 md:p-6 bg-admin-surface">
                <h4 className="font-serif text-sm font-bold text-admin-text mb-3 flex items-center gap-1">
                  Deliverables Included
                </h4>
                <div className="space-y-2">
                  {addonsList.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none ${
                          isChecked ? 'border-maroon/30 bg-maroon/10 text-admin-text' : 'border-admin-border hover:border-admin-border text-admin-muted'
                        }`}
                      >
                        <input type="checkbox" checked={isChecked} readOnly className="mt-0.5 accent-maroon" />
                        <div className="flex-grow">
                          <p className="font-bold">{addon.name}</p>
                          <p className="text-[10px] text-admin-muted mt-0.5">+ ₹{formatPrice(addon.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing override panel */}
              <div className="border border-admin-border rounded-2xl p-5 md:p-6 bg-admin-surface space-y-4">
                <h4 className="font-serif text-sm font-bold text-admin-text">Quote Investment</h4>

                <div>
                  <span className="text-[9px] font-bold text-admin-muted uppercase tracking-widest block">Auto Calculated Sum:</span>
                  <span className="text-lg font-serif font-black text-admin-text">₹{formatPrice(autoPrice)}/-</span>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-admin-muted uppercase tracking-widest mb-1">
                    Final Price Override (₹)
                  </label>
                  <input
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder={`e.g. ${autoPrice - 5000}`}
                    className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.02] focus:border-maroon rounded-xl px-3 py-2 text-xs md:text-sm font-semibold outline-none transition-all text-admin-text placeholder-admin-muted/50"
                  />
                  <span className="text-[9px] text-admin-muted font-medium mt-1 block leading-relaxed">
                    Leave blank to use the auto-calculated sum.
                  </span>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-[9px] font-bold text-admin-muted uppercase tracking-widest mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white/5 border border-admin-border text-xs font-semibold text-admin-text rounded-xl px-3 py-2 outline-none focus:border-maroon"
                  >
                    <option value="draft">Draft (Hidden from public)</option>
                    <option value="published">Published (Visible on site)</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-admin-border flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs py-3 px-4 rounded-xl shadow-black/20 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save Package
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </div>

            </div>

          </form>
        </div>
      )}

      {/* Package Preview Modal dialog */}
      {previewPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPreviewPkg(null)} />
          <div className="bg-admin-surface rounded-3xl w-full max-w-4xl h-[85vh] relative z-10 overflow-hidden flex flex-col border border-admin-border shadow-2xl shadow-black/40">
            <div className="bg-admin-surface-soft text-admin-text px-6 py-4 flex items-center justify-between border-b border-admin-border flex-shrink-0">
              <span className="font-serif font-bold text-sm">Predefined Package Layout Preview</span>
              <button
                onClick={() => setPreviewPkg(null)}
                className="text-admin-muted hover:text-admin-text p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto bg-admin-bg">
              <PackageView
                name={previewPkg.name}
                days={previewPkg.days}
                addons={previewPkg.addons}
                autoPrice={previewPkg.autoPrice}
                finalPrice={previewPkg.finalPrice}
                resources={resources}
                addonsList={addonsList}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
