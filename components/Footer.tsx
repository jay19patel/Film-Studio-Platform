'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const pathname = usePathname();

  // Don't show public footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-100 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <Camera className="h-5 w-5 text-maroon" />
            <span className="font-serif text-2xl tracking-widest text-neutral-900 uppercase">
              CamBuddy
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-xs md:text-sm max-w-md text-neutral-500 leading-relaxed">
            Crafting timeless cinematic wedding films & stunning photographs of your special day. From Haldi to Reception, we capture love in its purest form.
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-6 md:gap-8 justify-center text-xs font-bold tracking-widest uppercase text-neutral-600">
            <Link href="/" className="hover:text-maroon transition-colors duration-200">
              Packages
            </Link>
            <Link href="/build-your-own" className="hover:text-maroon transition-colors duration-200">
              Builder
            </Link>
            <Link href="/terms" className="hover:text-maroon transition-colors duration-200">
              Terms & Conditions
            </Link>
            <Link href="/admin/login" className="hover:text-maroon transition-colors duration-200">
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs font-bold tracking-widest uppercase text-neutral-400">
          <p>&copy; {new Date().getFullYear()} CamBuddy. All rights reserved.</p>
          <p className="flex items-center gap-2 mt-4 sm:mt-0">
            MADE BY <span className="text-maroon font-black text-sm">NJTECHSTUDIO</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
