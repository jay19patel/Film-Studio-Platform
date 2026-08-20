'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.replace('/admin/dashboard');
        }
      } catch (err) {
        // Not logged in is fine
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!pin || pin.length !== 5) {
      setError('Please enter a valid 5-digit PIN.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid PIN');
      }

      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-lg relative">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-maroon/10 text-maroon p-3 rounded-2xl shadow-sm mb-4 animate-spin-slow border border-maroon/20">
            <Camera className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-widest flex items-center justify-center gap-1">
            CamBuddy Admin
          </h2>
          <p className="text-neutral-500 text-xs mt-1.5 font-bold uppercase tracking-widest">
            Studio Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl flex items-start gap-2 font-bold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PIN input */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 text-center">
              Enter 5-Digit PIN
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 5))}
                required
                disabled={isLoading}
                placeholder="•••••"
                className="w-full bg-gray-50 border border-gray-300 text-neutral-900 placeholder-gray-400 rounded-xl py-4 pl-11 pr-4 text-center tracking-[1em] text-xl outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all font-bold"
                maxLength={5}
                autoFocus
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || pin.length !== 5}
            className="w-full bg-maroon hover:bg-maroon-dark text-white font-bold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
