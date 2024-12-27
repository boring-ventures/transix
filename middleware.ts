import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect all dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      console.warn('[Middleware] Redirecting to login - No session')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // TODO: Check for specific roles if needed
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('role')
    //   .eq('user_id', session.user.id)
    //   .single()

    // console.log(profile);

    // if (!profile) {
    //   return NextResponse.redirect(new URL('/setup', req.url))
    // }
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