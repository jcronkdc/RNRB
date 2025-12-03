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

interface FileSharedEmailProps {
  recipientName: string;
  senderName: string;
  senderEmail: string;
  fileNames: string[];
  message?: string;
  canDownload: boolean;
  expiresAt?: string;
  viewUrl: string;
}

export function FileSharedEmail({
  recipientName,
  senderName,
  senderEmail,
  fileNames,
  message,
  canDownload,
  expiresAt,
  viewUrl,
}: FileSharedEmailProps) {
  const previewText = `${senderName} shared ${fileNames.length} file${fileNames.length > 1 ? 's' : ''} with you`;

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

          <Heading style={heading}>New Files Shared With You</Heading>

          <Text style={paragraph}>Hey {recipientName || 'there'},</Text>

          <Text style={paragraph}>
            <strong>{senderName}</strong> ({senderEmail}) just shared{' '}
            {fileNames.length === 1 ? 'a file' : `${fileNames.length} files`} with you on Rock N'
            Roll Basement.
          </Text>

          {/* Files List */}
          <Section style={fileListSection}>
            <Text style={fileListHeader}>Shared Files:</Text>
            {fileNames.slice(0, 5).map((name, i) => (
              <Text key={i} style={fileName}>
                📄 {name}
              </Text>
            ))}
            {fileNames.length > 5 && (
              <Text style={moreFiles}>...and {fileNames.length - 5} more files</Text>
            )}
          </Section>

          {/* Optional Message */}
          {message && (
            <Section style={messageSection}>
              <Text style={messageLabel}>Message from {senderName}:</Text>
              <Text style={messageText}>"{message}"</Text>
            </Section>
          )}

          {/* Permissions */}
          <Section style={permissionsSection}>
            <Text style={permissionText}>
              {canDownload ? '✅ You can download these files' : '👁️ View only (no download)'}
            </Text>
            {expiresAt && (
              <Text style={expirationText}>
                ⏰ Access expires: {new Date(expiresAt).toLocaleDateString()}
              </Text>
            )}
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={viewUrl}>
              View Shared Files
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent from{' '}
            <Link href="https://rnrb.app" style={link}>
              Rock N' Roll Basement
            </Link>
            . If you didn't expect this email, you can safely ignore it.
          </Text>
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
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const paragraph = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const fileListSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const fileListHeader = {
  color: '#f97316',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const fileName = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

const moreFiles = {
  color: '#9ca3af',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '8px 0 0',
  paddingLeft: '8px',
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

const permissionsSection = {
  margin: '24px 0',
};

const permissionText = {
  color: '#10b981',
  fontSize: '14px',
  margin: '0 0 8px',
};

const expirationText = {
  color: '#f59e0b',
  fontSize: '14px',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
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

const link = {
  color: '#f97316',
  textDecoration: 'underline',
};

export default FileSharedEmail;
