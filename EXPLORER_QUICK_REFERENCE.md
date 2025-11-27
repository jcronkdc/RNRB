# Explorer Feature - Quick Reference

## 🔧 Maintenance Guide

### Adding New Search Fields

To add a new searchable field (e.g., "bio", "location"):

1. **Update API Route** (`apps/web/app/api/discover/search/route.ts`):

```typescript
case 'bio':
  whereCondition = {
    musicianProfile: {
      bio: { contains: query, mode: 'insensitive' }
    }
  };
  break;
```

2. **Add Database Index**:

```sql
CREATE INDEX "MusicianProfile_bio_pattern_idx"
ON "MusicianProfile" ("bio" text_pattern_ops);
```

3. **Update Frontend** (`apps/web/app/discover/page.tsx`):

```typescript
const [searchType, setSearchType] = useState<'username' | 'email' | 'bio'>('username');
```

---

## 🐛 Common Issues & Solutions

### Issue: Slow Search Performance

**Solution:** Check if database indexes are properly applied

```bash
pnpm prisma:studio
# Navigate to indexes tab and verify
```

### Issue: Cache Not Working

**Solution:** Cache is in-memory, resets on server restart. For persistent cache, implement Redis:

```typescript
// Future: Replace in-memory cache with Redis
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.REDIS_URL });
```

### Issue: No Results Found

**Solution:** Check if users have public profiles or email visibility enabled

---

## 📊 Performance Monitoring

### Key Metrics to Track

```typescript
// Add to API route for monitoring
console.time('search-query');
const users = await prisma.user.findMany({...});
console.timeEnd('search-query');

// Track cache hit rate
const cacheHits = cachedResult ? 1 : 0;
const totalRequests = 1;
const hitRate = (cacheHits / totalRequests) * 100;
```

### Database Query Analysis

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM "User"
WHERE "name" ILIKE '%search%'
LIMIT 12;
```

---

## 🔄 API Endpoints

### Search Users

```
GET /api/discover/search?q={query}&type={type}&page={page}&limit={limit}
```

**Parameters:**

- `q` (required): Search query (min 2 characters)
- `type` (optional): `username` | `email` | `phone` (default: `username`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 50)

**Response:**

```json
{
  "users": [...],
  "total": 42,
  "page": 1,
  "limit": 12,
  "totalPages": 4,
  "cached": true
}
```

---

## 🎨 Styling Customization

### UserProfileCard Component

To customize card appearance:

```typescript
// apps/web/components/user-profile-card.tsx

// Change hover effect:
className="rnrb-card group relative overflow-hidden p-6
transition-all hover:shadow-2xl hover:scale-105"

// Modify gradient:
className="absolute inset-0 bg-gradient-to-br
from-brand-primary/10 to-brand-secondary/5"
```

---

## 🧪 Testing Commands

```bash
# Manual API test
curl "http://localhost:3000/api/discover/search?q=test&type=username"

# Load test (requires 'autocannon')
npx autocannon -c 10 -d 30 "http://localhost:3000/api/discover/search?q=john&type=username"

# Check TypeScript
pnpm typecheck

# Check linting
pnpm lint

# Run Prisma Studio
pnpm prisma:studio
```

---

## 📈 Scaling Considerations

### When to Upgrade

**100-1,000 users:**

- Current implementation ✅
- In-memory cache sufficient

**1,000-10,000 users:**

- Add Redis caching
- Implement rate limiting
- Add search analytics

**10,000-100,000 users:**

- Implement Elasticsearch/Algolia
- Add CDN for static assets
- Implement database read replicas

**100,000+ users:**

- Full-text search engine required
- Distributed caching (Redis Cluster)
- Horizontal scaling with load balancer
- Advanced search features (fuzzy matching, synonyms)

---

## 🔐 Security Checklist

- [x] SQL injection protection (Prisma ORM)
- [x] Input validation (min 2 chars)
- [x] Rate limiting (via caching)
- [x] Private data protection
- [ ] TODO: Add explicit rate limiting middleware
- [ ] TODO: Add request logging
- [ ] TODO: Add abuse detection

---

## 📚 Related Documentation

- [Database Schema](/Users/justincronk/Desktop/CronkWaters/DATABASE_SCHEMA.md)
- [Design System](/Users/justincronk/Desktop/CronkWaters/DESIGN_SYSTEM.md)
- [Full Optimization Report](/Users/justincronk/Desktop/CronkWaters/EXPLORER_OPTIMIZATION_REPORT.md)

---

**Last Updated:** 2025-11-25  
**Maintainer:** Development Team






