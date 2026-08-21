'use client';

import React, { useState, useRef } from 'react';
import { Client, Inquiry, Resource, Addon } from '@/lib/db';
import { CheckCircle, AlertTriangle, Clock, XCircle, Send, FileText, Camera, ShieldCheck, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { captureHtml2Canvas } from '@/lib/pdfHelper';
import PdfProposalTemplate from '@/components/PdfProposalTemplate';

interface ClientProposalViewProps {
  client: Client;
  inquiry: Inquiry | null;
  resources: Resource[];
  addonsList: Addon[];
  currentToken: string;
}

export default function ClientProposalView({
  client,
  inquiry,
  resources,
  addonsList,
  currentToken,
}: ClientProposalViewProps) {
  const [proposalStatus, setProposalStatus] = useState<'draft' | 'pending' | 'sent' | 'confirmed' | 'rejected'>(
    client.proposalStatus || 'pending'
  );
  const [confirmedAt, setConfirmedAt] = useState<string>(client.proposalConfirmedAt || '');
  const [clientNotes, setClientNotes] = useState<string>(client.proposalClientNotes || '');

  // Action Modals
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Validate token (permanent, no expiration)
  const isTokenValid = currentToken && client.proposalToken === currentToken;

  const handleDownloadPdf = async () => {
    if (!pdfTemplateRef.current) return;
    setIsPdfGenerating(true);
    try {
      const canvas = await captureHtml2Canvas(pdfTemplateRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`CamBuddy_${client.name.replace(/\s+/g, '_')}_Official_Invoice.pdf`);
      toast.success('Official PDF Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF invoice');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleRespond = async (action: 'accept' | 'reject', notes?: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/proposals/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          token: currentToken,
          action,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit response');

      setProposalStatus(data.status);
      if (data.confirmedAt) setConfirmedAt(data.confirmedAt);
      if (notes) setClientNotes(notes);

      if (action === 'accept') {
        toast.success('Quotation Confirmed & Accepted successfully!');
        setShowAcceptModal(false);
      } else {
        toast.success('Feedback / Revision Request sent to CamBuddy Studios.');
        setShowRejectModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number = 0) =>
    new Intl.NumberFormat('en-IN').format(price);

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-gray-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-black text-gray-900 mb-2">Proposal Link Expired</h2>
          <p className="text-xs text-gray-600 font-bold leading-relaxed mb-6">
            This digital proposal link is valid for <strong>24 hours</strong> only and has now expired.
            Please reach out to CamBuddy Studios to receive an updated proposal link.
          </p>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700">
            Contact Studio: <a href="tel:+919876543210" className="text-maroon underline">+91 98765 43210</a> | hello@cambuddy.com
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <header className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-maroon text-white p-2.5 rounded-2xl">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-widest text-gray-900 uppercase">CAMBUDDY STUDIOS</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Luxury Wedding Photography & Films</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-maroon/5 text-maroon border border-maroon/20 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Official Proposal Link
            </span>
          </div>
        </header>

        {/* Status Alert Banner */}
        {proposalStatus === 'confirmed' && (
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-md border border-emerald-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2.5 rounded-2xl flex-shrink-0">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-black uppercase tracking-widest">QUOTATION CONFIRMED & ACCEPTED</h3>
                <p className="text-xs font-bold text-emerald-100 mt-1">
                  Confirmed on: <span className="underline">{confirmedAt || 'Verified Official Timestamp'}</span>
                </p>
                <p className="text-xs font-medium text-emerald-100 mt-0.5">
                  This proposal is officially locked and approved. Your dates & crew allocation are reserved.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <FileDown className="h-4 w-4 text-emerald-700" />
              <span>{isPdfGenerating ? 'Generating...' : 'Download Invoice PDF'}</span>
            </button>
          </div>
        )}

        {proposalStatus === 'rejected' && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-base font-bold uppercase tracking-widest text-rose-900">Revision / Changes Requested</h3>
              <p className="text-xs font-medium text-rose-700 mt-1">
                Your remarks: &ldquo;{clientNotes}&rdquo;
              </p>
              <p className="text-xs font-medium text-rose-600 mt-2">
                CamBuddy Studios will review your requests and send an updated proposal shortly.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls for Active Proposals */}
        {(proposalStatus === 'pending' || proposalStatus === 'sent' || proposalStatus === 'draft') && (
          <div className="bg-white rounded-3xl p-6 border border-maroon/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 uppercase tracking-widest">Review Official Proposal Quote</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                Total Quotation: <span className="text-maroon font-black text-sm">₹{formatPrice(client.totalAmount)}/-</span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all cursor-pointer"
              >
                Request Changes
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" /> Accept & Confirm
              </button>
            </div>
          </div>
        )}

        {/* Main Proposal Invoice HTML Display */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex justify-center p-4 sm:p-8">
          <div ref={pdfTemplateRef} className="bg-white select-none">
            <PdfProposalTemplate
              name={client.packageName || 'Custom Wedding Package'}
              days={((client.customDetails || inquiry?.customDetails)?.days || []).map((d) => ({ ...d, image: d.image || '' }))}
              addons={(client.customDetails || inquiry?.customDetails)?.addons || []}
              autoPrice={client.totalAmount || (client.customDetails || inquiry?.customDetails)?.totalPrice || 0}
              finalPrice={client.totalAmount || (client.customDetails || inquiry?.customDetails)?.totalPrice || 0}
              resources={resources}
              addonsList={addonsList}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 font-medium pb-8">
          © 2026 CamBuddy Studios. Official Digital Quotation Proposal.
        </footer>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest">Confirm Quotation?</h3>
            <p className="text-xs font-bold text-gray-500 mb-6 leading-relaxed">
              By confirming, you accept the quote of <strong className="text-maroon">₹{formatPrice(client.totalAmount)}/-</strong> for {client.packageName}.
              Your confirmation timestamp will be officially recorded.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespond('accept')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isSubmitting ? 'Confirming...' : 'Yes, Accept & Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-500" /> Request Revision
            </h3>
            <p className="text-xs font-bold text-gray-500 mb-4">
              Specify requested changes or price adjustments for CamBuddy Studios:
            </p>

            <textarea
              rows={4}
              required
              placeholder="e.g. Please add drone coverage for Haldi, or adjust total package price..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 font-bold text-xs outline-none focus:border-maroon transition-colors mb-4"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !rejectReason.trim()}
                onClick={() => handleRespond('reject', rejectReason)}
                className="w-full sm:w-auto px-6 py-3 bg-maroon hover:bg-maroon-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Revision Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
