-- Error Tracking Tables Migration
-- Creates ErrorReport and AdminErrorAlert tables for production error monitoring

-- ErrorReport: Stores detailed error reports from the frontend
CREATE TABLE IF NOT EXISTS "ErrorReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
    "category" TEXT NOT NULL, -- 'runtime', 'network', 'ui', 'validation', etc.
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "componentStack" TEXT,
    "url" TEXT NOT NULL,
    "route" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "userTier" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "breadcrumbs" JSONB DEFAULT '[]',
    "fingerprint" TEXT NOT NULL, -- For deduplication
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "lastOccurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ErrorReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ErrorReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AdminErrorAlert: Real-time alerts for critical errors
CREATE TABLE IF NOT EXISTS "AdminErrorAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "errorReportId" TEXT,
    "type" TEXT NOT NULL, -- 'error_critical', 'error_high', 'spike', 'system'
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "url" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "AdminErrorAlert_errorReportId_fkey" FOREIGN KEY ("errorReportId") REFERENCES "ErrorReport"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AdminErrorAlert_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "ErrorReport_severity_idx" ON "ErrorReport"("severity");
CREATE INDEX IF NOT EXISTS "ErrorReport_category_idx" ON "ErrorReport"("category");
CREATE INDEX IF NOT EXISTS "ErrorReport_resolved_idx" ON "ErrorReport"("resolved");
CREATE INDEX IF NOT EXISTS "ErrorReport_fingerprint_idx" ON "ErrorReport"("fingerprint");
CREATE INDEX IF NOT EXISTS "ErrorReport_userId_idx" ON "ErrorReport"("userId");
CREATE INDEX IF NOT EXISTS "ErrorReport_createdAt_idx" ON "ErrorReport"("createdAt");
CREATE INDEX IF NOT EXISTS "ErrorReport_lastOccurredAt_idx" ON "ErrorReport"("lastOccurredAt");

CREATE INDEX IF NOT EXISTS "AdminErrorAlert_acknowledged_idx" ON "AdminErrorAlert"("acknowledged");
CREATE INDEX IF NOT EXISTS "AdminErrorAlert_type_idx" ON "AdminErrorAlert"("type");
CREATE INDEX IF NOT EXISTS "AdminErrorAlert_createdAt_idx" ON "AdminErrorAlert"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminErrorAlert_errorReportId_idx" ON "AdminErrorAlert"("errorReportId");

-- Add comment for documentation
COMMENT ON TABLE "ErrorReport" IS 'Stores frontend error reports for monitoring and debugging production issues';
COMMENT ON TABLE "AdminErrorAlert" IS 'Real-time alerts for critical errors sent to admins';

-- RLS Policies (optional - only if you want row-level security)
-- Enable RLS
ALTER TABLE "ErrorReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminErrorAlert" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert error reports
CREATE POLICY "error_report_insert" ON "ErrorReport"
    FOR INSERT
    WITH CHECK (true);

-- Allow only owners to view/manage error reports
CREATE POLICY "error_report_owner_select" ON "ErrorReport"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid()::text 
            AND "User"."isOwner" = true
        )
    );

CREATE POLICY "error_report_owner_update" ON "ErrorReport"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid()::text 
            AND "User"."isOwner" = true
        )
    );

-- Allow authenticated users to insert alerts
CREATE POLICY "error_alert_insert" ON "AdminErrorAlert"
    FOR INSERT
    WITH CHECK (true);

-- Allow only owners to view/manage alerts
CREATE POLICY "error_alert_owner_select" ON "AdminErrorAlert"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid()::text 
            AND "User"."isOwner" = true
        )
    );

CREATE POLICY "error_alert_owner_update" ON "AdminErrorAlert"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid()::text 
            AND "User"."isOwner" = true
        )
    );

