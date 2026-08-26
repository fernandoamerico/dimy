import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/db';

async function authenticateRequest(request: NextRequest, requiredRole: 'read' | 'write' = 'read') {
  // Em desenvolvimento local, se não houver cabeçalho, podemos criar uma chave padrão no banco
  // Mas para produção e para o fluxo correto, exigimos o cabeçalho Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Faltando cabeçalho Authorization ou formato inválido', status: 401 };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Token não encontrado', status: 401 };
  }
  const apiKey = await prisma.apiKey.findUnique({ where: { key: token } });
  
  if (!apiKey || !apiKey.active) {
    return { error: 'Chave de API inválida ou inativa', status: 403 };
  }
  
  if (requiredRole === 'write' && apiKey.role !== 'write') {
    return { error: 'A Chave de API não tem permissões de escrita', status: 403 };
  }
  
  return { success: true };
}

// GET /api/dimy/[collection]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const auth = await authenticateRequest(request, 'read');
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status as number });
    }

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
    const sortParam = searchParams.get('sort');

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    // Fetch all documents from the DB first (in-memory filtering is required because data is JSON string)
    const documents = await prisma.document.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON data
    let parsedDocs = documents.map(doc => ({
      id: doc.id,
      ...JSON.parse(doc.data),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    // Dynamic filtering
    searchParams.forEach((value, key) => {
      if (key !== 'limit' && key !== 'page' && key !== 'sort') {
        parsedDocs = parsedDocs.filter(doc => String(doc[key]) === value);
      }
    });

    // Sorting
    if (sortParam) {
      const parts = sortParam.split(':');
      const field = parts[0];
      const direction = parts[1];
      if (field) {
        parsedDocs.sort((a, b) => {
          const valA = a[field as keyof typeof a];
          const valB = b[field as keyof typeof b];
          if (valA < valB) return direction === 'desc' ? 1 : -1;
          if (valA > valB) return direction === 'desc' ? -1 : 1;
          return 0;
        });
      }
    }

    const total = parsedDocs.length;

    // Pagination
    if (skip !== undefined || take !== undefined) {
      const start = skip || 0;
      const end = take ? start + take : undefined;
      parsedDocs = parsedDocs.slice(start, end);
    }

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
    const auth = await authenticateRequest(request, 'write');
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status as number });
    }

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
