import { NextResponse } from 'next/server';
import { getClients, saveClients } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { clientId } = await request.json();
    if (!clientId) return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });

    const clients = await getClients();
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx === -1) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    if (!clients[idx].totalAmount || clients[idx].totalAmount === 0) {
      return NextResponse.json({ error: 'Quotation amount is ₹0. Please edit and configure quotation price & terms before generating proposal link.' }, { status: 400 });
    }

    // Generate secure permanent token
    const token = crypto.randomBytes(32).toString('hex');

    clients[idx].proposalToken = token;
    delete clients[idx].proposalTokenExpiresAt;
    if (clients[idx].proposalStatus !== 'confirmed') {
      clients[idx].proposalStatus = 'sent';
    }

    await saveClients(clients);

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${origin}/proposal/${clientId}?token=${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      token,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate proposal link' }, { status: 500 });
  }
}
