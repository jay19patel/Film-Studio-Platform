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
  UserPlus,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Inquiry, Resource, Addon } from '@/lib/db';
import toast from 'react-hot-toast';

interface InquiriesClientProps {
  initialInquiries: Inquiry[];
  resources: Resource[];
  addonsList: Addon[];
}

const COLUMNS: { key: 'new' | 'contacted' | 'completed'; label: string; badgeClass: string }[] = [
  { key: 'new', label: 'New Leads', badgeClass: 'badge-new' },
  { key: 'contacted', label: 'Contacted', badgeClass: 'badge-contacted' },
  { key: 'completed', label: 'Completed', badgeClass: 'badge-completed' },
];

export default function InquiriesClient({
  initialInquiries,
  resources,
  addonsList,
}: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Custom Modal States
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
  const [inquiryToConvert, setInquiryToConvert] = useState<Inquiry | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
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
          customDetails: inq.customDetails || null,
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

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((col) => {
          const columnInquiries = inquiries.filter((inq) => inq.status === col.key);
          return (
            <div key={col.key} className="bg-white/[0.02] border border-admin-border rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className={`badge-status ${col.badgeClass}`}>{col.label}</span>
                <span className="text-admin-muted text-xs font-bold">{columnInquiries.length}</span>
              </div>

              {columnInquiries.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-admin-border rounded-xl">
                  <Inbox className="h-8 w-8 text-admin-muted/40 mx-auto mb-2" />
                  <p className="text-admin-muted text-xs font-semibold">No leads here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {columnInquiries.map((inq) => {
                    const isExpanded = expandedId === inq.id;
                    const isDeleting = deletingId === inq.id;
                    const formattedDate = new Date(inq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={inq.id}
                        className={`bg-admin-surface border border-admin-border rounded-xl p-4 transition-all hover:border-maroon/30 ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-serif text-sm font-bold text-admin-text leading-snug">{inq.name}</h4>
                          <button
                            onClick={() => setInquiryToDelete(inq.id)}
                            className="text-admin-muted hover:text-red-400 p-1 rounded-lg transition-all flex-shrink-0"
                            title="Delete inquiry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                            inq.type === 'custom' ? 'bg-maroon/10 text-maroon border border-maroon/20' : 'bg-white/5 text-admin-muted border border-admin-border'
                          }`}>
                            {inq.type === 'custom' ? 'Custom Build' : 'Predefined'}
                          </span>
                          <span className="text-[10px] text-admin-muted">{formattedDate}</span>
                        </div>

                        <p className="text-[11px] text-admin-muted mb-3 truncate">
                          For: <span className="text-maroon font-semibold">{inq.packageName}</span>
                        </p>

                        <div className="space-y-1.5 text-xs text-admin-muted mb-3">
                          <a href={`mailto:${inq.email}`} className="flex items-center gap-1.5 hover:text-maroon transition-colors truncate">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{inq.email}</span>
                          </a>
                          <a href={`tel:${inq.phone}`} className="flex items-center gap-1.5 hover:text-maroon transition-colors">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            {inq.phone}
                          </a>
                          {inq.eventDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              {new Date(inq.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {inq.address && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{inq.address}</span>
                            </div>
                          )}
                        </div>

                        {inq.specialNotes && (
                          <div className="bg-white/5 border border-admin-border rounded-lg p-2.5 mb-3 flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-admin-muted flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-admin-muted leading-relaxed">{inq.specialNotes}</p>
                          </div>
                        )}

                        {inq.type === 'custom' && inq.customDetails && (
                          <div className="mb-3">
                            <button
                              onClick={() => toggleExpand(inq.id)}
                              className="text-[11px] font-bold text-maroon hover:text-maroon-dark flex items-center gap-1 transition-colors"
                            >
                              {isExpanded ? (
                                <><EyeOff className="h-3.5 w-3.5" /> Hide Quote</>
                              ) : (
                                <><Eye className="h-3.5 w-3.5" /> View Quote (₹{formatPrice(inq.customDetails.totalPrice)})</>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 bg-white/5 border border-admin-border rounded-xl p-3.5 space-y-3 animate-slideDown">
                                <div className="space-y-2">
                                  <h6 className="text-[10px] font-bold text-admin-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Schedule &amp; Resources
                                  </h6>
                                  {inq.customDetails.days.map((day, idx) => (
                                    <div key={idx} className="bg-admin-surface border border-admin-border p-3 rounded-lg space-y-1.5">
                                      <span className="inline-block bg-maroon/10 border border-maroon/20 text-maroon text-[9px] uppercase font-bold px-2 py-0.5 rounded-md">
                                        {day.title}
                                      </span>
                                      <ul className="space-y-1">
                                        {day.items.map((item, itemIdx) => (
                                          <li key={itemIdx} className="text-[11px] text-admin-muted flex justify-between font-medium">
                                            <span>{getResourceName(item.resourceId)}</span>
                                            <span className="font-bold text-admin-text">Qty: {item.qty}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>

                                {inq.customDetails.addons.length > 0 && (
                                  <div className="space-y-1.5 border-t border-admin-border pt-3">
                                    <h6 className="text-[10px] font-bold text-admin-muted uppercase tracking-widest flex items-center gap-1.5">
                                      <Sparkles className="h-3.5 w-3.5" /> Deliverables Selected
                                    </h6>
                                    <ul className="grid grid-cols-1 gap-1 pl-4 list-disc text-[11px] text-admin-muted font-medium">
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

                        {/* Column-specific actions */}
                        {col.key === 'new' && (
                          <button
                            onClick={() => handleStatusChange(inq.id, 'contacted')}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-maroon/10 border border-admin-border hover:border-maroon/30 text-admin-text py-2 rounded-lg transition-all"
                          >
                            Mark Contacted <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {col.key === 'contacted' && (
                          <button
                            onClick={() => setInquiryToConvert(inq)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-2 rounded-lg transition-all"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Convert to Client
                          </button>
                        )}
                        {col.key === 'completed' && (
                          <span className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 py-2">
                            <CheckCircle className="h-3.5 w-3.5" /> Converted
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Delete Modal */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface border border-admin-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">Delete Inquiry?</h3>
            <p className="text-xs font-medium text-admin-muted mb-6">Are you sure you want to permanently delete this inquiry? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setInquiryToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDelete(inquiryToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Convert Modal */}
      {inquiryToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface border border-admin-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">Convert to Client?</h3>
            <p className="text-xs font-medium text-admin-muted mb-6">Are you ready to move <strong className="text-admin-text">{inquiryToConvert.name}</strong> from new leads to your permanent Client Hub?</p>
            <div className="flex gap-3">
              <button onClick={() => setInquiryToConvert(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handlePromoteToClient(inquiryToConvert)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
