import { getEquipment } from '@/lib/db';
import { getDictionary } from '@/lib/dictionaries';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
  const [equipment, dict] = await Promise.all([
    getEquipment(),
    getDictionary(),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16 animate-slideUp">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-4">{dict.equipmentPage.title} <span className="font-caveat text-maroon font-normal lowercase tracking-normal">{dict.equipmentPage.titleAccent}</span></h1>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            {dict.equipmentPage.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp stagger-1">
          {equipment.map(eq => (
            <div key={eq.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group">
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {eq.image ? (
                  <img src={eq.image} alt={eq.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <Camera className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <div className="p-6">
                <span className="inline-block bg-maroon/5 text-maroon text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mb-3 border border-maroon/10">
                  {eq.category}
                </span>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{eq.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {eq.description || dict.equipmentPage.defaultDesc}
                </p>
              </div>
            </div>
          ))}

          {equipment.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500">{dict.equipmentPage.emptyText}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
