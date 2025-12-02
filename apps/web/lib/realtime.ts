/**
 * Server-side Ably publishing utilities
 *
 * For publishing events from API routes to specific users or channels.
 */

// Singleton client for server-side publishing (lazy loaded)
let serverClient: import('ably').Rest | null | undefined = undefined;

async function getServerClient(): Promise<import('ably').Rest | null> {
  if (serverClient !== undefined) return serverClient;

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    console.warn('[Realtime] ABLY_API_KEY not set - real-time notifications disabled');
    serverClient = null;
    return null;
  }

  try {
    const Ably = (await import('ably')).default;
    serverClient = new Ably.Rest(apiKey);
    return serverClient;
  } catch (error) {
    console.error('[Realtime] Failed to initialize Ably:', error);
    serverClient = null;
    return null;
  }
}

/**
 * Publish a message to a user's personal channel
 *
 * @param userId - The user's ID
 * @param event - Event name (e.g., 'library:file-shared')
 * @param data - Event data
 */
export async function publishToUser(
  userId: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const client = await getServerClient();
  if (!client) return false;

  try {
    const channel = client.channels.get(`user:${userId}`);
    await channel.publish(event, {
      ...data,
      _timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error(`[Realtime] Failed to publish to user ${userId}:`, error);
    return false;
  }
}

/**
 * Publish a message to a project channel
 *
 * @param projectId - The project's ID
 * @param event - Event name
 * @param data - Event data
 */
export async function publishToProject(
  projectId: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const client = await getServerClient();
  if (!client) return false;

  try {
    const channel = client.channels.get(`project:${projectId}`);
    await channel.publish(event, {
      ...data,
      _timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error(`[Realtime] Failed to publish to project ${projectId}:`, error);
    return false;
  }
}

/**
 * Publish a message to multiple users
 *
 * @param userIds - Array of user IDs
 * @param event - Event name
 * @param data - Event data
 */
export async function publishToUsers(
  userIds: string[],
  event: string,
  data: Record<string, unknown>
): Promise<number> {
  const results = await Promise.all(userIds.map((userId) => publishToUser(userId, event, data)));

  return results.filter(Boolean).length;
}

/**
 * Publish a message to a custom channel
 *
 * @param channelName - The channel name
 * @param event - Event name
 * @param data - Event data
 */
export async function publishToChannel(
  channelName: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const client = await getServerClient();
  if (!client) return false;

  try {
    const channel = client.channels.get(channelName);
    await channel.publish(event, {
      ...data,
      _timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error(`[Realtime] Failed to publish to channel ${channelName}:`, error);
    return false;
  }
}
