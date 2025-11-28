#!/bin/bash
# Migration script to move library files from user metadata to database

echo "🚀 Starting Library Migration..."

# 1. Generate Prisma Client with new schema
echo "📦 Generating Prisma Client..."
cd packages/db
pnpm prisma generate

# 2. Push schema changes to database
echo "🗄️  Applying database migrations..."
pnpm prisma db push

# 3. Run migration script to transfer user metadata to database
echo "📝 Migrating user metadata to database..."
cat > migrate-library-data.ts << 'EOF'
import { prisma } from './src';

async function migrateLibraryData() {
  console.log('Starting library data migration...');
  
  try {
    // Get all users with library_files in metadata
    const users = await prisma.$queryRaw`
      SELECT id, "user_metadata"
      FROM "User"
      WHERE "user_metadata"::jsonb ? 'library_files'
    `;
    
    console.log(`Found ${(users as any[]).length} users with library files`);
    
    let totalMigrated = 0;
    
    for (const user of users as any[]) {
      const libraryFiles = user.user_metadata?.library_files || [];
      
      if (libraryFiles.length === 0) continue;
      
      console.log(`Migrating ${libraryFiles.length} files for user ${user.id}...`);
      
      for (const file of libraryFiles) {
        try {
          await prisma.libraryFile.create({
            data: {
              userId: user.id,
              name: file.name || 'Untitled',
              originalName: file.name || 'Untitled',
              url: file.url,
              path: file.path,
              size: BigInt(file.size || 0),
              mimeType: file.mimeType || 'audio/mpeg',
              type: file.type || 'other',
              duration: file.duration,
              tags: file.tags || [],
              createdAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
            },
          });
          totalMigrated++;
        } catch (err) {
          console.error(`Failed to migrate file ${file.id}:`, err);
        }
      }
    }
    
    console.log(`✅ Migration complete! Migrated ${totalMigrated} files.`);
    console.log('You can now safely remove library_files from user_metadata.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLibraryData();
EOF

# 4. Run the migration
npx tsx migrate-library-data.ts

# 5. Clean up
rm migrate-library-data.ts

echo "✨ Library migration complete!"
echo ""
echo "Next steps:"
echo "1. Test the new library page at /library"
echo "2. Verify all files are displayed correctly"
echo "3. Test upload, delete, and playback functionality"
echo "4. If everything works, you can remove library_files from user metadata"


















