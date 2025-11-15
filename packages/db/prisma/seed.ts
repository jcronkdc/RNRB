import { prisma } from '../src/index';

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
