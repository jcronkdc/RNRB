'use client';

import { Button, Input, Label } from '@cronkwater/ui';
import { useEffect, useRef, useState } from 'react';

import OrgMembersStub from './OrgMembersStub';

const ORG_TYPES = ['Foundation', 'Studio', 'Band'] as const;

interface OrgSettingsFormProps {
  orgId: string;
  name: string;
  slug: string;
  orgType: (typeof ORG_TYPES)[number];
  brandColor: string;
  members: { id: string; name: string; role: 'Owner' | 'Admin' | 'Member' }[];
  setActiveAction?: (formData: FormData) => Promise<void>;
  clearActiveAction?: (formData: FormData) => Promise<void>;
}

export default function OrgSettingsForm({
  orgId,
  name,
  slug,
  orgType,
  brandColor,
  members,
  setActiveAction,
  clearActiveAction
}: OrgSettingsFormProps) {
  const [orgName, setOrgName] = useState(name);
  const [type, setType] = useState<(typeof ORG_TYPES)[number]>(orgType);
  const [color, setColor] = useState(brandColor);
  const [saved, setSaved] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (saved) {
      successRef.current?.focus();
      const timeout = window.setTimeout(() => setSaved(false), 2000);
      return () => window.clearTimeout(timeout);
    }
  }, [saved]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="space-y-8 rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 shadow-soft">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" value={orgName} onChange={(event) => setOrgName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input id="org-slug" value={slug} readOnly aria-describedby="org-slug-help" />
            <p id="org-slug-help" className="text-xs text-muted-foreground">
              Used in URLs such as /{slug}/public/epk.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-brand-foreground">Organization type</span>
            <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
              <select
                value={type}
                onChange={(event) => setType(event.target.value as (typeof ORG_TYPES)[number])}
                className="w-full rounded-xl border border-border/40 bg-surface px-3 py-2 text-sm text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                {ORG_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label htmlFor="org-color" className="space-y-2">
            <span className="text-sm font-medium text-brand-foreground">Brand color</span>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/60 px-4 py-3">
              <Input
                id="org-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-11 w-16 cursor-pointer rounded-lg border border-border/40 bg-surface/70"
              />
              <span className="text-xs text-muted-foreground">Used for badges and backgrounds.</span>
            </div>
          </label>
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

      <div className="flex flex-wrap gap-3">
        {setActiveAction ? (
          <form action={setActiveAction}>
            <input type="hidden" name="orgId" value={orgId} />
            <Button type="submit" variant="outline">
              Set as active org
            </Button>
          </form>
        ) : null}
        {clearActiveAction ? (
          <form action={clearActiveAction}>
            <Button type="submit" variant="ghost">
              Clear active org
            </Button>
          </form>
        ) : null}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-foreground">Members</h2>
          <p className="text-sm text-muted-foreground">Roles define who can manage assets, splits, and invitations.</p>
        </div>
        <OrgMembersStub members={members} />
      </section>
    </div>
  );
}
