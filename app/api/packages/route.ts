import { NextResponse } from 'next/server';
import { getPackages, savePackages, Package } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET: Fetch packages (Public - returns published by default or all if admin/requested)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status'); // e.g. "published"
    const id = searchParams.get('id'); // Get single package by ID

    const packages = await getPackages();

    if (id) {
      const pkg = packages.find((p) => p.id === id);
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json(pkg);
    }

    if (filterStatus) {
      const filtered = packages.filter((p) => p.status === filterStatus);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

// POST: Add new package (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, days, addons, autoPrice, finalPrice, status } = body;

    if (!name || !days || !Array.isArray(days)) {
      return NextResponse.json({ error: 'Package name and days list are required' }, { status: 400 });
    }

    const packages = await getPackages();
    const newPackage: Package = {
      id: `pkg_${Date.now()}`,
      name,
      days,
      addons: addons || [],
      autoPrice: Number(autoPrice) || 0,
      finalPrice: finalPrice !== undefined ? Number(finalPrice) : (Number(autoPrice) || 0),
      status: status || 'draft',
    };

    packages.push(newPackage);
    await savePackages(packages);

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}

// PUT: Update package (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, days, addons, autoPrice, finalPrice, status } = body;

    if (!id || !name || !days || !Array.isArray(days)) {
      return NextResponse.json({ error: 'Package ID, name, and days list are required' }, { status: 400 });
    }

    const packages = await getPackages();
    const index = packages.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    packages[index] = {
      id,
      name,
      days,
      addons: addons || [],
      autoPrice: Number(autoPrice) || 0,
      finalPrice: finalPrice !== undefined ? Number(finalPrice) : (Number(autoPrice) || 0),
      status: status || 'draft',
    };

    await savePackages(packages);
    return NextResponse.json(packages[index]);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

// DELETE: Delete package (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const packages = await getPackages();
    const filteredPackages = packages.filter((p) => p.id !== id);

    if (packages.length === filteredPackages.length) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    await savePackages(filteredPackages);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
