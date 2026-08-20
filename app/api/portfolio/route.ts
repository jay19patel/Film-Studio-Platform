import { NextResponse } from 'next/server';
import { getPortfolio, savePortfolio, PortfolioItem } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const port = await getPortfolio();
    return NextResponse.json(port);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const portfolio = await getPortfolio();
    
    const newItem: PortfolioItem = {
      id: randomUUID(),
      title: data.title,
      type: data.type,
      url: data.url,
      thumbnail: data.thumbnail || '',
      description: data.description || ''
    };
    
    portfolio.push(newItem);
    await savePortfolio(portfolio);
    
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const portfolio = await getPortfolio();
    
    const index = portfolio.findIndex(p => p.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    portfolio[index] = { ...portfolio[index], ...data };
    await savePortfolio(portfolio);
    
    return NextResponse.json(portfolio[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const portfolio = await getPortfolio();
    const updated = portfolio.filter(p => p.id !== id);
    await savePortfolio(updated);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
