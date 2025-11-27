import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'test-agent-resume@example.com';
  const password = 'TestPassword123!';
  
  console.log('Testing login for:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log('ERROR: User not found');
    return;
  }
  
  console.log('User found:', !!user);
  console.log('Has password:', !!user.password);
  console.log('Password hash:', user.password);
  
  const isValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValid);
  
  if (isValid) {
    console.log('SUCCESS: Login would succeed');
  } else {
    console.log('FAIL: Password comparison failed');
    // Try hashing the same password to compare
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash would be:', newHash);
  }
}

testLogin().catch(console.error).finally(() => prisma.$disconnect());

