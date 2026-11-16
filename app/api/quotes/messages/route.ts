import { randomUUID } from 'node:crypto'
import { and, desc, eq, gt } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quoteMessages } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const rooms = {
  quotes: 'quote-lounge',
  community: 'reader-community',
} as const

const maxMessageLength = 1200
const maxAttachmentBytes = 2.5 * 1024 * 1024
const allowedMediaTypes = new Map([
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

type RoomKey = keyof typeof rooms

function getRoomKey(value: string | null): RoomKey | null {
  return value === 'community' || value === 'quotes' ? value : null
}

async function getSignedInUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch (error) {
    console.error('Session retrieval failed:', error)
    return null
  }
}

export async function GET(request: Request) {
  const requestId = randomUUID()
  try {
    console.log(`[${requestId}] GET /api/quotes/messages - room: ${new URL(request.url).searchParams.get('room')}`)
    
    const user = await getSignedInUser()
    if (!user) {
      console.warn(`[${requestId}] No user found in session`)
      return NextResponse.json({ authenticated: false, messages: [] }, { status: 401 })
    }

    const roomKey = getRoomKey(new URL(request.url).searchParams.get('room') ?? 'quotes')
    if (!roomKey) {
      console.error(`[${requestId}] Invalid room key`)
      return NextResponse.json({ error: 'Choose a valid chat room.' }, { status: 400 })
    }

    console.log(`[${requestId}] Fetching messages for room: ${rooms[roomKey]}`)
    const rows = await db
      .select()
      .from(quoteMessages)
      .where(eq(quoteMessages.roomId, rooms[roomKey]))
      .orderBy(desc(quoteMessages.createdAt))
      .limit(100)

    console.log(`[${requestId}] Found ${rows.length} messages`)
    const messages = rows.reverse().map((message) => ({
      id: message.id,
      userName: message.userName,
      body: message.body,
      mediaType: message.mediaType,
      mediaUrl: message.mediaPath
        ? `/api/quotes/messages/media?id=${encodeURIComponent(message.id)}`
        : null,
      createdAt: message.createdAt.toISOString(),
      isOwn: message.userId === user.id,
    }))

    return NextResponse.json({ authenticated: true, messages })
  } catch (error) {
    console.error(`[${requestId}] Failed to load chat messages:`, error)
    return NextResponse.json({ 
      error: 'Unable to load messages.',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getSignedInUser()
  if (!user) return NextResponse.json({ error: 'Sign in to send messages.' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Send a valid chat message.' }, { status: 400 })
  }

  const roomKey = getRoomKey(typeof formData.get('room') === 'string' ? String(formData.get('room')) : null)
  if (!roomKey) return NextResponse.json({ error: 'Choose a valid chat room.' }, { status: 400 })

  const body = typeof formData.get('body') === 'string' ? String(formData.get('body')).trim() : ''
  if (body.length > maxMessageLength) {
    return NextResponse.json({ error: 'Messages must be 1,200 characters or fewer.' }, { status: 413 })
  }

  const fileEntry = formData.get('file')
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null
  if (fileEntry !== null && typeof fileEntry !== 'string' && !(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'Choose a valid attachment.' }, { status: 400 })
  }
  if (!body && !file) return NextResponse.json({ error: 'Write a message or attach a file.' }, { status: 400 })
  if (file && file.size > maxAttachmentBytes) {
    return NextResponse.json({ error: 'Attachments must be 2.5 MB or smaller.' }, { status: 413 })
  }

  const contentType = file?.type.split(';')[0].toLowerCase()
  const extension = contentType ? allowedMediaTypes.get(contentType) : undefined
  if (file && (!contentType || !extension)) {
    return NextResponse.json({ error: 'Choose a supported image or audio format.' }, { status: 415 })
  }

  const recentMessages = await db
    .select({ id: quoteMessages.id })
    .from(quoteMessages)
    .where(and(
      eq(quoteMessages.roomId, rooms[roomKey]),
      eq(quoteMessages.userId, user.id),
      gt(quoteMessages.createdAt, new Date(Date.now() - 1500)),
    ))
    .limit(1)
  if (recentMessages.length) {
    return NextResponse.json({ error: 'Please wait before sending another message.' }, { status: 429 })
  }

  try {
    const mediaData = file && contentType
      ? `data:${contentType};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
      : null

    const [message] = await db
      .insert(quoteMessages)
      .values({
        id: randomUUID(),
        roomId: rooms[roomKey],
        userId: user.id,
        userName: user.name,
        body,
        mediaPath: mediaData,
        mediaType: contentType ?? null,
      })
      .returning()

    return NextResponse.json({
      message: {
        id: message.id,
        userName: message.userName,
        body: message.body,
        mediaType: message.mediaType,
        mediaUrl: message.mediaPath
          ? `/api/quotes/messages/media?id=${encodeURIComponent(message.id)}`
          : null,
        createdAt: message.createdAt.toISOString(),
        isOwn: true,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to send chat message:', error)
    return NextResponse.json({ error: 'Unable to send message.' }, { status: 500 })
  }
}
