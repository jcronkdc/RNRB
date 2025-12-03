#!/bin/bash
#
# RNRB Mail Server Setup Script
# 
# This script sets up a production-ready mail server using Stalwart
# on Ubuntu 24.04 LTS
#
# Usage: ./setup-server.sh <domain> <admin_password>
# Example: ./setup-server.sh rnrb.me mysecurepassword
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-rnrb.me}"
ADMIN_PASSWORD="${2:-$(openssl rand -base64 32)}"
HOSTNAME="mail.${DOMAIN}"
STALWART_VERSION="latest"
BACKUP_DIR="/var/backups/stalwart"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           RNRB Mail Server Setup                       ║${NC}"
echo -e "${BLUE}║           Domain: ${HOSTNAME}                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Step 1: System Update
echo -e "\n${BLUE}Step 1: Updating system...${NC}"
apt update && apt upgrade -y
print_status "System updated"

# Step 2: Set hostname
echo -e "\n${BLUE}Step 2: Setting hostname...${NC}"
hostnamectl set-hostname "${HOSTNAME}"
echo "127.0.0.1 ${HOSTNAME}" >> /etc/hosts
print_status "Hostname set to ${HOSTNAME}"

# Step 3: Install dependencies
echo -e "\n${BLUE}Step 3: Installing dependencies...${NC}"
apt install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    certbot \
    ufw \
    fail2ban \
    unattended-upgrades \
    rsync \
    logrotate
print_status "Dependencies installed"

# Step 4: Configure firewall
echo -e "\n${BLUE}Step 4: Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 25/tcp    # SMTP
ufw allow 465/tcp   # SMTPS
ufw allow 587/tcp   # Submission
ufw allow 993/tcp   # IMAPS
ufw allow 143/tcp   # IMAP
ufw allow 443/tcp   # HTTPS/JMAP
ufw allow 80/tcp    # HTTP (for Let's Encrypt)
ufw --force enable
print_status "Firewall configured"

# Step 5: Get SSL certificate
echo -e "\n${BLUE}Step 5: Obtaining SSL certificate...${NC}"
certbot certonly --standalone \
    -d "${HOSTNAME}" \
    --non-interactive \
    --agree-tos \
    --email "admin@${DOMAIN}" \
    --preferred-challenges http
print_status "SSL certificate obtained"

# Step 6: Install Stalwart Mail Server
echo -e "\n${BLUE}Step 6: Installing Stalwart Mail Server...${NC}"

# Download and install Stalwart
curl -sL https://get.stalw.art | bash -s -- --version ${STALWART_VERSION}

print_status "Stalwart Mail Server installed"

# Step 7: Configure Stalwart
echo -e "\n${BLUE}Step 7: Configuring Stalwart...${NC}"

# Create config directory if it doesn't exist
mkdir -p /opt/stalwart-mail/etc

# Generate DKIM key
echo -e "${BLUE}Generating DKIM key...${NC}"
openssl genrsa -out /opt/stalwart-mail/etc/dkim-private.pem 2048
openssl rsa -in /opt/stalwart-mail/etc/dkim-private.pem -pubout -out /opt/stalwart-mail/etc/dkim-public.pem
chmod 600 /opt/stalwart-mail/etc/dkim-private.pem

# Create main configuration
cat > /opt/stalwart-mail/etc/config.toml << EOF
#
# RNRB Mail Server Configuration
# Stalwart Mail Server
#

[server]
hostname = "${HOSTNAME}"
run-as-user = "stalwart-mail"

# TLS Certificate
[certificate.default]
cert = "/etc/letsencrypt/live/${HOSTNAME}/fullchain.pem"
private-key = "/etc/letsencrypt/live/${HOSTNAME}/privkey.pem"

# SMTP Listener (Port 25 - receiving)
[server.listener.smtp]
bind = ["[::]:25"]
protocol = "smtp"
tls.implicit = false
tls.starttls = true

# SMTP Submission (Port 587 - sending with STARTTLS)
[server.listener.submission]
bind = ["[::]:587"]
protocol = "smtp"
tls.implicit = false
tls.starttls = true

# SMTPS (Port 465 - sending with implicit TLS)
[server.listener.submissions]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true

# IMAP (Port 143 - with STARTTLS)
[server.listener.imap]
bind = ["[::]:143"]
protocol = "imap"
tls.implicit = false
tls.starttls = true

# IMAPS (Port 993 - implicit TLS)
[server.listener.imaps]
bind = ["[::]:993"]
protocol = "imap"
tls.implicit = true

# JMAP/HTTPS (Port 443)
[server.listener.https]
bind = ["[::]:443"]
protocol = "http"
tls.implicit = true

# Admin API (Port 8080 - restrict access!)
[server.listener.admin]
bind = ["127.0.0.1:8080"]
protocol = "http"
tls.implicit = false

# Storage
[store.db]
type = "rocksdb"
path = "/opt/stalwart-mail/data/db"

[store.blob]
type = "fs"
path = "/opt/stalwart-mail/data/blobs"

# Full-text search
[store.fts]
type = "rocksdb"
path = "/opt/stalwart-mail/data/fts"

# Authentication
[directory.internal]
type = "internal"
store = "db"

[authentication]
fallback-admin.user = "admin"
fallback-admin.secret = "${ADMIN_PASSWORD}"

# DKIM Signing
[signature.dkim.default]
private-key = "file:///opt/stalwart-mail/etc/dkim-private.pem"
domain = "${DOMAIN}"
selector = "mail"
algorithm = "rsa-sha256"
canonicalization = "relaxed/relaxed"
headers = ["From", "To", "Subject", "Date", "Message-ID"]

# Spam filtering
[spam]
header.is-spam = "X-Spam-Status"
header.score = "X-Spam-Score"

[spam.score]
spam-threshold = 5.0
discard-threshold = 10.0

# Rate limiting
[rate-limit.smtp]
messages = "100/1h"
recipients = "500/1h"
size = "100M/1h"

# Session limits
[session.smtp]
max-message-size = 26214400  # 25 MB

# Logging
[tracing]
method = "stdout"
level = "info"

# Domains we handle mail for
[session.rcpt]
relay = false
directory = "internal"

# Add supported domains
[[lookup.domains]]
name = "${DOMAIN}"

[[lookup.domains]]
name = "rnrb.band"

[[lookup.domains]]
name = "rnrb.app"
EOF

print_status "Stalwart configured"

# Step 8: Set permissions
echo -e "\n${BLUE}Step 8: Setting permissions...${NC}"
chown -R stalwart-mail:stalwart-mail /opt/stalwart-mail
chmod 750 /opt/stalwart-mail/data
chmod 640 /opt/stalwart-mail/etc/config.toml
print_status "Permissions set"

# Step 9: Start Stalwart
echo -e "\n${BLUE}Step 9: Starting Stalwart...${NC}"
systemctl enable stalwart-mail
systemctl start stalwart-mail
sleep 3

if systemctl is-active --quiet stalwart-mail; then
    print_status "Stalwart Mail Server is running"
else
    print_error "Stalwart failed to start. Check: journalctl -u stalwart-mail"
    exit 1
fi

# Step 10: Configure Fail2ban
echo -e "\n${BLUE}Step 10: Configuring Fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[stalwart-smtp]
enabled = true
port = smtp,465,587
filter = stalwart-smtp
logpath = /opt/stalwart-mail/logs/smtp.log
maxretry = 3

[stalwart-imap]
enabled = true
port = imap,imaps
filter = stalwart-imap
logpath = /opt/stalwart-mail/logs/imap.log
maxretry = 5
EOF

cat > /etc/fail2ban/filter.d/stalwart-smtp.conf << EOF
[Definition]
failregex = ^.*SMTP.*authentication failed.*remote=<HOST>.*$
ignoreregex =
EOF

cat > /etc/fail2ban/filter.d/stalwart-imap.conf << EOF
[Definition]
failregex = ^.*IMAP.*authentication failed.*remote=<HOST>.*$
ignoreregex =
EOF

systemctl restart fail2ban
print_status "Fail2ban configured"

# Step 11: Setup automatic certificate renewal
echo -e "\n${BLUE}Step 11: Setting up certificate renewal...${NC}"
cat > /etc/cron.d/certbot-renew << EOF
0 3 * * * root certbot renew --quiet --post-hook "systemctl reload stalwart-mail"
EOF
print_status "Certificate auto-renewal configured"

# Step 12: Setup backups
echo -e "\n${BLUE}Step 12: Setting up backups...${NC}"
mkdir -p "${BACKUP_DIR}"

cat > /usr/local/bin/backup-mail.sh << 'BACKUP_EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR="/var/backups/stalwart"
STALWART_DATA="/opt/stalwart-mail/data"

# Create backup
tar -czf "${BACKUP_DIR}/stalwart-${DATE}.tar.gz" -C /opt/stalwart-mail data etc

# Keep only last 7 days
find "${BACKUP_DIR}" -name "stalwart-*.tar.gz" -mtime +7 -delete

echo "Backup completed: stalwart-${DATE}.tar.gz"
BACKUP_EOF

chmod +x /usr/local/bin/backup-mail.sh

# Add daily backup cron
echo "0 2 * * * root /usr/local/bin/backup-mail.sh" > /etc/cron.d/stalwart-backup
print_status "Backup system configured"

# Step 13: Extract DKIM public key for DNS
echo -e "\n${BLUE}Step 13: Generating DNS records...${NC}"
DKIM_PUBLIC=$(grep -v "^-" /opt/stalwart-mail/etc/dkim-public.pem | tr -d '\n')

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    SETUP COMPLETE!                                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Add these DNS records to your domain:${NC}"
echo ""
echo -e "${BLUE}MX Record:${NC}"
echo "  ${DOMAIN}    MX    10    ${HOSTNAME}"
echo ""
echo -e "${BLUE}A Record:${NC}"
echo "  ${HOSTNAME}    A    $(curl -s ifconfig.me)"
echo ""
echo -e "${BLUE}SPF Record:${NC}"
echo "  ${DOMAIN}    TXT    \"v=spf1 mx a:${HOSTNAME} ~all\""
echo ""
echo -e "${BLUE}DKIM Record:${NC}"
echo "  mail._domainkey.${DOMAIN}    TXT    \"v=DKIM1; k=rsa; p=${DKIM_PUBLIC}\""
echo ""
echo -e "${BLUE}DMARC Record:${NC}"
echo "  _dmarc.${DOMAIN}    TXT    \"v=DMARC1; p=quarantine; rua=mailto:dmarc@${DOMAIN}\""
echo ""
echo -e "${YELLOW}Admin Credentials:${NC}"
echo "  URL: https://${HOSTNAME}:8080 (from localhost only)"
echo "  User: admin"
echo "  Password: ${ADMIN_PASSWORD}"
echo ""
echo -e "${YELLOW}Connection Settings for Mail Apps:${NC}"
echo "  IMAP Server: ${HOSTNAME}"
echo "  IMAP Port: 993 (SSL/TLS)"
echo "  SMTP Server: ${HOSTNAME}"
echo "  SMTP Port: 465 (SSL/TLS)"
echo ""
echo -e "${GREEN}Save these credentials securely!${NC}"
echo ""

# Save credentials to file
cat > /root/mail-server-credentials.txt << EOF
RNRB Mail Server Credentials
=============================
Domain: ${DOMAIN}
Hostname: ${HOSTNAME}
Server IP: $(curl -s ifconfig.me)

Admin API:
  URL: https://${HOSTNAME}:8080
  User: admin
  Password: ${ADMIN_PASSWORD}

Environment Variables for RNRB:
  STALWART_API_URL=http://127.0.0.1:8080
  STALWART_ADMIN_USER=admin
  STALWART_ADMIN_PASSWORD=${ADMIN_PASSWORD}

DKIM Public Key:
${DKIM_PUBLIC}

Created: $(date)
EOF

chmod 600 /root/mail-server-credentials.txt
echo -e "${GREEN}Credentials saved to: /root/mail-server-credentials.txt${NC}"



