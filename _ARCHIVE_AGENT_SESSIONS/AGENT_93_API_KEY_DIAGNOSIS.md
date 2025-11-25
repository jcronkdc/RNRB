# 🔍 Agent 93 - Songwriting AI API Key Diagnosis

**Date:** 2025-11-24  
**Task:** Continue Agent 92's work - find missing API keys for songwriting tool  
**Status:** 🔴 **CRITICAL BLOCKAGE FOUND**

---

## 🎯 Executive Summary

**CRITICAL FINDING:** The songwriting tool's AI features are **completely non-functional** in production because **NO AI API KEY is configured in Vercel**.

### Health Check Results (Production)
```json
{
  "status": "healthy",
  "environment": "production",
  "checks": {
    "env": {
      "DATABASE_URL": true,
      "NEXTAUTH_SECRET": true,
      "GOOGLE_CLIENT_ID": true,
      "GOOGLE_CLIENT_SECRET": true,
      "DAILY_API_KEY": true,
      "ABLY_API_KEY": true,
      "OPENROUTER_API_KEY": false ❌
    },
    "services": {
      "oauth": true,
      "video": true,
      "chat": true,
      "ai": false ❌
    },
    "healthPercentage": 100
  }
}
```

---

## 🐜 Tokyo Ant Pathway Analysis

### Pathway 1: Lyrics Assistant → AI Chat → OpenAI
**Flow:** User clicks "AI Assistant" tab → `/api/ai/chat-assist` → `getChatAssistance()` → OpenAI API

**Blockage:**
```typescript
// apps/web/lib/ai/openai.ts:18
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('OPENAI_API_KEY not configured');
  return null; // ❌ Returns null, AI fails silently
}
```

**Result:** AI suggestions return error message: "AI lyric assistant unavailable. Check OPENAI_API_KEY."

---

### Pathway 2: Social Media Generator → Content API → OpenAI
**Flow:** User generates social content → `/api/ai/generate-content` → `generateContent()` → OpenAI API

**Blockage:**
```typescript
// apps/web/app/api/ai/generate-content/route.ts:59
if (!content) {
  return NextResponse.json(
    { error: 'AI content generation unavailable. Check OPENAI_API_KEY.' },
    { status: 503 }
  );
}
```

**Result:** 503 Service Unavailable

---

### Pathway 3: Chord Progression → Key Detection → OpenRouter (Alternative)
**Flow:** User types lyrics → Real-time key detection → `/api/chord-analyzer` → OpenRouter or OpenAI

**Code:**
```typescript
// apps/web/lib/music-theory/ai-key-detector.ts:113
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
```

**Blockage:** Both API keys missing

---

### Pathway 4: Collaboration Chat → AI Suggestions → OpenAI
**Flow:** User asks for help in chat → Ably message → `/api/ai/chat-assist` → OpenAI API

**Blockage:** Same as Pathway 1

---

## 📋 Required API Keys

### 1. OPENAI_API_KEY (Primary) ❌ MISSING
**Purpose:**
- AI lyric suggestions
- Chat assistance
- Social media content generation
- Session transcription (Whisper API)
- Mix suggestions
- Tour routing optimization
- Royalty split analysis

**Format:** `sk-...` (starts with "sk-")  
**Where to get:** https://platform.openai.com/api-keys  
**Cost:** Pay-as-you-go (gpt-4o-mini is $0.150/$0.600 per 1M tokens)

**Used in:**
- `/apps/web/lib/ai/openai.ts` (8 functions)
- `/apps/web/app/api/ai/chat-assist/route.ts`
- `/apps/web/app/api/ai/generate-content/route.ts`
- `/apps/web/app/api/ai/tour-router/route.ts`
- `/apps/web/app/api/ai/transcribe/route.ts`
- `/apps/web/components/songwriting/lyrics-assistant.tsx`
- `/apps/web/components/ably/chat-room.tsx`
- `/apps/web/components/social-media-generator.tsx`

---

### 2. OPENROUTER_API_KEY (Alternative) ❌ MISSING
**Purpose:**
- Alternative to OpenAI
- Real-time chord key detection
- Can route to multiple AI providers

**Format:** `sk-or-v1-...`  
**Where to get:** https://openrouter.ai/keys  
**Cost:** Varies by model (often cheaper than OpenAI)

**Used in:**
- `/apps/web/lib/music-theory/ai-key-detector.ts`
- Checked in health endpoint

---

### 3. ELEVENLABS_API_KEY (Voice Synthesis) ❓ OPTIONAL
**Purpose:**
- Voice synthesis features (future)
- Text-to-speech for demos

**Status:** Defined in schema but not actively used yet

**Used in:**
- `/apps/web/lib/env.ts` (schema only)

---

## 🔥 Impact Analysis

### Features Currently Broken
1. ❌ **Lyrics Assistant** - All AI suggestions fail
2. ❌ **Chat AI Assistant** - In-app help unavailable
3. ❌ **Social Media Generator** - Cannot generate content
4. ❌ **Chord Key Detection** - Real-time analysis disabled
5. ❌ **Tour Router** - Tokyo Ant optimization unavailable
6. ❌ **Session Transcription** - Whisper API unavailable
7. ❌ **Mix Suggestions** - Audio analysis AI disabled
8. ❌ **Royalty Split Advisor** - Fair split calculations unavailable

### Features Still Working ✅
- ✅ Rhyme dictionary (uses Datamuse API)
- ✅ Thesaurus (uses Datamuse API)
- ✅ Syllable counter (client-side algorithm)
- ✅ Manual chord placement
- ✅ Song structure builder (no AI needed)
- ✅ All non-AI collaboration features

---

## 🛠️ Fix Instructions

### Option 1: Add OpenAI Key (Recommended)

1. **Get API Key:**
   ```bash
   # Go to: https://platform.openai.com/api-keys
   # Click "Create new secret key"
   # Copy the key (starts with sk-...)
   ```

2. **Add to Vercel:**
   ```bash
   # Go to: https://vercel.com/[team]/cronkwater/settings/environment-variables
   # Add new variable:
   # Name: OPENAI_API_KEY
   # Value: sk-...
   # Environment: Production, Preview, Development (check all)
   # Save
   ```

3. **Redeploy:**
   ```bash
   # Vercel will auto-deploy after env var change
   # Or manually trigger: vercel deploy --prod
   ```

4. **Verify:**
   ```bash
   # Check health: https://www.cronkwaters.com/api/health
   # Should show: "OPENAI_API_KEY": true, "ai": true
   ```

---

### Option 2: Add OpenRouter Key (Alternative)

If OpenAI is too expensive or unavailable:

1. **Get API Key:**
   ```bash
   # Go to: https://openrouter.ai/keys
   # Create account and get key
   # Copy key (starts with sk-or-v1-...)
   ```

2. **Add to Vercel:**
   ```bash
   # Name: OPENROUTER_API_KEY
   # Value: sk-or-v1-...
   # Note: Some features still require OPENAI_API_KEY
   ```

3. **Update Code:**
   ```typescript
   // Modify lib/ai/openai.ts to support OpenRouter
   // This requires code changes
   ```

---

## 📊 API Cost Estimates

### OpenAI Pricing (gpt-4o-mini)
- **Input:** $0.150 per 1M tokens (~750K words)
- **Output:** $0.600 per 1M tokens (~750K words)
- **Whisper:** $0.006 per minute of audio

### Estimated Monthly Costs
**Low Usage (50 users):**
- Lyric suggestions: 500 requests × 500 tokens = $0.08
- Chat assist: 1000 messages × 300 tokens = $0.18
- Total: ~$0.50/month

**Medium Usage (500 users):**
- Lyric suggestions: 5000 requests × 500 tokens = $0.75
- Chat assist: 10000 messages × 300 tokens = $1.80
- Content generation: 1000 requests × 800 tokens = $1.20
- Total: ~$5/month

**High Usage (5000 users):**
- Total: ~$50/month

---

## 🧪 Testing Plan (After Fix)

### Test 1: Lyrics Assistant AI
1. Sign in to https://www.cronkwaters.com/auth
2. Go to `/songwriting`
3. Click "Lyrics Assistant" tab
4. Click "AI Assistant" button
5. Type: "help with chorus about heartbreak"
6. Click "Search"
7. **Expected:** AI suggestion appears (not error message)

### Test 2: Chat AI Assistant
1. Open any project with chat
2. Send message: "@ai suggest a chord progression for verse"
3. **Expected:** AI responds with chord suggestions

### Test 3: Social Media Generator
1. Go to any song page
2. Click "Generate Social Media Post"
3. Fill in details
4. Click "Generate"
5. **Expected:** AI-generated content appears

### Test 4: Health Check
1. Visit: https://www.cronkwaters.com/api/health
2. **Expected:**
   ```json
   {
     "OPENAI_API_KEY": true,
     "ai": true
   }
   ```

---

## 🔗 Related Files

**Configuration:**
- `apps/web/lib/env.ts` - Environment variable schema
- `apps/web/lib/ai/openai.ts` - OpenAI client initialization

**API Routes:**
- `apps/web/app/api/ai/chat-assist/route.ts` - Chat assistance
- `apps/web/app/api/ai/generate-content/route.ts` - Content generation
- `apps/web/app/api/ai/tour-router/route.ts` - Tour optimization
- `apps/web/app/api/ai/transcribe/route.ts` - Audio transcription

**Components:**
- `apps/web/components/songwriting/lyrics-assistant.tsx` - Lyrics AI UI
- `apps/web/components/ably/chat-room.tsx` - Chat AI integration
- `apps/web/components/social-media-generator.tsx` - Content generator UI

**Documentation:**
- `VERCEL_ENV_CHECKLIST.md` - Lists OPENAI_API_KEY as optional
- `DEPLOYMENT.md` - Mentions AI features as optional
- `MASTER_TRUTH.md` - Current project state

---

## 📈 Next Steps

### Immediate (High Priority)
1. ✅ **Diagnosis Complete** - Found missing API keys
2. ⏳ **Human Decision Required:** User must:
   - Get OpenAI API key from https://platform.openai.com/api-keys
   - Add to Vercel environment variables
   - Trigger redeploy
3. ⏳ **Post-Fix Testing** - Run full AI feature test suite

### Follow-Up (Medium Priority)
1. Update `VERCEL_ENV_CHECKLIST.md` to mark `OPENAI_API_KEY` as **REQUIRED** (not optional)
2. Add better error handling for missing API keys (show upgrade prompt)
3. Implement fallback behavior when AI unavailable
4. Add API usage monitoring (PostHog events)

### Optional Enhancements
1. Support OpenRouter as alternative to OpenAI
2. Add AI feature toggles for cost control
3. Implement caching to reduce API calls
4. Add mock responses for development environment

---

## 🎓 Lessons Learned

1. **Silent Failures:** AI features fail silently with null returns - need better error visibility
2. **Optional vs Required:** Marked as "optional" but songwriting tool heavily relies on AI
3. **Multi-Provider Support:** Should support multiple AI providers (OpenAI, OpenRouter, Anthropic)
4. **Cost Monitoring:** No tracking of AI API usage - could lead to surprise bills
5. **Development Environment:** No mock responses, making local dev testing difficult

---

## 📝 For Next Agent

### If API Key Gets Added:
1. Wait for Vercel deployment to complete
2. Run health check: https://www.cronkwaters.com/api/health
3. Verify `"OPENAI_API_KEY": true` and `"ai": true`
4. Run all 4 AI feature tests (see Testing Plan above)
5. Document results in new agent report
6. Update MASTER_TRUTH.md with "AI features operational" status

### If User Doesn't Have API Key:
1. Mark songwriting AI features as "unavailable by design"
2. Update UI to show upgrade prompts instead of error messages
3. Consider implementing free tier with limited AI calls
4. Explore alternative free AI providers

---

**Report Status:** ✅ Diagnosis Complete  
**Blockage:** 🔴 Missing OPENAI_API_KEY in production  
**Next Action:** Human must add API key to Vercel  
**Agent:** Mycelial Network Agent 93  

---

**END OF REPORT**


