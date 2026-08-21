'use client';

import { useState } from 'react';
import {
  Inbox,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  Filter,
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import { Inquiry, Resource, Addon } from '@/lib/db';
import toast from 'react-hot-toast';

interface InquiriesClientProps {
  initialInquiries: Inquiry[];
  resources: Resource[];
  addonsList: Addon[];
}

type StatusFilter = 'all' | 'new' | 'contacted' | 'completed';

export default function InquiriesClient({
  initialInquiries,
  resources,
  addonsList,
}: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Custom Modal States
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
  const [inquiryToConvert, setInquiryToConvert] = useState<Inquiry | null>(null);

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

      toast.success('Inquiry status updated successfully!');
      
      // Update local state
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus as any } : inq))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete inquiry');
      }

      toast.success('Inquiry deleted successfully!');
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      
      if (expandedId === id) setExpandedId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete inquiry.');
    } finally {
      setDeletingId(null);
      setInquiryToDelete(null);
    }
  };

  const handlePromoteToClient = async (inq: Inquiry) => {
    try {
      const calculatedAmount = inq.customDetails?.totalPrice || 0;

      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inq.name,
          email: inq.email,
          phone: inq.phone,
          address: inq.address || '',
          packageName: inq.packageName,
          status: 'onboarding',
          notes: inq.specialNotes || '',
          totalAmount: calculatedAmount,
          amountPaid: 0,
        })
      });

      if (!clientRes.ok) throw new Error('Failed to create client record');

      await handleStatusChange(inq.id, 'completed');
      
      toast.success(`${inq.name} has been converted to a Client!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to convert to client.');
    } finally {
      setInquiryToConvert(null);
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

  // Filter inquiries by status
  const filteredInquiries = statusFilter === 'all'
    ? inquiries
    : inquiries.filter((inq) => inq.status === statusFilter);

  // Count badges
  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    completed: inquiries.filter((i) => i.status === 'completed').length,
  };

  const filterTabs: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'All', value: 'all', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { label: 'New Leads', value: 'new', color: 'bg-maroon-50 text-maroon-800 border-maroon-200' },
    { label: 'Contacted', value: 'contacted', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { label: 'Completed', value: 'completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400 mr-1" />
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
              statusFilter === tab.value
                ? `${tab.color} ring-2 ring-offset-1 ring-maroon-300/30`
                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] font-bold opacity-60">
              ({statusCounts[tab.value]})
            </span>
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {statusFilter === 'all' ? 'No Inquiries Found' : `No ${statusFilter} inquiries`}
          </h3>
          <p className="text-gray-500 text-sm">
            {statusFilter === 'all'
              ? 'When clients browse predefined packages or design custom builds, leads will appear here.'
              : `There are no inquiries with "${statusFilter}" status right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            const isDeleting = deletingId === inq.id;
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
                    ? 'border-maroon-300 ring-2 ring-maroon-100/50'
                    : 'border-gray-150'
                } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Client name & package */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-gray-900">{inq.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                        inq.type === 'custom'
                          ? 'bg-maroon-50 text-maroon-800 border-maroon-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {inq.type === 'custom' ? 'Custom Build' : 'Predefined'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
                      Inquired For:{' '}
                      <span className="text-maroon-600 font-bold">{inq.packageName}</span>
                    </p>
                  </div>

                  {/* Status Dropdown, Delete, and Timestamp */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                    
                    {inq.status === 'completed' ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Converted
                      </span>
                    ) : (
                      <>
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                            inq.status === 'new'
                              ? 'bg-maroon-50 text-maroon-800 border-maroon-200 focus:border-maroon-400'
                              : 'bg-blue-50 text-blue-800 border-blue-200 focus:border-blue-400'
                          }`}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                        </select>

                        <button
                          onClick={() => setInquiryToConvert(inq)}
                          className="text-gray-400 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Convert to Client"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setInquiryToDelete(inq.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact grid info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-50 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${inq.email}`} className="hover:text-maroon-500 font-semibold truncate">
                      {inq.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${inq.phone}`} className="hover:text-maroon-500 font-semibold">
                      {inq.phone}
                    </a>
                  </div>
                  {inq.eventDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-maroon-700">
                        {new Date(inq.eventDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {inq.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{inq.address}</span>
                    </div>
                  )}
                </div>

                {/* Special Notes */}
                {inq.specialNotes && (
                  <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-2.5">
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Special Notes
                      </span>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">{inq.specialNotes}</p>
                    </div>
                  </div>
                )}

                {/* Collapsible Custom Package details */}
                {inq.type === 'custom' && inq.customDetails && (
                  <div className="mt-5">
                    <button
                      onClick={() => toggleExpand(inq.id)}
                      className="text-xs font-bold text-maroon-600 hover:text-maroon-700 flex items-center gap-1 transition-colors"
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
                                <span className="inline-block bg-maroon-50 border border-maroon-200 text-maroon-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
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

      {/* Custom Delete Modal */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Delete Inquiry?</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Are you sure you want to permanently delete this inquiry? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setInquiryToDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDelete(inquiryToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Convert Modal */}
      {inquiryToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Convert to Client?</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Are you ready to move <strong>{inquiryToConvert.name}</strong> from new leads to your permanent Client Hub?</p>
            <div className="flex gap-3">
              <button onClick={() => setInquiryToConvert(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handlePromoteToClient(inquiryToConvert)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
