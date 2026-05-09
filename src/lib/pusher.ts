import Pusher from 'pusher-js'

let pusherInstance: Pusher | null = null

export function getPusherClient(): Pusher {
  if (pusherInstance) return pusherInstance

  pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '5c0dab8f11f43914d9a6', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    channelAuthorization: {
      endpoint: '/api/admin-chat/pusher-auth',
      transport: 'ajax',
      headers: {},
    },
  })

  return pusherInstance
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}
