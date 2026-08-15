import { NextResponse } from 'next/server';
import { getAddons, saveAddons, Addon } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET: Fetch all addons (Public)
export async function GET() {
  try {
    const addons = await getAddons();
    return NextResponse.json(addons);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
  }
}

// POST: Add new addon (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, type } = await request.json();

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const addons = await getAddons();
    const newAddon: Addon = {
      id: `addon_${Date.now()}`,
      name,
      price: Number(price),
      type: type || 'one-time',
    };

    addons.push(newAddon);
    await saveAddons(addons);

    return NextResponse.json(newAddon, { status: 201 });
  } catch (error) {
    console.error('Error creating addon:', error);
    return NextResponse.json({ error: 'Failed to create addon' }, { status: 500 });
  }
}

// PUT: Update addon (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, price, type } = await request.json();

    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: 'All fields (id, name, price) are required' }, { status: 400 });
    }

    const addons = await getAddons();
    const index = addons.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
    }

    addons[index] = {
      id,
      name,
      price: Number(price),
      type: type || 'one-time',
    };

    await saveAddons(addons);
    return NextResponse.json(addons[index]);
  } catch (error) {
    console.error('Error updating addon:', error);
    return NextResponse.json({ error: 'Failed to update addon' }, { status: 500 });
  }
}

// DELETE: Delete addon (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Addon id is required' }, { status: 400 });
    }

    const addons = await getAddons();
    const filteredAddons = addons.filter((a) => a.id !== id);

    if (addons.length === filteredAddons.length) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 });
    }

    await saveAddons(filteredAddons);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting addon:', error);
    return NextResponse.json({ error: 'Failed to delete addon' }, { status: 500 });
  }
}
