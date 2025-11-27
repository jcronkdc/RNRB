import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyUser() {
  const testUsers = [
    { email: 'justin@cronkwaters.com', password: 'TestRock2024!' },
    { email: 'test-agent-resume@example.com', password: 'TestPassword123!' },
    { email: 'test-fresh-deploy@example.com', password: 'FreshPassword123!' },
  ];
  
  for (const { email, password } of testUsers) {
    console.log(`\n=== Testing: ${email} ===`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, profileCompleted: true }
    });
    
    if (!user) {
      console.log('User NOT FOUND');
      continue;
    }
    
    console.log('User found:', user.id);
    console.log('Has password:', !!user.password);
    console.log('Profile completed:', user.profileCompleted);
    
    if (user.password) {
      console.log('Password hash starts with:', user.password.substring(0, 7));
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValid);
    }
  }
  
  // Also list all users with passwords
  console.log('\n=== All users with passwords ===');
  const usersWithPasswords = await prisma.user.findMany({
    where: { password: { not: null } },
    select: { id: true, email: true, name: true, createdAt: true }
  });
  console.log('Total users with passwords:', usersWithPasswords.length);
  usersWithPasswords.forEach(u => {
    console.log(`- ${u.email} (${u.name || 'no name'}) - created ${u.createdAt}`);
  });
}

verifyUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

