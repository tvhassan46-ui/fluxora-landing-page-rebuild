const GOOGLE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single'
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get'

function splitIntoChunks(value: string, maxLength = 420): string[] {
  const chunks: string[] = []
  let remaining = value.trim()

  while (remaining.length > maxLength) {
    let boundary = remaining.lastIndexOf(' ', maxLength)
    if (boundary < maxLength * 0.55) boundary = maxLength
    chunks.push(remaining.slice(0, boundary).trim())
    remaining = remaining.slice(boundary).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks
}

async function translateWithGoogle(text: string): Promise<string> {
  const url = new URL(GOOGLE_ENDPOINT)
  url.search = new URLSearchParams({
    client: 'gtx',
    sl: 'ar',
    tl: 'en',
    dt: 't',
    ie: 'UTF-8',
    oe: 'UTF-8',
    q: text,
  }).toString()

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'LIVA-Reader/1.0' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`Google translation returned ${response.status}`)

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Unexpected Google translation response')
  const result = (data[0] as unknown[])
    .filter((part): part is unknown[] => Array.isArray(part) && typeof part[0] === 'string')
    .map((part) => part[0] as string)
    .join('')
    .trim()
  if (!result) throw new Error('Google returned an empty translation')
  return result
}

async function translateWithMyMemory(text: string): Promise<string> {
  const translated: string[] = []
  for (const chunk of splitIntoChunks(text)) {
    const url = new URL(MYMEMORY_ENDPOINT)
    url.search = new URLSearchParams({ q: chunk, langpair: 'ar|en' }).toString()
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'LIVA-Reader/1.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error(`MyMemory translation returned ${response.status}`)
    const data = await response.json() as {
      responseStatus?: number
      responseData?: { translatedText?: string }
    }
    const result = data.responseData?.translatedText?.trim()
    if (!result || data.responseStatus !== 200) throw new Error('MyMemory did not return a translation')
    translated.push(result)
  }
  return translated.join(' ')
}

export async function translateArabicToEnglish(sourceText: string): Promise<string> {
  const paragraphs = sourceText.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
  const output: string[] = []

  for (const paragraph of paragraphs) {
    try {
      output.push(await translateWithGoogle(paragraph))
    } catch (googleError) {
      console.warn('Google translation unavailable; trying secondary provider:', googleError)
      output.push(await translateWithMyMemory(paragraph))
    }
  }

  return output.join('\n\n')
}
