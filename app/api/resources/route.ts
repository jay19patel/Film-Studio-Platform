import { NextResponse } from 'next/server';
import { getResources, saveResources, Resource } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET: Fetch all resources (Public)
export async function GET() {
  try {
    const resources = await getResources();
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// POST: Add new resource (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, pricePerDay, unit, icon } = await request.json();

    if (!name || pricePerDay === undefined || !unit) {
      return NextResponse.json({ error: 'Name, pricePerDay, and unit are required' }, { status: 400 });
    }

    const resources = await getResources();
    const newResource: Resource = {
      id: `res_${Date.now()}`,
      name,
      pricePerDay: Number(pricePerDay),
      unit,
      icon: icon || 'Camera',
    };

    resources.push(newResource);
    await saveResources(resources);

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

// PUT: Update resource (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, pricePerDay, unit, icon } = await request.json();

    if (!id || !name || pricePerDay === undefined || !unit) {
      return NextResponse.json({ error: 'All fields (id, name, pricePerDay, unit) are required' }, { status: 400 });
    }

    const resources = await getResources();
    const index = resources.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    resources[index] = {
      id,
      name,
      pricePerDay: Number(pricePerDay),
      unit,
      icon: icon || 'Camera',
    };

    await saveResources(resources);
    return NextResponse.json(resources[index]);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

// DELETE: Delete resource (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource id is required' }, { status: 400 });
    }

    const resources = await getResources();
    const filteredResources = resources.filter((r) => r.id !== id);

    if (resources.length === filteredResources.length) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await saveResources(filteredResources);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
