// @ts-check
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: 'demo@cronkwaters.dev' } });
  if (existing) {
    console.log('Seed data already present. Skipping.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: 'demo@cronkwaters.dev',
      name: 'CronkWaters Demo'
    }
  });

  const org = await prisma.org.create({
    data: {
      name: 'CronkWaters Collective',
      slug: 'cronkwaters-collective',
      type: 'band'
    }
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: 'owner'
    }
  });

  console.log('✅ Seed data created successfully.');
  console.log('   User:', user.email);
  console.log('   Org:', org.name, '-', org.slug);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

