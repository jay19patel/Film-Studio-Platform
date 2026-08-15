'use client';

import { useState } from 'react';
import {
  Inbox,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { Inquiry, Resource, Addon } from '@/lib/db';

interface InquiriesClientProps {
  initialInquiries: Inquiry[];
  resources: Resource[];
  addonsList: Addon[];
}

export default function InquiriesClient({
  initialInquiries,
  resources,
  addonsList,
}: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      showSuccess('Inquiry status updated successfully!');
      
      // Update local state
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus as any } : inq))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const getResourceName = (resId: string) => {
    const res = resources.find((r) => r.id === resId);
    return res ? res.name : 'Crew Role';
  };

  const getAddonName = (addonId: string) => {
    const addon = addonsList.find((a) => a.id === addonId);
    return addon ? addon.name : 'Deliverable';
  };

  return (
    <div className="space-y-6">
      
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-4 rounded-2xl font-semibold">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Inquiries Found</h3>
          <p className="text-gray-500 text-sm">When clients browse predefined packages or design custom builds, leads will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            const formattedDate = new Date(inq.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={inq.id}
                className={`bg-white border rounded-3xl p-6 transition-all duration-200 shadow-xs ${
                  inq.status === 'new'
                    ? 'border-amber-300 ring-2 ring-amber-100/50'
                    : 'border-gray-150'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Client name & package */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-gray-900">{inq.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                        inq.type === 'custom'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {inq.type === 'custom' ? 'Custom Build' : 'Predefined'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
                      Inquired For:{' '}
                      <span className="text-amber-600 font-bold">{inq.packageName}</span>
                    </p>
                  </div>

                  {/* Status Dropdown and Timestamp */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                    
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                        inq.status === 'new'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 focus:border-amber-400'
                          : inq.status === 'contacted'
                          ? 'bg-blue-50 text-blue-800 border-blue-200 focus:border-blue-400'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 focus:border-emerald-400'
                      }`}
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Contact grid info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-50 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${inq.email}`} className="hover:text-amber-500 font-semibold truncate">
                      {inq.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${inq.phone}`} className="hover:text-amber-500 font-semibold">
                      {inq.phone}
                    </a>
                  </div>
                  {inq.address && (
                    <div className="flex items-center gap-2 col-span-1 sm:col-span-2 md:col-span-1">
                      <MapPin className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{inq.address}</span>
                    </div>
                  )}
                </div>

                {/* Collapsible Custom Package details */}
                {inq.type === 'custom' && inq.customDetails && (
                  <div className="mt-5">
                    <button
                      onClick={() => toggleExpand(inq.id)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="h-4 w-4" /> Hide Custom Quote Configuration
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" /> View Custom Quote Configuration
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 bg-gray-50 border border-gray-150 rounded-2xl p-5 md:p-6 space-y-5 animate-slideDown">
                        <h5 className="font-serif text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
                          Custom Investment: ₹{formatPrice(inq.customDetails.totalPrice)}/-
                        </h5>

                        {/* Days Breakdown */}
                        <div className="space-y-4">
                          <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Events Schedule & Resources
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inq.customDetails.days.map((day, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-gray-200 p-4 rounded-xl space-y-2.5"
                              >
                                <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                                  {day.title}
                                </span>
                                <ul className="space-y-1">
                                  {day.items.map((item, itemIdx) => (
                                    <li
                                      key={itemIdx}
                                      className="text-xs text-gray-600 flex justify-between font-medium"
                                    >
                                      <span>{getResourceName(item.resourceId)}</span>
                                      <span className="font-bold text-gray-950">Qty: {item.qty}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Addons List */}
                        {inq.customDetails.addons.length > 0 && (
                          <div className="space-y-2.5 border-t border-gray-200 pt-4">
                            <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 text-gray-400" />
                              Physical Deliverables Selected
                            </h6>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 list-disc text-xs text-gray-700 font-semibold">
                              {inq.customDetails.addons.map((addonId) => (
                                <li key={addonId}>{getAddonName(addonId)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
