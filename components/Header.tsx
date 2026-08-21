'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Send, Globe, Check, ChevronDown } from 'lucide-react';
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

  // The homepage hero is a deliberate dark video island — header floats
  // transparent with light text over it until the user scrolls past it.
  // Everywhere else (and once scrolled) the header sits on the paper theme.
  const isOverHero = isHome && !isScrolled;

  const getHeaderClass = () => {
    if (isOverHero) {
      return 'absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-ink/85 via-ink/30 to-transparent text-cream transition-all duration-500';
    }
    if (isHome) {
      return 'fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-md border-b border-maroon/12 text-ink shadow-sm transition-all duration-500';
    }
    return 'sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-maroon/12 text-ink transition-all duration-500';
  };

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
              <span className="font-serif text-2xl sm:text-3xl tracking-wide font-semibold flex items-center">
                <span className="text-maroon font-black">M</span>
                <span className={isOverHero ? 'text-cream' : 'text-ink'}>inesh_</span>
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
                      ? 'text-maroon font-extrabold'
                      : isOverHero
                        ? 'text-cream/70 hover:text-cream'
                        : 'text-ink/60 hover:text-ink'
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

          {/* Desktop CTA & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isOverHero
                    ? 'bg-white/10 hover:bg-white/20 border border-cream/20 text-cream'
                    : 'bg-black/[0.03] hover:bg-black/[0.06] border border-ink/10 text-ink'
                }`}
                aria-label="Select Language"
              >
                <Globe className="h-4 w-4 text-maroon" />
                <span>{locale === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOverHero ? 'text-cream/50' : 'text-ink/40'} ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 bg-charcoal text-ink rounded-2xl shadow-2xl shadow-black/10 border border-maroon/15 py-1.5 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        locale === 'en' ? 'bg-maroon/10 text-maroon font-bold' : 'text-ink/70 hover:bg-black/[0.03]'
                      }`}
                    >
                      <span>English</span>
                      {locale === 'en' && <Check className="h-3.5 w-3.5 text-maroon" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('gu')}
                      className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        locale === 'gu' ? 'bg-maroon/10 text-maroon font-bold' : 'text-ink/70 hover:bg-black/[0.03]'
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isOverHero
                  ? 'bg-white/10 hover:bg-white/20 border border-cream/20 text-cream'
                  : 'bg-black/[0.03] hover:bg-black/[0.06] border border-ink/10 text-ink'
              }`}
            >
              <Send className="h-3.5 w-3.5 text-maroon" />
              <span>{dict.header.contactUs}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-all hover:text-maroon ${isOverHero ? 'text-cream' : 'text-ink'}`}
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
            className="md:hidden overflow-hidden bg-charcoal/98 backdrop-blur-xl border-b border-maroon/12 text-ink"
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
                        ? 'bg-maroon/10 text-maroon border-l-2 border-maroon'
                        : 'text-ink/60 hover:bg-black/[0.03] hover:text-ink'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Language Switcher */}
              <div className="pt-3 pb-1 border-t mt-2 border-ink/10">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-ink/40">
                  <Globe className="h-3.5 w-3.5 text-maroon" />
                  Select Language / ભાષા પસંદ કરો
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 mt-2 mb-3">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      locale === 'en'
                        ? 'bg-maroon text-cream shadow-xs'
                        : 'bg-black/[0.04] text-ink hover:bg-black/[0.07]'
                    }`}
                  >
                    English {locale === 'en' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('gu')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      locale === 'gu'
                        ? 'bg-maroon text-cream shadow-xs'
                        : 'bg-black/[0.04] text-ink hover:bg-black/[0.07]'
                    }`}
                  >
                    ગુજરાતી {locale === 'gu' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-2 border bg-black/[0.03] hover:bg-black/[0.06] border-ink/10 text-ink"
              >
                <Send className="h-4 w-4 text-maroon" />
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
