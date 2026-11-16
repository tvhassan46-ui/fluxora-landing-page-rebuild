import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quoteMessages } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supportedMedia = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav',
  'audio/ogg', 'audio/aac', 'audio/x-m4a',
])

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Sign in to view this attachment.' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id || id.length > 128) {
    return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 })
  }

  try {
    const [message] = await db
      .select({ mediaPath: quoteMessages.mediaPath })
      .from(quoteMessages)
      .where(eq(quoteMessages.id, id))
      .limit(1)

    if (!message?.mediaPath) {
      return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 })
    }

    const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(message.mediaPath)
    if (!match || !supportedMedia.has(match[1])) {
      return NextResponse.json(
        { error: 'This older attachment is no longer available in local storage.' },
        { status: 410 },
      )
    }

    const contentType = match[1]
    const bytes = Buffer.from(match[2], 'base64')
    if (!bytes.length || bytes.length > 2.5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Attachment is invalid.' }, { status: 413 })
    }

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(bytes.length),
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    })
  } catch (error) {
    console.error('Unable to retrieve chat attachment:', error)
    return NextResponse.json({ error: 'Unable to retrieve this attachment.' }, { status: 500 })
  }
}
