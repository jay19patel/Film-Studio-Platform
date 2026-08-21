'use client';

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { CalendarDays, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Resource } from '@/lib/db';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null); // resource ID being edited
  const [formData, setFormData] = useState({
    name: '',
    pricePerDay: '',
    unit: 'per day',
    icon: 'Camera',
  });

  const availableIcons = ['Camera', 'Video', 'Film', 'Aperture', 'Sparkles', 'Users'];

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
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
    setFormData({ name: '', pricePerDay: '', unit: 'per day', icon: 'Camera' });
    setIsEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.pricePerDay) {
      setError('Please fill in Name and Day Rate price.');
      return;
    }

    const payload = {
      ...formData,
      pricePerDay: Number(formData.pricePerDay),
    };

    try {
      let response;
      if (isEditing) {
        // Edit mode (PUT)
        response = await fetch('/api/resources', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: isEditing, ...payload }),
        });
      } else {
        // Add mode (POST)
        response = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save resource');
      }

      showSuccess(isEditing ? 'Resource updated successfully!' : 'Resource added successfully!');
      resetForm();
      fetchResources();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving.');
    }
  };

  const handleEditClick = (res: Resource) => {
    setIsEditing(res.id);
    setFormData({
      name: res.name,
      pricePerDay: String(res.pricePerDay),
      unit: res.unit,
      icon: res.icon,
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource role? This will affect packages utilizing this resource.')) return;
    setError('');

    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete resource');
      }

      showSuccess('Resource role deleted successfully!');
      fetchResources();
    } catch (err: any) {
      setError(err.message || 'Error occurred while deleting.');
    }
  };

  const renderResourceIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName] || Icons.Camera;
    return <IconComp className="h-5 w-5 text-maroon" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-black text-admin-text flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-maroon" />
          Crew Resources Rates Management
        </h2>
        <p className="text-admin-muted text-xs mt-1 max-w-xl">
          Create, edit, or delete photographer and videographer roles along with their daily rates.
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
            {isEditing ? 'Edit Resource' : 'Add New Resource'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Resource Role Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Traditional Videographer"
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Price (Day Rate in ₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                required
                placeholder="e.g. 10000"
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Pricing Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-admin-text"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                Display Icon
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-admin-border focus:bg-white/[0.07] focus:border-maroon rounded-xl px-3 py-2.5 text-sm font-semibold text-admin-text outline-none"
              >
                {availableIcons.map((ic) => (
                  <option key={ic} value={ic} className="bg-admin-surface">
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-grow bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Role' : 'Add Role'}
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

        {/* Resources Table Column */}
        <div className="lg:col-span-8 bg-admin-surface border border-admin-border rounded-3xl p-6">
          <h3 className="font-serif text-lg font-bold text-admin-text mb-4">Active Resource Rates</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-admin-muted text-xs">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-admin-muted italic py-6 text-center">
              No resource roles configured. Set up your first photographer/videographer role.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-admin-border text-admin-muted text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Icon</th>
                    <th className="pb-3 font-semibold">Role Name</th>
                    <th className="pb-3 font-semibold">Daily Rate Price</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="bg-maroon/10 p-2 rounded-xl border border-maroon/20 inline-block">
                          {renderResourceIcon(res.icon)}
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 font-bold text-admin-text">{res.name}</td>
                      <td className="py-3.5 pr-2 text-admin-muted font-bold">
                        ₹{formatPrice(res.pricePerDay)} <span className="text-[10px] text-admin-muted/70 font-semibold font-sans">/ {res.unit}</span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(res)}
                          className="text-admin-muted hover:text-maroon p-1.5 hover:bg-maroon/10 rounded-lg transition-all"
                          title="Edit role"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(res.id)}
                          className="text-admin-muted hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete role"
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
