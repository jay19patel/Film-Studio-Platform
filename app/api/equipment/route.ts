import { NextResponse } from 'next/server';
import { getEquipment, saveEquipment, Equipment } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const eq = await getEquipment();
    return NextResponse.json(eq);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const equipment = await getEquipment();
    
    const newEq: Equipment = {
      id: randomUUID(),
      name: data.name,
      category: data.category,
      description: data.description || '',
      image: data.image || ''
    };
    
    equipment.push(newEq);
    await saveEquipment(equipment);
    
    return NextResponse.json(newEq);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const equipment = await getEquipment();
    
    const index = equipment.findIndex(e => e.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    equipment[index] = { ...equipment[index], ...data };
    await saveEquipment(equipment);
    
    return NextResponse.json(equipment[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const equipment = await getEquipment();
    const updated = equipment.filter(e => e.id !== id);
    await saveEquipment(updated);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
