import { Mail, Phone, MapPin, Camera, Video, Users, Sparkles, Heart, Film } from 'lucide-react';
import Image from 'next/image';
import { getDictionary } from '@/lib/dictionaries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | CamBuddy',
  description: 'Meet the creative crew behind CamBuddy Studios.',
};

const crew = [
  {
    name: 'Minesh Patel',
    role: 'Lead Photographer & Cinematographer',
    image: '/uploads/minesh_patel.jpg',
    instagram: '@_minesh_p',
    instagramUrl: 'https://www.instagram.com/_minesh_p/',
    mobile: '+91 98765 43210',
  },
];

export default async function AboutPage() {
  const dict = await getDictionary();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section matching Portfolio / Equipment header */}
      <section className="bg-gray-50 pt-24 pb-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center animate-slideUp">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
            {dict.aboutPage.title}{' '}
            <span className="font-caveat text-maroon font-normal lowercase tracking-normal">
              {dict.aboutPage.titleAccent}
            </span>
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            {dict.aboutPage.subtitle}
          </p>
        </div>
      </section>

      {/* The Crew Grid */}
      <section className="py-20 bg-white relative">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {crew.map((member, idx) => (
            <div key={idx} className="group relative">
              <div className="relative h-[450px] md:h-[520px] w-full rounded-[2.5rem] overflow-hidden mb-6 shadow-md border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
              </div>
              <div className="text-center mt-6">
                <h3 className="font-serif text-3xl font-bold text-neutral-900 uppercase tracking-wide">{member.name}</h3>
                <p className="text-maroon font-bold text-xs uppercase tracking-widest mt-1.5 mb-4">{member.role}</p>
                <div className="flex items-center justify-center gap-3">
                  <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-pink-600 transition-colors bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl shadow-xs">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                    <span>{member.instagram}</span>
                  </a>
                  <a href={`tel:${member.mobile.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-maroon transition-colors bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl shadow-xs">
                    <Phone className="h-4 w-4 text-maroon" />
                    <span>{member.mobile}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Highlight */}
      <section className="py-24 bg-maroon text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-widest mb-16">
            {dict.aboutPage.whatWeDoTitle} <span className="text-maroon-300">{dict.aboutPage.whatWeDoAccent}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <Camera className="h-10 w-10 mb-5 text-maroon-200" />
              <h4 className="font-bold text-sm tracking-widest uppercase mb-2">{dict.aboutPage.candidTitle}</h4>
              <p className="text-maroon-100 text-xs leading-relaxed max-w-xs text-center font-medium opacity-80">{dict.aboutPage.candidDesc}</p>
            </div>
            <div className="flex flex-col items-center">
              <Video className="h-10 w-10 mb-5 text-maroon-200" />
              <h4 className="font-bold text-sm tracking-widest uppercase mb-2">{dict.aboutPage.filmsTitle}</h4>
              <p className="text-maroon-100 text-xs leading-relaxed max-w-xs text-center font-medium opacity-80">{dict.aboutPage.filmsDesc}</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-10 w-10 mb-5 text-maroon-200" />
              <h4 className="font-bold text-sm tracking-widest uppercase mb-2">{dict.aboutPage.prewedTitle}</h4>
              <p className="text-maroon-100 text-xs leading-relaxed max-w-xs text-center font-medium opacity-80">{dict.aboutPage.prewedDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Socials */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-200 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-maroon/5 rounded-full blur-[80px]" />
            
            <div className="text-center mb-12 relative z-10">
              <Sparkles className="h-8 w-8 text-maroon mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-widest mb-4">
                {dict.aboutPage.connectTitle} <span className="text-maroon">{dict.aboutPage.connectAccent}</span>
              </h2>
              <p className="text-neutral-500 text-sm font-medium">{dict.aboutPage.connectSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              
              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-maroon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-1">{dict.aboutPage.locationTitle}</h5>
                    <p className="text-sm font-semibold text-neutral-800">
                      123 Photography Lane, Creative District<br />
                      Ahmedabad, Gujarat 380001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-maroon">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-1">{dict.aboutPage.phoneTitle}</h5>
                    <a href="tel:+919876543210" className="text-sm font-semibold text-neutral-800 hover:text-maroon transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-maroon">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-1">{dict.aboutPage.emailTitle}</h5>
                    <a href="mailto:hello@cambuddy.com" className="text-sm font-semibold text-neutral-800 hover:text-maroon transition-colors">
                      hello@cambuddy.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-6 md:pl-12 md:border-l border-gray-100">
                <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">{dict.aboutPage.followTitle}</h5>
                
                <a href="#" className="flex items-center gap-4 group">
                  <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-pink-600 group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm group-hover:text-pink-600 transition-colors">@cambuddystudios</span>
                </a>
                
                <a href="#" className="flex items-center gap-4 group">
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 group-hover:scale-110 transition-transform">
                    <Film className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm group-hover:text-red-600 transition-colors">CamBuddy Films</span>
                </a>
              </div>
              
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
