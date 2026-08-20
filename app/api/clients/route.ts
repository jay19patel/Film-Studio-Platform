import { NextResponse } from 'next/server';
import { getClients, saveClients, Client } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clients = await getClients();
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const newClient: Client = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      packageName: data.packageName || 'Unknown',
      status: data.status || 'onboarding',
      events: data.events || [],
      notes: data.notes || '',
    };

    const clients = await getClients();
    clients.push(newClient);
    await saveClients(clients);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const clients = await getClients();
    const idx = clients.findIndex(c => c.id === data.id);
    if (idx === -1) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    clients[idx] = { ...clients[idx], ...data };
    await saveClients(clients);

    return NextResponse.json(clients[idx]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    let clients = await getClients();
    clients = clients.filter(c => c.id !== id);
    await saveClients(clients);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
