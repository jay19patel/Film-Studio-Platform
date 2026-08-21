'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Don't show public footer on admin pages or proposal review pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/proposal')) {
    return null;
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-maroon shadow-sm flex-shrink-0">
              <img src="/logo.png" alt="Minesh_P" className="w-full h-full object-cover object-center" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-wide font-extrabold flex items-center">
                <span className="text-maroon font-black">M</span>
                <span className="text-neutral-900">inesh_</span>
                <span className="text-maroon font-black">P</span>
              </span>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                Luxury Wedding Photography & Films
              </p>
            </div>
          </div>

          {/* Clean Tagline */}
          <p className="text-xs md:text-sm max-w-md text-neutral-500 leading-relaxed text-center font-medium">
            Crafting timeless cinematic wedding films & stunning photographs of your special day.
          </p>

          {/* Clean Essential Links (Terms & Conditions, Admin) */}
          <div className="flex items-center gap-6 text-xs font-bold tracking-widest uppercase text-neutral-600">
            <Link href="/terms" className="hover:text-maroon transition-colors duration-200">
              Terms & Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/admin/login" className="hover:text-maroon transition-colors duration-200">
              Admin
            </Link>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-neutral-400 gap-2">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-maroon font-bold">Minesh_P Studio</span>. All rights reserved.
          </p>
          <p>
            Powered by <span className="text-maroon font-bold">NJTechStudio</span> | Developed by <span className="text-maroon font-bold">Jay Patel</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
