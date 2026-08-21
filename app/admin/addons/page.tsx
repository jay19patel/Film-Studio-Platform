'use client';

import { useState, useEffect } from 'react';
import { Gem, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Addon } from '@/lib/db';

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'one-time',
  });

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/addons');
      if (!res.ok) throw new Error('Failed to load addons');
      const data = await res.json();
      setAddons(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching addons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', type: 'one-time' });
    setIsEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('Please fill in Name and Price.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      let response;
      if (isEditing) {
        // Edit mode (PUT)
        response = await fetch('/api/addons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: isEditing, ...payload }),
        });
      } else {
        // Add mode (POST)
        response = await fetch('/api/addons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save addon');
      }

      showSuccess(isEditing ? 'Add-on updated successfully!' : 'Add-on added successfully!');
      resetForm();
      fetchAddons();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving.');
    }
  };

  const handleEditClick = (addon: Addon) => {
    setIsEditing(addon.id);
    setFormData({
      name: addon.name,
      price: String(addon.price),
      type: addon.type,
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on item? This will remove it from packages containing this item.')) return;
    setError('');

    try {
      const response = await fetch(`/api/addons?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete addon');
      }

      showSuccess('Add-on deleted successfully!');
      fetchAddons();
    } catch (err: any) {
      setError(err.message || 'Error occurred while deleting.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-black text-admin-text flex items-center gap-2">
          <Gem className="h-6 w-6 text-maroon" />
          Physical Add-ons Deliverables Management
        </h2>
        <p className="text-admin-muted text-xs mt-1 max-w-xl">
          Create, edit, or delete studio physical deliverables (albums, video films, highlights, reels, pendrive data) along with their one-time pricing.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-2xl font-semibold animate-pulse">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-admin-surface border border-admin-border rounded-3xl p-6">
          <h3 className="font-serif text-lg font-bold text-admin-text mb-4 flex items-center gap-2">
            {isEditing ? <Edit2 className="h-4.5 w-4.5 text-maroon" /> : <Plus className="h-5 w-5 text-maroon" />}
            {isEditing ? 'Edit Add-on' : 'Add New Add-on'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Add-on Deliverable Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Cinematic Wedding Film 4K"
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                One-time Price (in ₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="e.g. 15000"
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Billing Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-grow bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Item' : 'Add Item'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/5 hover:bg-white/10 border border-admin-border text-admin-muted font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Addons List Column */}
        <div className="lg:col-span-8 bg-admin-surface border border-admin-border rounded-3xl p-6">
          <h3 className="font-serif text-lg font-bold text-admin-text mb-4">Active Deliverables Pricing</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-admin-muted text-xs">Loading add-ons...</span>
            </div>
          ) : addons.length === 0 ? (
            <p className="text-sm text-admin-muted italic py-6 text-center">
              No add-on deliverables configured. Set up your first physical item.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-admin-border text-admin-muted text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Deliverable Name</th>
                    <th className="pb-3 font-semibold">One-time Price</th>
                    <th className="pb-3 font-semibold">Billing Type</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {addons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-admin-text">{addon.name}</td>
                      <td className="py-3.5 pr-2 text-admin-muted font-bold">₹{formatPrice(addon.price)}</td>
                      <td className="py-3.5 pr-2">
                        <span className="bg-white/5 text-admin-muted font-bold px-2 py-0.5 rounded-lg text-xs tracking-wider capitalize border border-admin-border">
                          {addon.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(addon)}
                          className="text-admin-muted hover:text-maroon p-1.5 hover:bg-maroon/10 rounded-lg transition-all"
                          title="Edit deliverable"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(addon.id)}
                          className="text-admin-muted hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete deliverable"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
