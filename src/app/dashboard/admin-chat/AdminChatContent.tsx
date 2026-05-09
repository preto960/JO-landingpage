'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Users, Circle, ArrowDown, ArrowLeft, Search } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher'
import Pusher from 'pusher-js'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  senderPlatform: string
  recipientId: string | null
  targetPlatform: string
  createdAt: string
}

interface OnlineMember {
  id: string
  name?: string
  email?: string
  role?: string
  platform?: string
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
  const [showMembers, setShowMembers] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([])
  const [selectedMember, setSelectedMember] = useState<OnlineMember | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  // Fetch messages (filtered by recipient if one is selected)
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const params = selectedMember ? `?recipientId=${selectedMember.id}` : ''
      const res = await fetch(`/api/admin-chat/messages${params}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedMember])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  // Pusher subscription (once — connection + presence events)
  useEffect(() => {
    const pusher = getPusherClient()

    pusher.connection.bind('connected', () => setIsConnected(true))
    pusher.connection.bind('disconnected', () => setIsConnected(false))
    if (pusher.connection.state === 'connected') setIsConnected(true)

    const channel = pusher.subscribe('presence-admin-chat')
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const list: OnlineMember[] = []
      members.each((m: any) => {
        list.push({ id: m.id, name: m.info?.name, email: m.info?.email, role: m.info?.role, platform: m.info?.platform })
      })
      // Show only users from other platforms (not landingpage, not self)
      const filtered = list.filter(m => m.id !== String(user.id) && m.platform !== 'landingpage')
      setOnlineMembers(filtered)
      setOnlineCount(filtered.length)
    })

    channel.bind('pusher:member_added', (member: any) => {
      if (member.id === String(user.id) || member.info?.platform === 'landingpage') return
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
      channel.unbind('pusher:subscription_succeeded')
      channel.unbind('pusher:member_added')
      channel.unbind('pusher:member_removed')
      pusher.unsubscribe('presence-admin-chat')
    }
  }, [user.id])

  // Listen for new-message events (re-binds when selectedMember changes)
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return

    const handleNewMessage = (data: any) => {
      const newMsg: Message = {
        id: String(data.id),
        content: data.content,
        senderId: String(data.senderId),
        senderName: data.senderName || 'Admin',
        senderPlatform: data.senderPlatform || data.platform || 'unknown',
        recipientId: data.recipientId ? String(data.recipientId) : null,
        targetPlatform: data.targetPlatform || 'all',
        senderRole: 'admin',
        createdAt: data.createdAt,
      }

      // If no chat is selected, only show broadcast messages
      if (!selectedMember) {
        if (!newMsg.recipientId) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
        return
      }

      // If a chat is selected, only show messages relevant to that conversation
      const isRelevant =
        (newMsg.senderId === String(user.id) && newMsg.recipientId === selectedMember.id) ||
        (newMsg.senderId === selectedMember.id && (newMsg.recipientId === String(user.id) || !newMsg.recipientId)) ||
        (newMsg.senderId === String(user.id) && !newMsg.recipientId)

      if (isRelevant) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      }
    }

    channel.bind('new-message', handleNewMessage)

    return () => {
      channel.unbind('new-message', handleNewMessage)
    }
  }, [user.id, selectedMember])

  // Select a member to chat with
  const openChat = (member: OnlineMember) => {
    setSelectedMember(member)
    setMessages([])
    setInputText('')
  }

  // Go back to user list
  const closeChat = () => {
    setSelectedMember(null)
    setMessages([])
    setInputText('')
  }

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || sending) return
    const content = inputText.trim()
    setInputText('')
    setSending(true)
    try {
      const body: any = { content }
      if (selectedMember) {
        body.recipientId = parseInt(selectedMember.id)
        body.targetPlatform = selectedMember.platform || 'all'
      }
      await fetch('/api/admin-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    if (isNearBottom()) scrollToBottom()
  }, [messages, scrollToBottom])

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 150
  }

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    setShowScrollBtn(!isNearBottom())
  }

  // Filter members by search
  const filteredMembers = onlineMembers.filter(m =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>
            {onlineCount} en linea
          </span>
        </div>

        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-200 cursor-pointer"
          style={{
            background: showMembers ? 'rgba(201,168,76,.12)' : 'rgba(201,168,76,.06)',
            border: showMembers ? '1px solid rgba(201,168,76,.25)' : '1px solid rgba(201,168,76,.1)',
          }}
        >
          <Users className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
          <span className="text-xs font-medium" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', letterSpacing: '.05em' }}>
            {onlineCount}
          </span>
        </button>
      </div>

      {/* Main content: chat column + sidebar */}
      <div className="flex flex-1 min-h-0">

        {/* ════════════════════════════════════════════════════════
            VIEW 1: USER LIST (no chat selected)
           ════════════════════════════════════════════════════════ */}
        {!selectedMember ? (
          <div className="flex flex-col flex-1 min-h-0" style={{ background: '#0A0A0A' }}>
            {/* Search bar */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-sm" style={{ background: 'rgba(245,240,232,.04)', border: '1px solid rgba(245,240,232,.06)' }}>
                <Search className="w-4 h-4" style={{ color: 'rgba(245,240,232,.3)' }} />
                <input
                  type="text"
                  placeholder="Buscar administrador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.85)', border: 'none' }}
                />
              </div>
            </div>

            {/* Members list */}
            <div className="flex-1 overflow-y-auto py-2">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)' }}>
                    <Users className="w-7 h-7" style={{ color: 'rgba(201,168,76,.4)' }} />
                  </div>
                  <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                    {searchTerm ? 'No se encontraron administradores' : 'No hay administradores conectados'}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
                    {searchTerm ? 'Intenta con otro termino de busqueda' : 'Los administradores conectados desde frontend-shop o las apps apareceran aqui'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const memberName = member.name || member.email || 'Admin'
                  const memberPlatform = member.platform || 'unknown'
                  const platformColor = getPlatformColor(memberPlatform)

                  return (
                    <div
                      key={member.id}
                      onClick={() => openChat(member)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(245,240,232,.03)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,240,232,.03)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Avatar with online indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${platformColor}15`, color: platformColor }}>
                          {getInitials(memberName)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', border: '2px solid #0A0A0A' }} />
                      </div>

                      {/* Name + platform */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.85)' }}>
                          {memberName}
                        </p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm" style={{ fontFamily: "'Jost', sans-serif", color: platformColor, background: `${platformColor}10`, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                          {getPlatformLabel(memberPlatform)} · En linea
                        </span>
                      </div>

                      {/* Arrow */}
                      <div style={{ color: 'rgba(245,240,232,.2)', fontSize: 18 }}>›</div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Broadcast messages section (if any) */}
            {!searchTerm && messages.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(245,240,232,.06)', maxHeight: 200, overflowY: 'auto' }}>
                <div className="px-4 py-2 text-[10px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Mensajes recientes (general)
                </div>
                {messages.slice(-5).map((msg) => (
                  <div key={msg.id} className="flex items-center gap-2 px-4 py-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif", color: getPlatformColor(msg.senderPlatform), background: `${getPlatformColor(msg.senderPlatform)}15`, letterSpacing: '.03em' }}>
                      {msg.senderName.split(' ')[0]}
                    </span>
                    <span className="text-xs truncate flex-1" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                      {msg.content}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════
              VIEW 2: CHAT CONVERSATION (member selected)
             ════════════════════════════════════════════════════════ */
          <div className="flex flex-col flex-1 min-h-0 relative" style={{ background: '#0A0A0A' }}>
            {/* Chat header with back button */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
              <button
                onClick={closeChat}
                className="flex items-center gap-1 px-2 py-1.5 rounded-sm transition-colors duration-150 cursor-pointer"
                style={{ background: 'rgba(245,240,232,.06)', border: '1px solid rgba(245,240,232,.06)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,240,232,.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,240,232,.06)' }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(245,240,232,.6)' }} />
              </button>

              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${getPlatformColor(selectedMember.platform)}15`, color: getPlatformColor(selectedMember.platform) }}>
                  {getInitials(selectedMember.name || 'Admin')}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', border: '2px solid #0A0A0A' }} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.85)' }}>
                  {selectedMember.name || selectedMember.email || 'Admin'}
                </p>
                <span className="text-[10px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: getPlatformColor(selectedMember.platform), letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {getPlatformLabel(selectedMember.platform)} · En linea
                </span>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
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
                      Inicia una conversacion con {selectedMember.name || 'este administrador'}
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
                      const isOwn = msg.senderId === String(user.id)
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            {/* Sender name + platform (only for others) */}
                            {!isOwn && (
                              <div className="flex items-center gap-2 mb-1 ml-1">
                                <span className="text-xs font-medium" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.6)' }}>
                                  {msg.senderName || 'Admin'}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-sm" style={{ fontFamily: "'Jost', sans-serif", color: getPlatformColor(msg.senderPlatform), background: `${getPlatformColor(msg.senderPlatform)}10`, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                                  {getPlatformLabel(msg.senderPlatform)}
                                </span>
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
                  placeholder={`Escribe un mensaje a ${selectedMember.name || 'admin'}...`}
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
                  {user.name} · {user.role}
                </span>
                <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.15)' }}>
                  Enter para enviar · Shift+Enter nueva linea
                </span>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: '#C9A84C' }} />
                <span className="text-xs font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  En linea
                </span>
              </div>
              <span className="text-[10px] font-bold" style={{ fontFamily: "'Jost', sans-serif", color: '#0A0A0A', background: '#22c55e', borderRadius: '9999px', padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
                {onlineCount}
              </span>
            </div>
            {/* Members list */}
            <div className="flex-1 overflow-y-auto py-2">
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
                      onClick={() => openChat(member)}
                      className="flex items-center gap-2.5 px-4 py-2 transition-colors duration-150 cursor-pointer"
                      style={{ background: isSelected ? 'rgba(201,168,76,.06)' : 'transparent' }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(245,240,232,.03)' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
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
                          {isSelected && <span style={{ color: 'rgba(245,240,232,.3)', fontWeight: 400 }}> (Chat)</span>}
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
