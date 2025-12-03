import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface LinkSharedEmailProps {
  recipientEmail: string;
  senderName: string;
  fileName: string;
  shareUrl: string;
  hasPassword: boolean;
  canDownload: boolean;
  expiresAt?: string | null;
  message?: string;
}

export function LinkSharedEmail({
  recipientEmail,
  senderName,
  fileName,
  shareUrl,
  hasPassword,
  canDownload,
  expiresAt,
  message,
}: LinkSharedEmailProps) {
  const previewText = `${senderName} shared "${fileName}" with you`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://rnrb.app/logo-dark.png"
              width="150"
              height="60"
              alt="Rock N' Roll Basement"
              style={logo}
            />
          </Section>

          <Heading style={heading}>You've Got a File!</Heading>

          <Text style={paragraph}>
            <strong>{senderName}</strong> shared a file with you on Rock N' Roll Basement.
          </Text>

          {/* File Info */}
          <Section style={fileSection}>
            <Text style={fileIcon}>📄</Text>
            <Text style={fileNameText}>{fileName}</Text>
          </Section>

          {/* Optional Message */}
          {message && (
            <Section style={messageSection}>
              <Text style={messageLabel}>Message:</Text>
              <Text style={messageText}>"{message}"</Text>
            </Section>
          )}

          {/* Info badges */}
          <Section style={badgesSection}>
            {hasPassword && <Text style={badgePassword}>🔒 Password protected</Text>}
            {canDownload && <Text style={badgeDownload}>⬇️ Download enabled</Text>}
            {expiresAt && (
              <Text style={badgeExpires}>
                ⏰ Expires: {new Date(expiresAt).toLocaleDateString()}
              </Text>
            )}
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={shareUrl}>
              View File
            </Button>
          </Section>

          {/* Password notice */}
          {hasPassword && (
            <Text style={passwordNotice}>
              You'll need to enter the password provided by {senderName} to access this file.
            </Text>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent from{' '}
            <Link href="https://rnrb.app" style={link}>
              Rock N' Roll Basement
            </Link>
            . If you didn't expect this email, you can safely ignore it.
          </Text>

          <Text style={footerSmall}>Sent to {recipientEmail}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#111111',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '12px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const paragraph = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const fileSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const fileIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const fileNameText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const messageSection = {
  backgroundColor: '#1f2937',
  borderLeft: '4px solid #f97316',
  borderRadius: '0 8px 8px 0',
  padding: '16px',
  margin: '24px 0',
};

const messageLabel = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const messageText = {
  color: '#e5e5e5',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '24px',
};

const badgesSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const badgePassword = {
  color: '#fbbf24',
  fontSize: '14px',
  margin: '4px 0',
};

const badgeDownload = {
  color: '#10b981',
  fontSize: '14px',
  margin: '4px 0',
};

const badgeExpires = {
  color: '#60a5fa',
  fontSize: '14px',
  margin: '4px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
};

const passwordNotice = {
  color: '#fbbf24',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
  fontStyle: 'italic',
};

const hr = {
  borderColor: '#333333',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#4b5563',
  fontSize: '11px',
  textAlign: 'center' as const,
  marginTop: '8px',
};

const link = {
  color: '#f97316',
  textDecoration: 'underline',
};

export default LinkSharedEmail;
