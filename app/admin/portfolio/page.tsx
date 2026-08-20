'use client';

import { useState, useEffect } from 'react';
import { Video, Plus, Trash, Edit, RefreshCw, Play, Image as ImageIcon } from 'lucide-react';
import { PortfolioItem } from '@/lib/db';

export default function AdminPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<PortfolioItem>>({
    title: '',
    type: 'video',
    url: '',
    thumbnail: '',
    description: ''
  });

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        // Update
        await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentItem),
        });
      } else {
        // Create
        await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentItem),
        });
      }
      setIsEditing(false);
      setCurrentItem({ title: '', type: 'video', url: '', thumbnail: '', description: '' });
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Portfolio Showcase</h1>
          <p className="text-sm text-gray-500">Manage wedding films, YouTube trailers, and photo galleries.</p>
        </div>
        <button
          onClick={() => {
            setCurrentItem({ title: '', type: 'video', url: '', thumbnail: '', description: '' });
            setIsEditing(true);
          }}
          className="bg-maroon-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-maroon-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">{currentItem.id ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
              <input
                required
                type="text"
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                placeholder="e.g. Royal Udaipur Wedding Trailer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Media Type</label>
              <select
                value={currentItem.type || 'video'}
                onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
              >
                <option value="youtube">YouTube Video</option>
                <option value="video">Direct Video URL</option>
                <option value="photo">Photo / Gallery Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content URL</label>
              <input
                required
                type="url"
                value={currentItem.url || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Thumbnail URL (Optional)</label>
              <input
                type="url"
                value={currentItem.thumbnail || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, thumbnail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                placeholder="Cover image URL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Optional)</label>
              <textarea
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-maroon-500 text-sm"
                rows={2}
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
              Save Item
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
          {portfolio.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-44 bg-gray-100 relative group">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.type === 'youtube' && <Play className="h-10 w-10 text-gray-400" />}
                    {item.type === 'video' && <Video className="h-10 w-10 text-gray-400" />}
                    {item.type === 'photo' && <ImageIcon className="h-10 w-10 text-gray-400" />}
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-gray-200">
                  {item.type === 'youtube' && <Play className="h-4 w-4 text-red-500" />}
                  {item.type === 'video' && <Video className="h-4 w-4 text-blue-500" />}
                  {item.type === 'photo' && <ImageIcon className="h-4 w-4 text-emerald-500" />}
                </div>

                {/* View Link Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                    Preview Media
                  </a>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                  {item.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => {
                      setCurrentItem(item);
                      setIsEditing(true);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {portfolio.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-500">No portfolio items added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
