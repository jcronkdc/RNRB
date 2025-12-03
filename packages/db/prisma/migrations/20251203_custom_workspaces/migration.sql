-- Custom Workspaces Migration
-- Enables user-owned dashboard customization
-- Safe: All new tables, no changes to existing data

-- CreateTable: UserWorkspace
CREATE TABLE "UserWorkspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'layout',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkspaceTool
CREATE TABLE "WorkspaceTool" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserPreferences
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "accentColor" TEXT NOT NULL DEFAULT 'default',
    "colorScheme" TEXT NOT NULL DEFAULT 'midnight',
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "showWelcome" BOOLEAN NOT NULL DEFAULT true,
    "editModeHintSeen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: UserWorkspace indexes
CREATE INDEX "UserWorkspace_userId_idx" ON "UserWorkspace"("userId");
CREATE INDEX "UserWorkspace_userId_order_idx" ON "UserWorkspace"("userId", "order");

-- CreateIndex: WorkspaceTool indexes
CREATE UNIQUE INDEX "WorkspaceTool_workspaceId_toolKey_key" ON "WorkspaceTool"("workspaceId", "toolKey");
CREATE INDEX "WorkspaceTool_workspaceId_idx" ON "WorkspaceTool"("workspaceId");
CREATE INDEX "WorkspaceTool_workspaceId_order_idx" ON "WorkspaceTool"("workspaceId", "order");

-- CreateIndex: UserPreferences unique constraint
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey: UserWorkspace -> User
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: WorkspaceTool -> UserWorkspace
ALTER TABLE "WorkspaceTool" ADD CONSTRAINT "WorkspaceTool_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "UserWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: UserPreferences -> User
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


