# RNRB Email Worker

Cloudflare Email Worker that automatically creates support tickets from incoming emails.

## Features

- **Auto-Ticket Creation**: Emails to `support@rnrb.me` automatically create support tickets
- **Smart Categorization**: Analyzes email content to categorize tickets (Bug, Feature Request, Billing, etc.)
- **Auto-Reply**: Sends confirmation email with ticket number
- **Admin Forwarding**: Always forwards original email to admin inbox

## Flow

```
1. User emails support@rnrb.me
        ↓
2. Cloudflare Email Routing → Email Worker
        ↓
3. Worker parses email (subject, body, sender)
        ↓
4. Creates ticket via RNRB API
        ↓
5. Sends auto-reply with ticket number
        ↓
6. Forwards original to admin inbox
```

## Setup

### 1. Install Dependencies

```bash
cd apps/email-worker
pnpm install
```

### 2. Set Secrets

```bash
# Use the same API key as your MCP server
pnpm wrangler secret put RNRB_API_KEY
```

### 3. Deploy

```bash
pnpm deploy
```

### 4. Configure Email Routing in Cloudflare

1. Go to **Cloudflare Dashboard** → **rnrb.me** → **Email** → **Email Routing**
2. Click **"Email Workers"** tab
3. Click **"Create"** to create a new email worker trigger
4. Set:
   - **Custom address**: `support`
   - **Action**: Send to Worker → `rnrb-email-worker`
5. Save

Now emails to `support@rnrb.me` will be processed by this worker!

## MailChannels Integration

This worker uses [MailChannels](https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels) for sending auto-reply emails. It's **free** for Cloudflare Workers.

### DNS Setup for MailChannels

Add this TXT record to your DNS:

```
Type: TXT
Name: _mailchannels
Value: v=mc1 cfid=rnrb.me
```

This authorizes MailChannels to send emails on behalf of your domain.

## Environment Variables

| Variable        | Description                                          |
| --------------- | ---------------------------------------------------- |
| `RNRB_API_URL`  | Main RNRB API URL (default: https://cronkwaters.com) |
| `ADMIN_EMAIL`   | Email to forward all messages to                     |
| `SUPPORT_EMAIL` | From address for auto-replies                        |
| `RNRB_API_KEY`  | API key for ticket creation (secret)                 |

## Categories

The worker automatically categorizes tickets based on keywords:

| Category        | Keywords                               |
| --------------- | -------------------------------------- |
| BUG             | bug, error, broken, crash, not working |
| FEATURE_REQUEST | feature, request, suggestion, add      |
| BILLING         | billing, payment, subscription, refund |
| ACCOUNT         | account, login, password, access       |
| QUESTION        | how, help, question, where             |
| GENERAL         | (default)                              |

## Logs

View real-time logs:

```bash
pnpm wrangler tail
```

## Testing

Send a test email to `support@rnrb.me` and check:

1. Ticket appears in RNRB admin dashboard
2. Auto-reply received
3. Email forwarded to admin inbox
