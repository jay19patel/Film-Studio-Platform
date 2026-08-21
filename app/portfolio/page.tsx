import { getPortfolio } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Play, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const [portfolio, dict] = await Promise.all([
    getPortfolio(),
    getDictionary(),
  ]);
  
  const videos = portfolio.filter(p => p.type === 'video' || p.type === 'youtube');
  const photos = portfolio.filter(p => p.type === 'photo');

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16 animate-slideUp">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-4">{dict.portfolioPage.title} <span className="font-caveat text-maroon font-normal lowercase tracking-normal">{dict.portfolioPage.titleAccent}</span></h1>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            {dict.portfolioPage.subtitle}
          </p>
        </div>

        {/* Video Highlights */}
        {videos.length > 0 && (
          <div className="mb-20 animate-slideUp stagger-1">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
              <Play className="h-6 w-6 text-maroon" />
              <h2 className="font-serif text-3xl font-bold text-neutral-900">{dict.portfolioPage.cinematicFilms}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map(video => (
                <a 
                  key={video.id} 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative rounded-3xl overflow-hidden aspect-video bg-gray-100 shadow-sm hover:shadow-xl transition-all block"
                >
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-6 md:p-8">
                    <div className="bg-maroon w-12 h-12 rounded-full flex items-center justify-center mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <Play className="h-5 w-5 text-white ml-1" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-gray-200 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Photo Galleries */}
        {photos.length > 0 && (
          <div className="animate-slideUp stagger-2">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
              <ImageIcon className="h-6 w-6 text-maroon" />
              <h2 className="font-serif text-3xl font-bold text-neutral-900">{dict.portfolioPage.photographyEditorials}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {photos.map(photo => (
                <a 
                  key={photo.id} 
                  href={photo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-gray-100 shadow-sm hover:shadow-xl transition-all block"
                >
                  {photo.thumbnail || photo.url ? (
                    <img src={photo.thumbnail || photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="font-serif text-xl font-bold text-white mb-1">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-xs text-gray-300 line-clamp-2">{photo.description}</p>
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
