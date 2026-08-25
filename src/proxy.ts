import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || 'adimy-super-secret-key-change-me'
const key = new TextEncoder().encode(secretKey)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas que não precisam de sessão validada pelo middleware
  const isPublicRoute = pathname === '/login' || pathname === '/setup'

  // Recupera o cookie
  const sessionCookie = request.cookies.get('adimy_session')?.value

  let isSessionValid = false

  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] })
      isSessionValid = true
    } catch (error) {
      isSessionValid = false
    }
  }

  // Se não estiver logado e não for rota pública, redireciona para /login
  if (!isSessionValid && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se estiver logado e tentar acessar login ou setup, manda para o dashboard
  if (isSessionValid && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Executa o middleware em todas as rotas, exceto:
  // - api (rotas de API podem ter sua própria autenticação)
  // - _next/static (arquivos estáticos)
  // - _next/image (arquivos de imagem)
  // - favicon.ico (favicon)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
