import { del, put } from '@vercel/blob'
import { and, count, desc, eq, gte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quoteMessages } from '@/lib/db/schema'

const roomId = 'quote-lounge'
const maxMessageLength = 1200
const maxMediaBytes = 4 * 1024 * 1024
const supportedMedia = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['audio/webm', 'webm'],
  ['audio/mp4', 'm4a'],
  ['audio/mpeg', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/ogg', 'ogg'],
  ['audio/aac', 'aac'],
  ['audio/x-m4a', 'm4a'],
])

function mediaUrl(pathname: string | null) {
  return pathname ? `/api/quotes/messages/media?pathname=${encodeURIComponent(pathname)}` : null
}

function serializeMessage(message: typeof quoteMessages.$inferSelect, currentUserId: string) {
  return {
    id: message.id,
    userName: message.userName,
    body: message.body,
    mediaType: message.mediaType,
    mediaUrl: mediaUrl(message.mediaPath),
    createdAt: message.createdAt.toISOString(),
    isOwn: message.userId === currentUserId,
  }
}

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ authenticated: false, messages: [] }, { status: 401 })

  try {
    const messages = await db
      .select()
      .from(quoteMessages)
      .where(eq(quoteMessages.roomId, roomId))
      .orderBy(desc(quoteMessages.createdAt))
      .limit(50)

    return NextResponse.json({
      authenticated: true,
      messages: messages.reverse().map((message) => serializeMessage(message, user.id)),
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load the conversation.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to join the conversation.' }, { status: 401 })

  let uploadedBlob: { url: string } | null = null

  try {
    const recentMessages = await db
      .select({ value: count() })
      .from(quoteMessages)
      .where(and(
        eq(quoteMessages.userId, user.id),
        gte(quoteMessages.createdAt, new Date(Date.now() - 30_000)),
      ))

    if (Number(recentMessages[0]?.value ?? 0) >= 5) {
      return NextResponse.json({ error: 'Please wait a moment before sending another message.' }, { status: 429 })
    }

    const formData = await request.formData()
    const rawBody = formData.get('body')
    const body = typeof rawBody === 'string' ? rawBody.trim() : ''
    if (body.length > maxMessageLength) {
      return NextResponse.json({ error: `Messages must be ${maxMessageLength} characters or fewer.` }, { status: 413 })
    }

    const formFile = formData.get('file')
    const file = formFile instanceof File && formFile.size > 0 ? formFile : null
    if (formFile && !(formFile instanceof File)) {
      return NextResponse.json({ error: 'Choose a supported image or audio file.' }, { status: 400 })
    }
    if (!body && !file) {
      return NextResponse.json({ error: 'Write a message or attach a file.' }, { status: 400 })
    }
    if (file && file.size > maxMediaBytes) {
      return NextResponse.json({ error: 'Attachments must be 4 MB or smaller.' }, { status: 413 })
    }

    let pathname: string | null = null
    let mediaType: string | null = null

    if (file) {
      mediaType = file.type.split(';')[0].trim().toLowerCase()
      const extension = supportedMedia.get(mediaType)
      if (!extension) {
        return NextResponse.json({ error: 'Only common image and audio formats are supported.' }, { status: 415 })
      }

      const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || 'reader'
      pathname = `quote-chat/${safeUserId}/${crypto.randomUUID()}.${extension}`
      uploadedBlob = await put(pathname, file, {
        access: 'private',
        addRandomSuffix: false,
        contentType: mediaType,
      })
    }

    const [message] = await db.insert(quoteMessages).values({
      id: crypto.randomUUID(),
      roomId,
      userId: user.id,
      userName: user.name.trim().slice(0, 80) || 'Reader',
      body,
      mediaPath: pathname,
      mediaType,
    }).returning()

    if (!message) throw new Error('Message insert returned no row')
    return NextResponse.json({ message: serializeMessage(message, user.id) }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    if (uploadedBlob) {
      await del(uploadedBlob.url).catch(() => undefined)
    }
    return NextResponse.json({ error: 'Your message could not be sent. Please try again.' }, { status: 500 })
  }
}
