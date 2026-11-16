'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { AudioLines, FileAudio2, ImagePlus, Mic, Paperclip, Send, Smile, Sticker, X } from 'lucide-react'
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from '@/components/chat-elements/attachment'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/chat-elements/input-group'
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport } from '@/components/chat-ui/message-scroller'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { Message, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/message'
import { useLanguage } from '@/components/language-provider'
import { getQuoteChatCopy } from '@/lib/quote-chat-copy'

type ChatMessage = {
  id: string
  userName: string
  body: string
  mediaType: string | null
  mediaUrl: string | null
  createdAt: string
  isOwn: boolean
}

type MessagesResponse = {
  authenticated: boolean
  messages: ChatMessage[]
}

type ApiError = { error?: string }

const maxMediaBytes = 2.5 * 1024 * 1024
const allowedMediaTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a',
])
const emojiOptions = ['📚', '📖', '✨', '❤️', '🌿', '😂', '👏', '🤍', '🙌', '🪶', '🌙', '💬']
const stickerOptions = ['🦉', '📚', '📖', '✨', '👏', '💛', '🌙', '🌿', '🎉', '💬', '😄', '🤗']

async function fetchMessages(url: string): Promise<MessagesResponse> {
  try {
    const response = await fetch(url, { 
      cache: 'no-store',
      credentials: 'include' // Explicitly include credentials for mobile/CORS safety
    })
    
    if (response.status === 401) {
      return { authenticated: false, messages: [] }
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error body')
      console.error(`Chat fetch failed: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Unable to load messages: ${response.status}`)
    }
    
    const data = await response.json() as MessagesResponse
    return data
  } catch (err) {
    console.error('Chat fetch network/parse error:', err)
    throw err
  }
}

function formatMegabytes(size: number) {
  return (size / (1024 * 1024)).toFixed(1)
}

function formatFileType(type: string, locale: 'en' | 'ar') {
  if (type.startsWith('image/')) return locale === 'ar' ? 'صورة' : 'Image'
  return locale === 'ar' ? 'صوت' : 'Audio'
}

type ChatMode = 'quotes' | 'community' | 'club-arabic-classics' | 'club-poetry-circle' | 'club-short-stories'

const clubCopy = {
  'club-arabic-classics': {
    en: { title: 'Arabic Classics Club', description: 'Read the great works of Arabic literature together and exchange notes about each chapter.', room: 'Classics discussion', empty: 'Start with a classic you love or recommend a work to the club.', signInTitle: 'Join the classics club', signInDescription: 'Sign in to take part in the shared reading conversation.', placeholder: 'Share a thought about an Arabic classic…' },
    ar: { title: 'نادي الأدب العربي', description: 'نقرأ روائع الأدب العربي معًا ونتبادل الملاحظات حول كل فصل.', room: 'نقاش الأدب الكلاسيكي', empty: 'ابدأ بعمل أدبي تحبه أو رشّح كتابًا للنادي.', signInTitle: 'انضم إلى نادي الأدب', signInDescription: 'سجّل الدخول للمشاركة في القراءة الجماعية.', placeholder: 'شاركنا رأيك في عمل أدبي…' },
  },
  'club-poetry-circle': {
    en: { title: 'Poetry Circle', description: 'Explore poems, favorite verses, literary meanings, and the voices behind them.', room: 'Poetry conversation', empty: 'Share a verse that stayed with you.', signInTitle: 'Join the poetry circle', signInDescription: 'Sign in to share verses and discuss poetry with other readers.', placeholder: 'Share a poem or a favorite verse…' },
    ar: { title: 'حلقة الشعر', description: 'اكتشف القصائد والأبيات المفضلة ومعانيها وأصوات الشعراء.', room: 'مجلس الشعر', empty: 'شارك بيتًا شعريًا بقي في ذاكرتك.', signInTitle: 'انضم إلى حلقة الشعر', signInDescription: 'سجّل الدخول لمشاركة الأبيات ومناقشة الشعر مع القراء.', placeholder: 'شارك قصيدة أو بيتًا تحبه…' },
  },
  'club-short-stories': {
    en: { title: 'Short Story Club', description: 'Read short stories, discuss the characters, and share your interpretations.', room: 'Story discussion', empty: 'Suggest a short story to start the conversation.', signInTitle: 'Join the story club', signInDescription: 'Sign in to read and discuss stories with the group.', placeholder: 'What did you think of the story…' },
    ar: { title: 'نادي القصة القصيرة', description: 'نقرأ القصص القصيرة ونناقش شخصياتها ونشارك تأويلاتنا.', room: 'نقاش القصص', empty: 'اقترح قصة قصيرة لبدء الحوار.', signInTitle: 'انضم إلى نادي القصة', signInDescription: 'سجّل الدخول لقراءة القصص ومناقشتها مع المجموعة.', placeholder: 'ما رأيك في القصة…' },
  },
} as const

export function QuoteChat({ mode = 'quotes' }: { mode?: ChatMode }) {
  const { locale } = useLanguage()
  const sourceCopy = getQuoteChatCopy(locale)
  const copy = mode.startsWith('club-')
    ? { ...sourceCopy, ...clubCopy[mode as keyof typeof clubCopy][locale] }
    : mode === 'community'
      ? {
          ...sourceCopy,
          title: sourceCopy.communityTitle,
          description: sourceCopy.communityDescription,
          room: sourceCopy.communityRoom,
          empty: sourceCopy.communityEmpty,
          signInTitle: sourceCopy.communitySignInTitle,
          signInDescription: sourceCopy.communitySignInDescription,
          placeholder: sourceCopy.communityPlaceholder,
        }
      : sourceCopy
  const emojiPanelId = `${mode}-emoji-options`
  const stickerPanelId = `${mode}-sticker-options`
  const { data, error: loadError, isLoading, mutate } = useSWR<MessagesResponse>(`/api/quotes/messages?room=${mode}`, fetchMessages, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    errorRetryCount: 2,
  })
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<number | null>(null)
  const messages = data?.messages ?? []

  useEffect(() => {
    if (!attachment) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(attachment)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [attachment])

  useEffect(() => () => {
    if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!allowedMediaTypes.has(file.type.split(';')[0].toLowerCase())) {
      setError(copy.fileUnsupported)
      return
    }
    if (file.size > maxMediaBytes) {
      setError(copy.fileTooLarge)
      return
    }
    setError('')
    setAttachment(file)
  }

  async function startRecording() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(copy.micUnavailable)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const preferredType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      const chunks: BlobPart[] = []
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setIsRecording(false)
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        if (!blob.size) return
        if (blob.size > maxMediaBytes) {
          setError(copy.fileTooLarge)
          return
        }
        const type = blob.type.split(';')[0].toLowerCase()
        const extension = type === 'audio/mp4' || type === 'audio/x-m4a' ? 'm4a' : type === 'audio/ogg' ? 'ogg' : type === 'audio/mpeg' ? 'mp3' : 'webm'
        setAttachment(new File([blob], `voice-note.${extension}`, { type }))
      }
      recorder.onerror = () => setError(copy.micUnavailable)
      recorder.start(250)
      setIsRecording(true)
      recordingTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          setError(copy.recordingLimit)
          recorder.stop()
        }
      }, 60000)
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setError(copy.micDenied)
    }
  }

  function stopRecording() {
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (isSending) return
    const body = draft.trim()
    if (!body && !attachment) {
      setError(copy.emptyMessage)
      return
    }
    if (body.length > 1200) {
      setError(copy.messageTooLong)
      return
    }

    setError('')
    setIsSending(true)
    const formData = new FormData()
    formData.set('body', body)
    formData.set('room', mode)
    if (attachment) formData.set('file', attachment)

    try {
      const response = await fetch('/api/quotes/messages', { method: 'POST', body: formData })
      const result = await response.json().catch(() => null) as { message?: ChatMessage } & ApiError | null
      if (!response.ok) {
        setError(response.status === 401 ? copy.authExpired : response.status === 429 ? copy.rateLimited : response.status === 413 ? (attachment ? copy.fileTooLarge : copy.messageTooLong) : response.status === 415 ? copy.fileUnsupported : response.status === 400 ? copy.emptyMessage : copy.sendError)
        return
      }
      setDraft('')
      setAttachment(null)
      setEmojiOpen(false)
      setStickerOpen(false)
      await mutate()
    } catch {
      setError(copy.sendError)
    } finally {
      setIsSending(false)
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    formRef.current?.requestSubmit()
  }

  function addEmoji(emoji: string) {
    setDraft((current) => `${current}${emoji}`)
    setEmojiOpen(false)
  }

  function addSticker(sticker: string) {
    setDraft((current) => current ? `${current}${current.endsWith(' ') ? '' : ' '}${sticker}` : sticker)
    setStickerOpen(false)
  }

  const isImageAttachment = attachment?.type.startsWith('image/') ?? false
  const isAuthenticated = data?.authenticated === true

  return (
    <section className={`quote-chat${mode === 'community' ? ' community-chat' : ''}`} dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale} aria-labelledby={`${mode}-chat-title`}>
      <header className="quote-chat-heading">
        <div>
          <span className="library-eyebrow">{copy.room}</span>
          <h2 id={`${mode}-chat-title`}>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
      </header>

      {isAuthenticated ? (
        <div className="quote-chat-panel">
          <Marker variant="separator" className="quote-chat-marker"><MarkerContent>{copy.room}</MarkerContent></Marker>
          <div className="quote-chat-transcript" aria-label={copy.title}>
            <MessageScrollerProvider autoScroll>
              <MessageScroller>
                <MessageScrollerViewport className="quote-chat-viewport">
                  <MessageScrollerContent className="quote-chat-message-list">
                    {isLoading && <Marker><MarkerContent>{copy.loading}</MarkerContent></Marker>}
                    {loadError && <Marker><MarkerContent>{copy.loadError}</MarkerContent></Marker>}
                    {!isLoading && !loadError && messages.length === 0 && <Marker variant="separator"><MarkerContent>{copy.empty}</MarkerContent></Marker>}
                    {messages.map((message, index) => (
                      <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={index === messages.length - 1}>
                        <Message align={message.isOwn ? 'end' : 'start'} className="quote-chat-message">
                          <MessageContent className="quote-chat-message-content">
                            <MessageHeader className="quote-chat-message-header">{message.isOwn ? copy.you : message.userName}</MessageHeader>
                            {message.body && <Bubble variant={message.isOwn ? 'tinted' : 'secondary'} align={message.isOwn ? 'end' : 'start'} className="quote-chat-bubble"><BubbleContent><p className={stickerOptions.includes(message.body) ? 'quote-chat-sticker' : undefined} style={stickerOptions.includes(message.body) ? { fontSize: '56px', lineHeight: 1.15 } : undefined}>{message.body}</p></BubbleContent></Bubble>}
                            {message.mediaUrl && message.mediaType?.startsWith('image/') && (
                              <Attachment className="quote-chat-message-attachment" size="sm" orientation="vertical">
                                <AttachmentMedia variant="image"><img src={message.mediaUrl} alt={copy.sharedImage} loading="lazy" /></AttachmentMedia>
                                <AttachmentContent><AttachmentTitle>{copy.sharedImage}</AttachmentTitle></AttachmentContent>
                              </Attachment>
                            )}
                            {message.mediaUrl && message.mediaType?.startsWith('audio/') && (
                              <Attachment className="quote-chat-message-attachment" size="sm">
                                <AttachmentMedia><AudioLines aria-hidden="true" /></AttachmentMedia>
                                <AttachmentContent><AttachmentTitle>{copy.audioAttachment}</AttachmentTitle><audio controls preload="none" src={message.mediaUrl} aria-label={copy.audioAttachment} /></AttachmentContent>
                              </Attachment>
                            )}
                            <MessageFooter className="quote-chat-message-time"><time dateTime={message.createdAt}>{new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(message.createdAt))}</time></MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          <form ref={formRef} className="quote-chat-form" onSubmit={(event) => void sendMessage(event)}>
            {attachment && (
              <Attachment className="quote-chat-preview" state={isSending ? 'uploading' : 'done'} size="sm">
                {isImageAttachment && previewUrl
                  ? <AttachmentMedia variant="image"><img src={previewUrl} alt={copy.imagePreview} /></AttachmentMedia>
                  : <AttachmentMedia>{attachment.type.startsWith('audio/') ? <FileAudio2 aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}</AttachmentMedia>}
                <AttachmentContent>
                  <AttachmentTitle>{attachment.name}</AttachmentTitle>
                  <AttachmentDescription>{copy.attachmentDescription.replace('{type}', formatFileType(attachment.type, locale)).replace('{size}', formatMegabytes(attachment.size))}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions><AttachmentAction aria-label={copy.removeAttachment} onClick={() => setAttachment(null)}><X /></AttachmentAction></AttachmentActions>
              </Attachment>
            )}
            <InputGroup className="quote-chat-composer">
              <InputGroupTextarea
                aria-label={copy.composer}
                placeholder={copy.placeholder}
                maxLength={1200}
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                disabled={isSending || isRecording}
              />
              <InputGroupAddon align="block-end" className="quote-chat-composer-actions">
                <div className="quote-chat-toolbar">
                  <InputGroupButton type="button" aria-label={copy.emoji} aria-expanded={emojiOpen} aria-controls={emojiPanelId} onClick={() => { setEmojiOpen((open) => !open); setStickerOpen(false) }} disabled={isSending}>
                    <Smile />
                  </InputGroupButton>
                  <InputGroupButton type="button" aria-label={copy.stickers} aria-expanded={stickerOpen} aria-controls={stickerPanelId} onClick={() => { setStickerOpen((open) => !open); setEmojiOpen(false) }} disabled={isSending}>
                    <Sticker />
                  </InputGroupButton>
                  <InputGroupButton type="button" aria-label={copy.attach} onClick={() => fileInputRef.current?.click()} disabled={isSending || isRecording}>
                    <Paperclip />
                  </InputGroupButton>
                  <InputGroupButton type="button" aria-label={isRecording ? copy.stopRecording : copy.startRecording} aria-pressed={isRecording} onClick={() => isRecording ? stopRecording() : void startRecording()} disabled={isSending}>
                    {isRecording ? <X /> : <Mic />}
                  </InputGroupButton>
                  <span className="quote-chat-limit">{copy.audioNotes}</span>
                  <button className="quote-chat-send" type="submit" disabled={isSending || isRecording || (!draft.trim() && !attachment)}>
                    <Send aria-hidden="true" /> <span>{isSending ? copy.sending : copy.send}</span>
                  </button>
                </div>
              </InputGroupAddon>
            </InputGroup>
            <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif,audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/x-m4a" aria-label={copy.chooseFile} onChange={handleFileChange} />
            {isRecording && <p className="quote-chat-recording" role="status"><span aria-hidden="true" />{copy.recording}</p>}
            {emojiOpen && <div className="quote-chat-emoji-panel" id={emojiPanelId} role="group" aria-label={copy.emojiOptions}>{emojiOptions.map((emoji) => <button type="button" key={emoji} aria-label={copy.insertEmoji.replace('{emoji}', emoji)} onClick={() => addEmoji(emoji)}>{emoji}</button>)}</div>}
            {stickerOpen && <div className="quote-chat-emoji-panel quote-chat-sticker-panel" id={stickerPanelId} role="group" aria-label={copy.stickerOptions}>{stickerOptions.map((sticker) => <button type="button" key={sticker} aria-label={copy.insertSticker.replace('{emoji}', sticker)} onClick={() => addSticker(sticker)}>{sticker}</button>)}</div>}
            {error && <p className="quote-chat-error" role="alert">{error}</p>}
          </form>
        </div>
      ) : data?.authenticated === false ? (
        <div className="quote-chat-signin">
          <h3>{copy.signInTitle}</h3>
          <p>{copy.signInDescription}</p>
          <div><Link className="read-book-button" href="/sign-in">{copy.signIn}</Link><Link className="quote-chat-signup" href="/sign-up">{copy.createAccount}</Link></div>
        </div>
      ) : (
        <div className="quote-chat-signin" role={loadError ? 'alert' : 'status'}>
          <p>{loadError ? copy.loadError : copy.loading}</p>
          {loadError && <button type="button" className="quote-chat-retry" onClick={() => void mutate()}>{copy.retry}</button>}
        </div>
      )}
    </section>
  )
}
