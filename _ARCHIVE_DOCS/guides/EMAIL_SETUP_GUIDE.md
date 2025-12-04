# RNRB Email & Support System Setup Guide

## Overview

Rock N' Roll Basement now has a comprehensive email and support system:

1. **Business Email Addresses** - Custom @rnrb.me addresses for different purposes
2. **Newsletter System** - Email marketing with subscription management
3. **Support Ticket System** - Help desk with AI assistance
4. **AI IT Support** - The AI assistant can now help with technical issues

---

## Business Email Addresses

You need to configure the following email addresses on your mail server (Stalwart at mail.rnrb.me):

### Required Addresses

| Address              | Purpose              | Notes                    |
| -------------------- | -------------------- | ------------------------ |
| `newsletter@rnrb.me` | Newsletter sending   | Main marketing email     |
| `support@rnrb.me`    | Customer support     | Receives support tickets |
| `info@rnrb.me`       | General inquiries    | Contact form destination |
| `noreply@rnrb.me`    | Transactional emails | Auth emails, receipts    |
| `hello@rnrb.me`      | Friendly contact     | Alternative to info@     |
| `billing@rnrb.me`    | Payment issues       | Stripe-related inquiries |

### Recommended Additional Addresses

| Address                | Purpose                             |
| ---------------------- | ----------------------------------- |
| `press@rnrb.me`        | Press and media inquiries           |
| `security@rnrb.me`     | Security vulnerability reports      |
| `feedback@rnrb.me`     | User feedback                       |
| `partnerships@rnrb.me` | Business partnerships               |
| `team@rnrb.me`         | Internal team communications        |
| `booking@rnrb.me`      | Artist booking (forwarded to users) |
| `legal@rnrb.me`        | Legal inquiries                     |

### Setting Up in Stalwart

1. Access Stalwart admin at `mail.rnrb.me:8080`
2. For each address, create as either:
   - **Alias** → Forwards to your personal email
   - **Account** → Full mailbox with its own storage

Example configuration for `support@rnrb.me`:

```bash
# Create as alias forwarding to admin
curl -X POST http://mail.rnrb.me:8080/api/principal \
  -H "Authorization: Basic ${STALWART_AUTH}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "list",
    "name": "support",
    "emails": ["support@rnrb.me"],
    "members": ["admin@rnrb.me"]
  }'
```

---

## Environment Variables

Add these to your `.env.local` and Vercel environment:

```bash
# ============================================
# EMAIL CONFIGURATION - RNRB Business Emails
# ============================================

# Resend API Key (for sending emails)
# Get from: https://resend.com/api-keys
RESEND_API_KEY="re_..."

# Newsletter
NEWSLETTER_FROM_EMAIL="Rock N' Roll Basement <newsletter@rnrb.me>"

# Support
SUPPORT_EMAIL="Rock N' Roll Basement Support <support@rnrb.me>"
SUPPORT_REPLY_TO="support@rnrb.me"

# General
INFO_EMAIL="info@rnrb.me"
NOREPLY_EMAIL="Rock N' Roll Basement <noreply@rnrb.me>"

# Stalwart Mail Server (for user email accounts)
STALWART_API_URL="http://mail.rnrb.me:8080"
STALWART_ADMIN_USER="admin"
STALWART_ADMIN_PASSWORD="your-admin-password"
STALWART_API_KEY="your-api-key"
```

---

## DNS Configuration

Ensure your DNS records are properly configured for email deliverability:

### MX Records

```
rnrb.me.    IN MX 10 mail.rnrb.me.
```

### SPF Record

```
rnrb.me.    IN TXT "v=spf1 include:_spf.google.com include:sendgrid.net include:amazonses.com a mx ~all"
```

### DKIM Record

```
resend._domainkey.rnrb.me.    IN TXT "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
```

### DMARC Record

```
_dmarc.rnrb.me.    IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@rnrb.me; pct=100"
```

---

## Features

### Newsletter System

The newsletter system provides:

- **Double opt-in** subscription with email confirmation
- **Preference management** - users can choose what emails to receive
- **Frequency settings** - realtime, daily, weekly, or monthly
- **Unsubscribe handling** - one-click unsubscribe
- **Analytics** - open rates, click rates, bounce tracking
- **Campaign management** - schedule and send newsletters

### API Endpoints

```
POST /api/newsletter/subscribe     # Subscribe new email
GET  /api/newsletter/confirm       # Confirm subscription
POST /api/newsletter/unsubscribe   # Unsubscribe
GET  /api/newsletter/unsubscribe   # One-click unsubscribe
```

### Support Ticket System

The support system provides:

- **Ticket creation** with automatic numbering (RNRB-XXXX)
- **Priority levels** - Low, Normal, High, Urgent, Critical
- **Categories** - Account, Billing, Technical, etc.
- **Email notifications** - Confirmation, reply, resolution
- **Conversation threads** - Full history
- **Internal notes** - For support team
- **Satisfaction ratings** - 1-5 stars
- **AI assistance** - AI can create tickets and provide IT support

### API Endpoints

```
GET  /api/support/tickets          # List user's tickets
POST /api/support/tickets          # Create new ticket
GET  /api/support/tickets/:id      # Get ticket details
POST /api/support/tickets/:id      # Reply to ticket
PATCH /api/support/tickets/:id     # Update ticket status
```

---

## AI Assistant Capabilities

The AI assistant now has IT support powers:

### What Users Can Say:

- "I'm having trouble with video calls"
- "The page isn't loading"
- "My audio isn't working"
- "Create a support ticket about..."
- "Show me my support tickets"
- "Subscribe me to the newsletter"
- "I want weekly emails instead of daily"

### AI Can:

1. **Troubleshoot Issues** - Step-by-step debugging for:
   - Audio/video problems
   - Login issues
   - Performance issues
   - Sync problems
   - Browser compatibility

2. **Create Support Tickets** - Automatically when needed

3. **Manage Newsletter** - Subscribe, preferences, frequency

4. **Check System Status** - Report any known issues

5. **Send Feedback** - Route feature requests appropriately

---

## Database Models

New models added to Prisma schema:

- `NewsletterSubscriber` - Email subscriptions
- `SupportTicket` - Help desk tickets
- `SupportTicketMessage` - Ticket conversations
- `SupportTicketTag` - Ticket categorization
- `ContactSubmission` - Contact form submissions
- `BusinessEmailConfig` - Email address settings
- `NewsletterCampaign` - Email campaigns

Run migration:

```bash
pnpm prisma:generate
pnpm prisma db push
```

---

## Quick Start

1. **Set up DNS** - MX, SPF, DKIM, DMARC records
2. **Configure Stalwart** - Create business email addresses
3. **Add environment variables** - All email-related vars
4. **Run migration** - Add new database tables
5. **Test newsletter** - Subscribe yourself
6. **Test support** - Create a test ticket
7. **Test AI** - Ask the assistant for help with a technical issue

---

## Monitoring

### Newsletter Health

- Check bounce rates (should be < 2%)
- Monitor unsubscribe rates
- Track open rates (industry avg ~20%)

### Support Health

- Average response time target: < 4 hours
- Resolution time target: < 24 hours
- Customer satisfaction: > 4.0 stars

---

## Security Considerations

1. **Rate Limiting** - 5 subscriptions/hour per IP, 5 tickets/hour per IP
2. **Email Validation** - All addresses validated before subscription
3. **Token Expiry** - Confirmation tokens expire in 24 hours
4. **User Isolation** - Users can only see their own tickets
5. **Admin Verification** - Only isOwner users can access admin functions

---

## Future Enhancements

- [ ] Slack integration for urgent tickets
- [ ] Auto-responder with AI for common questions
- [ ] Knowledge base integration
- [ ] Ticket escalation workflows
- [ ] SLA tracking and alerts
- [ ] Newsletter A/B testing
- [ ] Email template builder

---

_Last updated: December 2, 2025_
