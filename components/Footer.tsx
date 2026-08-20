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
    <footer className="bg-neutral-950 text-neutral-400 mt-auto border-t border-white/[0.05] relative overflow-hidden">
      
      {/* Background glow flares */}
      <div className="absolute bottom-[-100px] left-[10%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          
          {/* Logo with gold gradient */}
          <div className="flex items-center space-x-2.5">
            <div className="bg-gold-gradient text-neutral-950 p-2 rounded-xl">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-black tracking-tight text-white flex items-center">
              <span className="text-gold-gradient">CamBuddy</span>
              <Sparkles className="h-4 w-4 ml-1 text-amber-300 fill-amber-300" />
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-xs md:text-sm max-w-md text-neutral-400 font-medium leading-relaxed">
            Crafting timeless cinematic wedding films & stunning photographs of your special day. From Haldi to Reception, we capture love in its purest, luxury form.
          </p>

          {/* Links */}
          <div className="flex space-x-8 text-sm font-semibold tracking-wide">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Explore Packages
            </Link>
            <Link href="/build-your-own" className="hover:text-white transition-colors duration-200">
              Custom Builder
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors duration-200">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center text-xs font-semibold tracking-wider text-neutral-500">
          <p>&copy; {new Date().getFullYear()} CamBuddy Photography. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-3 sm:mt-0">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> for your dream weddings.
          </p>
        </div>
      </div>
    </footer>
  );
}
