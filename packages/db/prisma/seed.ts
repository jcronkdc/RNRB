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
      name: 'CronkWaters Demo',
      emailVerified: new Date()
    }
  });

  const organization = await prisma.organization.create({
    data: {
      name: 'CronkWaters Collective',
      slug: 'cronkwaters-collective'
    }
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: 'OWNER'
    }
  });

  console.log('Seed data created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
