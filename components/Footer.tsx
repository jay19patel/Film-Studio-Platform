'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Don't show public footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 text-white p-1.5 rounded-lg">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white flex items-center">
              CamBuddy
              <Sparkles className="h-3.5 w-3.5 ml-1 text-amber-400" />
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-sm max-w-md text-gray-400">
            Crafting timeless cinematic films & stunning photographs of your special day. From Haldi to Reception, we capture love in its purest form.
          </p>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Explore Packages
            </Link>
            <Link href="/build-your-own" className="hover:text-white transition-colors">
              Custom Builder
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} CamBuddy Photography. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for your dream weddings.
          </p>
        </div>
      </div>
    </footer>
  );
}
