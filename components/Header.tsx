'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Sparkles, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
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
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/45 backdrop-blur-xl border-b border-white/[0.06] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo with gold gradient */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gold-gradient text-neutral-900 p-2.5 rounded-xl shadow-lg border border-amber-200/20"
              >
                <Camera className="h-5 w-5" />
              </motion.div>
              <span className="font-serif text-2xl font-black tracking-tight text-white flex items-center gap-1 group-hover:text-amber-200 transition-colors">
                <span className="text-gold-gradient">CamBuddy</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300" />
                </motion.div>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-sm font-semibold tracking-wide text-neutral-300 hover:text-white py-2 transition-colors duration-200"
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-gradient"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="h-4 w-[1px] bg-white/10" />

            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 border border-white/10 hover:border-amber-400/40 px-3.5 py-2 rounded-xl transition-all bg-white/[0.02]"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-neutral-950 border-b border-white/[0.08] overflow-hidden"
          >
            <div className="px-3 pt-2 pb-5 space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-200 border-l-2 border-amber-400'
                        : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="h-[1px] bg-white/5 my-3" />
              
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-base text-neutral-400 hover:bg-white/[0.02] hover:text-white"
              >
                <Settings className="h-4.5 w-4.5" />
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
