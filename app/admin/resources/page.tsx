'use client';

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Camera, CalendarDays, Plus, Edit2, Trash2, Save, X, HelpCircle } from 'lucide-react';
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
    return <IconComp className="h-5 w-5 text-amber-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-black text-gray-900 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-amber-500" />
          Crew Resources Rates Management
        </h2>
        <p className="text-gray-500 text-xs mt-1 max-w-xl">
          Create, edit, or delete photographer and videographer roles along with their daily rates.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-4 rounded-2xl font-semibold animate-pulse">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            {isEditing ? <Edit2 className="h-4.5 w-4.5 text-amber-500" /> : <Plus className="h-5 w-5 text-amber-500" />}
            {isEditing ? 'Edit Resource' : 'Add New Resource'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Resource Role Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Traditional Videographer"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-gray-700"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Price (Day Rate in ₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                required
                placeholder="e.g. 10000"
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-gray-700"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Pricing Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl px-3 py-2 text-sm outline-none transition-all font-semibold text-gray-700"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Display Icon
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none"
              >
                {availableIcons.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-grow bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Role' : 'Add Role'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-150 hover:bg-gray-200 text-gray-600 font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Resources Table Column */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Active Resource Rates</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-gray-400 text-xs">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-6 text-center">
              No resource roles configured. Set up your first photographer/videographer role.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Icon</th>
                    <th className="pb-3 font-semibold">Role Name</th>
                    <th className="pb-3 font-semibold">Daily Rate Price</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 inline-block">
                          {renderResourceIcon(res.icon)}
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 font-bold text-gray-800">{res.name}</td>
                      <td className="py-3.5 pr-2 text-gray-600 font-bold">
                        ₹{formatPrice(res.pricePerDay)} <span className="text-[10px] text-gray-400 font-semibold font-sans">/ {res.unit}</span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(res)}
                          className="text-gray-400 hover:text-amber-500 p-1.5 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit role"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(res.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
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
