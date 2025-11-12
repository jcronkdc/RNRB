'use client';

import { Button, Input, Label, Textarea } from '@cronkwater/ui';
import { useEffect, useRef, useState } from 'react';

import AvatarStub from './AvatarStub';

interface ProfileFormProps {
  name?: string;
  email?: string;
}

const PRO_OPTIONS = ['None', 'ASCAP', 'BMI', 'SESAC'] as const;

export default function ProfileForm({ name = 'CronkWater Member', email = 'demo@example.com' }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(name);
  const [proAffiliation, setProAffiliation] = useState<(typeof PRO_OPTIONS)[number]>('None');
  const [mlcMember, setMlcMember] = useState(true);
  const [soundExchange, setSoundExchange] = useState(false);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setDisplayName(name);
  }, [name]);

  useEffect(() => {
    if (saved) {
      successRef.current?.focus();
      const timer = window.setTimeout(() => setSaved(false), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [saved]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
        <AvatarStub name={displayName} />
        <div>
          <p className="text-sm text-muted-foreground">Update how your collaborators see you across sessions.</p>
          <Button type="button" variant="ghost" size="sm" className="mt-2" disabled>
            Change avatar (coming soon)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-display-name">Display name</Label>
          <Input
            id="profile-display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} readOnly aria-describedby="profile-email-help" />
          <p id="profile-email-help" className="text-xs text-muted-foreground">
            Managed via authentication provider. Contact support to update.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-pro">PRO affiliation</Label>
          <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
            <select
              id="profile-pro"
              value={proAffiliation}
              onChange={(event) => setProAffiliation(event.target.value as (typeof PRO_OPTIONS)[number])}
              className="w-full rounded-xl border border-border/40 bg-surface px-3 py-2 text-sm text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              {PRO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-brand-foreground">MLC member</span>
              <p className="text-xs text-muted-foreground">Helps route digital mechanical royalties.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border/60 text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              checked={mlcMember}
              onChange={(event) => setMlcMember(event.target.checked)}
              aria-label="MLC member"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-brand-foreground">SoundExchange registered</span>
              <p className="text-xs text-muted-foreground">Collects non-interactive digital performance royalties.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border/60 text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              checked={soundExchange}
              onChange={(event) => setSoundExchange(event.target.checked)}
              aria-label="SoundExchange registered"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-notes">Notes</Label>
        <Textarea
          id="profile-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Share anything the team should know about scheduling, rights, or access."
          rows={4}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Save changes</Button>
        {saved ? (
          <p
            ref={successRef}
            tabIndex={-1}
            className="rounded-full border border-brand-primary/60 bg-brand-primary/15 px-4 py-1 text-xs font-medium text-brand-foreground shadow-soft"
            aria-live="polite"
          >
            Saved
          </p>
        ) : null}
      </div>
    </form>
  );
}
