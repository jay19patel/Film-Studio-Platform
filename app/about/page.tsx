import { Mail, Phone, MapPin, Camera, Video, Users, Sparkles, Heart, Film } from 'lucide-react';
import Image from 'next/image';
import { getDictionary } from '@/lib/dictionaries';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';

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
    <div className="min-h-screen bg-paper">
      <PageHero
        eyebrow="The Studio"
        title={dict.aboutPage.title}
        accent={dict.aboutPage.titleAccent}
        subtitle={dict.aboutPage.subtitle}
      />

      {/* The Crew */}
      <section className="py-24 bg-paper relative">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {crew.map((member, idx) => (
            <Reveal key={idx} className="group relative">
              <div className="relative h-[450px] md:h-[520px] w-full rounded-[2.5rem] overflow-hidden mb-6 border border-black/5 group-hover:border-maroon/30 shadow-xl shadow-black/10 transition-all duration-500">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 768px) 448px, 90vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              </div>
              <div className="text-center mt-6">
                <h3 className="font-serif text-3xl font-medium text-ink tracking-wide">{member.name}</h3>
                <p className="text-maroon font-bold text-xs uppercase tracking-widest mt-1.5 mb-4">{member.role}</p>
                <div className="flex items-center justify-center gap-3">
                  <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-ink/70 hover:text-pink-500 transition-colors bg-black/[0.02] border border-black/10 px-4 py-2.5 rounded-xl">
                    <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
                    <span>{member.instagram}</span>
                  </a>
                  <a href={`tel:${member.mobile.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-xs font-bold text-ink/70 hover:text-maroon transition-colors bg-black/[0.02] border border-black/10 px-4 py-2.5 rounded-xl">
                    <Phone className="h-4 w-4 text-maroon" />
                    <span>{member.mobile}</span>
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What We Do — asymmetric, no icon-card grid */}
      <section className="py-24 bg-charcoal-soft cinematic-overlay border-y border-black/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block mb-4">
              What We Do
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-ink tracking-tight">
              {dict.aboutPage.whatWeDoTitle}{' '}
              <span className="text-maroon italic">{dict.aboutPage.whatWeDoAccent}</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/10 border-t border-black/10">
            {[
              { icon: Camera, title: dict.aboutPage.candidTitle, desc: dict.aboutPage.candidDesc },
              { icon: Video, title: dict.aboutPage.filmsTitle, desc: dict.aboutPage.filmsDesc },
              { icon: Users, title: dict.aboutPage.prewedTitle, desc: dict.aboutPage.prewedDesc },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1} className="pt-8 sm:pt-10 sm:px-8 first:sm:pl-0">
                <item.icon className="h-8 w-8 mb-5 text-maroon" />
                <h4 className="font-bold text-sm tracking-widest uppercase mb-2 text-ink">{item.title}</h4>
                <p className="text-ink/50 text-xs leading-relaxed max-w-xs font-light">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Socials */}
      <section className="py-24 bg-paper">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="card-elevated rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-maroon/10 rounded-full blur-[80px]" />

            <div className="text-center mb-12 relative z-10">
              <Sparkles className="h-8 w-8 text-maroon mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-5xl font-medium text-ink tracking-tight mb-4">
                {dict.aboutPage.connectTitle} <span className="text-maroon italic">{dict.aboutPage.connectAccent}</span>
              </h2>
              <p className="text-ink/50 text-sm font-light">{dict.aboutPage.connectSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/[0.02] rounded-xl border border-black/10 text-maroon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">{dict.aboutPage.locationTitle}</h5>
                    <p className="text-sm font-semibold text-ink">
                      123 Photography Lane, Creative District<br />
                      Ahmedabad, Gujarat 380001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/[0.02] rounded-xl border border-black/10 text-maroon">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">{dict.aboutPage.phoneTitle}</h5>
                    <a href="tel:+919876543210" className="text-sm font-semibold text-ink hover:text-maroon transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/[0.02] rounded-xl border border-black/10 text-maroon">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-1">{dict.aboutPage.emailTitle}</h5>
                    <a href="mailto:hello@cambuddy.com" className="text-sm font-semibold text-ink hover:text-maroon transition-colors">
                      hello@cambuddy.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-6 md:pl-12 md:border-l border-black/10">
                <h5 className="font-bold text-xs uppercase tracking-widest text-ink/40 mb-6">{dict.aboutPage.followTitle}</h5>

                <a href="#" className="flex items-center gap-4 group">
                  <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm text-ink/80 group-hover:text-pink-500 transition-colors">@cambuddystudios</span>
                </a>

                <a href="#" className="flex items-center gap-4 group">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
                    <Film className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm text-ink/80 group-hover:text-red-500 transition-colors">CamBuddy Films</span>
                </a>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
