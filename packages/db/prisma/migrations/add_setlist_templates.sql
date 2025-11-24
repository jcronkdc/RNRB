-- CreateSetlistTemplate
CREATE TABLE IF NOT EXISTS "SetlistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetDuration" INTEGER NOT NULL,
    "energyLevel" TEXT,
    "filters" JSONB,
    "songIds" TEXT[],
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SetlistTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SetlistTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "SetlistTemplate_orgId_idx" ON "SetlistTemplate"("orgId");
CREATE INDEX "SetlistTemplate_createdById_idx" ON "SetlistTemplate"("createdById");
CREATE INDEX "SetlistTemplate_isBuiltIn_idx" ON "SetlistTemplate"("isBuiltIn");

-- Insert built-in templates
INSERT INTO "SetlistTemplate" ("id", "name", "description", "targetDuration", "energyLevel", "filters", "songIds", "isBuiltIn", "orgId", "createdById", "createdAt", "updatedAt")
SELECT 
  'built_in_festival' as id,
  'Festival Set (45-60min)' as name,
  'High-energy set for festivals. Fast-paced songs only, no ballads.' as description,
  60 as "targetDuration",
  'high' as "energyLevel",
  '{"excludeSlow": true}'::jsonb as filters,
  ARRAY[]::TEXT[] as "songIds",
  true as "isBuiltIn",
  org.id as "orgId",
  usr.id as "createdById",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM "Org" org
CROSS JOIN (SELECT id FROM "User" LIMIT 1) usr
WHERE NOT EXISTS (SELECT 1 FROM "SetlistTemplate" WHERE id = 'built_in_festival')
LIMIT 1;

INSERT INTO "SetlistTemplate" ("id", "name", "description", "targetDuration", "energyLevel", "filters", "songIds", "isBuiltIn", "orgId", "createdById", "createdAt", "updatedAt")
SELECT 
  'built_in_club_tour' as id,
  'Club Tour (90min)' as name,
  'Standard club set with mixed energy levels. Build momentum through the night.' as description,
  90 as "targetDuration",
  'mixed' as "energyLevel",
  '{}'::jsonb as filters,
  ARRAY[]::TEXT[] as "songIds",
  true as "isBuiltIn",
  org.id as "orgId",
  usr.id as "createdById",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM "Org" org
CROSS JOIN (SELECT id FROM "User" LIMIT 1) usr
WHERE NOT EXISTS (SELECT 1 FROM "SetlistTemplate" WHERE id = 'built_in_club_tour')
LIMIT 1;

INSERT INTO "SetlistTemplate" ("id", "name", "description", "targetDuration", "energyLevel", "filters", "songIds", "isBuiltIn", "orgId", "createdById", "createdAt", "updatedAt")
SELECT 
  'built_in_acoustic' as id,
  'Acoustic Set (60min)' as name,
  'Intimate acoustic performance. Slower tempos, focus on lyrics and storytelling.' as description,
  60 as "targetDuration",
  'mellow' as "energyLevel",
  '{"preferSlow": true}'::jsonb as filters,
  ARRAY[]::TEXT[] as "songIds",
  true as "isBuiltIn",
  org.id as "orgId",
  usr.id as "createdById",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM "Org" org
CROSS JOIN (SELECT id FROM "User" LIMIT 1) usr
WHERE NOT EXISTS (SELECT 1 FROM "SetlistTemplate" WHERE id = 'built_in_acoustic')
LIMIT 1;

INSERT INTO "SetlistTemplate" ("id", "name", "description", "targetDuration", "energyLevel", "filters", "songIds", "isBuiltIn", "orgId", "createdById", "createdAt", "updatedAt")
SELECT 
  'built_in_wedding' as id,
  'Wedding/Corporate (75min)' as name,
  'Professional event set. Client-friendly songs, no explicit content.' as description,
  75 as "targetDuration",
  'mixed' as "energyLevel",
  '{"excludeExplicit": true}'::jsonb as filters,
  ARRAY[]::TEXT[] as "songIds",
  true as "isBuiltIn",
  org.id as "orgId",
  usr.id as "createdById",
  CURRENT_TIMESTAMP as "createdAt",
  CURRENT_TIMESTAMP as "updatedAt"
FROM "Org" org
CROSS JOIN (SELECT id FROM "User" LIMIT 1) usr
WHERE NOT EXISTS (SELECT 1 FROM "SetlistTemplate" WHERE id = 'built_in_wedding')
LIMIT 1;

