'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, Calendar, FileText, Sparkles, Clock, Heart, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { en } from '@/dictionaries/en';

interface ContactClientProps {
  dict: typeof en;
}

export default function ContactClient({ dict }: ContactClientProps) {
  const d = dict.contactPage;
  const inq = dict.inquiryModal;
  const about = dict.aboutPage;

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
          packageName: 'General Contact Form Inquiry',
          type: 'general',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit inquiry.');
      }

      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B1A2B', '#D4AF37', '#e0a83a', '#ffffff'],
      });

      setFormData({ name: '', email: '', phone: '', address: '', eventDate: getTodayDate(), specialNotes: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-elevated rounded-3xl p-8 space-y-8">
            <h3 className="font-serif text-xl font-medium text-ink border-b border-black/10 pb-4">
              {d.infoTitle}
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-maroon/10 rounded-2xl border border-maroon/20 text-maroon flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">
                    {about.locationTitle}
                  </h5>
                  <p className="text-sm font-semibold text-ink leading-relaxed">
                    123 Photography Lane, Creative District<br />
                    Ahmedabad, Gujarat 380001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-maroon/10 rounded-2xl border border-maroon/20 text-maroon flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">
                    {about.phoneTitle}
                  </h5>
                  <a href="tel:+919876543210" className="text-sm font-semibold text-ink hover:text-maroon transition-colors block">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-maroon/10 rounded-2xl border border-maroon/20 text-maroon flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">
                    {about.emailTitle}
                  </h5>
                  <a href="mailto:hello@cambuddy.com" className="text-sm font-semibold text-ink hover:text-maroon transition-colors block">
                    hello@cambuddy.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-maroon/10 rounded-2xl border border-maroon/20 text-maroon flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">
                    Working Hours
                  </h5>
                  <p className="text-sm font-semibold text-ink">
                    Monday – Saturday: 10:00 AM – 8:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/10">
              <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-4">
                {about.followTitle}
              </h5>
              <div className="flex items-center gap-4">
                <a href="#" className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-400 hover:scale-105 transition-transform flex items-center gap-2 text-xs font-bold">
                  <Heart className="h-4 w-4" />
                  @cambuddystudios
                </a>
                <a href="#" className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 hover:scale-105 transition-transform flex items-center gap-2 text-xs font-bold">
                  <Film className="h-4 w-4" />
                  CamBuddy Films
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Area */}
        <div className="lg:col-span-7">
          <div className="card-elevated rounded-3xl p-8 md:p-10">
            <h3 className="font-serif text-2xl font-medium text-ink mb-2">
              {d.formTitle}
            </h3>
            <p className="text-xs text-ink/50 mb-8 font-medium">
              {inq.subtitle}
            </p>

            {isSuccess ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full mb-6 border border-emerald-500/20"
                >
                  <CheckCircle2 className="h-12 w-12" />
                </motion.div>
                <h4 className="font-serif text-2xl font-medium text-ink mb-3">
                  {inq.successTitle}
                </h4>
                <p className="text-ink/50 text-sm max-w-md mx-auto mb-8 font-medium leading-relaxed">
                  {inq.successDesc}
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="btn-maroon text-sm uppercase tracking-wider py-3 px-8"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl font-medium">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {inq.fullName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-ink/40">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      placeholder={inq.placeholders.name}
                      className="input-light"
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {inq.email} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-ink/40">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        placeholder={inq.placeholders.email}
                        className="input-light"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {inq.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-ink/40">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        placeholder={inq.placeholders.phone}
                        className="input-light"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Date + Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {inq.eventDate}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-ink/40">
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

                  <div>
                    <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                      {inq.address}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-ink/40">
                        <MapPin className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder={inq.placeholders.address}
                        className="input-light"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1.5">
                    {inq.notes}
                  </label>
                  <div className="relative">
                    <span className="absolute top-4 left-0 pl-4 flex items-start text-ink/40">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      name="specialNotes"
                      value={formData.specialNotes}
                      onChange={handleChange}
                      disabled={isLoading}
                      rows={4}
                      placeholder={inq.placeholders.notes}
                      className="input-light resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-maroon py-4 shadow-lg text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      {inq.submitBtn}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
