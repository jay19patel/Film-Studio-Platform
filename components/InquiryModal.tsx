'use client';

import { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Mail, User, MapPin, Calendar, FileText, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { en } from '@/dictionaries/en';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
  packageId?: string;
  type?: 'predefined' | 'custom' | 'general';
  customDetails?: any;
  onSuccess?: () => void;
  onDownloadPdf?: () => void;
  dict?: typeof en.inquiryModal;
}

export default function InquiryModal({
  isOpen,
  onClose,
  packageName,
  packageId,
  type = 'general',
  customDetails,
  onSuccess,
  onDownloadPdf,
  dict = en.inquiryModal,
}: InquiryModalProps) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    eventDate: getTodayDate(),
    specialNotes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadPdfChecked, setDownloadPdfChecked] = useState(true);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields (Name, Email, and Phone).');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packageId,
          packageName: packageName || 'General Inquiry',
          type,
          customDetails: type === 'custom' ? customDetails : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit inquiry.');
      }

      // Success trigger
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#e0a83a', '#d4143a', '#ffffff'],
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onDownloadPdf) {
        onDownloadPdf();
      }

      // Clear form
      setFormData({ name: '', email: '', phone: '', address: '', eventDate: getTodayDate(), specialNotes: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container — Cinematic Dark Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-charcoal rounded-3xl shadow-2xl shadow-black/15 w-full max-w-lg relative z-10 overflow-hidden border border-black/10"
        >
          {/* Header */}
          <div className="bg-maroon-gradient px-6 py-4 flex justify-between items-center text-ink">
            <div>
              <h3 className="font-serif text-lg font-bold tracking-tight text-ink">
                {type === 'general' ? dict.generalTitle : `${dict.title} ${packageName || ''}`}
              </h3>
              {packageName && (
                <p className="text-xs text-ink/70 truncate max-w-[320px] font-medium">
                  {packageName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-ink/70 hover:text-ink hover:bg-black/10 p-1.5 rounded-full transition-all"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {isSuccess ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full mb-4 border border-emerald-500/20 shadow-xs"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h4 className="font-serif text-xl font-medium text-ink mb-2">{dict.successTitle}</h4>
                <p className="text-sm text-ink/50 max-w-sm mx-auto mb-6 leading-relaxed">
                  {dict.successDesc}
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="bg-maroon hover:bg-maroon-dark text-cream font-bold text-sm py-2.5 px-6 rounded-xl transition-all cursor-pointer"
                >
                  {dict.closeBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-ink/50 mb-2 font-medium">
                  {dict.subtitle}
                </p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Name Input */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {dict.fullName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      placeholder={dict.placeholders.name}
                      className="input-light"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {dict.email} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      placeholder={dict.placeholders.email}
                      className="input-light"
                    />
                  </div>
                </div>

                {/* Phone + Event Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {dict.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        placeholder={dict.placeholders.phone}
                        className="input-light"
                      />
                    </div>
                  </div>

                  {/* Event Date Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {dict.eventDate}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                        <Calendar className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="input-light [color-scheme:light]"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {dict.address}
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-0 pl-3.5 flex items-start text-ink/40">
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isLoading}
                      rows={2}
                      placeholder={dict.placeholders.address}
                      className="input-light resize-none"
                    />
                  </div>
                </div>

                {/* Special Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {dict.notes}
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-0 pl-3.5 flex items-start text-ink/40">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      name="specialNotes"
                      value={formData.specialNotes}
                      onChange={handleChange}
                      disabled={isLoading}
                      rows={2}
                      placeholder={dict.placeholders.notes}
                      className="input-light resize-none"
                    />
                  </div>
                </div>



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-maroon py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      {dict.submitBtn}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
