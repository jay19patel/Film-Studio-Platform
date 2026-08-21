'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, Menu, X, Send, Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InquiryModal from '@/components/InquiryModal';
import { en } from '@/dictionaries/en';
import { gu } from '@/dictionaries/gu';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'gu'>('en');
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const savedLocale = (getCookie('NEXT_LOCALE') as 'en' | 'gu') || 
      (document.documentElement.getAttribute('data-locale') as 'en' | 'gu') || 
      'en';
      
    setLocale(savedLocale);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: 'en' | 'gu') => {
    setLocale(newLocale);
    setLangDropdownOpen(false);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute('data-locale', newLocale);
    document.documentElement.lang = newLocale;
    router.refresh();
  };

  // Don't show public header on admin pages or proposal review pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/proposal')) {
    return null;
  }

  const dict = locale === 'gu' ? gu : en;

  const navLinks = [
    { name: dict.header.buildYourOwn, href: '/build-your-own' },
    { name: dict.header.portfolio, href: '/portfolio' },
    { name: dict.header.equipment, href: '/equipment' },
    { name: dict.header.aboutUs, href: '/about' },
  ];

  // Dynamic header styles based on homepage & scroll
  const getHeaderClass = () => {
    if (isHome) {
      if (isScrolled) {
        return 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 text-neutral-900 shadow-sm transition-all duration-300';
      }
      return 'absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 via-black/20 to-transparent text-white transition-all duration-300';
    }
    return 'sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs text-neutral-900 transition-all duration-300';
  };

  const isDarkHeader = isHome && !isScrolled;

  return (
    <header className={getHeaderClass()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3.5 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-maroon shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="Minesh_P"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <span className="font-serif text-2xl sm:text-3xl tracking-wide font-extrabold flex items-center">
                <span className="text-maroon font-black">M</span>
                <span className={isDarkHeader ? 'text-white' : 'text-neutral-900'}>inesh_</span>
                <span className="text-maroon font-black">P</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative transition-colors duration-200 font-bold ${
                    locale === 'gu'
                      ? 'text-sm lg:text-[15px] font-bold tracking-normal'
                      : 'text-xs lg:text-sm font-bold uppercase tracking-[0.08em]'
                  } ${
                    isActive
                      ? isDarkHeader ? 'text-rose-300 font-extrabold' : 'text-maroon font-extrabold'
                      : isDarkHeader ? 'text-white/80 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className={`absolute -bottom-2 left-0 right-0 h-[2px] ${isDarkHeader ? 'bg-rose-400' : 'bg-maroon'}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  isDarkHeader
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                    : 'bg-gray-50 hover:bg-white border border-gray-200 text-neutral-700'
                }`}
                aria-label="Select Language"
              >
                <Globe className={`h-4 w-4 ${isDarkHeader ? 'text-rose-300' : 'text-maroon'}`} />
                <span>{locale === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDarkHeader ? 'text-white/60' : 'text-neutral-400'} ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 bg-white text-neutral-900 rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        locale === 'en' ? 'bg-maroon/5 text-maroon font-bold' : 'text-neutral-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>English</span>
                      {locale === 'en' && <Check className="h-3.5 w-3.5 text-maroon" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('gu')}
                      className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        locale === 'gu' ? 'bg-maroon/5 text-maroon font-bold' : 'text-neutral-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>ગુજરાતી</span>
                      {locale === 'gu' && <Check className="h-3.5 w-3.5 text-maroon" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/contact"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isDarkHeader
                  ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                  : 'bg-gray-50 hover:bg-white border border-gray-200 text-neutral-700'
              }`}
            >
              <Send className={`h-3.5 w-3.5 ${isDarkHeader ? 'text-rose-300' : 'text-maroon'}`} />
              <span>{dict.header.contactUs}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-all ${isDarkHeader ? 'text-white hover:text-rose-300' : 'text-neutral-900 hover:text-maroon'}`}
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
            className={`md:hidden overflow-hidden ${isDarkHeader ? 'bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 text-white' : 'bg-white border-b border-gray-100 text-neutral-900'}`}
          >
            <div className="px-4 pt-2 pb-5 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3.5 rounded-xl transition-all font-bold ${
                      locale === 'gu' ? 'text-base font-bold tracking-normal' : 'text-sm font-bold tracking-widest uppercase'
                    } ${
                      isActive
                        ? isDarkHeader ? 'bg-white/10 text-rose-300 border-l-2 border-rose-400' : 'bg-maroon/5 text-maroon border-l-2 border-maroon'
                        : isDarkHeader ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-neutral-600 hover:bg-gray-50 hover:text-neutral-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Language Switcher */}
              <div className={`pt-3 pb-1 border-t mt-2 ${isDarkHeader ? 'border-neutral-800' : 'border-gray-100'}`}>
                <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkHeader ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  <Globe className={`h-3.5 w-3.5 ${isDarkHeader ? 'text-rose-400' : 'text-maroon'}`} />
                  Select Language / ભાષા પસંદ કરો
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 mt-2 mb-3">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      locale === 'en'
                        ? 'bg-maroon text-white shadow-xs'
                        : isDarkHeader ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-neutral-700 hover:bg-gray-200'
                    }`}
                  >
                    English {locale === 'en' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('gu')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      locale === 'gu'
                        ? 'bg-maroon text-white shadow-xs'
                        : isDarkHeader ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-neutral-700 hover:bg-gray-200'
                    }`}
                  >
                    ગુજરાતી {locale === 'gu' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <Link 
                href="/contact"
                onClick={() => setIsOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-2 border ${
                  isDarkHeader
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    : 'bg-gray-50 hover:bg-white border-gray-200 text-neutral-700'
                }`}
              >
                <Send className={`h-4 w-4 ${isDarkHeader ? 'text-rose-300' : 'text-maroon'}`} />
                <span>{dict.header.contactUs}</span>
              </Link>
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
