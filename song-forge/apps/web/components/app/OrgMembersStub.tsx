interface Member {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
}

interface OrgMembersStubProps {
  members: Member[];
}

export default function OrgMembersStub({ members }: OrgMembersStubProps) {
  if (!members.length) {
    return <p className="text-sm text-muted-foreground">No members yet. Invite collaborators to start sharing assets.</p>;
  }

  return (
    <ul className="space-y-3" aria-label="Organization members">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-sm text-brand-foreground"
        >
          <span>{member.name}</span>
          <span className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">{member.role}</span>
        </li>
      ))}
    </ul>
  );
}
