'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper,
  Download,
  Image,
  Music,
  Calendar,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Eye,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface EPKData {
  artistName: string;
  tagline: string;
  bio: {
    short: string;
    long: string;
  };
  genre: string;
  location: string;
  formed: string;
  members: { name: string; role: string }[];
  contact: {
    email: string;
    phone: string;
    booking: string;
    management: string;
  };
  social: {
    website: string;
    instagram: string;
    youtube: string;
    twitter: string;
    spotify: string;
    appleMusic: string;
  };
  stats: {
    monthlyListeners: string;
    followers: string;
    streamsTotal: string;
  };
  achievements: string[];
  quotes: { text: string; source: string }[];
  upcomingShows: { date: string; venue: string; city: string }[];
}

const DEFAULT_EPK: EPKData = {
  artistName: 'Your Band Name',
  tagline: 'Genre-bending rock with soul',
  bio: {
    short: 'A brief 2-3 sentence bio perfect for social media and quick introductions.',
    long: 'A longer biography (2-3 paragraphs) that tells your story, your sound, your journey, and what makes you unique. Include your origins, influences, and vision.',
  },
  genre: 'Rock / Alternative',
  location: 'Los Angeles, CA',
  formed: '2020',
  members: [
    { name: 'John Doe', role: 'Lead Vocals, Guitar' },
    { name: 'Jane Smith', role: 'Bass, Backing Vocals' },
    { name: 'Mike Johnson', role: 'Drums' },
  ],
  contact: {
    email: 'booking@yourband.com',
    phone: '(555) 123-4567',
    booking: 'Agent Name - agent@agency.com',
    management: 'Manager Name - manager@mgmt.com',
  },
  social: {
    website: 'https://yourband.com',
    instagram: '@yourband',
    youtube: 'YourBandOfficial',
    twitter: '@yourband',
    spotify: 'spotify:artist:xxxxx',
    appleMusic: 'https://music.apple.com/artist/yourband',
  },
  stats: {
    monthlyListeners: '50,000+',
    followers: '25,000+',
    streamsTotal: '5 Million+',
  },
  achievements: [
    'Opened for [Major Artist] at [Venue] (2024)',
    'Featured on [Playlist/Blog/Magazine]',
    'Song featured in [TV Show/Film]',
    '[Award/Recognition]',
  ],
  quotes: [
    { text: '"[Band] delivers an electrifying live performance..."', source: 'Rolling Stone' },
    { text: '"A fresh sound that commands attention..."', source: 'Pitchfork' },
  ],
  upcomingShows: [
    { date: '2025-01-15', venue: 'The Troubadour', city: 'Los Angeles, CA' },
    { date: '2025-01-22', venue: 'The Roxy', city: 'Los Angeles, CA' },
  ],
};

export function EPKGenerator() {
  const [epkData, setEpkData] = useState<EPKData>(DEFAULT_EPK);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState('basic');
  const [copied, setCopied] = useState(false);

  const updateField = (path: string, value: any) => {
    setEpkData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let obj: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const generateAIBio = () => {
    // In real implementation, this would call an AI API
    const genres = ['rock', 'indie', 'alternative', 'pop', 'metal', 'folk'];
    const adjectives = ['electrifying', 'soulful', 'dynamic', 'innovative', 'raw', 'powerful'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

    updateField(
      'bio.short',
      `${epkData.artistName} brings ${adj} ${epkData.genre.toLowerCase()} music from ${epkData.location}. Since ${epkData.formed}, they've captivated audiences with their unique blend of sound and unforgettable live performances.`
    );
  };

  const copyToClipboard = () => {
    const text = `
${epkData.artistName}
${epkData.tagline}

ABOUT
${epkData.bio.short}

GENRE: ${epkData.genre}
LOCATION: ${epkData.location}
FORMED: ${epkData.formed}

CONTACT
Email: ${epkData.contact.email}
Booking: ${epkData.contact.booking}
Management: ${epkData.contact.management}

SOCIAL
${epkData.social.website}
Instagram: ${epkData.social.instagram}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    // In real implementation, this would generate a PDF
    alert('PDF generation would be implemented here using a library like jsPDF or react-pdf');
  };

  const SECTIONS = [
    { id: 'basic', name: 'Basic Info', icon: Music },
    { id: 'bio', name: 'Biography', icon: FileText },
    { id: 'members', name: 'Members', icon: Music },
    { id: 'contact', name: 'Contact', icon: Mail },
    { id: 'social', name: 'Social', icon: Globe },
    { id: 'stats', name: 'Stats', icon: Sparkles },
    { id: 'achievements', name: 'Achievements', icon: Sparkles },
  ];

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">EPK Generator</h3>
            <p className="text-sm text-muted-foreground">Create professional press kits</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('preview')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="flex">
          {/* Section Navigation */}
          <div className="w-48 border-r border-border p-4">
            <div className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-brand-primary text-white'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div className="flex-1 p-6">
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Basic Information</h4>
                <div>
                  <label className="mb-2 block text-sm font-medium">Artist/Band Name</label>
                  <input
                    type="text"
                    value={epkData.artistName}
                    onChange={(e) => updateField('artistName', e.target.value)}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tagline</label>
                  <input
                    type="text"
                    value={epkData.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    placeholder="One-line description of your sound"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Genre</label>
                    <input
                      type="text"
                      value={epkData.genre}
                      onChange={(e) => updateField('genre', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Location</label>
                    <input
                      type="text"
                      value={epkData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Formed</label>
                    <input
                      type="text"
                      value={epkData.formed}
                      onChange={(e) => updateField('formed', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'bio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Biography</h4>
                  <Button variant="outline" size="sm" onClick={generateAIBio} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Generate
                  </Button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Short Bio (2-3 sentences)
                  </label>
                  <textarea
                    value={epkData.bio.short}
                    onChange={(e) => updateField('bio.short', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    placeholder="Perfect for social media and quick introductions..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Long Bio (2-3 paragraphs)
                  </label>
                  <textarea
                    value={epkData.bio.long}
                    onChange={(e) => updateField('bio.long', e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    placeholder="Tell your full story..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'members' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Band Members</h4>
                {epkData.members.map((member, i) => (
                  <div key={i} className="flex gap-4">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...epkData.members];
                        newMembers[i].name = e.target.value;
                        updateField('members', newMembers);
                      }}
                      placeholder="Name"
                      className="flex-1 rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => {
                        const newMembers = [...epkData.members];
                        newMembers[i].role = e.target.value;
                        updateField('members', newMembers);
                      }}
                      placeholder="Role/Instrument"
                      className="flex-1 rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateField('members', [...epkData.members, { name: '', role: '' }])
                  }
                >
                  Add Member
                </Button>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Contact Information</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={epkData.contact.email}
                      onChange={(e) => updateField('contact.email', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={epkData.contact.phone}
                      onChange={(e) => updateField('contact.phone', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Booking Agent</label>
                    <input
                      type="text"
                      value={epkData.contact.booking}
                      onChange={(e) => updateField('contact.booking', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Management</label>
                    <input
                      type="text"
                      value={epkData.contact.management}
                      onChange={(e) => updateField('contact.management', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'social' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Social Media & Streaming</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(epkData.social).map(([key, value]) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-medium capitalize">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateField(`social.${key}`, e.target.value)}
                        className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'stats' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Statistics & Metrics</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Monthly Listeners</label>
                    <input
                      type="text"
                      value={epkData.stats.monthlyListeners}
                      onChange={(e) => updateField('stats.monthlyListeners', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Social Followers</label>
                    <input
                      type="text"
                      value={epkData.stats.followers}
                      onChange={(e) => updateField('stats.followers', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Total Streams</label>
                    <input
                      type="text"
                      value={epkData.stats.streamsTotal}
                      onChange={(e) => updateField('stats.streamsTotal', e.target.value)}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Notable Achievements</h4>
                {epkData.achievements.map((achievement, i) => (
                  <input
                    key={i}
                    type="text"
                    value={achievement}
                    onChange={(e) => {
                      const newAchievements = [...epkData.achievements];
                      newAchievements[i] = e.target.value;
                      updateField('achievements', newAchievements);
                    }}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateField('achievements', [...epkData.achievements, ''])}
                >
                  Add Achievement
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="p-6">
          <div className="mx-auto max-w-2xl space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-black">{epkData.artistName}</h1>
              <p className="mt-2 text-xl text-muted-foreground">{epkData.tagline}</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {epkData.genre}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {epkData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Est. {epkData.formed}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{epkData.stats.monthlyListeners}</div>
                <div className="text-xs text-muted-foreground">Monthly Listeners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{epkData.stats.followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{epkData.stats.streamsTotal}</div>
                <div className="text-xs text-muted-foreground">Total Streams</div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">About</h3>
              <p className="text-muted-foreground">{epkData.bio.short}</p>
            </div>

            {/* Members */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Members</h3>
              <div className="space-y-2">
                {epkData.members
                  .filter((m) => m.name)
                  .map((member, i) => (
                    <div key={i} className="flex justify-between rounded-lg bg-white/5 px-4 py-2">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">{member.role}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Contact</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {epkData.contact.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {epkData.contact.phone}
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 border-t border-border pt-6">
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button
                onClick={downloadPDF}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
