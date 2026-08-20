'use client';

import { useState } from 'react';
import { Client, ClientEvent, Inquiry, Resource, Addon } from '@/lib/db';
import { Mail, Phone, MapPin, Calendar, Clock, Edit, Trash2, Plus, X, Briefcase, ArrowLeft, IndianRupee, CreditCard, Sparkles, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ClientDetailClientProps {
  initialClient: Client;
  inquiry: Inquiry | null;
  resources: Resource[];
  addons: Addon[];
}

export default function ClientDetailClient({ initialClient, inquiry, resources, addons }: ClientDetailClientProps) {
  const [client, setClient] = useState<Client>(initialClient);
  
  // Forms
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState<Partial<Client>>({});
  
  const [editingPayments, setEditingPayments] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{ amount: number, date: string, notes: string }>({
    amount: 0,
    date: new Date().toISOString().slice(0, 16),
    notes: '',
  });
  const [totalAmountForm, setTotalAmountForm] = useState<{ totalAmount: number }>({
    totalAmount: client.totalAmount || 0,
  });

  const [addingEvent, setAddingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<ClientEvent>>({ title: '', date: '', notes: '' });

  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Formatting helpers
  const formatMoney = (amount: number = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  
  // Computed values
  const computedAmountPaid = (client.paymentHistory || []).reduce((sum, tx) => sum + tx.amount, 0);
  const balance = (client.totalAmount || 0) - computedAmountPaid;
  const paymentPercentage = client.totalAmount ? Math.min(100, Math.round((computedAmountPaid / client.totalAmount) * 100)) : 0;

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding': return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Onboarding</span>;
      case 'shooting': return <span className="bg-maroon/10 text-maroon font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Shooting Phase</span>;
      case 'photo-editing': return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Photo Editing</span>;
      case 'video-editing': return <span className="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Video Editing</span>;
      case 'delivered': return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Delivered</span>;
      default: return null;
    }
  };

  const getResourceName = (resId: string) => resources.find(r => r.id === resId)?.name || 'Crew';
  const getAddonName = (addonId: string) => addons.find(a => a.id === addonId)?.name || 'Deliverable';

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, ...detailsForm }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditingDetails(false);
        toast.success('Client details updated.');
      } else { throw new Error(); }
    } catch (err) {
      toast.error('Failed to update client details.');
    }
  };

  const handleUpdatePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTransaction = paymentForm.amount > 0 ? {
        id: Date.now().toString(),
        amount: paymentForm.amount,
        date: paymentForm.date,
        notes: paymentForm.notes,
      } : null;

      const updatedHistory = newTransaction 
        ? [...(client.paymentHistory || []), newTransaction] 
        : (client.paymentHistory || []);

      const newComputedAmountPaid = updatedHistory.reduce((sum, tx) => sum + tx.amount, 0);

      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: client.id, 
          totalAmount: totalAmountForm.totalAmount,
          paymentHistory: updatedHistory,
          amountPaid: newComputedAmountPaid 
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditingPayments(false);
        setPaymentForm({ amount: 0, date: new Date().toISOString().slice(0, 16), notes: '' });
        toast.success('Payments updated.');
      } else { throw new Error(); }
    } catch (err) {
      toast.error('Failed to update payments.');
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    const updatedHistory = (client.paymentHistory || []).filter(tx => tx.id !== txId);
    const newComputedAmountPaid = updatedHistory.reduce((sum, tx) => sum + tx.amount, 0);
    
    try {
      await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: client.id, 
          paymentHistory: updatedHistory,
          amountPaid: newComputedAmountPaid
        }),
      });
      setClient({ ...client, paymentHistory: updatedHistory, amountPaid: newComputedAmountPaid });
      toast.success('Transaction removed.');
    } catch (err) {
      toast.error('Failed to remove transaction.');
    } finally {
      setTransactionToDelete(null);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, status: newStatus }),
      });
      if (res.ok) {
        setClient({ ...client, status: newStatus as any });
        toast.success('Status updated.');
      } else { throw new Error(); }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = { ...eventForm, id: Date.now().toString() } as ClientEvent;
    const updatedEvents = [...(client.events || []), newEvent];
    
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, events: updatedEvents }),
      });
      if (res.ok) {
        setClient({ ...client, events: updatedEvents });
        setAddingEvent(false);
        setEventForm({ title: '', date: '', notes: '' });
        toast.success('Event scheduled.');
      } else { throw new Error(); }
    } catch (err) {
      toast.error('Failed to add event.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = client.events.filter(e => e.id !== eventId);
    try {
      await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, events: updatedEvents }),
      });
      setClient({ ...client, events: updatedEvents });
      toast.success('Event removed.');
    } catch (err) {
      toast.error('Failed to remove event.');
    } finally {
      setEventToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn pb-12">
        
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <Link href="/admin/clients" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-maroon uppercase tracking-widest mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
          <h2 className="font-serif text-3xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
            {client.name}
          </h2>
          <p className="text-gray-500 text-sm font-bold tracking-wide mt-1">Package: <span className="text-maroon">{client.packageName}</span></p>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow Status</p>
          <select 
            value={client.status}
            onChange={handleStatusChange}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all cursor-pointer"
          >
            <option value="onboarding">Onboarding</option>
            <option value="shooting">Shooting Phase</option>
            <option value="photo-editing">Photo Editing</option>
            <option value="video-editing">Video Editing</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financials & Details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Financial Tracking Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <IndianRupee className="h-24 w-24" />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Info
              </h3>
              <button 
                onClick={() => { 
                  setTotalAmountForm({ totalAmount: client.totalAmount || 0 }); 
                  setPaymentForm({ amount: 0, date: new Date().toISOString().slice(0, 16), notes: '' });
                  setEditingPayments(true); 
                }}
                className="p-2 bg-gray-50 text-gray-600 hover:text-maroon hover:bg-maroon/5 rounded-xl transition-colors border border-gray-100"
                title="Manage Payments"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-sm font-black text-gray-900">{formatMoney(client.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                <span className="text-sm font-black text-emerald-600">{formatMoney(computedAmountPaid)}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</span>
                <span className={`text-lg font-black ${balance > 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatMoney(balance)}</span>
              </div>
              
              <div className="pt-3">
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <span>Progress</span>
                  <span>{paymentPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${paymentPercentage}%` }} />
                </div>
              </div>

              {/* Transaction Ledger */}
              {(client.paymentHistory && client.paymentHistory.length > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Transaction Ledger</h4>
                  <div className="space-y-3">
                    {client.paymentHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{formatMoney(tx.amount)}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                            <Clock className="h-3 w-3" />
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {tx.notes && <p className="text-[10px] font-medium text-gray-500 mt-1">{tx.notes}</p>}
                        </div>
                        <button 
                          onClick={() => setTransactionToDelete(tx.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 hover:border-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" /> Contact Details
              </h3>
              <button 
                onClick={() => { setDetailsForm(client); setEditingDetails(true); }}
                className="p-2 bg-gray-50 text-gray-600 hover:text-maroon hover:bg-maroon/5 rounded-xl transition-colors border border-gray-100"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${client.email}`} className="font-bold text-gray-700 hover:text-maroon">{client.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${client.phone}`} className="font-bold text-gray-700 hover:text-maroon">{client.phone}</a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="font-bold text-gray-600">{client.address}</span>
              </div>
            </div>
            {client.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Global Notes</p>
                <div className="bg-amber-50 border border-amber-100 text-amber-900 text-xs font-medium p-4 rounded-xl">
                  {client.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Events / Itinerary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-5 w-5 text-maroon" /> Event Itinerary
              </h3>
              <button 
                onClick={() => setAddingEvent(true)}
                className="bg-maroon hover:bg-maroon-dark text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>

            {(!client.events || client.events.length === 0) ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">No events scheduled yet.</p>
                <p className="text-xs font-medium text-gray-400 mt-1">Add dates for Pre-Wedding, Haldi, Wedding, etc.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {client.events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((evt) => (
                  <div key={evt.id} className="group bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:border-maroon/30 transition-all flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="bg-maroon/5 border border-maroon/10 rounded-xl p-3 text-center min-w-[70px] flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-black text-maroon leading-tight">{new Date(evt.date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm tracking-wide mb-1">{evt.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mb-2">
                          <Clock className="h-3 w-3" /> {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                        </div>
                        {evt.notes && <p className="text-xs font-medium text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{evt.notes}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => setEventToDelete(evt.id)}
                      className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                      title="Remove event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Original Inquiry Requirements (Read-only) */}
          {inquiry && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mt-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-gray-400" /> Original Requirements
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase ${
                    inquiry.type === 'custom'
                      ? 'bg-maroon-50 text-maroon-800 border-maroon-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {inquiry.type === 'custom' ? 'Custom Build' : 'Predefined Package'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{inquiry.packageName}</span>
                </div>

                {inquiry.type === 'custom' && inquiry.customDetails && (
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-5">
                    <h5 className="font-serif text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 flex justify-between">
                      <span>Custom Quote Baseline</span>
                      <span className="text-maroon">₹{formatMoney(inquiry.customDetails.totalPrice)}</span>
                    </h5>

                    <div className="space-y-4">
                      <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> Requested Coverage
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {inquiry.customDetails.days.map((day, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 p-3 rounded-xl">
                            <span className="inline-block bg-maroon-50 border border-maroon-200 text-maroon-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mb-2">
                              {day.title}
                            </span>
                            <ul className="space-y-1 text-xs text-gray-600 font-medium">
                              {day.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex justify-between">
                                  <span>{getResourceName(item.resourceId)}</span>
                                  <span className="font-bold text-gray-900">Qty: {item.qty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {inquiry.customDetails.addons.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <h6 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" /> Requested Deliverables
                        </h6>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 list-disc text-xs text-gray-700 font-semibold">
                          {inquiry.customDetails.addons.map(addonId => (
                            <li key={addonId}>{getAddonName(addonId)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {inquiry.specialNotes && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-900 text-xs font-medium p-4 rounded-xl">
                    <strong className="block text-[10px] uppercase tracking-widest mb-1 text-blue-500">Initial Notes</strong>
                    {inquiry.specialNotes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
      </div>
      {/* MODALS */}

      {/* Edit Details Modal */}
      {editingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button onClick={() => setEditingDetails(false)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2"><Edit className="h-5 w-5 text-maroon" /> Edit Client</h3>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Name</label>
                <input type="text" required value={detailsForm.name || ''} onChange={e => setDetailsForm({...detailsForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                <input type="email" required value={detailsForm.email || ''} onChange={e => setDetailsForm({...detailsForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone</label>
                <input type="tel" required value={detailsForm.phone || ''} onChange={e => setDetailsForm({...detailsForm, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Address</label>
                <input type="text" required value={detailsForm.address || ''} onChange={e => setDetailsForm({...detailsForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Global Notes (Optional)</label>
                <textarea rows={3} value={detailsForm.notes || ''} onChange={e => setDetailsForm({...detailsForm, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <button type="submit" className="w-full bg-maroon hover:bg-maroon-dark text-white font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm shadow-sm">Save Details</button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Payments Modal */}
      {editingPayments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingPayments(false)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-500" /> Manage Payments</h3>
            
            <form onSubmit={handleUpdatePayments} className="space-y-6">
              {/* Top: Edit Total Amount */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total Package Amount (₹)</label>
                <input type="number" required value={totalAmountForm.totalAmount} onChange={e => setTotalAmountForm({ totalAmount: Number(e.target.value) })} className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" />
              </div>

              {/* Bottom: Log New Transaction */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-4">
                <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200 pb-2">Log New Transaction</h4>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Amount Received (₹)</label>
                  <input type="number" value={paymentForm.amount || ''} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full bg-white border border-emerald-200 text-emerald-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-500 transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Date & Time</label>
                  <input type="datetime-local" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full bg-white border border-emerald-200 text-emerald-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                  <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="e.g. Bank Transfer, Cash" className="w-full bg-white border border-emerald-200 text-emerald-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm shadow-sm">Save & Update Ledger</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {addingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative">
            <button onClick={() => setAddingEvent(false)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2"><Calendar className="h-5 w-5 text-maroon" /> Schedule Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Event Title</label>
                <input type="text" required placeholder="e.g. Pre-Wedding Shoot" value={eventForm.title || ''} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Event Date</label>
                <input type="date" required value={eventForm.date || ''} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Notes (Locations, Time, etc)</label>
                <textarea rows={3} value={eventForm.notes || ''} onChange={e => setEventForm({...eventForm, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <button type="submit" className="w-full bg-maroon hover:bg-maroon-dark text-white font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm shadow-sm">Add Event</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Remove Event?</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Are you sure you want to remove this scheduled event from the itinerary?</p>
            <div className="flex gap-3">
              <button onClick={() => setEventToDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDeleteEvent(eventToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Delete Transaction?</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Are you sure you want to delete this payment record? The total amount paid will be recalculated automatically.</p>
            <div className="flex gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDeleteTransaction(transactionToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
