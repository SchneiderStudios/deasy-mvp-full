'use client'

import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'

interface AnalysisResult {
  success: boolean
  document_type?: string
  summary?: string
  explanation?: string
  urgent_tasks?: Array<{
    task: string
    deadline: string
    urgency: 'high' | 'medium' | 'low'
    details: string
  }>
  time_critical_amounts?: string | null
  next_steps?: string[]
  confidence?: number
  error?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleFile = async (file: File) => {
    setError(null)
    setResult(null)
    setChatMessages([])
    setChatInput('')

    // Validierung
    const maxSize = 10 * 1024 * 1024 // 10 MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

    if (!validTypes.includes(file.type)) {
      setError('❌ Ungültiger Dateityp. Erlaubt: JPG, PNG, GIF, WEBP, PDF')
      return
    }

    if (file.size > maxSize) {
      setError('❌ Datei ist zu groß (max. 10 MB)')
      return
    }

    setLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1]

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              mediaType: file.type,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            setError(`❌ ${data.error || 'Fehler bei der Analyse'}`)
            return
          }

          setResult(data)
          // Initialisiere Chat mit Willkommensnachricht
          setChatMessages([
            {
              role: 'assistant',
              content: '👋 Hallo! Ich habe deinen Brief analysiert. Hast du Fragen dazu? Ich helfe dir gerne!',
              timestamp: Date.now(),
            },
          ])
        } catch (err) {
          setError(`❌ Netzwerkfehler: ${err instanceof Error ? err.message : 'Unbekannt'}`)
        } finally {
          setLoading(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError(`❌ Fehler beim Lesen der Datei: ${err instanceof Error ? err.message : 'Unbekannt'}`)
      setLoading(false)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !result || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')

    // Füge Nutzernachricht hinzu
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }
    setChatMessages((prev) => [...prev, newUserMessage])
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          documentAnalysis: JSON.stringify(result),
          conversationHistory: chatMessages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Fehler: ${data.error || 'Chat fehlgeschlagen'}`,
            timestamp: Date.now(),
          },
        ])
        return
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Netzwerkfehler: ${err instanceof Error ? err.message : 'Unbekannt'}`,
          timestamp: Date.now(),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <>
      <Head>
        <title>DEASY — Deutsche Bürokratie. Endlich verständlich.</title>
        <meta name="description" content="DEASY erklärt deine Behördenbriefe und beantwortet deine Fragen." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>📋 DEASY</div>
          <h1>Deutsche Bürokratie. Endlich verständlich.</h1>
        </header>

        <section className={styles.uploadSection}>
          <h2>Behördenbrief hochladen</h2>
          <p className={styles.subtitle}>
            Lade einen Brief oder Antrag hoch. DEASY erklärt dir, was er bedeutet und beantwortet deine Fragen.
          </p>

          {/* Upload Zone */}
          <div
            className={`${styles.uploadZone} ${dragActive ? styles.active : ''} ${
              loading ? styles.loading : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                <p>📊 Analysiere Dokument...</p>
              </>
            ) : (
              <>
                <div className={styles.uploadIcon}>📸</div>
                <h3>Datei hier ablegen</h3>
                <p>oder</p>
                <button
                  className={styles.browseBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Datei wählen
                </button>
                <p className={styles.fileInfo}>
                  ✅ JPG, PNG, GIF, WEBP (max. 10 MB)
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>✕ Schließen</button>
            </div>
          )}

          {/* Result + Chat Layout */}
          {result && (
            <div className={styles.resultContainer}>
              {/* Analysis Result */}
              <div className={styles.result}>
                {result.success ? (
                  <>
                    <div className={styles.resultHeader}>
                      <h3>✅ Analyse abgeschlossen</h3>
                      <span className={styles.confidence}>
                        Genauigkeit: {Math.round((result.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    {result.document_type && (
                      <div className={styles.docType}>
                        <strong>Dokumenttyp:</strong> {result.document_type}
                      </div>
                    )}

                    {result.summary && (
                      <div className={styles.section}>
                        <h4>📝 Zusammenfassung</h4>
                        <p>{result.summary}</p>
                      </div>
                    )}

                    {result.explanation && (
                      <div className={styles.section}>
                        <h4>📖 Erklärung</h4>
                        <p>{result.explanation}</p>
                      </div>
                    )}

                    {result.time_critical_amounts && (
                      <div className={styles.warning}>
                        <strong>⚠️ Wichtig:</strong> {result.time_critical_amounts}
                      </div>
                    )}

                    {result.urgent_tasks && result.urgent_tasks.length > 0 && (
                      <div className={styles.section}>
                        <h4>🎯 Deine Aufgaben</h4>
                        {result.urgent_tasks.map((task, idx) => (
                          <div key={idx} className={`${styles.task} ${styles[task.urgency]}`}>
                            <div className={styles.taskHeader}>
                              <span className={styles.urgencyBadge}>{task.urgency}</span>
                              <strong>{task.task}</strong>
                            </div>
                            {task.deadline && (
                              <div className={styles.deadline}>
                                📅 Frist: <strong>{task.deadline}</strong>
                              </div>
                            )}
                            {task.details && (
                              <p className={styles.taskDetails}>{task.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {result.next_steps && result.next_steps.length > 0 && (
                      <div className={styles.section}>
                        <h4>👣 Nächste Schritte</h4>
                        <ol className={styles.steps}>
                          {result.next_steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <button
                      className={styles.resetBtn}
                      onClick={() => {
                        setResult(null)
                        setError(null)
                        setChatMessages([])
                      }}
                    >
                      ↻ Neuen Brief analysieren
                    </button>
                  </>
                ) : (
                  <div className={styles.error}>
                    <p>❌ {result.error || 'Fehler bei der Analyse'}</p>
                  </div>
                )}
              </div>

              {/* Chat */}
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <h3>💬 Frag den Assistenten</h3>
                </div>

                <div className={styles.chatMessages}>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.chatMessage} ${
                        msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                      }`}
                    >
                      <div className={styles.messageBubble}>{msg.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
                      <div className={styles.messageBubble}>
                        <div className={styles.typingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className={styles.chatInputContainer}>
                  <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Stell deine Frage..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !chatLoading) {
                        handleSendChatMessage()
                      }
                    }}
                    disabled={chatLoading}
                  />
                  <button
                    className={styles.sendBtn}
                    onClick={handleSendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    {chatLoading ? '⏳' : '➜'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <p>© 2024 DEASY — Für besseres Verständnis deutscher Behördenbriefe</p>
          <div className={styles.footerLinks}>
            <a href="/datenschutz">Datenschutz</a>
            <span>•</span>
            <a href="/impressum">Impressum</a>
          </div>
        </footer>
      </main>
    </>
  )
}
