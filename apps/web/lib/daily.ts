/**
 * Daily.co Integration
 *
 * Video conferencing API for meetings and collaboration
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

interface CreateRoomOptions {
  name?: string;
  privacy?: 'private' | 'public';
  properties?: {
    max_participants?: number;
    enable_recording?: 'cloud' | 'local' | false;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    exp?: number; // Unix timestamp for room expiration
    [key: string]: unknown;
  };
}

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  privacy: string;
  created_at: string;
  config: Record<string, unknown>;
}

interface TokenOptions {
  userId: string;
  userName: string;
  isOwner?: boolean;
  expiresIn?: number;
}

/**
 * Create a Daily.co room for meetings
 */
export async function createMeetingRoom(
  options: CreateRoomOptions = {}
): Promise<DailyRoom | null> {
  if (!DAILY_API_KEY) {
    console.error('DAILY_API_KEY not configured');
    return null;
  }

  const { name, privacy = 'private', properties = {} } = options;

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        privacy,
        properties: {
          enable_recording: 'cloud',
          enable_live_streaming: true,
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: true, // Waiting room
          max_participants: 100,
          ...properties,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Failed to create Daily room:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Daily room creation error:', error);
    return null;
  }
}

/**
 * Get a Daily.co room by name
 */
export async function getMeetingRoom(roomName: string): Promise<DailyRoom | null> {
  if (!DAILY_API_KEY) return null;

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to get Daily room:', error);
    return null;
  }
}

/**
 * Delete a Daily.co room
 */
export async function deleteMeetingRoom(roomName: string): Promise<boolean> {
  if (!DAILY_API_KEY) return false;

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to delete Daily room:', error);
    return false;
  }
}

/**
 * Generate a meeting token for a participant
 */
export async function getMeetingToken(
  roomName: string,
  options: TokenOptions
): Promise<string | null> {
  if (!DAILY_API_KEY) return null;

  const { userId, userName, isOwner = false, expiresIn = 3600 } = options;

  try {
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          user_id: userId,
          is_owner: isOwner,
          enable_recording: isOwner ? 'cloud' : false,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + expiresIn,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Failed to create meeting token:', error);
      return null;
    }

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Meeting token error:', error);
    return null;
  }
}

/**
 * Get room presence (active participants)
 */
export async function getRoomPresence(roomName: string): Promise<any[]> {
  if (!DAILY_API_KEY) return [];

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}/presence`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to get room presence:', error);
    return [];
  }
}

/**
 * Start recording a meeting
 */
export async function startRecording(roomName: string): Promise<string | null> {
  if (!DAILY_API_KEY) return null;

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}/recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        // Recording options
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return null;
  }
}

/**
 * Stop recording a meeting
 */
export async function stopRecording(recordingId: string): Promise<boolean> {
  if (!DAILY_API_KEY) return false;

  try {
    const response = await fetch(`${DAILY_API_URL}/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return false;
  }
}

/**
 * Get recording details
 */
export async function getRecording(recordingId: string): Promise<any | null> {
  if (!DAILY_API_KEY) return null;

  try {
    const response = await fetch(`${DAILY_API_URL}/recordings/${recordingId}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to get recording:', error);
    return null;
  }
}

/**
 * List all recordings for a room
 */
export async function listRecordings(roomName: string): Promise<any[]> {
  if (!DAILY_API_KEY) return [];

  try {
    const response = await fetch(`${DAILY_API_URL}/recordings?room_name=${roomName}`, {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to list recordings:', error);
    return [];
  }
}
