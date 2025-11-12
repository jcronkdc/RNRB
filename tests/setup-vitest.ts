import { beforeAll } from 'vitest';
import { prisma } from '@cronkwaters/db';

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Please start Postgres (e.g. via Docker) and run tests again.'
    );
  }

  await prisma.$transaction([
    prisma.splitContributor.deleteMany({}),
    prisma.splitSheet.deleteMany({}),
    prisma.asset.deleteMany({}),
    prisma.project.deleteMany({ where: { slug: { startsWith: 'test-project' } } }),
    prisma.org.deleteMany({ where: { slug: { startsWith: 'test-org' } } })
  ]);
});
