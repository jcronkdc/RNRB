# RNRB Mail - Setup Guide

## Overview

RNRB Mail is a professional email service for musicians, providing `@rnrb.me` email addresses that work with any standard mail app.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     RNRB Mail System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ RNRB Web    │  │ Mail Apps   │  │ Webmail     │        │
│  │ (Settings)  │  │ (IMAP/SMTP) │  │ (Future)    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                  │
│              ┌───────────┴───────────┐                     │
│              │    Stalwart Mail      │                     │
│              │    Server (Rust)      │                     │
│              └───────────┬───────────┘                     │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐           │
│    │  JMAP   │     │  IMAP   │     │  SMTP   │           │
│    │ (Modern)│     │  :993   │     │  :465   │           │
│    └─────────┘     └─────────┘     └─────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Server Setup

### Option A: Hetzner Cloud (Recommended)

1. **Create Server**

   ```
   Location: US East (Ashburn) or Germany
   Type: CX32 (4 vCPU, 8GB RAM, 80GB SSD)
   OS: Ubuntu 24.04
   Cost: ~$14/month
   ```

2. **Initial Setup**

   ```bash
   # SSH into server
   ssh root@YOUR_SERVER_IP

   # Update system
   apt update && apt upgrade -y

   # Set hostname
   hostnamectl set-hostname mail.rnrb.me

   # Add to /etc/hosts
   echo "YOUR_SERVER_IP mail.rnrb.me" >> /etc/hosts
   ```

### Option B: DigitalOcean

1. **Create Droplet**
   ```
   Region: NYC1 or SFO3
   Size: Basic (4GB RAM, 2 vCPU)
   OS: Ubuntu 24.04
   Cost: ~$24/month
   ```

## Phase 2: DNS Configuration

Add these records to your DNS (Vercel or Cloudflare):

### A Records

```
mail.rnrb.me    A    YOUR_SERVER_IP
```

### MX Records

```
rnrb.me         MX   10   mail.rnrb.me
rnrb.band       MX   10   mail.rnrb.me
rnrb.app        MX   10   mail.rnrb.me
```

### SPF Record

```
rnrb.me         TXT  "v=spf1 mx a:mail.rnrb.me ~all"
rnrb.band       TXT  "v=spf1 mx a:mail.rnrb.me ~all"
rnrb.app        TXT  "v=spf1 mx a:mail.rnrb.me ~all"
```

### DKIM Record (Generated after Stalwart setup)

```
mail._domainkey.rnrb.me    TXT    "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
```

### DMARC Record

```
_dmarc.rnrb.me     TXT    "v=DMARC1; p=quarantine; rua=mailto:dmarc@rnrb.me"
```

### PTR Record (Reverse DNS)

Contact your VPS provider to set:

```
YOUR_SERVER_IP → mail.rnrb.me
```

## Phase 3: Install Stalwart Mail Server

```bash
# Download and install Stalwart
curl -sL https://get.stalw.art | sudo bash

# The installer will:
# 1. Install Stalwart Mail Server
# 2. Generate SSL certificates (Let's Encrypt)
# 3. Configure DKIM keys
# 4. Set up systemd service
```

### Configuration

Edit `/opt/stalwart-mail/etc/config.toml`:

```toml
[server]
hostname = "mail.rnrb.me"

[server.listener.smtp]
bind = ["[::]:25"]
protocol = "smtp"

[server.listener.submission]
bind = ["[::]:587"]
protocol = "smtp"
tls.implicit = false

[server.listener.submissions]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true

[server.listener.imap]
bind = ["[::]:143"]
protocol = "imap"
tls.implicit = false

[server.listener.imaps]
bind = ["[::]:993"]
protocol = "imap"
tls.implicit = true

[server.listener.jmap]
bind = ["[::]:443"]
protocol = "jmap"
tls.implicit = true

[directory."rnrb"]
type = "http"
url = "https://rnrb.app/api/email/stalwart"
```

### SSL Certificates

```bash
# Install certbot
apt install certbot -y

# Get certificate
certbot certonly --standalone -d mail.rnrb.me

# Configure in Stalwart
# Edit /opt/stalwart-mail/etc/config.toml
[certificate."mail"]
cert = "/etc/letsencrypt/live/mail.rnrb.me/fullchain.pem"
key = "/etc/letsencrypt/live/mail.rnrb.me/privkey.pem"
```

## Phase 4: Environment Variables

Add to Vercel:

```
STALWART_API_URL=https://mail.rnrb.me:8080
STALWART_API_KEY=your_admin_api_key
```

## Phase 5: Firewall Configuration

```bash
# Allow mail ports
ufw allow 25/tcp    # SMTP
ufw allow 465/tcp   # SMTPS
ufw allow 587/tcp   # Submission
ufw allow 993/tcp   # IMAPS
ufw allow 143/tcp   # IMAP
ufw allow 443/tcp   # HTTPS/JMAP
ufw allow 8080/tcp  # Admin API (restrict to RNRB servers)

ufw enable
```

## Phase 6: Test Configuration

### Test SMTP

```bash
# From another server
openssl s_client -connect mail.rnrb.me:465
```

### Test IMAP

```bash
openssl s_client -connect mail.rnrb.me:993
```

### Test Mail Delivery

```bash
# Send test email
echo "Test" | mail -s "Test" test@rnrb.me
```

### Check DNS

```bash
# Check MX
dig MX rnrb.me

# Check SPF
dig TXT rnrb.me

# Check DKIM
dig TXT mail._domainkey.rnrb.me
```

## Monitoring

### Logs

```bash
# View mail logs
journalctl -u stalwart-mail -f
```

### Metrics

Stalwart provides metrics at:

```
https://mail.rnrb.me:8080/metrics
```

## Backup

### Daily Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-mail.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups/mail

# Backup Stalwart data
tar -czf $BACKUP_DIR/stalwart-$DATE.tar.gz /opt/stalwart-mail/data

# Upload to S3/R2
aws s3 cp $BACKUP_DIR/stalwart-$DATE.tar.gz s3://rnrb-backups/mail/

# Keep last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

## Mobile Apps

RNRB Mail works with:

### iOS

- Apple Mail (built-in)
- Spark
- Edison Mail
- Outlook

### Android

- Gmail app
- Outlook
- K-9 Mail
- Blue Mail

### Desktop

- Apple Mail
- Outlook
- Thunderbird
- Mailspring

## Connection Settings

```
IMAP Server: mail.rnrb.me
IMAP Port: 993
IMAP Security: SSL/TLS

SMTP Server: mail.rnrb.me
SMTP Port: 465
SMTP Security: SSL/TLS

Username: your-email@rnrb.me
Password: (App Password from Settings)
```

## Costs

| Item                  | Monthly Cost   |
| --------------------- | -------------- |
| Server (Hetzner CX32) | $14            |
| Backup Storage (R2)   | ~$2            |
| **Total**             | **~$16/month** |

## Future Enhancements

- [ ] Custom webmail UI in RNRB dashboard
- [ ] Native mobile apps (Flutter)
- [ ] Calendar integration
- [ ] Contact sync
- [ ] Push notifications
- [ ] Smart booking inbox
- [ ] Fan mail categorization
