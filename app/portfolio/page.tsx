import { getPortfolio } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Play, Image as ImageIcon } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const [portfolio, dict] = await Promise.all([
    getPortfolio(),
    getDictionary(),
  ]);

  const videos = portfolio.filter(p => p.type === 'video' || p.type === 'youtube');
  const photos = portfolio.filter(p => p.type === 'photo');

  return (
    <div className="bg-paper min-h-screen pb-20">
      <PageHero
        eyebrow="Our Work"
        title={dict.portfolioPage.title}
        accent={dict.portfolioPage.titleAccent}
        subtitle={dict.portfolioPage.subtitle}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20">

        {/* Video Highlights */}
        {videos.length > 0 && (
          <div className="mb-24">
            <Reveal className="flex items-center gap-3 mb-8 border-b border-black/10 pb-4">
              <Play className="h-5 w-5 text-maroon" />
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink">{dict.portfolioPage.cinematicFilms}</h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((video, i) => (
                <Reveal key={video.id} delay={i * 0.08}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden aspect-video bg-charcoal border border-black/5 hover:border-maroon/30 transition-all block"
                  >
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12 text-ink/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors flex flex-col justify-end p-6 md:p-8">
                      <div className="bg-maroon w-12 h-12 rounded-full flex items-center justify-center mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        <Play className="h-5 w-5 text-ink ml-1" />
                      </div>
                      <h3 className="font-serif text-2xl font-medium text-cream mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-cream/60 line-clamp-2">{video.description}</p>
                      )}
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Photo Galleries — masonry */}
        {photos.length > 0 && (
          <div>
            <Reveal className="flex items-center gap-3 mb-8 border-b border-black/10 pb-4">
              <ImageIcon className="h-5 w-5 text-maroon" />
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink">{dict.portfolioPage.photographyEditorials}</h2>
            </Reveal>
            <div className="masonry-columns">
              {photos.map((photo, i) => (
                <a
                  key={photo.id}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`masonry-item group relative block rounded-2xl overflow-hidden border border-black/5 hover:border-maroon/30 bg-charcoal transition-all animate-fadeIn ${i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'}`}
                  style={{ animationDelay: `${(i % 6) * 0.05}s` }}
                >
                  {photo.thumbnail || photo.url ? (
                    <img src={photo.thumbnail || photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-ink/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-6">
                    <h3 className="font-serif text-xl font-medium text-cream mb-1">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-xs text-cream/60 line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
