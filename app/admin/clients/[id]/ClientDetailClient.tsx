'use client';

import { useState, useRef } from 'react';
import { Client, ClientEvent, Inquiry, Resource, Addon, PackageDay } from '@/lib/db';
import { Mail, Phone, MapPin, Calendar, Clock, Edit, Trash2, Plus, X, Briefcase, ArrowLeft, IndianRupee, CreditCard, Sparkles, FileText, CheckCircle, FileDown, Share2, Link2, Lock, ExternalLink, Send, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { captureHtml2Canvas } from '@/lib/pdfHelper';
import PdfProposalTemplate from '@/components/PdfProposalTemplate';

interface ClientDetailClientProps {
  initialClient: Client;
  inquiry: Inquiry | null;
  resources: Resource[];
  addons: Addon[];
}

export default function ClientDetailClient({ initialClient, inquiry, resources, addons }: ClientDetailClientProps) {
  const [client, setClient] = useState<Client>(initialClient);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  
  const effectiveCustomDetails = client.customDetails || inquiry?.customDetails;

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

  const [editingQuotation, setEditingQuotation] = useState(false);
  const [quotationForm, setQuotationForm] = useState<{
    packageName: string;
    totalAmount: number;
    days: PackageDay[];
    addons: string[];
  }>({
    packageName: client.packageName || 'My Custom Wedding Package',
    totalAmount: client.totalAmount || 0,
    days: [],
    addons: [],
  });

  const calcAutoPrice = (daysList: PackageDay[], addonsList: string[]) => {
    const daysTotal = daysList.reduce((total, day) => {
      const dayTotal = day.items.reduce((sum, item) => {
        const res = resources.find((r) => r.id === item.resourceId);
        return sum + (res ? res.pricePerDay * item.qty : 0);
      }, 0);
      return total + dayTotal;
    }, 0);

    const addonsTotal = addonsList.reduce((sum, addonId) => {
      const add = addons.find((a) => a.id === addonId);
      return sum + (add ? add.price : 0);
    }, 0);

    return daysTotal + addonsTotal;
  };

  const openQuotationModal = () => {
    const defaultDays: PackageDay[] = effectiveCustomDetails?.days?.length
      ? JSON.parse(JSON.stringify(effectiveCustomDetails.days))
      : [
          {
            title: 'Day 1 - Main Wedding Ceremony',
            image: '',
            items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
          },
        ];
    const defaultAddons = effectiveCustomDetails?.addons ? [...effectiveCustomDetails.addons] : [];
    const defaultPrice = client.totalAmount || effectiveCustomDetails?.totalPrice || calcAutoPrice(defaultDays, defaultAddons);

    setQuotationForm({
      packageName: client.packageName || 'My Custom Wedding Package',
      totalAmount: defaultPrice,
      days: defaultDays,
      addons: defaultAddons,
    });
    setEditingQuotation(true);
  };

  const handleAddDay = () => {
    const newDay: PackageDay = {
      title: `Day ${quotationForm.days.length + 1} - Celebrations`,
      image: '',
      items: [{ resourceId: resources[0]?.id || '', qty: 1 }],
    };
    const updatedDays = [...quotationForm.days, newDay];
    const autoPrice = calcAutoPrice(updatedDays, quotationForm.addons);
    setQuotationForm({
      ...quotationForm,
      days: updatedDays,
      totalAmount: autoPrice,
    });
  };

  const handleRemoveDay = (dayIdx: number) => {
    const updatedDays = quotationForm.days.filter((_, idx) => idx !== dayIdx);
    const autoPrice = calcAutoPrice(updatedDays, quotationForm.addons);
    setQuotationForm({
      ...quotationForm,
      days: updatedDays,
      totalAmount: autoPrice,
    });
  };

  const handleDayTitleChange = (dayIdx: number, title: string) => {
    const updatedDays = [...quotationForm.days];
    updatedDays[dayIdx].title = title;
    setQuotationForm({ ...quotationForm, days: updatedDays });
  };

  const handleAddCrewItem = (dayIdx: number) => {
    const updatedDays = [...quotationForm.days];
    updatedDays[dayIdx].items.push({ resourceId: resources[0]?.id || '', qty: 1 });
    const autoPrice = calcAutoPrice(updatedDays, quotationForm.addons);
    setQuotationForm({
      ...quotationForm,
      days: updatedDays,
      totalAmount: autoPrice,
    });
  };

  const handleRemoveCrewItem = (dayIdx: number, itemIdx: number) => {
    const updatedDays = [...quotationForm.days];
    updatedDays[dayIdx].items = updatedDays[dayIdx].items.filter((_, idx) => idx !== itemIdx);
    const autoPrice = calcAutoPrice(updatedDays, quotationForm.addons);
    setQuotationForm({
      ...quotationForm,
      days: updatedDays,
      totalAmount: autoPrice,
    });
  };

  const handleCrewItemChange = (dayIdx: number, itemIdx: number, field: 'resourceId' | 'qty', val: any) => {
    const updatedDays = [...quotationForm.days];
    updatedDays[dayIdx].items[itemIdx] = {
      ...updatedDays[dayIdx].items[itemIdx],
      [field]: val,
    };
    const autoPrice = calcAutoPrice(updatedDays, quotationForm.addons);
    setQuotationForm({
      ...quotationForm,
      days: updatedDays,
      totalAmount: autoPrice,
    });
  };

  const handleToggleAddon = (addonId: string) => {
    const exists = quotationForm.addons.includes(addonId);
    const updatedAddons = exists
      ? quotationForm.addons.filter((id) => id !== addonId)
      : [...quotationForm.addons, addonId];
    const autoPrice = calcAutoPrice(quotationForm.days, updatedAddons);
    setQuotationForm({
      ...quotationForm,
      addons: updatedAddons,
      totalAmount: autoPrice,
    });
  };

  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const autoPrice = calcAutoPrice(quotationForm.days, quotationForm.addons);
      const customDetailsObj = {
        days: quotationForm.days,
        addons: quotationForm.addons,
        autoPrice: autoPrice,
        totalPrice: Number(quotationForm.totalAmount),
      };

      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          packageName: quotationForm.packageName,
          totalAmount: Number(quotationForm.totalAmount),
          customDetails: customDetailsObj,
          proposalStatus: 'pending',
        }),
      });

      if (!res.ok) throw new Error('Failed to update quotation');

      const updated = await res.json();
      setClient(updated);
      setEditingQuotation(false);
      toast.success('Proposal Quotation updated! Status set to Pending Review.');
    } catch (err) {
      toast.error('Failed to update proposal quotation.');
    }
  };

  // Formatting helpers
  const formatMoney = (amount: number = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const element = pdfTemplateRef.current;
      if (!element) return;

      const canvas = await captureHtml2Canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CamBuddy_${client.name.replace(/\s+/g, '_')}_Quotation.pdf`);
      toast.success('Official PDF Quotation downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF quotation');
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleGenerateShareLink = async (openNewTab = false) => {
    const isAlreadySent = client.proposalStatus === 'sent' || client.proposalStatus === 'confirmed';
    setIsGeneratingLink(true);
    try {
      const res = await fetch('/api/proposals/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate link');

      await navigator.clipboard.writeText(data.shareUrl);
      setClient((prev) => ({
        ...prev,
        proposalToken: data.token,
        proposalStatus: prev.proposalStatus === 'confirmed' ? 'confirmed' : 'sent',
      }));

      toast.success(
        isAlreadySent
          ? 'Proposal link copied to clipboard!'
          : 'Proposal sent to client! Link copied to clipboard.'
      );

      if (openNewTab) {
        window.open(data.shareUrl, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate proposal link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const currentProposalStatus = client.proposalStatus || 'pending';
  const isConfirmed = currentProposalStatus === 'confirmed';

  // Computed values
  const computedAmountPaid = (client.paymentHistory || []).reduce((sum, tx) => sum + tx.amount, 0);
  const balance = (client.totalAmount || 0) - computedAmountPaid;
  const paymentPercentage = client.totalAmount ? Math.min(100, Math.round((computedAmountPaid / client.totalAmount) * 100)) : 0;

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding': return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Onboarding</span>;
      case 'shooting': return <span className="bg-maroon/10 text-maroon border border-maroon/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Shooting Phase</span>;
      case 'photo-editing': return <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Photo Editing</span>;
      case 'video-editing': return <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Video Editing</span>;
      case 'delivered': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">Delivered</span>;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-surface p-6 rounded-3xl border border-admin-border">
        <div>
          <Link href="/admin/clients" className="inline-flex items-center gap-2 text-xs font-bold text-admin-muted hover:text-maroon uppercase tracking-widest mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
          <h2 className="font-serif text-3xl font-black text-admin-text uppercase tracking-widest flex items-center gap-3">
            {client.name}
          </h2>
          <p className="text-admin-muted text-sm font-bold tracking-wide mt-1">Package: <span className="text-maroon">{client.packageName}</span></p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <p className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">Workflow Status</p>
          <select
            value={client.status}
            onChange={handleStatusChange}
            className="bg-white/5 border border-admin-border text-admin-text text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all cursor-pointer"
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
        
        {/* Main Primary Column (Span 2): Proposal Quotation & Event Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Approved Proposal Quotation Card (Primary Focus) */}
          <div className="bg-admin-surface rounded-3xl border border-admin-border p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-admin-border pb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-5 w-5 text-maroon" /> Proposal Quotation
                </h3>
                {!isConfirmed && (
                  <Link
                    href={`/admin/clients/${client.id}/quotation`}
                    className="p-1.5 bg-white/5 text-admin-muted hover:text-maroon hover:bg-maroon/10 rounded-xl transition-colors border border-admin-border cursor-pointer ml-1"
                    title="Edit & Customize Quotation Terms (Full Page)"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* Status Badge & Action Button right next to it */}
              <div className="flex flex-wrap items-center gap-2">
                {isConfirmed ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Confirmed & Locked
                  </span>
                ) : currentProposalStatus === 'sent' ? (
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                    Sent to Client
                  </span>
                ) : currentProposalStatus === 'rejected' ? (
                  <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                    Revision Requested
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                    Draft / In Prep
                  </span>
                )}

                {/* Compact Action Button (Send / Copy Link) */}
                {(!client.totalAmount || client.totalAmount === 0) ? (
                  <Link
                    href={`/admin/clients/${client.id}/quotation`}
                    className="bg-amber-500 hover:bg-amber-600 text-ink font-bold text-[10px] uppercase px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="h-3 w-3" /> Setup Quote
                  </Link>
                ) : currentProposalStatus === 'sent' || currentProposalStatus === 'confirmed' || currentProposalStatus === 'rejected' ? (
                  <button
                    onClick={() => handleGenerateShareLink(false)}
                    disabled={isGeneratingLink}
                    className="inline-flex items-center gap-1 bg-maroon/10 hover:bg-maroon hover:text-ink text-maroon font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md transition-all border border-maroon/20 cursor-pointer disabled:opacity-50"
                    title="Copy Proposal Share Link to Clipboard"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>{isGeneratingLink ? 'Copying...' : 'Copy Link'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateShareLink(false)}
                    disabled={isGeneratingLink}
                    className="inline-flex items-center gap-1 bg-maroon hover:bg-maroon-dark text-ink font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md transition-all cursor-pointer disabled:opacity-50"
                    title="Send Proposal to Client (Generates & Copies Link)"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isGeneratingLink ? 'Sending...' : 'Send Proposal'}</span>
                  </button>
                )}

                {isConfirmed && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                    className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-admin-text font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md transition-all border border-admin-border cursor-pointer disabled:opacity-50"
                    title="Download Confirmed Official Invoice PDF"
                  >
                    <FileDown className="h-3 w-3" />
                    <span>{isPdfGenerating ? 'Generating...' : 'PDF'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Title & Amount Overview Row */}
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-admin-border">
              <span className="text-sm font-bold text-admin-text">{client.packageName}</span>
              <span className="text-base font-black text-maroon">{formatMoney(client.totalAmount)}</span>
            </div>

            {/* Confirmation & Status Notice */}
            {isConfirmed && client.proposalConfirmedAt && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl text-xs font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 uppercase text-[10px] tracking-widest font-extrabold">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> Quotation Confirmed
                </div>
                <p className="text-admin-muted font-medium">Accepted on: <strong className="text-admin-text">{client.proposalConfirmedAt}</strong></p>
                <p className="text-[11px] text-emerald-300 font-medium">This quotation is now permanently locked and cannot be edited.</p>
              </div>
            )}

            {currentProposalStatus === 'rejected' && client.proposalClientNotes && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-xs font-medium space-y-1">
                <div className="flex items-center gap-1 text-rose-400 uppercase text-[10px] tracking-widest font-bold">
                  Client Revision Remarks:
                </div>
                <p className="text-rose-300 font-semibold italic">&ldquo;{client.proposalClientNotes}&rdquo;</p>
              </div>
            )}

            {/* Clean List View of Proposal Coverage & Deliverables */}
            {effectiveCustomDetails && (
              <div className="border border-admin-border rounded-2xl overflow-hidden bg-admin-surface">
                <div className="bg-white/5 border-b border-admin-border px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-admin-muted flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-maroon" /> Included Coverage & Deliverables
                  </span>
                  <span className="text-[10px] font-bold text-admin-muted uppercase">
                    {effectiveCustomDetails.days.length} Days | {effectiveCustomDetails.addons.length} Deliverables
                  </span>
                </div>

                <div className="p-4 divide-y divide-admin-border space-y-3">
                  {/* Days & Crew List */}
                  {effectiveCustomDetails.days.map((day, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-3' : ''}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-admin-text tracking-wide">{day.title}</span>
                        <span className="text-[10px] font-bold text-admin-muted uppercase bg-white/5 px-2 py-0.5 rounded-md">
                          Day {idx + 1}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.items.map((item, itemIdx) => (
                          <span
                            key={itemIdx}
                            className="bg-white/5 border border-admin-border text-admin-text text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                          >
                            <Camera className="h-3.5 w-3.5 text-maroon" />
                            {getResourceName(item.resourceId)}
                            <strong className="text-admin-text font-bold ml-1">x{item.qty}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Included Deliverables List */}
                  {effectiveCustomDetails.addons.length > 0 && (
                    <div className="pt-3">
                      <span className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                        Included Physical Deliverables
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {effectiveCustomDetails.addons.map((addonId) => (
                          <span
                            key={addonId}
                            className="bg-maroon/10 border border-maroon/20 text-maroon text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                          >
                            <Sparkles className="h-3 w-3" />
                            {getAddonName(addonId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {inquiry?.specialNotes && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-medium p-3.5 rounded-2xl flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[10px] uppercase tracking-widest mb-0.5 text-blue-300">Initial Request Notes</strong>
                  <p className="text-blue-100 font-medium">{inquiry.specialNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Itinerary Card */}
          <div className="bg-admin-surface rounded-3xl border border-admin-border p-6">
            <div className="flex items-center justify-between mb-6 border-b border-admin-border pb-4">
              <h3 className="font-serif text-lg font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-5 w-5 text-maroon" /> Event Itinerary
              </h3>
              <button
                onClick={() => setAddingEvent(true)}
                className="bg-maroon hover:bg-maroon-dark text-ink text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>

            {(!client.events || client.events.length === 0) ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-admin-border">
                <Calendar className="h-12 w-12 text-admin-muted/50 mx-auto mb-3" />
                <p className="text-sm font-bold text-admin-muted">No events scheduled yet.</p>
                <p className="text-xs font-medium text-admin-muted/70 mt-1">Add dates for Pre-Wedding, Haldi, Wedding, etc.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {client.events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((evt) => (
                  <div key={evt.id} className="group bg-white/5 border border-admin-border p-5 rounded-2xl hover:border-maroon/30 transition-all flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="bg-maroon/10 border border-maroon/20 rounded-xl p-3 text-center min-w-[70px] flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-black text-maroon leading-tight">{new Date(evt.date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-admin-text text-sm tracking-wide mb-1">{evt.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-admin-muted font-bold mb-2">
                          <Clock className="h-3 w-3" /> {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                        </div>
                        {evt.notes && <p className="text-xs font-medium text-admin-muted bg-white/5 p-2.5 rounded-lg border border-admin-border">{evt.notes}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setEventToDelete(evt.id)}
                      className="p-2 text-admin-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20 cursor-pointer"
                      title="Remove event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column (Span 1): Financial Ledger & Contact Details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Financial Tracking Card */}
          <div className="bg-admin-surface rounded-3xl border border-admin-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-admin-text">
              <IndianRupee className="h-24 w-24" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-serif text-lg font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" /> Payment Info
              </h3>
              <button
                onClick={() => {
                  setTotalAmountForm({ totalAmount: client.totalAmount || 0 });
                  setPaymentForm({ amount: 0, date: new Date().toISOString().slice(0, 16), notes: '' });
                  setEditingPayments(true);
                }}
                className="p-2 bg-white/5 text-admin-muted hover:text-maroon hover:bg-maroon/10 rounded-xl transition-colors border border-admin-border cursor-pointer"
                title="Manage Payments"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end border-b border-admin-border pb-3">
                <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">Total Amount</span>
                <span className="text-sm font-black text-admin-text">{formatMoney(client.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-admin-border pb-3">
                <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">Amount Paid</span>
                <span className="text-sm font-black text-emerald-400">{formatMoney(computedAmountPaid)}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">Balance</span>
                <span className={`text-lg font-black ${balance > 0 ? 'text-red-400' : 'text-admin-text'}`}>{formatMoney(balance)}</span>
              </div>

              <div className="pt-3">
                <div className="flex justify-between text-[9px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  <span>Progress</span>
                  <span>{paymentPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${paymentPercentage}%` }} />
                </div>
              </div>

              {/* Transaction Ledger */}
              {(client.paymentHistory && client.paymentHistory.length > 0) && (
                <div className="mt-6 pt-6 border-t border-admin-border">
                  <h4 className="text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-3">Transaction Ledger</h4>
                  <div className="space-y-3">
                    {client.paymentHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-admin-border group">
                        <div>
                          <p className="text-xs font-bold text-admin-text">{formatMoney(tx.amount)}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-admin-muted uppercase">
                            <Clock className="h-3 w-3" />
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {tx.notes && <p className="text-[10px] font-medium text-admin-muted mt-1">{tx.notes}</p>}
                        </div>
                        <button
                          onClick={() => setTransactionToDelete(tx.id)}
                          className="p-1.5 text-admin-muted hover:text-red-400 bg-admin-surface border border-admin-border hover:border-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
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
          <div className="bg-admin-surface rounded-3xl border border-admin-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-bold text-admin-text uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" /> Contact Details
              </h3>
              <button
                onClick={() => { setDetailsForm(client); setEditingDetails(true); }}
                className="p-2 bg-white/5 text-admin-muted hover:text-maroon hover:bg-maroon/10 rounded-xl transition-colors border border-admin-border cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-admin-muted" />
                <a href={`mailto:${client.email}`} className="font-bold text-admin-text hover:text-maroon">{client.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-admin-muted" />
                <a href={`tel:${client.phone}`} className="font-bold text-admin-text hover:text-maroon">{client.phone}</a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-admin-muted mt-0.5" />
                <span className="font-bold text-admin-muted">{client.address}</span>
              </div>
            </div>
            {client.notes && (
              <div className="mt-6 pt-6 border-t border-admin-border">
                <p className="text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-2">Global Notes</p>
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium p-4 rounded-xl">
                  {client.notes}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      </div>
      {/* MODALS */}

      {/* Edit Details Modal */}
      {editingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-black/40 border border-admin-border relative">
            <button onClick={() => setEditingDetails(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-admin-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-6 uppercase tracking-widest flex items-center gap-2"><Edit className="h-5 w-5 text-maroon" /> Edit Client</h3>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Name</label>
                <input type="text" required value={detailsForm.name || ''} onChange={e => setDetailsForm({...detailsForm, name: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Email</label>
                <input type="email" required value={detailsForm.email || ''} onChange={e => setDetailsForm({...detailsForm, email: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Phone</label>
                <input type="tel" required value={detailsForm.phone || ''} onChange={e => setDetailsForm({...detailsForm, phone: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Address</label>
                <input type="text" required value={detailsForm.address || ''} onChange={e => setDetailsForm({...detailsForm, address: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Global Notes (Optional)</label>
                <textarea rows={3} value={detailsForm.notes || ''} onChange={e => setDetailsForm({...detailsForm, notes: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <button type="submit" className="w-full bg-maroon hover:bg-maroon-dark text-ink font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm">Save Details</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit & Customize Proposal Quotation Modal */}
      {editingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl shadow-black/40 border border-admin-border relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingQuotation(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-admin-muted rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-1 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-5 w-5 text-maroon" /> Edit & Customize Proposal Quotation
            </h3>
            <p className="text-xs text-admin-muted font-medium mb-6">
              Configure coverage days, crew allocation, deliverables, and total proposal price.
            </p>

            <form onSubmit={handleUpdateQuotation} className="space-y-6">
              {/* Package Title & Final Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-admin-border">
                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Package / Proposal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={quotationForm.packageName}
                    onChange={(e) => setQuotationForm({ ...quotationForm, packageName: e.target.value })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Total Final Proposal Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={quotationForm.totalAmount}
                    onChange={(e) => setQuotationForm({ ...quotationForm, totalAmount: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                  <p className="text-[10px] text-admin-muted font-bold mt-1">
                    Calculated Subtotal: ₹{calcAutoPrice(quotationForm.days, quotationForm.addons).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Coverage Days Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-admin-border pb-2">
                  <h4 className="font-serif text-sm font-bold text-admin-text uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-maroon" /> Event Coverage Days & Crew Allocation
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="text-xs font-bold text-maroon hover:text-maroon-dark uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  {quotationForm.days.map((day, dayIdx) => (
                    <div key={dayIdx} className="bg-white/5 border border-admin-border p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          required
                          value={day.title}
                          onChange={(e) => handleDayTitleChange(dayIdx, e.target.value)}
                          className="flex-1 bg-admin-surface border border-admin-border text-admin-text rounded-xl py-2 px-3 font-bold text-xs outline-none focus:border-maroon transition-colors"
                          placeholder="Day Title e.g. Day 1 - Haldi & Mehendi"
                        />
                        {quotationForm.days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(dayIdx)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Crew Items */}
                      <div className="space-y-2 pl-2">
                        <div className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">
                          Allocated Crew Roles:
                        </div>
                        {day.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2">
                            <select
                              value={item.resourceId}
                              onChange={(e) => handleCrewItemChange(dayIdx, itemIdx, 'resourceId', e.target.value)}
                              className="flex-1 bg-admin-surface border border-admin-border text-admin-text rounded-xl py-2 px-3 font-semibold text-xs outline-none focus:border-maroon"
                            >
                              {resources.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} (₹{r.pricePerDay.toLocaleString('en-IN')}/day)
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleCrewItemChange(dayIdx, itemIdx, 'qty', Math.max(1, Number(e.target.value)))}
                              className="w-16 bg-admin-surface border border-admin-border text-admin-text rounded-xl py-2 px-2 text-center font-bold text-xs outline-none focus:border-maroon"
                            />

                            {day.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCrewItem(dayIdx, itemIdx)}
                                className="p-1.5 text-admin-muted hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddCrewItem(dayIdx)}
                          className="text-[11px] font-bold text-maroon hover:underline uppercase tracking-widest pt-1 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Add Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Add-ons Deliverables Section */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-admin-text uppercase tracking-widest flex items-center gap-1.5 border-b border-admin-border pb-2">
                  <Sparkles className="h-4 w-4 text-maroon" /> Included Deliverables & Add-ons
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addons.map((addon) => {
                    const isChecked = quotationForm.addons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-maroon/10 border-maroon text-maroon'
                            : 'bg-white/5 border-admin-border text-admin-text hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-maroon h-4 w-4" />
                          {addon.name}
                        </span>
                        <span className="text-admin-text font-black">₹{addon.price.toLocaleString('en-IN')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium p-3.5 rounded-xl">
                Saving will update the proposal breakdown and reset proposal status to <strong>Pending Review</strong> so you can copy and send a fresh 24h link to the client.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuotation(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Save & Update Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Payments Modal */}
      {editingPayments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 border border-admin-border relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingPayments(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-admin-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-6 uppercase tracking-widest flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-400" /> Manage Payments</h3>

            <form onSubmit={handleUpdatePayments} className="space-y-6">
              {/* Top: Edit Total Amount */}
              <div className="bg-white/5 p-4 rounded-2xl border border-admin-border">
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Total Package Amount (₹)</label>
                <input type="number" required value={totalAmountForm.totalAmount} onChange={e => setTotalAmountForm({ totalAmount: Number(e.target.value) })} className="w-full bg-admin-surface border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" />
              </div>

              {/* Bottom: Log New Transaction */}
              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 space-y-4">
                <h4 className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest border-b border-emerald-500/20 pb-2">Log New Transaction</h4>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">Amount Received (₹)</label>
                  <input type="number" value={paymentForm.amount || ''} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full bg-admin-surface border border-emerald-500/30 text-emerald-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-400 transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">Date & Time</label>
                  <input type="datetime-local" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full bg-admin-surface border border-emerald-500/30 text-emerald-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                  <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="e.g. Bank Transfer, Cash" className="w-full bg-admin-surface border border-emerald-500/30 text-emerald-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-emerald-400 transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm">Save & Update Ledger</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {addingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 border border-admin-border relative">
            <button onClick={() => setAddingEvent(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-admin-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-6 uppercase tracking-widest flex items-center gap-2"><Calendar className="h-5 w-5 text-maroon" /> Schedule Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Event Title</label>
                <input type="text" required placeholder="e.g. Pre-Wedding Shoot" value={eventForm.title || ''} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Event Date</label>
                <input type="date" required value={eventForm.date || ''} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">Notes (Locations, Time, etc)</label>
                <textarea rows={3} value={eventForm.notes || ''} onChange={e => setEventForm({...eventForm, notes: e.target.value})} className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors" /></div>
              <button type="submit" className="w-full bg-maroon hover:bg-maroon-dark text-ink font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-colors mt-2 text-sm">Add Event</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 border border-admin-border text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">Remove Event?</h3>
            <p className="text-xs font-medium text-admin-muted mb-6">Are you sure you want to remove this scheduled event from the itinerary?</p>
            <div className="flex gap-3">
              <button onClick={() => setEventToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDeleteEvent(eventToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 border border-admin-border text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">Delete Transaction?</h3>
            <p className="text-xs font-medium text-admin-muted mb-6">Are you sure you want to delete this payment record? The total amount paid will be recalculated automatically.</p>
            <div className="flex gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDeleteTransaction(transactionToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice-Style PDF Template for Confirmed Invoice PDF download */}
      <div className="absolute left-[-9999px] top-0 bg-white">
        <div ref={pdfTemplateRef} className="bg-white select-none">
          <PdfProposalTemplate
            name={client.name}
            days={effectiveCustomDetails?.days || []}
            addons={effectiveCustomDetails?.addons || []}
            autoPrice={effectiveCustomDetails?.autoPrice || client.totalAmount || 0}
            finalPrice={client.totalAmount || 0}
            resources={resources}
            addonsList={addons}
            isInvoice={true}
            invoiceNumber={`INV-${client.id.slice(-6).toUpperCase()}`}
            confirmedAt={client.proposalConfirmedAt}
            clientEmail={client.email}
            clientPhone={client.phone}
            clientAddress={client.address}
          />
        </div>
      </div>
    </>
  );
}
