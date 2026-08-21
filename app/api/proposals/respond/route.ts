import { NextResponse } from 'next/server';
import { getClients, saveClients } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { clientId, token, action, notes } = await request.json();

    if (!clientId || !token || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const clients = await getClients();
    const idx = clients.findIndex((c) => c.id === clientId);

    if (idx === -1) {
      return NextResponse.json({ error: 'Proposal quotation not found' }, { status: 404 });
    }

    const client = clients[idx];

    // Validate token and 24-hour expiration
    if (!client.proposalToken || client.proposalToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired proposal token' }, { status: 403 });
    }

    if (client.proposalTokenExpiresAt && Date.now() > client.proposalTokenExpiresAt) {
      return NextResponse.json({ error: 'This proposal link has expired after 24 hours. Please request a fresh link.' }, { status: 410 });
    }

    // Process client response
    if (action === 'accept') {
      clients[idx].proposalStatus = 'confirmed';
      clients[idx].proposalConfirmedAt = new Date().toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      clients[idx].proposalClientNotes = notes || 'Confirmed & Accepted by client.';
    } else if (action === 'reject') {
      clients[idx].proposalStatus = 'rejected';
      clients[idx].proposalClientNotes = notes || 'Revision requested by client.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await saveClients(clients);

    return NextResponse.json({
      success: true,
      status: clients[idx].proposalStatus,
      confirmedAt: clients[idx].proposalConfirmedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process proposal response' }, { status: 500 });
  }
}
