import { get } from '@vercel/blob'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in to view this attachment.' }, { status: 401 })

  const pathname = request.nextUrl.searchParams.get('pathname')
  const parts = pathname?.split('/') ?? []
  if (!pathname || parts.length !== 3 || parts[0] !== 'quote-chat' || parts.some((part) => !part || part === '.' || part === '..')) {
    return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) return new NextResponse('Not found', { status: 404 })
    const securityHeaders = {
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': result.blob.contentType ?? 'application/octet-stream',
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, { status: 304, headers: securityHeaders })
    }

    return new NextResponse(result.stream, { headers: securityHeaders })
  } catch {
    return NextResponse.json({ error: 'Unable to retrieve this attachment.' }, { status: 500 })
  }
}
