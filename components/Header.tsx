'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Sparkles, Menu, X, Settings } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show public header on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Wedding Packages', href: '/' },
    { name: 'Custom Builder', href: '/build-your-own' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
                <Camera className="h-6 w-6" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 flex items-center">
                CamBuddy
                <Sparkles className="h-4 w-4 ml-1 text-amber-500 animate-pulse" />
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
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-amber-600 border-b-2 border-amber-500 py-1'
                      : 'text-gray-600 hover:text-amber-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-all"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-amber-500 p-2 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-amber-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
