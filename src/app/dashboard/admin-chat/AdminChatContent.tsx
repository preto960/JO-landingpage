'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Send, X } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher'

interface OnlineMember {
  id: string
  name?: string
  email?: string
  role?: string
  platform?: string
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderEmail: string
  senderPlatform: string
  recipientId: string | null
  targetPlatform: string
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
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [showMembers, setShowMembers] = useState(false)
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([])
  const [selectedMember, setSelectedMember] = useState<OnlineMember | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const channelRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myUserEmail = user.email

  // Pusher subscription (once — connection + presence events)
  useEffect(() => {
    const pusher = getPusherClient()

    console.log('[AdminChat] Pusher connection state:', pusher.connection.state)

    pusher.connection.bind('connected', () => {
      console.log('[AdminChat] Pusher connected')
      setIsConnected(true)
    })
    pusher.connection.bind('disconnected', () => {
      console.log('[AdminChat] Pusher disconnected')
      setIsConnected(false)
    })
    if (pusher.connection.state === 'connected') setIsConnected(true)

    const channel = pusher.subscribe('presence-admin-chat')
    channelRef.current = channel

    channel.bind('pusher:subscription_error', (err: any) => {
      console.error('[AdminChat] Subscription error:', err)
    })

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      console.log('[AdminChat] Subscribed to presence-admin-chat, members:', members.count)
      const list: OnlineMember[] = []
      members.each((m: any) => {
        list.push({ id: m.id, name: m.info?.name, email: m.info?.email, role: m.info?.role, platform: m.info?.platform })
      })
      const filtered = list.filter(m => m.platform !== 'landingpage')
      setOnlineMembers(filtered)
      setOnlineCount(filtered.length)
    })

    channel.bind('pusher:member_added', (member: any) => {
      if (member.info?.platform === 'landingpage') return
      const newMember: OnlineMember = { id: member.id, name: member.info?.name, email: member.info?.email, role: member.info?.role, platform: member.info?.platform }
      setOnlineMembers(prev => [...prev, newMember])
      setOnlineCount(prev => prev + 1)
    })

    channel.bind('pusher:member_removed', (member: any) => {
      setOnlineMembers(prev => {
        const filtered = prev.filter(m => m.id !== member.id)
        setOnlineCount(filtered.length)
        return filtered
      })
    })

    return () => {
      channel.unbind('pusher:subscription_error')
      channel.unbind('pusher:subscription_succeeded')
      channel.unbind('pusher:member_added')
      channel.unbind('pusher:member_removed')
      channel.unbind('new-message')
      pusher.unsubscribe('presence-admin-chat')
    }
  }, [user.id])

  // Listen for new messages via Pusher
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return

    const handleNewMessage = (data: any) => {
      console.log('[AdminChat] Received new-message event:', data)
      if (!selectedMember) return
      const numericSenderId = String(data.senderId)
      const numericRecipientId = data.recipientId ? String(data.recipientId) : null
      const selectedNumericId = selectedMember.id.split('-')[0]
      const senderPlatform = data.senderPlatform || 'unknown'
      const targetPlatform = data.targetPlatform || 'all'

      // Must match BOTH platform AND targetPlatform to isolate conversations
      const isFromSelected =
        (numericSenderId === selectedNumericId && senderPlatform === selectedMember.platform && targetPlatform === 'landingpage') ||
        (data.senderEmail === myUserEmail && senderPlatform === 'landingpage' && targetPlatform === selectedMember.platform)

      if (isFromSelected) {
        setMessages(prev => {
          if (prev.some(m => m.id === String(data.id))) return prev
          return [...prev, {
            id: String(data.id),
            content: data.content,
            senderId: numericSenderId,
            senderName: data.senderName || 'Admin',
            senderEmail: data.senderEmail || '',
            senderPlatform: data.senderPlatform || 'unknown',
            recipientId: numericRecipientId,
            targetPlatform: data.targetPlatform || 'all',
            createdAt: data.createdAt,
          }]
        })
      }
    }

    channel.bind('new-message', handleNewMessage)
    return () => channel.unbind('new-message', handleNewMessage)
  }, [selectedMember, myUserEmail])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when member selected
  useEffect(() => {
    if (selectedMember) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selectedMember])

  // Extract numeric ID from composite ID
  const getNumericId = (compositeId: string) => parseInt(compositeId.split('-')[0])

  // Load messages for a selected member
  const loadMessages = useCallback(async (member: OnlineMember) => {
    const recipientId = getNumericId(member.id)
    if (isNaN(recipientId)) return

    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/admin-chat/messages?recipientId=${recipientId}&senderPlatform=landingpage&recipientPlatform=${member.platform || 'all'}`)
      if (!res.ok) throw new Error('Error loading messages')
      const data = await res.json()
      setMessages((data.messages || []).map((msg: any) => ({
        id: String(msg.id),
        content: msg.content,
        senderId: String(msg.senderId),
        senderName: msg.senderName || 'Admin',
        senderEmail: msg.senderEmail || '',
        senderPlatform: msg.senderPlatform || 'unknown',
        recipientId: msg.recipientId ? String(msg.recipientId) : null,
        targetPlatform: msg.targetPlatform || 'all',
        createdAt: msg.createdAt,
      })))
    } catch (err) {
      console.error('[AdminChat] Error loading messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  // Select a member
  const handleSelectMember = useCallback((member: OnlineMember) => {
    setSelectedMember(member)
    setMessages([])
    loadMessages(member)
  }, [loadMessages])

  // Close chat
  const handleCloseChat = useCallback(() => {
    setSelectedMember(null)
    setMessages([])
    setNewMessage('')
  }, [])

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedMember || sendingMessage) return

    const recipientId = getNumericId(selectedMember.id)
    if (isNaN(recipientId)) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/admin-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          recipientId,
          targetPlatform: selectedMember.platform || 'all',
        }),
      })
      if (!res.ok) throw new Error('Error sending message')
      const resData = await res.json()
      // Optimistic: add the sent message immediately
      const savedMsg = resData?.message || resData?.data
      if (savedMsg) {
        setMessages(prev => {
          if (prev.some(m => m.id === String(savedMsg.id))) return prev
          return [...prev, {
            id: String(savedMsg.id),
            content: savedMsg.content,
            senderId: String(savedMsg.senderId),
            senderName: savedMsg.senderName || savedMsg.sender?.name || 'Admin',
            senderEmail: savedMsg.senderEmail || savedMsg.sender?.email || '',
            senderPlatform: 'landingpage',
            recipientId: savedMsg.recipientId ? String(savedMsg.recipientId) : null,
            targetPlatform: savedMsg.targetPlatform || 'all',
            createdAt: savedMsg.createdAt,
          }]
        })
      }
      setNewMessage('')
    } catch (err) {
      console.error('[AdminChat] Error sending message:', err)
    } finally {
      setSendingMessage(false)
      inputRef.current?.focus()
    }
  }, [newMessage, selectedMember, sendingMessage])

  // Keyboard send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Platform helpers
  const getPlatformLabel = (platform?: string) => {
    switch (platform) {
      case 'landingpage': return 'Landing'
      case 'frontend-shop': return 'Tienda'
      case 'app-shop': return 'App Shop'
      case 'app-delivery': return 'App Delivery'
      default: return ''
    }
  }

  const getPlatformColor = (platform?: string) => {
    switch (platform) {
      case 'landingpage': return '#C9A84C'
      case 'frontend-shop': return '#3b82f6'
      case 'app-shop': return '#22c55e'
      case 'app-delivery': return '#f97316'
      default: return 'rgba(245,240,232,.4)'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)', maxHeight: 'calc(100vh - 8rem)' }}>
      {/* Header (compact single line) */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}>
            Chat de <span style={{ color: '#C9A84C' }}>Administradores</span>
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm" style={{ background: 'rgba(245,240,232,.04)' }}>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isConnected ? '#22c55e' : '#ef4444',
                boxShadow: isConnected ? '0 0 5px rgba(34,197,94,.4)' : 'none',
                animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              {isConnected ? 'En linea' : 'Desconectado'}
            </span>
          </div>
          <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>
            {onlineCount} en linea
          </span>
        </div>

        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all duration-200 cursor-pointer"
          style={{
            background: showMembers ? 'rgba(201,168,76,.12)' : 'rgba(201,168,76,.06)',
            border: showMembers ? '1px solid rgba(201,168,76,.25)' : '1px solid rgba(201,168,76,.1)',
          }}
        >
          <Users className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
          <span className="text-[11px] font-medium" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', letterSpacing: '.05em' }}>
            {onlineCount}
          </span>
        </button>
      </div>

      {/* Main content: chat area + sidebar */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Chat area (empty or conversation) */}
        <div className="flex flex-col flex-1 min-h-0" style={{ background: '#0A0A0A' }}>
          {selectedMember ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${getPlatformColor(selectedMember.platform)}15`, color: getPlatformColor(selectedMember.platform) }}>
                      {getInitials(selectedMember.name || 'Admin')}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', border: '2px solid #0A0A0A' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.85)', margin: 0 }}>
                      {selectedMember.name || selectedMember.email || 'Admin'}
                    </p>
                    <span className="text-[10px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: getPlatformColor(selectedMember.platform), letterSpacing: '.05em', textTransform: 'uppercase' }}>
                      {getPlatformLabel(selectedMember.platform)} · En linea
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'rgba(245,240,232,.3)', cursor: 'pointer' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>Cargando mensajes...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <Users className="w-6 h-6" style={{ color: 'rgba(245,240,232,.15)' }} />
                    <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', margin: 0 }}>
                      Inicia la conversacion
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderEmail === myUserEmail && msg.senderPlatform === 'landingpage'
                    return (
                      <div key={msg.id} className="flex" style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div
                          className="px-3 py-2"
                          style={{
                            maxWidth: '70%',
                            borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            background: isMine ? 'rgba(201,168,76,.15)' : 'rgba(245,240,232,.05)',
                            color: 'rgba(245,240,232,.85)',
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}
                        >
                          <p style={{ margin: 0, wordBreak: 'break-word', fontFamily: "'Jost', sans-serif" }}>{msg.content}</p>
                          <p style={{ margin: '3px 0 0', fontSize: 10, opacity: 0.5, textAlign: isMine ? 'right' : 'left', fontFamily: "'Jost', sans-serif" }}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="flex gap-2 px-4 py-2.5" style={{ borderTop: '1px solid rgba(245,240,232,.06)' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  style={{
                    borderRadius: 8,
                    border: '1px solid rgba(245,240,232,.08)',
                    background: 'rgba(245,240,232,.03)',
                    color: '#F5F0E8',
                    fontFamily: "'Jost', sans-serif",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    background: newMessage.trim() ? 'rgba(201,168,76,.2)' : 'rgba(245,240,232,.05)',
                    color: newMessage.trim() ? '#C9A84C' : 'rgba(245,240,232,.2)',
                    cursor: newMessage.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)' }}>
                <Users className="w-6 h-6" style={{ color: 'rgba(201,168,76,.25)' }} />
              </div>
              <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)' }}>
                Selecciona un administrador para chatear
              </p>
              <p className="text-xs text-center px-8" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
                Usa el boton de la esquina para ver los administradores conectados
              </p>
            </div>
          )}
        </div>

        {/* Online members sidebar */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300"
          style={{
            width: showMembers ? 240 : 0,
            opacity: showMembers ? 1 : 0,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            borderLeft: showMembers ? '1px solid rgba(245,240,232,.06)' : 'none',
            background: '#111111',
          }}
        >
          <div style={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                <span className="text-[11px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  En linea
                </span>
              </div>
              <span className="text-[10px] font-bold" style={{ fontFamily: "'Jost', sans-serif", color: '#0A0A0A', background: '#22c55e', borderRadius: '9999px', padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
                {onlineCount}
              </span>
            </div>
            {/* Members list */}
            <div className="flex-1 overflow-y-auto py-1">
              {onlineMembers.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
                    No hay usuarios conectados
                  </p>
                </div>
              ) : (
                onlineMembers.map((member) => {
                  const memberName = member.name || 'Admin'
                  const memberPlatform = member.platform || 'unknown'
                  const platformColor = getPlatformColor(memberPlatform)
                  const isSelected = selectedMember?.id === member.id

                  return (
                    <div
                      key={member.id}
                      onClick={() => handleSelectMember(member)}
                      className="flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors duration-150"
                      style={{ background: isSelected ? 'rgba(201,168,76,.08)' : 'transparent' }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(245,240,232,.03)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${platformColor}15`, color: platformColor }}>
                          {getInitials(memberName)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', border: '2px solid #111111' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)' }}>
                          {memberName}
                        </p>
                        <span className="text-[10px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: platformColor, letterSpacing: '.03em', textTransform: 'uppercase' }}>
                          {getPlatformLabel(memberPlatform)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
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
