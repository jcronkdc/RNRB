export const dynamic = "force-dynamic";

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { Button } from "@cronkwaters/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RequestAccessButton } from "./RequestAccessButton";
import CreditList from "../../../../components/marketing/CreditList";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch real project data
  const project = await prisma.project.findFirst({
    where: {
      slug,
      visibility: "public",
    },
  });

  return {
    openGraph: {
      images: [`/p/${slug}/opengraph-image`],
      title: project?.name || "CronkWaters Project",
      description: project?.description || "A CronkWaters release.",
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  // Fetch real project with songs data
  const project = await prisma.project.findFirst({
    where: {
      slug,
      visibility: "public",
    },
    include: {
      org: true,
    },
  });

  if (!project) {
    notFound();
  }

  // For now, show project org as main credit
  // In the future, we could fetch song splits separately if needed
  const credits = [
    {
      name: project.org.name,
      role: "Organization",
      pct: 100,
    },
  ];

  return (
    <main id="main-content" className="bg-background">
      <section className="motion-safe:animate-fade-in mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col gap-12 px-6 py-20">
        <header className="grid gap-8 md:grid-cols-[280px,1fr] md:items-center">
          <div className="border-border/60 bg-surface shadow-soft relative h-64 w-full overflow-hidden rounded-3xl border">
            <div
              role="img"
              aria-label={`${project.name} cover art`}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: project.coverImage
                  ? `url(${project.coverImage})`
                  : "linear-gradient(to br, rgb(var(--brand-primary) / 0.1), rgb(var(--brand-secondary) / 0.1))",
              }}
            />
            <div
              className="from-background/60 absolute inset-0 bg-gradient-to-br to-transparent"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-brand-muted-foreground text-xs uppercase tracking-[0.32em]">
                {project.org.name} Project
              </p>
              <h1 className="text-brand-foreground mt-3 text-4xl font-semibold">{project.name}</h1>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                {project.description || "A collaborative music project."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RequestAccessButton projectId={project.id} userId={session?.user?.id} />
              <Button variant="ghost" asChild>
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </header>

        <section
          aria-labelledby="project-credits"
          className="border-border/60 bg-surface/80 shadow-soft rounded-3xl border px-6 py-10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="project-credits" className="text-brand-foreground text-2xl font-semibold">
                Credits
              </h2>
              <p className="text-muted-foreground text-sm">
                Key collaborators across writing, production, and performance.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <CreditList items={credits} />
          </div>
        </section>

        <section className="border-border/60 bg-surface/80 shadow-soft rounded-3xl border px-6 py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-brand-foreground text-2xl font-semibold">Support this project</h2>
              <p className="text-muted-foreground text-sm">
                Get exclusive access to studio sessions, early demos, and behind-the-scenes content.
              </p>
            </div>
            <Button asChild>
              <Link href="/donate">Support this project</Link>
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}
