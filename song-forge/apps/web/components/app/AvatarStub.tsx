interface AvatarStubProps {
  name: string;
}

export default function AvatarStub({ name }: AvatarStubProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/15 text-lg font-semibold text-brand-foreground shadow-soft">
      {initials || 'SF'}
    </div>
  );
}
