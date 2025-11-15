# Required Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

## Required Variables

### Database
```
DATABASE_URL=your_postgres_connection_string
```

### Authentication
```
NEXTAUTH_SECRET=generate_a_random_secret_at_least_32_chars
NEXTAUTH_URL=https://cronkwaters.vercel.app
```

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://cronkwaters.vercel.app
```

## Optional Variables

### Email with Resend (Recommended)
To enable email authentication (magic links), configure Resend:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify a domain (or use `onboarding@resend.dev` for testing)
4. Add these variables:

```
EMAIL_SERVER_URL=smtp://resend:YOUR_RESEND_API_KEY@smtp.resend.com:587
EMAIL_FROM=noreply@yourdomain.com
```

**Important Notes:**
- Replace `YOUR_RESEND_API_KEY` with your actual Resend API key
- The `EMAIL_FROM` must use a verified domain in Resend
- For testing without a domain, you can use `onboarding@resend.dev` temporarily
- Use port 587 (TLS) or 465 (SSL) for SMTP

**Example:**
```
EMAIL_SERVER_URL=smtp://resend:re_AbCdEf123456@smtp.resend.com:587
EMAIL_FROM=noreply@cronkwaters.com
```

### OAuth Providers (Optional)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
```

### AI Services (Optional)
```
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key
XAI_RATE_LIMIT_RPM=60
XAI_RATE_LIMIT_TPM=60000
```

### Other
```
NEXT_TELEMETRY_DISABLED=1
```

## How to Add in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Make sure to add them for Production, Preview, and Development environments
5. Redeploy after adding all variables

## Generating Secrets

For `NEXTAUTH_SECRET`, you can generate one using:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

