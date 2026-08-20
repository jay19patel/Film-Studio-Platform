'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Sparkles, Menu, X, Settings, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InquiryModal from '@/components/InquiryModal';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const pathname = usePathname();

  // Don't show public header on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Packages', href: '/' },
    { name: 'Build Your Own', href: '/build-your-own' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Equipment', href: '/equipment' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <Camera className="h-6 w-6 text-maroon group-hover:scale-110 transition-transform" />
              <span className="font-serif text-2xl tracking-widest text-neutral-900 uppercase">
                CamBuddy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-xs font-bold tracking-[0.1em] uppercase transition-colors duration-200 ${
                    isActive ? 'text-maroon' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute -bottom-2 left-0 right-0 h-[2px] bg-maroon"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={() => setIsInquiryOpen(true)}
              className="bg-maroon hover:bg-maroon-600 text-white font-bold text-[10px] tracking-widest uppercase py-3 px-6 rounded-xl transition-all flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Contact Us
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-900 hover:text-maroon p-2 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-5 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all ${
                      isActive
                        ? 'bg-maroon/5 text-maroon border-l-2 border-maroon'
                        : 'text-neutral-600 hover:bg-gray-50 hover:text-neutral-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <button 
                onClick={() => { setIsOpen(false); setIsInquiryOpen(true); }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold tracking-widest uppercase bg-maroon text-white hover:bg-maroon-600 transition-all flex items-center gap-2 mt-2"
              >
                <Send className="h-4 w-4" />
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        type="general"
      />
    </header>
  );
}
