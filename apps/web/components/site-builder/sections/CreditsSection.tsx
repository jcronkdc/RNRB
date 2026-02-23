'use client';

import {
  Users,
  Music,
  Mic,
  Disc,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  website?: string;
  spotify?: string;
  instagram?: string;
  // Credits
  credits?: Array<{
    track: string;
    album?: string;
    role: string;
    year?: string;
  }>;
}

interface CreditsSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    collaborators?: Collaborator[];
    showByRole?: boolean;
    showCreditsCount?: boolean;
    layout?: 'grid' | 'list';
  };
  theme?: Record<string, unknown>;
}

const ROLE_ICONS: Record<string, typeof Users> = {
  producer: Disc,
  songwriter: Music,
  vocalist: Mic,
  musician: Music,
  engineer: Disc,
  mixer: Disc,
  default: Users,
};

export function CreditsSection({ content, theme }: CreditsSectionProps) {
  const {
    headline = 'Collaborators & Credits',
    subheadline = 'The talented people behind the music',
    collaborators = [],
    showByRole = true,
    showCreditsCount = true,
    layout = 'grid',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Get unique roles
  const roles = [...new Set(collaborators.map((c) => c.role.toLowerCase()))];

  // Filter by role
  const filteredCollaborators = activeRole
    ? collaborators.filter((c) => c.role.toLowerCase() === activeRole)
    : collaborators;

  const getRoleIcon = (role: string) => {
    const normalizedRole = role.toLowerCase();
    return ROLE_ICONS[normalizedRole] || ROLE_ICONS.default;
  };

  const CollaboratorCard = ({ collab }: { collab: Collaborator }) => {
    const isExpanded = expandedId === collab.id;
    const RoleIcon = getRoleIcon(collab.role);

    return (
      <div
        className="overflow-hidden rounded-xl transition-all"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Main Info */}
        <div className="flex items-center gap-4 p-4">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: 'var(--bg)' }}
          >
            {collab.image ? (
              <img src={collab.image} alt={collab.name} className="h-full w-full object-cover" />
            ) : (
              <RoleIcon size={28} style={{ color: 'var(--muted)' }} />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              {collab.name}
            </h3>
            <p className="text-sm" style={{ color: accentColor }}>
              {collab.role}
            </p>
            {showCreditsCount && collab.credits && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {collab.credits.length} credit{collab.credits.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Links & Expand */}
          <div className="flex items-center gap-2">
            {collab.website && (
              <a
                href={collab.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <ExternalLink size={18} />
              </a>
            )}
            {(collab.bio || (collab.credits && collab.credits.length > 0)) && (
              <button
                onClick={() => setExpandedId(isExpanded ? null : collab.id)}
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            {collab.bio && (
              <p className="mb-4 text-sm" style={{ color: 'var(--text)' }}>
                {collab.bio}
              </p>
            )}

            {/* Credits List */}
            {collab.credits && collab.credits.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                  Credits
                </h4>
                <div className="space-y-2">
                  {collab.credits.map((credit, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg p-2"
                      style={{ background: 'var(--bg)' }}
                    >
                      <div>
                        <span style={{ color: 'var(--text)' }}>{credit.track}</span>
                        {credit.album && (
                          <span className="text-sm" style={{ color: 'var(--muted)' }}>
                            {' '}
                            — {credit.album}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: accentColor }}>
                          {credit.role}
                        </span>
                        {credit.year && (
                          <span className="text-sm" style={{ color: 'var(--muted)' }}>
                            ({credit.year})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(collab.spotify || collab.instagram) && (
              <div className="mt-4 flex gap-2">
                {collab.spotify && (
                  <a
                    href={collab.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Spotify
                  </a>
                )}
                {collab.instagram && (
                  <a
                    href={collab.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Role Filters */}
        {showByRole && roles.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveRole(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !activeRole ? 'scale-105' : 'hover:bg-white/5'
              }`}
              style={{
                background: !activeRole ? accentColor : 'var(--panel)',
                color: !activeRole ? '#fff' : 'var(--text)',
              }}
            >
              All ({collaborators.length})
            </button>
            {roles.map((role) => {
              const count = collaborators.filter((c) => c.role.toLowerCase() === role).length;
              const RoleIcon = getRoleIcon(role);
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                    activeRole === role ? 'scale-105' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: activeRole === role ? accentColor : 'var(--panel)',
                    color: activeRole === role ? '#fff' : 'var(--text)',
                  }}
                >
                  <RoleIcon size={14} />
                  {role} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Grid Layout */}
        {layout === 'grid' && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCollaborators.map((collab) => (
              <CollaboratorCard key={collab.id} collab={collab} />
            ))}
          </div>
        )}

        {/* List Layout */}
        {layout === 'list' && (
          <div className="space-y-4">
            {filteredCollaborators.map((collab) => (
              <CollaboratorCard key={collab.id} collab={collab} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCollaborators.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            {activeRole ? <p>No {activeRole}s found</p> : <p>No collaborators listed yet</p>}
          </div>
        )}
      </div>
    </section>
  );
}
