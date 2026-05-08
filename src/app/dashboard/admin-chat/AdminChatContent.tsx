'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Users, Circle, ArrowDown } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher'
import Pusher from 'pusher-js'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  createdAt: string
}

interface AdminChatContentProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
  }
}

export default function AdminChatContent({ user }: AdminChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin-chat/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  // Pusher subscription
  useEffect(() => {
    const pusher = getPusherClient()

    pusher.connection.bind('connected', () => setIsConnected(true))
    pusher.connection.bind('disconnected', () => setIsConnected(false))
    if (pusher.connection.state === 'connected') setIsConnected(true)

    const channel = pusher.subscribe('presence-admin-chat')
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setOnlineCount(members.count)
    })

    channel.bind('pusher:member_added', () => {
      setOnlineCount(prev => prev + 1)
    })

    channel.bind('pusher:member_removed', () => {
      setOnlineCount(prev => Math.max(0, prev - 1))
    })

    channel.bind('new-message', (data: any) => {
      setMessages(prev => {
        const msg = {
          id: String(data.id),
          content: data.content,
          senderId: String(data.senderId),
          senderName: data.senderName || 'Admin',
          senderRole: 'admin',
          createdAt: data.createdAt,
        }
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      channel.unbind('pusher:subscription_succeeded')
      channel.unbind('pusher:member_added')
      channel.unbind('pusher:member_removed')
      channel.unbind('new-message')
      channel.unsubscribe()
    }
  }, [])

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || sending) return
    const content = inputText.trim()
    setInputText('')
    setSending(true)
    try {
      await fetch('/api/admin-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } catch (err) {
      console.error('Error sending:', err)
      setInputText(content)
    } finally {
      setSending(false)
    }
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
    setShowScrollBtn(!isNearBottom)
  }

  // Format time
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  // Format date separator
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (d.toDateString() === today.toDateString()) return 'Hoy'
      if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
    } catch { return '' }
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  messages.forEach((msg) => {
    const dateKey = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'unknown'
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] })
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}>
            Chat de <span style={{ color: '#C9A84C' }}>Administradores</span>
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm" style={{ background: 'rgba(245,240,232,.04)' }}>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isConnected ? '#22c55e' : '#ef4444',
                boxShadow: isConnected ? '0 0 6px rgba(34,197,94,.4)' : 'none',
                animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              {isConnected ? 'En linea' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)' }}>
          <Users className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
          <span className="text-xs font-medium" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', letterSpacing: '.05em' }}>
            {onlineCount} {onlineCount === 1 ? 'conectado' : 'conectados'}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: '#0A0A0A' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border border-[rgba(201,168,76,.3)] border-t-[#C9A84C] rounded-full animate-spin" />
              <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>Cargando mensajes...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)' }}>
                <Users className="w-7 h-7" style={{ color: 'rgba(201,168,76,.4)' }} />
              </div>
              <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                No hay mensajes
              </p>
              <p className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
                Inicia una conversacion con el equipo de administracion
              </p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 rounded-sm" style={{ background: 'rgba(245,240,232,.04)' }}>
                  <span className="text-[10px] font-medium" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {formatDate(group.messages[0]?.createdAt || '')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              {group.messages.map((msg) => {
                const isOwn = msg.senderId === user.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      {/* Sender name (only for others) */}
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1 ml-1">
                          <span className="text-xs font-medium" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.6)' }}>
                            {msg.senderName || 'Admin'}
                          </span>
                          {msg.senderRole && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-sm" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', background: 'rgba(201,168,76,.08)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                              {msg.senderRole}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className="px-3.5 py-2.5"
                        style={{
                          background: isOwn
                            ? 'linear-gradient(135deg, rgba(201,168,76,.15) 0%, rgba(201,168,76,.08) 100%)'
                            : 'rgba(245,240,232,.05)',
                          border: isOwn
                            ? '1px solid rgba(201,168,76,.15)'
                            : '1px solid rgba(245,240,232,.06)',
                          borderRadius: '2px',
                        }}
                      >
                        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.85)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.content}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className={`mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                        <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-200 hover:scale-105 cursor-pointer"
          style={{
            background: 'rgba(201,168,76,.9)',
            boxShadow: '0 4px 12px rgba(201,168,76,.3)',
          }}
        >
          <ArrowDown className="w-3.5 h-3.5" style={{ color: '#0A0A0A' }} />
          <span className="text-[10px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: '#0A0A0A', letterSpacing: '.05em', textTransform: 'uppercase' }}>
            Nuevo
          </span>
        </button>
      )}

      {/* Input area */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(245,240,232,.06)', background: '#111111' }}>
        <div className="flex items-end gap-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 resize-none px-3 py-2.5 text-sm outline-none transition-colors duration-200"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: 'rgba(245,240,232,.85)',
              background: 'rgba(245,240,232,.04)',
              border: '1px solid rgba(245,240,232,.08)',
              borderRadius: '2px',
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.08)' }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || sending}
            className="flex items-center justify-center w-10 h-10 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: inputText.trim() && !sending
                ? 'linear-gradient(135deg, #C9A84C 0%, #B8953E 100%)'
                : 'rgba(245,240,232,.06)',
              borderRadius: '2px',
              opacity: inputText.trim() && !sending ? 1 : 0.5,
            }}
          >
            {sending ? (
              <div className="w-4 h-4 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" style={{ color: inputText.trim() ? '#0A0A0A' : 'rgba(245,240,232,.3)', transform: 'rotate(-45deg)' }} />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
            {user.name} &middot; {user.role}
          </span>
          <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.15)' }}>
            Enter para enviar &middot; Shift+Enter nueva linea
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
