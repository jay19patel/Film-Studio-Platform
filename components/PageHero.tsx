import { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Shared asymmetric page-header used by every secondary public page
 * (About, Portfolio, Contact, Equipment, Build-Your-Own). Left-aligned
 * rather than centered, with a large serif watermark for editorial depth.
 */
export default function PageHero({ eyebrow, title, accent, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-paper cinematic-overlay border-b border-maroon/12">
      <div
        className="pointer-events-none absolute -top-10 right-0 select-none font-serif text-[10rem] sm:text-[14rem] leading-none text-maroon/[0.07] italic"
        aria-hidden="true"
      >
        {accent || title.split(' ')[0]}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(180,134,58,0.10),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-2xl animate-slideUp">
          {eyebrow && (
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-maroon/60" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-maroon">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-ink leading-[1.05]">
            {title}
            {accent && (
              <span className="block font-caveat text-3xl sm:text-4xl text-maroon font-normal mt-2">
                {accent}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="mt-6 text-base sm:text-lg text-ink/60 leading-relaxed font-light">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
