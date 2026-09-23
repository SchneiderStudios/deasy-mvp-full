import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  documentAnalysis: string // JSON der Dokumentenanalyse
  conversationHistory: ChatMessage[]
}

interface ChatResponse {
  success: boolean
  reply?: string
  error?: string
}

const CHAT_SYSTEM_PROMPT = `Du bist DEASY, ein KI-Assistent, der deutsche Behördenbriefe erklärt.

Der Nutzer hat ein Dokument analysiert und kann jetzt Fragen dazu stellen.

WICHTIG:
- Antworte auf Deutsch (B1-Niveau, einfache Sätze)
- Beziehe dich auf die Dokumentenanalyse (siehe unten)
- Sei hilfreich und ermutigend
- Erkläre komplexe Begriffe
- Gib konkrete Tipps
- Bei Unsicherheit: ehrlich sagen dass du nicht sicher bist

DIE DOKUMENTENANALYSE:
---
{ANALYSIS}
---

Antworte natürlich (kein JSON für Chat, nur normale Nachrichten).`

async function chatAboutDocument(
  userMessage: string,
  documentAnalysis: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = CHAT_SYSTEM_PROMPT.replace('{ANALYSIS}', documentAnalysis)

  // Baue Nachrichtenhistorie auf
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
  ]

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages,
  })

  const textContent = response.content.find(c => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Keine Textantwort vom Model')
  }

  return textContent.text
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { message, documentAnalysis, conversationHistory } = req.body as ChatRequest

    if (!message || !documentAnalysis) {
      return res.status(400).json({
        success: false,
        error: 'Message und documentAnalysis erforderlich',
      })
    }

    // Timeout für Chat: 30 Sekunden
    const chatPromise = chatAboutDocument(
      message,
      documentAnalysis,
      conversationHistory || []
    )
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Chat-Timeout (30s)')), 30000)
    )

    const reply = await Promise.race([chatPromise, timeoutPromise])

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
    })
  } catch (error) {
    console.error('Chat error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'

    if (errorMessage.includes('API')) {
      return res.status(500).json({
        success: false,
        error: 'API-Fehler. Bitte später versuchen.',
      })
    }

    return res.status(500).json({
      success: false,
      error: errorMessage || 'Chat fehlgeschlagen',
    })
  }
}
