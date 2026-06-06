// ── Daily.co Room Manager ─────────────────────────────────
// Creates encrypted, expiring rooms for each session

const DAILY_API_KEY  = process.env.DAILY_API_KEY!
const DAILY_API_BASE = 'https://api.daily.co/v1'

interface DailyRoom {
  id: string
  name: string
  url: string
  privacy: string
  created_at: number
  config: Record<string, unknown>
}

/** Create a private Daily.co room for a booking */
export async function createSessionRoom(bookingRef: string, durationMinutes: number): Promise<DailyRoom> {
  const expiresAt = Math.floor(Date.now() / 1000) + durationMinutes * 60 + 300 // +5min buffer

  const res = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `wesal-${bookingRef.toLowerCase()}`,
      privacy: 'private',
      properties: {
        exp: expiresAt,
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: true,
        enable_recording: 'cloud',
        start_video_off: false,
        start_audio_off: false,
        lang: 'ar',          // Arabic UI
        geo: 'eu-central-1', // closest to Kuwait
        signaling_imp: 'ws',
      },
    }),
  })

  if (!res.ok) throw new Error(`Daily.co room creation failed: ${res.statusText}`)
  return res.json()
}

/** Delete a room after session ends */
export async function deleteSessionRoom(roomName: string): Promise<void> {
  await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
  })
}

/** Generate a short-lived token for a participant */
export async function createRoomToken(roomName: string, participantName: string, isOwner: boolean): Promise<string> {
  const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name:    roomName,
        user_name:    participantName,
        is_owner:     isOwner,  // consultant = owner
        enable_recording: isOwner,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1hr token
      },
    }),
  })

  if (!res.ok) throw new Error(`Token creation failed: ${res.statusText}`)
  const data = await res.json()
  return data.token
}
