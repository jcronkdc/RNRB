'use client';

import { Card } from '@cronkwaters/ui';
import {
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  Music,
  Globe,
  DollarSign,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

type GuideSection = {
  id: string;
  title: string;
  icon: any;
  description: string;
  whatIs: string;
  whereToGet: string;
  cost: string;
  timeframe: string;
  required: boolean;
  links: Array<{ label: string; url: string; description: string }>;
  format?: string;
  example?: string;
};

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'pro',
    title: 'PRO Membership',
    icon: Shield,
    description: 'Your Performance Rights Organization membership',
    whatIs:
      'A PRO (Performance Rights Organization) collects royalties when your music is performed publicly - on radio, TV, streaming, live venues, etc. This is often the FIRST step in protecting your music.',
    whereToGet: 'Sign up directly with one of these organizations. You can only join ONE PRO.',
    cost: 'Free to $150/year depending on PRO',
    timeframe: 'Application: 1-2 weeks',
    required: true,
    links: [
      {
        label: 'ASCAP (USA)',
        url: 'https://www.ascap.com/join',
        description: 'Free membership, largest PRO in USA',
      },
      {
        label: 'BMI (USA)',
        url: 'https://www.bmi.com/join',
        description: 'Free for songwriters, industry standard',
      },
      {
        label: 'SESAC (USA)',
        url: 'https://www.sesac.com/join-sesac',
        description: 'Invitation-only, selective membership',
      },
      {
        label: 'GMR (USA)',
        url: 'https://gmrights.com/',
        description: 'Modern PRO with tech focus',
      },
      {
        label: 'SOCAN (Canada)',
        url: 'https://www.socan.com/membership/',
        description: 'Canadian performing rights',
      },
      {
        label: 'PRS (UK)',
        url: 'https://www.prsformusic.com/join',
        description: 'UK and Ireland',
      },
    ],
  },
  {
    id: 'ipi',
    title: 'IPI Number',
    icon: FileText,
    description: 'Your unique songwriter/publisher identifier',
    whatIs:
      'IPI (Interested Party Information) is a unique 9-11 digit number that identifies you as a songwriter or publisher in the global music database. Think of it like a Social Security Number for your music career.',
    whereToGet:
      'Automatically assigned by your PRO when you become a member. You will receive this in your PRO welcome email or account dashboard.',
    cost: 'Free (included with PRO membership)',
    timeframe: 'Received immediately to 2 weeks after PRO approval',
    required: true,
    format: '000000000 (9-11 digits)',
    example: '00123456789',
    links: [
      {
        label: 'Find Your IPI (ASCAP)',
        url: 'https://www.ascap.com/repertory',
        description: 'Look up your IPI in ASCAP database',
      },
      {
        label: 'Find Your IPI (BMI)',
        url: 'https://repertoire.bmi.com/',
        description: 'Search BMI repertoire for your IPI',
      },
    ],
  },
  {
    id: 'iswc',
    title: 'ISWC Code',
    icon: Music,
    description: 'International code for your musical composition',
    whatIs:
      'ISWC (International Standard Musical Work Code) is like an ISBN for books, but for songs. It uniquely identifies your musical COMPOSITION (the song itself - melody, lyrics, chords) worldwide.',
    whereToGet:
      'Register through your PRO when you register the song, or use the US Copyright Office. Most PROs assign this automatically.',
    cost: 'Usually free with PRO registration',
    timeframe: 'Assigned when you register your song (instant to 2 weeks)',
    required: false,
    format: 'T-123.456.789-0',
    example: 'T-123.456.789-0',
    links: [
      {
        label: 'Register via ASCAP',
        url: 'https://www.ascap.com/help/ace-title-registration',
        description: 'Register works with ASCAP (ISWC assigned automatically)',
      },
      {
        label: 'Register via BMI',
        url: 'https://www.bmi.com/faq/category/registration',
        description: 'Register works with BMI',
      },
      {
        label: 'ISWC Official Site',
        url: 'https://www.iswc.org/',
        description: 'Learn more about ISWC',
      },
    ],
  },
  {
    id: 'isrc',
    title: 'ISRC Code',
    icon: Globe,
    description: 'International code for your recording',
    whatIs:
      'ISRC (International Standard Recording Code) identifies a specific RECORDING of your song. If you re-record the same song, it gets a new ISRC. This tracks streams, sales, and radio plays.',
    whereToGet:
      'Get from your distributor (CD Baby, DistroKid, TuneCore), recording studio, or register as an ISRC manager yourself.',
    cost: 'Free from most distributors, or $95 to become a registrant',
    timeframe: 'Instant from distributors, or immediate if you register as manager',
    required: false,
    format: 'CC-XXX-YY-NNNNN (12 characters)',
    example: 'USRC17607839',
    links: [
      {
        label: 'US ISRC Registry',
        url: 'https://usisrc.org/',
        description: 'Official US ISRC registrar',
      },
      {
        label: 'Get ISRC (CD Baby)',
        url: 'https://cdbaby.com/',
        description: 'Free ISRCs with distribution',
      },
      {
        label: 'Get ISRC (DistroKid)',
        url: 'https://distrokid.com/',
        description: 'Automatic ISRCs for all releases',
      },
      {
        label: 'Get ISRC (TuneCore)',
        url: 'https://www.tunecore.com/',
        description: 'ISRCs included with distribution',
      },
    ],
  },
  {
    id: 'copyright',
    title: 'U.S. Copyright Registration',
    icon: Shield,
    description: 'Official copyright protection with the U.S. government',
    whatIs:
      'While your music is automatically copyrighted when you create it, REGISTERING with the US Copyright Office gives you legal benefits: you can sue for infringement, claim statutory damages, and prove ownership in court.',
    whereToGet:
      'Register directly with the U.S. Copyright Office online system (eCO). This is separate from your PRO registration.',
    cost: '$65 for single work, $45 for bulk registration',
    timeframe: '6-8 months for processing (protection is backdated)',
    required: false,
    links: [
      {
        label: 'U.S. Copyright Office',
        url: 'https://www.copyright.gov/registration/',
        description: 'Official registration portal',
      },
      {
        label: 'eCO Registration System',
        url: 'https://eco.copyright.gov/',
        description: 'Online copyright registration',
      },
      {
        label: 'How to Register Music',
        url: 'https://www.copyright.gov/registration/performing-arts/',
        description: 'Step-by-step guide',
      },
    ],
  },
];

export function CopyrightGuide({ onClose }: { onClose?: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-linear-to-br from-purple-500/10 to-blue-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
            <HelpCircle className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Copyright Registration Guide</h3>
            <p className="mt-2 text-sm text-gray-300">
              Follow this step-by-step guide to properly protect your music and collect all the
              royalties you deserve. We've included direct links to make the process as easy as
              possible.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Start */}
      <Card className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-6">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          Quick Start (Recommended Order)
        </h4>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
              1
            </span>
            <div>
              <strong className="text-white">Join a PRO</strong>
              <span className="text-gray-400">
                {' '}
                - Start collecting performance royalties (Free, 1-2 weeks)
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
              2
            </span>
            <div>
              <strong className="text-white">Get Your IPI Number</strong>
              <span className="text-gray-400">
                {' '}
                - Automatically assigned by your PRO (Free, immediate)
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
              3
            </span>
            <div>
              <strong className="text-white">Register Your Song with PRO</strong>
              <span className="text-gray-400">
                {' '}
                - Get ISWC and start tracking performances (Free, instant)
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
              4
            </span>
            <div>
              <strong className="text-white">Get ISRC (When Ready to Release)</strong>
              <span className="text-gray-400">
                {' '}
                - From distributor or registrar (Free with distributor)
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
              5
            </span>
            <div>
              <strong className="text-white">Optional: U.S. Copyright Registration</strong>
              <span className="text-gray-400">
                {' '}
                - For maximum legal protection ($65, 6-8 months)
              </span>
            </div>
          </li>
        </ol>
      </Card>

      {/* Detailed Sections */}
      <div className="space-y-4">
        {GUIDE_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <Card
              key={section.id}
              className="border-gray-800 bg-linear-to-b from-gray-900 to-black p-6 transition hover:border-gray-700"
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="flex w-full items-start gap-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                    {section.required && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{section.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> {section.cost}
                    </span>
                    <span>• {section.timeframe}</span>
                  </div>
                </div>
                <ArrowRight
                  className={`h-5 w-5 shrink-0 text-gray-500 transition ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-6 space-y-4 border-t border-gray-800 pt-6">
                  {/* What Is It */}
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-white">What is this?</h5>
                    <p className="text-sm text-gray-300">{section.whatIs}</p>
                  </div>

                  {/* Where to Get It */}
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-white">Where to get it:</h5>
                    <p className="text-sm text-gray-300">{section.whereToGet}</p>
                  </div>

                  {/* Format Example */}
                  {section.format && (
                    <div>
                      <h5 className="mb-2 text-sm font-semibold text-white">Format:</h5>
                      <div className="rounded-lg bg-gray-800 p-3">
                        <p className="font-mono text-sm text-gray-300">{section.format}</p>
                        {section.example && (
                          <p className="mt-1 font-mono text-xs text-gray-500">
                            Example: {section.example}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div>
                    <h5 className="mb-3 text-sm font-semibold text-white">Helpful Links:</h5>
                    <div className="space-y-2">
                      {section.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3 transition hover:border-blue-500/50 hover:bg-gray-800"
                        >
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                          <div className="flex-1">
                            <p className="font-medium text-white">{link.label}</p>
                            <p className="text-xs text-gray-400">{link.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer Help */}
      <Card className="border-blue-500/30 bg-blue-500/5 p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-white">Pro Tip:</strong> You don't need all of these immediately!
          Start with PRO membership (free) and register your songs. Get ISRCs when you're ready to
          distribute your music. Copyright registration is optional but recommended for commercial
          releases.
        </p>
      </Card>
    </div>
  );
}
