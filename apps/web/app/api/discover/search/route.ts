import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: string, type: string, page: number, limit: number): string {
  return `${type}:${query.toLowerCase()}:${page}:${limit}`;
}

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  
  // Clean up old cache entries (keep max 100 entries)
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const searchType = searchParams.get('type') || 'username';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 results per page

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [], total: 0, page, limit });
    }

    // Check cache first
    const cacheKey = getCacheKey(query, searchType, page, limit);
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const skip = (page - 1) * limit;

    // Build search conditions based on type
    let whereCondition: any = {};

    switch (searchType) {
      case 'username':
        whereCondition = {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        };
        break;
      case 'email':
        whereCondition = {
          email: { contains: query, mode: 'insensitive' },
        };
        break;
      case 'phone':
        // Phone search would require additional phone field in User model
        // For now, return empty results
        return NextResponse.json({ 
          users: [], 
          total: 0, 
          page, 
          limit,
          message: 'Phone search coming soon'
        });
      default:
        whereCondition = {
          name: { contains: query, mode: 'insensitive' },
        };
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where: whereCondition });

    // Fetch users with relevant data
    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        createdAt: true,
        musicianProfile: {
          select: {
            instruments: true,
            genres: true,
            availableForCollaboration: true,
            availableForGigs: true,
            location: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            communityTracks: true,
          },
        },
      },
      take: limit,
      skip,
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Transform data for response
    const results = users.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.musicianProfile,
      stats: {
        followers: user._count.followers,
        following: user._count.following,
        tracks: user._count.communityTracks,
      },
    }));

    const response = {
      users: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result
    setCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
