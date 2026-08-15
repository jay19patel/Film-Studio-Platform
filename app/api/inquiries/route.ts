import { NextResponse } from 'next/server';
import { getInquiries, saveInquiries, Inquiry } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET: Fetch all inquiries (Admin only)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await getInquiries();
    // Sort inquiries: newest first
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// POST: Add new inquiry (Public - no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, packageId, packageName, type, customDetails } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required fields' }, { status: 400 });
    }

    const inquiries = await getInquiries();
    const newInquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      name,
      email,
      phone,
      address: address || '',
      packageId: packageId || undefined,
      packageName: packageName || 'Custom Built Package',
      type: type || 'predefined',
      customDetails: customDetails || null,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    inquiries.push(newInquiry);
    await saveInquiries(inquiries);

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

// PUT: Update inquiry status (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Inquiry ID and new status are required' }, { status: 400 });
    }

    if (!['new', 'contacted', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const inquiries = await getInquiries();
    const index = inquiries.findIndex((inq) => inq.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    inquiries[index].status = status;
    await saveInquiries(inquiries);

    return NextResponse.json(inquiries[index]);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
