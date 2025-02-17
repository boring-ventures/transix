import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_ROUTES, DEFAULT_ROUTES } from '@/config/roleRoutes'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      console.warn('[Middleware] Redirecting to login - No session')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Obtener el perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      console.warn('[Middleware] Redirecting to setup - No profile')
      //return NextResponse.redirect(new URL('/setup', req.url))
      return null;
    }

    const role = profile.role as keyof typeof ROLE_ROUTES
    const currentPath = req.nextUrl.pathname

    console.log(`[Middleware] User role: ${role}`);
    console.log(`[Middleware] Current path: ${currentPath}`);
    console.log(`[Middleware] Allowed paths for role: ${ROLE_ROUTES[role].join(', ')}`);

    // Verificar si la ruta actual está permitida para el rol del usuario
    const isAllowed = ROLE_ROUTES[role].some(route => 
      currentPath === route || currentPath.endsWith(`${route}`)
    )

    if (!isAllowed) {
      console.warn(`[Middleware] Redirecting to default route - Unauthorized access to ${currentPath}`)
      return NextResponse.redirect(new URL(DEFAULT_ROUTES[role], req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/setup',
  ]
}