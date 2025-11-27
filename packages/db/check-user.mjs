import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test-agent-resume@example.com' },
    select: { 
      id: true, 
      email: true, 
      password: true, 
      profileCompleted: true 
    }
  });
  
  console.log('User found:', !!user);
  if (user) {
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Has password:', !!user.password);
    console.log('Password length:', user.password?.length);
    console.log('Profile completed:', user.profileCompleted);
    console.log('Password hash starts with:', user.password?.substring(0, 7));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

