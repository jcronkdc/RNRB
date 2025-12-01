'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  Calendar,
  Clock,
  BookOpen,
  Shield,
  Loader2,
  Link as LinkIcon,
  Twitter,
  Linkedin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface CertificateData {
  certificateNumber: string;
  issuedAt: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  instructorHeadline?: string;
  duration?: number;
  lessonsCompleted: number;
  verificationUrl: string;
}

export default function CertificatePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const certificateRef = useRef<HTMLDivElement>(null);

  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        // First get masterclass ID from slug
        const classRes = await fetch(`/api/masterclasses/${slug}`);
        if (!classRes.ok) throw new Error('Course not found');
        const classData = await classRes.json();

        // Then fetch certificate
        const certRes = await fetch(`/api/masterclasses/${classData.masterclass.id}/certificate`);
        const certData = await certRes.json();

        if (!certRes.ok) {
          if (certData.progress) {
            setProgress(certData.progress);
          }
          throw new Error(certData.error || 'Failed to load certificate');
        }

        setCertificate(certData.certificate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchCertificate();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyLink = async () => {
    if (certificate) {
      await navigator.clipboard.writeText(certificate.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    if (!certificate) return;
    const text = `🎓 I just completed "${certificate.courseName}" by ${certificate.instructorName}! #MusicEducation #Learning`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certificate.verificationUrl)}`;
    window.open(url, '_blank');
  };

  const shareLinkedin = () => {
    if (!certificate) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.verificationUrl)}`;
    window.open(url, '_blank');
  };

  const downloadCertificate = async () => {
    // In a real implementation, this would call an API to generate a PDF
    // For now, we'll use the browser's print functionality
    if (certificateRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate - ${certificate?.courseName}</title>
              <style>
                body { font-family: 'Georgia', serif; padding: 40px; background: #fefefe; }
                .certificate { 
                  border: 8px double #8B5CF6; 
                  padding: 60px; 
                  max-width: 800px; 
                  margin: 0 auto;
                  background: linear-gradient(135deg, #fefefe 0%, #f8f5ff 100%);
                }
                .header { text-align: center; margin-bottom: 40px; }
                .title { font-size: 48px; color: #8B5CF6; margin-bottom: 10px; }
                .subtitle { font-size: 18px; color: #666; }
                .body { text-align: center; margin-bottom: 40px; }
                .student { font-size: 36px; color: #1a1a1a; margin: 20px 0; }
                .course { font-size: 24px; color: #333; margin: 10px 0; }
                .instructor { font-size: 18px; color: #666; margin: 10px 0; }
                .footer { text-align: center; font-size: 12px; color: #999; }
                .seal { margin: 30px 0; }
              </style>
            </head>
            <body>
              <div class="certificate">
                <div class="header">
                  <div class="title">Certificate of Completion</div>
                  <div class="subtitle">Rock N' Roll Basement Masterclass</div>
                </div>
                <div class="body">
                  <p>This certifies that</p>
                  <div class="student">${certificate?.studentName}</div>
                  <p>has successfully completed</p>
                  <div class="course">"${certificate?.courseName}"</div>
                  <div class="instructor">Taught by ${certificate?.instructorName}</div>
                  ${certificate?.instructorHeadline ? `<div class="instructor-title">${certificate.instructorHeadline}</div>` : ''}
                </div>
                <div class="seal">
                  <p>Issued on ${certificate ? formatDate(certificate.issuedAt) : ''}</p>
                  <p>Certificate ID: ${certificate?.certificateNumber}</p>
                </div>
                <div class="footer">
                  Verify at: ${certificate?.verificationUrl}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--panel)] p-8 text-center">
          <Award className="mx-auto mb-4 h-16 w-16 text-[var(--muted)]" />
          <h2 className="mb-2 text-xl font-bold text-white">{error}</h2>

          {progress && (
            <div className="mt-6">
              <p className="mb-4 text-[var(--muted)]">
                Complete all lessons to earn your certificate
              </p>
              <div className="mb-2 h-3 w-full rounded-full bg-[var(--bg)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-[var(--muted)]">
                {progress.completed} of {progress.total} lessons completed ({progress.percentage}%)
              </p>
              <Link href={`/masterclasses/${slug}/watch`}>
                <button className="mt-6 rounded-full bg-purple-500 px-6 py-3 text-white hover:bg-purple-600">
                  Continue Learning
                </button>
              </Link>
            </div>
          )}

          {!progress && (
            <Link href={`/masterclasses/${slug}`}>
              <button className="mt-6 rounded-full bg-purple-500 px-6 py-3 text-white hover:bg-purple-600">
                View Course
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-12">
      {/* Header with logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/logo-dark.png"
            alt="Logo"
            width={60}
            height={60}
            className="transition-opacity hover:opacity-80"
          />
        </Link>
      </div>

      {/* Congratulations Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-3xl text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>Course Completed!</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Congratulations, {certificate.studentName}! 🎉
        </h1>
        <p className="text-[var(--muted)]">You've earned your certificate of completion</p>
      </motion.div>

      {/* Certificate Card */}
      <motion.div
        ref={certificateRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-1">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />

          <div className="relative rounded-3xl border border-purple-500/30 bg-[#0f0f23] p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute left-4 top-4 h-20 w-20 border-l-2 border-t-2 border-purple-500/30" />
            <div className="absolute right-4 top-4 h-20 w-20 border-r-2 border-t-2 border-purple-500/30" />
            <div className="absolute bottom-4 left-4 h-20 w-20 border-b-2 border-l-2 border-purple-500/30" />
            <div className="absolute bottom-4 right-4 h-20 w-20 border-b-2 border-r-2 border-purple-500/30" />

            {/* Certificate Content */}
            <div className="text-center">
              {/* Award Icon */}
              <div className="relative mx-auto mb-6 h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-xl" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="mb-2 text-sm tracking-[0.3em] text-purple-400">
                CERTIFICATE OF COMPLETION
              </h2>
              <div className="mx-auto mb-8 h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500" />

              {/* Student Name */}
              <p className="mb-2 text-[var(--muted)]">This is to certify that</p>
              <h3 className="mb-4 font-serif text-4xl font-bold text-white">
                {certificate.studentName}
              </h3>

              {/* Course */}
              <p className="mb-2 text-[var(--muted)]">has successfully completed</p>
              <h4 className="mb-2 text-2xl font-bold text-white">"{certificate.courseName}"</h4>

              {/* Instructor */}
              <p className="text-[var(--muted)]">
                Taught by <span className="text-purple-400">{certificate.instructorName}</span>
              </p>
              {certificate.instructorHeadline && (
                <p className="text-sm text-[var(--muted)]">{certificate.instructorHeadline}</p>
              )}

              {/* Stats */}
              <div className="my-8 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-[var(--muted)]">
                    {formatDate(certificate.issuedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-[var(--muted)]">
                    {certificate.lessonsCompleted} Lessons
                  </span>
                </div>
                {certificate.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-[var(--muted)]">
                      {Math.round(certificate.duration / 60)} Hours
                    </span>
                  </div>
                )}
              </div>

              {/* Certificate Number */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--panel)] px-4 py-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-[var(--muted)]">
                  Certificate ID: {certificate.certificateNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-4"
      >
        <button
          onClick={downloadCertificate}
          className="flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-white transition-colors hover:bg-purple-600"
        >
          <Download className="h-5 w-5" />
          Download PDF
        </button>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 rounded-full bg-[var(--panel)] px-6 py-3 text-white transition-colors hover:bg-[var(--border)]"
        >
          <LinkIcon className="h-5 w-5" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 rounded-full bg-[#1DA1F2] px-6 py-3 text-white transition-colors hover:bg-[#1a8cd8]"
        >
          <Twitter className="h-5 w-5" />
          Share
        </button>

        <button
          onClick={shareLinkedin}
          className="flex items-center gap-2 rounded-full bg-[#0077B5] px-6 py-3 text-white transition-colors hover:bg-[#006699]"
        >
          <Linkedin className="h-5 w-5" />
          Share
        </button>
      </motion.div>

      {/* Back Link */}
      <div className="mt-8 text-center">
        <Link href="/masterclasses" className="text-purple-400 hover:underline">
          ← Browse More Masterclasses
        </Link>
      </div>
    </div>
  );
}
