'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Users } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher'

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
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [showMembers, setShowMembers] = useState(false)
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([])
  const channelRef = useRef<any>(null)

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
      // Filter ONLY by platform — show admins from other platforms even if same user
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
      pusher.unsubscribe('presence-admin-chat')
    }
  }, [user.id])

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

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)', maxHeight: 'calc(100vh - 7rem)' }}>
      {/* Header (compact single line) */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
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

      {/* Main content: members list + sidebar */}
      <div className="flex flex-1 min-h-0">

        {/* Members list */}
        <div className="flex flex-col flex-1 min-h-0" style={{ background: '#0A0A0A' }}>
          <div className="flex-1 overflow-y-auto py-2">
            {onlineMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)' }}>
                  <Users className="w-7 h-7" style={{ color: 'rgba(201,168,76,.4)' }} />
                </div>
                <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                  No hay administradores conectados
                </p>
                <p className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
                  Los administradores conectados desde frontend-shop o las apps apareceran aqui
                </p>
              </div>
            ) : (
              onlineMembers.map((member) => {
                const memberName = member.name || member.email || 'Admin'
                const memberPlatform = member.platform || 'unknown'
                const platformColor = getPlatformColor(memberPlatform)

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(245,240,232,.03)' }}
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
                  </div>
                )
              })
            )}
          </div>
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
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
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

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-2.5 px-4 py-2"
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
