import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// In-memory rate limiting (простое решение для MVP)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_REQUESTS = 15
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 минут

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  
  // Удаляем старые запросы за пределами окна
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  
  if (recentTimestamps.length >= RATE_LIMIT_REQUESTS) {
    return false
  }
  
  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  return true
}

const SYSTEM_PROMPT = `Du bist DEASY, ein KI-Assistent, der deutschen Behördenbriefe analysiert.

DEINE AUFGABE:
1. Analysiere den hochgeladenen Brief/das Dokument
2. Erkläre auf Deutsch (B1-Niveau, einfache Sätze), was dieser Brief bedeutet
3. Identifiziere kritische Fristen und Deadlines
4. Schlage konkrete nächste Schritte vor
5. Warne vor zeitkritischen Beträgen (Kindergeld, Bürgergeld, Bafög)

ANTWORTE IMMER ALS JSON (gültig!):
{
  "success": true,
  "document_type": "z.B. Kindergeldantrag, Bußgeldbescheid, etc.",
  "summary": "2-3 Sätze: Was ist das Wichtigste in diesem Brief?",
  "explanation": "Detaillierte Erklärung in einfachen Worten",
  "urgent_tasks": [
    {
      "task": "Was genau tun?",
      "deadline": "z.B. 30.12.2024 oder 'Sofort'",
      "urgency": "high/medium/low",
      "details": "Weitere Details"
    }
  ],
  "time_critical_amounts": "Falls Summen genannt, die sich ändern könnten (Kindergeld, Bürgergeld), hier warnen. Sonst: null",
  "next_steps": [
    "Schritt 1: ...",
    "Schritt 2: ...",
    "Schritt 3: ..."
  ],
  "confidence": 0.85
}

FEHLERFALL (nicht erkannt/unleserlich):
{
  "success": false,
  "error": "Erklärung auf Deutsch, warum nicht analysiert werden konnte"
}
`

async function analyzeDocument(
  imageData: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageData,
            },
          },
          {
            type: 'text',
            text: 'Analysiere diesen Behördenbrief/dieses Dokument. Antworte nur mit dem JSON, ohne Markdown-Backticks.',
          },
        ],
      },
    ],
  })

  const textContent = response.content.find(c => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Keine Textantwort vom Model')
  }

  return textContent.text
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   'unknown'

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Zu viele Anfragen. Bitte warten Sie 10 Minuten.',
    })
  }

  try {
    const { image, mediaType } = req.body

    if (!image || !mediaType) {
      return res.status(400).json({
        error: 'Bild und mediaType erforderlich',
      })
    }

    // Validiere mediaType
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validMediaTypes.includes(mediaType)) {
      return res.status(400).json({
        error: 'Ungültiger Bildtyp. Erlaubt: JPG, PNG, GIF, WEBP',
      })
    }

    // Timeout für Analyse: 45 Sekunden
    const analysisPromise = analyzeDocument(image, mediaType)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Analyse-Timeout (45s)')), 45000)
    )

    const analysisText = await Promise.race([analysisPromise, timeoutPromise])

    // Parse JSON aus Antwort (может быть обернут в ```json блоком)
    let analysis
    try {
      // Удаляем возможные Markdown backticks
      const cleanedText = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      analysis = JSON.parse(cleanedText)
    } catch {
      // Если JSON parsing failed, пробуем найти JSON в тексте
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return res.status(500).json({
          error: 'Model gab ungültiges Format zurück',
        })
      }
      analysis = JSON.parse(jsonMatch[0])
    }

    return res.status(200).json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'

    // Nicht exponieren sensitive Info
    if (errorMessage.includes('API')) {
      return res.status(500).json({
        error: 'API-Fehler. Bitte später versuchen.',
      })
    }

    return res.status(500).json({
      error: errorMessage || 'Analyse fehlgeschlagen',
    })
  }
}
