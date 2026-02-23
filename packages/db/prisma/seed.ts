import { prisma } from '../src/index';

const OWNER_EMAIL = 'justincronk@pm.me';

async function main() {
  // Ensure platform owner always has isOwner flag
  const ownerUser = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (ownerUser && !ownerUser.isOwner) {
    await prisma.user.update({
      where: { email: OWNER_EMAIL },
      data: { isOwner: true },
    });
    console.log(`✅ Set isOwner=true for ${OWNER_EMAIL}`);
  } else if (!ownerUser) {
    console.log(
      `ℹ️  Owner account (${OWNER_EMAIL}) not yet registered — will be auto-flagged on first sign-in.`
    );
  }

  // Seed demo data
  const existing = await prisma.user.findFirst({ where: { email: 'demo@cronkwaters.dev' } });
  if (existing) {
    console.log('Seed data already present. Skipping demo data.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: 'demo@cronkwaters.dev',
      name: 'CronkWaters Demo',
    },
  });

  const org = await prisma.org.create({
    data: {
      name: 'CronkWaters Collective',
      slug: 'cronkwaters-collective',
      type: 'band',
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: 'owner',
    },
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
