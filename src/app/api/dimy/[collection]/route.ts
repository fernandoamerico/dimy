import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db';

// GET /api/dimy/[collection]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const slug = (await params).collection;
    
    // Check if collection exists
    const collection = await prisma.schemaCollection.findUnique({
      where: { slug }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const page = pageParam ? parseInt(pageParam, 10) : undefined;

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    // Fetch total count for pagination metadata
    const total = await prisma.document.count({
      where: { collectionId: collection.id }
    });

    // Fetch documents
    const documents = await prisma.document.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'desc' },
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    });

    // Parse JSON data
    const parsedDocs = documents.map(doc => ({
      id: doc.id,
      ...JSON.parse(doc.data),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    return NextResponse.json({
      collection: collection.name,
      total,
      limit,
      page,
      data: parsedDocs
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dimy/[collection]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const slug = (await params).collection;
    const body = await request.json();
    
    const collection = await prisma.schemaCollection.findUnique({
      where: { slug }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const document = await prisma.document.create({
      data: {
        collectionId: collection.id,
        data: JSON.stringify(body)
      }
    });

    return NextResponse.json({
      message: 'Document created successfully',
      id: document.id,
      data: { ...body }
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
