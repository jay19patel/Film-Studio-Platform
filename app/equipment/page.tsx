import { getEquipment } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Camera } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
  const [equipment, dict] = await Promise.all([
    getEquipment(),
    getDictionary(),
  ]);

  return (
    <div className="bg-paper min-h-screen pb-20">
      <PageHero
        eyebrow="The Kit"
        title={dict.equipmentPage.title}
        accent={dict.equipmentPage.titleAccent}
        subtitle={dict.equipmentPage.subtitle}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((eq, i) => (
            <Reveal key={eq.id} delay={(i % 6) * 0.06} className="card-elevated rounded-2xl overflow-hidden group">
              <div className="h-48 bg-black/[0.02] flex items-center justify-center overflow-hidden">
                {eq.image ? (
                  <img src={eq.image} alt={eq.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <Camera className="h-12 w-12 text-ink/20" />
                )}
              </div>
              <div className="p-6">
                <span className="inline-block bg-maroon/10 text-maroon text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mb-3 border border-maroon/20">
                  {eq.category}
                </span>
                <h3 className="font-serif text-xl font-medium text-ink mb-2">{eq.name}</h3>
                <p className="text-sm text-ink/50 leading-relaxed font-light">
                  {eq.description || dict.equipmentPage.defaultDesc}
                </p>
              </div>
            </Reveal>
          ))}

          {equipment.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-ink/50">{dict.equipmentPage.emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
