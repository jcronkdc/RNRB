# 📧 Email Integration Test Suite

Automated test suite for verifying email integration functionality.

## 🚀 Running the Tests

```bash
cd apps/web
TEST_EMAIL=justincronk@pm.me pnpm tsx test-email-integration.ts
```

## 📋 What Gets Tested

### Email Service Tests (Direct)

1. ✅ Resend API key configuration check
2. ✅ Simple email sending
3. ✅ Project invite template
4. ✅ Split sheet template (with PDF attachment)
5. ✅ Booking request template
6. ✅ Payment success template
7. ✅ Payment failed template
8. ✅ Trial ending template
9. ✅ General invitation template
10. ✅ Error handling (invalid email)

### API Endpoint Tests

1. ✅ `/api/test-email` endpoint
2. ⚠️ Other endpoints (require authentication)

## ⚙️ Configuration

### Required Environment Variables

The test loads from `apps/web/.env.local`:

- `RESEND_API_KEY` or `EMAIL_SERVER_URL` - Resend API configuration
- `EMAIL_FROM` - Sender email address (optional)
- `TEST_EMAIL` - Email to send test emails to (defaults to `justincronk@pm.me`)
- `TEST_BASE_URL` - Base URL for API tests (defaults to `http://localhost:3000`)

### For API Endpoint Tests

Start the dev server in another terminal:

```bash
pnpm dev
```

## 📊 Test Results

The test suite provides:

- ✅/❌ Pass/fail status for each test
- Detailed error messages
- Summary statistics
- Exit code (0 = all passed, 1 = failures)

## 🔍 Current Test Status

Based on the last run:

- **Configuration**: ❌ EMAIL_SERVER_URL not found in .env.local
- **Email Templates**: All 9 templates tested (will pass once API key is configured)
- **API Endpoints**: Requires dev server to be running

## 💡 Next Steps

1. **Add EMAIL_SERVER_URL to .env.local**:

   ```bash
   EMAIL_SERVER_URL="smtp://resend:YOUR_API_KEY@smtp.resend.com:587"
   EMAIL_FROM="onboarding@resend.dev"
   ```

2. **Or add RESEND_API_KEY**:

   ```bash
   RESEND_API_KEY="re_YOUR_API_KEY"
   EMAIL_FROM="onboarding@resend.dev"
   ```

3. **Run tests again**:

   ```bash
   cd apps/web
   TEST_EMAIL=justincronk@pm.me pnpm tsx test-email-integration.ts
   ```

4. **For API endpoint tests**, start dev server:

   ```bash
   # Terminal 1
   pnpm dev

   # Terminal 2
   cd apps/web
   TEST_EMAIL=justincronk@pm.me pnpm tsx test-email-integration.ts
   ```

## 📝 Test Output Example

```
🚀 Starting Email Integration Test Suite
📧 Test Email: justincronk@pm.me
🌐 Base URL: http://localhost:3000

🧪 Testing Email Service Directly...
✅ Resend API key configured
✅ Simple email sent
✅ Project invite email sent
...

📊 Test Summary
Total Tests: 11
✅ Passed: 11
❌ Failed: 0
Success Rate: 100.0%
```

## 🎯 What This Validates

- ✅ Email service initialization
- ✅ All email templates render correctly
- ✅ Email sending works with Resend
- ✅ Error handling works properly
- ✅ API endpoints respond correctly
- ✅ Email formatting and content

---

**Note**: Tests will only send actual emails if Resend is properly configured. Otherwise, they'll log what would be sent.
