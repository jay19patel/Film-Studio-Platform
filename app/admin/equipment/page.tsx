'use client';

import { useState, useEffect } from 'react';
import { Camera, Plus, Trash, Edit, RefreshCw } from 'lucide-react';
import { Equipment } from '@/lib/db';

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentEq, setCurrentEq] = useState<Partial<Equipment>>({
    name: '',
    category: 'camera',
    description: '',
    image: ''
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEq.id) {
        // Update
        await fetch('/api/equipment', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentEq),
        });
      } else {
        // Create
        await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentEq),
        });
      }
      setIsEditing(false);
      setCurrentEq({ name: '', category: 'camera', description: '', image: '' });
      fetchEquipment();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gear?')) return;
    try {
      await fetch(`/api/equipment?id=${id}`, { method: 'DELETE' });
      fetchEquipment();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Equipment Gear</h1>
          <p className="text-sm text-gray-500">Manage cameras, lenses, drones, and lighting to showcase your studio's arsenal.</p>
        </div>
        <button
          onClick={() => {
            setCurrentEq({ name: '', category: 'camera', description: '', image: '' });
            setIsEditing(true);
          }}
          className="bg-maroon-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-maroon-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Gear
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">{currentEq.id ? 'Edit Equipment' : 'Add New Equipment'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <input
                required
                type="text"
                value={currentEq.name || ''}
                onChange={(e) => setCurrentEq({ ...currentEq, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                placeholder="e.g. Sony A7S III"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <select
                value={currentEq.category || 'camera'}
                onChange={(e) => setCurrentEq({ ...currentEq, category: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
              >
                <option value="camera">Camera</option>
                <option value="lens">Lens</option>
                <option value="drone">Drone</option>
                <option value="lighting">Lighting</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Optional)</label>
              <textarea
                value={currentEq.description || ''}
                onChange={(e) => setCurrentEq({ ...currentEq, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                rows={2}
                placeholder="Brief description of the gear and its use."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={currentEq.image || ''}
                onChange={(e) => setCurrentEq({ ...currentEq, image: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              Save Equipment
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-maroon-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((eq) => (
            <div key={eq.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                {eq.image ? (
                  <img src={eq.image} alt={eq.name} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-10 w-10 text-gray-300" />
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase rounded-md text-maroon-600 shadow-sm border border-gray-200">
                  {eq.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1">{eq.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                  {eq.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => {
                      setCurrentEq(eq);
                      setIsEditing(true);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(eq.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {equipment.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-500">No equipment added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
