import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addOptimizedIndexes() {
  console.log('Adding optimized chat indexes...');

  try {
    // Drop existing simple indexes
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ChatMessage_channelId_createdAt_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ChatMessage_senderId_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ChatMessage_channelType_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ChatMessage_messageType_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ChatMessage_threadId_idx"`);

    // Add optimized compound indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_channelId_createdAt_idx" 
      ON "ChatMessage"("channelId", "createdAt" DESC)
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_channelId_messageType_createdAt_idx" 
      ON "ChatMessage"("channelId", "messageType", "createdAt" DESC)
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_createdAt_idx" 
      ON "ChatMessage"("senderId", "createdAt" DESC)
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_channelType_channelId_idx" 
      ON "ChatMessage"("channelType", "channelId")
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_threadId_createdAt_idx" 
      ON "ChatMessage"("threadId", "createdAt")
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_isDeleted_channelId_createdAt_idx" 
      ON "ChatMessage"("isDeleted", "channelId", "createdAt")
    `);
    
    // Add GIN index for mentions array
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ChatMessage_mentions_idx" 
      ON "ChatMessage" USING GIN ("mentions")
    `);
    
    // Analyze table
    await prisma.$executeRawUnsafe(`ANALYZE "ChatMessage"`);

    console.log('✅ Successfully added optimized indexes!');
  } catch (error) {
    console.error('Error adding indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addOptimizedIndexes();




