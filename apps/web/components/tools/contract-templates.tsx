'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Search,
  Building,
  Users,
  Music,
  Tv,
  Camera,
  DollarSign,
  Calendar,
  Shield,
  Copy,
  ExternalLink,
  CheckCircle,
  Star,
  Mic,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  popularity: number;
  fields: string[];
  preview: string;
}

const TEMPLATES: ContractTemplate[] = [
  {
    id: 'venue-performance',
    name: 'Venue Performance Agreement',
    description: 'Standard contract for live performances at venues, clubs, and bars',
    category: 'performance',
    icon: Building,
    popularity: 95,
    fields: [
      'Artist Name',
      'Venue Name',
      'Performance Date',
      'Set Length',
      'Compensation',
      'Sound Check Time',
      'Backline Requirements',
    ],
    preview: `PERFORMANCE AGREEMENT

This Agreement is made between [ARTIST NAME] ("Artist") and [VENUE NAME] ("Venue").

1. ENGAGEMENT
The Venue hereby engages the Artist to perform on [DATE] at [VENUE ADDRESS].

2. COMPENSATION
The Venue agrees to pay the Artist:
- Guarantee: $[AMOUNT]
- Door Split: [PERCENTAGE]% after [AMOUNT] attendees
- Payment due: [PAYMENT TERMS]

3. PERFORMANCE DETAILS
- Load-in Time: [TIME]
- Sound Check: [TIME]
- Performance Time: [START] - [END]
- Set Length: [MINUTES] minutes

4. TECHNICAL REQUIREMENTS
[BACKLINE AND TECHNICAL RIDER DETAILS]

5. CANCELLATION
Either party may cancel with [DAYS] days written notice...`,
  },
  {
    id: 'session-musician',
    name: 'Session Musician Work-for-Hire',
    description: 'Agreement for hiring session musicians for studio recordings',
    category: 'studio',
    icon: Mic,
    popularity: 88,
    fields: [
      'Musician Name',
      'Producer/Label',
      'Song Title',
      'Session Date',
      'Rate',
      'Usage Rights',
    ],
    preview: `SESSION MUSICIAN AGREEMENT

This Work-for-Hire Agreement is between [PRODUCER/LABEL] ("Producer") and [MUSICIAN NAME] ("Musician").

1. SERVICES
The Musician agrees to perform [INSTRUMENT] on the recording of [SONG TITLE].

2. COMPENSATION
Session Fee: $[AMOUNT]
- Payable upon completion of session
- Additional takes: $[AMOUNT] per hour

3. RIGHTS
This is a Work-for-Hire. All recordings become the sole property of the Producer.
The Musician waives all rights to royalties and residuals.

4. CREDITS
The Musician [WILL/WILL NOT] receive credit on the final release as: [CREDIT]

5. SESSION DETAILS
Date: [DATE]
Location: [STUDIO]
Expected Duration: [HOURS] hours...`,
  },
  {
    id: 'sync-license',
    name: 'Sync License Agreement',
    description: 'License music for use in film, TV, advertising, or video games',
    category: 'licensing',
    icon: Tv,
    popularity: 82,
    fields: ['Song Title', 'Licensor', 'Licensee', 'Media Type', 'Territory', 'Term', 'Fee'],
    preview: `SYNCHRONIZATION LICENSE AGREEMENT

LICENSOR: [COPYRIGHT OWNER]
LICENSEE: [PRODUCTION COMPANY]
SONG: "[SONG TITLE]" by [ARTIST]

1. GRANT OF LICENSE
Licensor grants Licensee the non-exclusive right to synchronize the Song with [PRODUCTION TITLE].

2. MEDIA & TERRITORY
Media: [FILM/TV/COMMERCIAL/VIDEO GAME]
Territory: [WORLDWIDE/SPECIFIC TERRITORIES]
Term: [DURATION]

3. FEE
Synchronization Fee: $[AMOUNT]
Master Use Fee: $[AMOUNT]
Total: $[TOTAL]

4. USAGE
- Scene: [DESCRIPTION]
- Duration: [LENGTH] of song used
- Type: [BACKGROUND/FEATURED/THEME]

5. CREDITS
"[SONG TITLE]" Written by [SONGWRITER]
Performed by [ARTIST]
Courtesy of [LABEL/PUBLISHER]...`,
  },
  {
    id: 'band-partnership',
    name: 'Band Partnership Agreement',
    description: 'Operating agreement for band members covering ownership, splits, and decisions',
    category: 'business',
    icon: Users,
    popularity: 76,
    fields: ['Band Name', 'Member Names', 'Ownership Split', 'Decision Making', 'Departure Terms'],
    preview: `BAND PARTNERSHIP AGREEMENT

BAND NAME: [BAND NAME]
EFFECTIVE DATE: [DATE]

MEMBERS:
1. [NAME] - [ROLE] - [OWNERSHIP %]
2. [NAME] - [ROLE] - [OWNERSHIP %]
3. [NAME] - [ROLE] - [OWNERSHIP %]

1. OWNERSHIP
- Existing Songs: [SPLIT ARRANGEMENT]
- New Songs: [SPLIT ARRANGEMENT]
- Band Name: Jointly owned by all members

2. INCOME DISTRIBUTION
- Live Performance: [SPLIT]
- Merchandise: [SPLIT]
- Recording/Streaming: [SPLIT]
- Sync/Licensing: [SPLIT]

3. DECISION MAKING
- Major Decisions: Require [UNANIMOUS/MAJORITY] vote
- Day-to-Day: [DESIGNATED MEMBER] has authority

4. DEPARTURE
- Voluntary: [TERMS]
- Involuntary: [TERMS]
- Band Name: [OWNERSHIP TERMS]...`,
  },
  {
    id: 'photo-video-release',
    name: 'Photo/Video Release Form',
    description: 'Get permission to use photos and videos of performances',
    category: 'media',
    icon: Camera,
    popularity: 71,
    fields: ['Subject Name', 'Event', 'Usage Rights', 'Duration'],
    preview: `PHOTO/VIDEO RELEASE FORM

I, [SUBJECT NAME], grant [ARTIST/COMPANY] permission to use photographs and/or video recordings of me taken at [EVENT] on [DATE].

USAGE RIGHTS:
I grant the right to use these images for:
☐ Social media marketing
☐ Website
☐ Promotional materials
☐ Commercial use
☐ All purposes

DURATION: [PERPETUAL/LIMITED TERM]

COMPENSATION: [NONE/AMOUNT]

I understand and agree that:
- I will not receive payment unless specified
- The materials may be edited or altered
- I waive the right to inspect final materials
- I release all claims against the photographer/videographer

Signature: _________________
Date: _________________
Witness: _________________...`,
  },
  {
    id: 'producer-agreement',
    name: 'Producer Agreement',
    description: 'Agreement between artist and music producer for recordings',
    category: 'studio',
    icon: Music,
    popularity: 79,
    fields: ['Artist', 'Producer', 'Project', 'Advance', 'Royalty Points', 'Credit'],
    preview: `PRODUCER AGREEMENT

ARTIST: [ARTIST NAME]
PRODUCER: [PRODUCER NAME]
PROJECT: [ALBUM/EP/SINGLE TITLE]

1. SERVICES
Producer agrees to produce [NUMBER] tracks for the Project.

2. COMPENSATION
- Advance: $[AMOUNT] per track
- Backend: [NUMBER] points (% of net receipts)
- Payable: [PAYMENT SCHEDULE]

3. CREDIT
Producer shall receive credit as:
"Produced by [PRODUCER NAME]"

4. DELIVERABLES
Producer will deliver:
- Mixed masters in [FORMAT]
- Stem files
- Session files (if requested)

5. OWNERSHIP
- Master: [ARTIST/LABEL]
- Publishing: [SPLIT IF APPLICABLE]

6. TIMELINE
Recording: [START DATE] - [END DATE]
Mixing: [DATE]
Final Delivery: [DATE]...`,
  },
  {
    id: 'management-agreement',
    name: 'Artist Management Agreement',
    description: 'Contract between artist and their manager',
    category: 'business',
    icon: Star,
    popularity: 73,
    fields: ['Artist', 'Manager', 'Term', 'Commission', 'Scope', 'Territory'],
    preview: `ARTIST MANAGEMENT AGREEMENT

ARTIST: [ARTIST NAME]
MANAGER: [MANAGER NAME/COMPANY]
EFFECTIVE DATE: [DATE]

1. APPOINTMENT
Artist appoints Manager as exclusive personal manager.

2. TERM
Initial Term: [YEARS] years
Options: [NUMBER] x [YEARS] year options

3. COMMISSION
Manager shall receive [PERCENTAGE]% of Gross Earnings from:
☐ Live performances
☐ Recording
☐ Publishing
☐ Merchandise
☐ Sync/Licensing
☐ Endorsements

4. SCOPE OF SERVICES
Manager agrees to:
- Advise on career decisions
- Secure opportunities
- Negotiate deals (with artist approval)
- Oversee day-to-day business

5. SUNSET CLAUSE
Post-term commission: [PERCENTAGE]% for [YEARS] years...`,
  },
  {
    id: 'equipment-rental',
    name: 'Equipment Rental Agreement',
    description: 'Rent out or borrow musical equipment',
    category: 'equipment',
    icon: DollarSign,
    popularity: 65,
    fields: ['Owner', 'Renter', 'Equipment', 'Rental Period', 'Rate', 'Deposit'],
    preview: `EQUIPMENT RENTAL AGREEMENT

OWNER: [OWNER NAME]
RENTER: [RENTER NAME]
DATE: [DATE]

EQUIPMENT:
1. [ITEM] - Serial #[NUMBER] - Value: $[AMOUNT]
2. [ITEM] - Serial #[NUMBER] - Value: $[AMOUNT]

RENTAL PERIOD: [START DATE] to [END DATE]

FEES:
- Daily Rate: $[AMOUNT]
- Weekly Rate: $[AMOUNT]
- Security Deposit: $[AMOUNT] (refundable)

RENTER AGREES TO:
- Return equipment in same condition
- Not sublease equipment
- Provide proof of insurance
- Pay for any damage or loss

LIABILITY:
Renter is responsible for full replacement value if equipment is lost, stolen, or damaged beyond repair...`,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Templates' },
  { id: 'performance', name: 'Performance' },
  { id: 'studio', name: 'Studio/Recording' },
  { id: 'licensing', name: 'Licensing' },
  { id: 'business', name: 'Business' },
  { id: 'media', name: 'Media' },
  { id: 'equipment', name: 'Equipment' },
];

export function ContractTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);

  const copyTemplate = (template: ContractTemplate) => {
    navigator.clipboard.writeText(template.preview);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTemplate = (template: ContractTemplate) => {
    const blob = new Blob([template.preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Contract Templates</h3>
          <p className="text-sm text-muted-foreground">Legal templates for the music industry</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 flex-shrink-0 text-yellow-500" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-400">Legal Disclaimer</p>
            <p className="text-muted-foreground">
              These templates are for educational purposes only. Always consult with a licensed
              attorney before signing or using any legal document. Laws vary by jurisdiction.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-xl border border-border bg-white/5 py-2 pl-10 pr-4 focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                activeCategory === cat.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group cursor-pointer rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <template.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {template.popularity}%
              </div>
            </div>
            <h4 className="font-semibold">{template.name}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {template.fields.slice(0, 3).map((field) => (
                <span key={field} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {field}
                </span>
              ))}
              {template.fields.length > 3 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  +{template.fields.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-panel max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <selectedTemplate.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(selectedTemplate)}
                    className="gap-2"
                  >
                    {copiedId === selectedTemplate.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate(selectedTemplate)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Required Fields */}
              <div className="border-b border-border p-4">
                <h4 className="mb-2 text-sm font-semibold">Fields to Complete</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full bg-brand-primary/20 px-3 py-1 text-sm text-brand-primary"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Template Preview */}
              <div className="max-h-[50vh] overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {selectedTemplate.preview}
                </pre>
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Replace all [BRACKETED] sections with your information
                  </p>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
