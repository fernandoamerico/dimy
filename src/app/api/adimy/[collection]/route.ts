import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/adimy/[collection]
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

    // Fetch documents
    const documents = await prisma.document.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'desc' }
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
      total: parsedDocs.length,
      data: parsedDocs
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/adimy/[collection]
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
