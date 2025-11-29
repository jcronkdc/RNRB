-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('draft', 'published', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('header', 'footer', 'hero_video', 'hero_image', 'hero_slideshow', 'hero_animated', 'hero_split', 'music_player', 'music_spotify', 'music_apple', 'music_bandcamp', 'discography', 'tour_dates', 'tour_map', 'tour_upcoming', 'video_hero', 'video_gallery', 'bio_full', 'bio_split', 'band_members', 'timeline', 'achievements', 'photo_gallery', 'photo_grid', 'press_photos', 'mailing_list', 'contact_form', 'social_links', 'social_feed', 'epk_download', 'press_quotes', 'press_logos', 'merch_bandcamp', 'merch_shopify', 'merch_grid', 'text_block', 'image_block', 'video_embed', 'html_embed', 'spacer', 'divider', 'cta_banner', 'countdown');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('new', 'read', 'replied', 'archived', 'spam');

-- CreateEnum
CREATE TYPE "MerchProductType" AS ENUM ('physical', 'digital', 'bundle');

-- CreateEnum
CREATE TYPE "MerchOrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('post_reaction', 'post_comment', 'post_share', 'post_mention', 'comment_reply', 'comment_reaction', 'new_follower', 'follow_post', 'collab_invite', 'collab_join', 'collab_leave', 'collab_mention', 'song_comment', 'song_play', 'system_message', 'account_update', 'site_contact', 'site_subscriber');

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "artworkPrompt" TEXT,
ADD COLUMN     "artworkStyle" TEXT,
ADD COLUMN     "artworkUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageCreditsBonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imageCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "audioUrl" TEXT,
    "audioPath" TEXT,
    "waveformData" JSONB,
    "duration" INTEGER,
    "bpm" INTEGER,
    "key" TEXT,
    "imageUrls" TEXT[],
    "videoUrl" TEXT,
    "linkUrl" TEXT,
    "linkPreview" JSONB,
    "genre" TEXT,
    "mood" TEXT,
    "tags" TEXT[],
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "allowReactions" BOOLEAN NOT NULL DEFAULT true,
    "allowShares" BOOLEAN NOT NULL DEFAULT true,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "originalPostId" TEXT,
    "sharedFromUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "audioUrl" TEXT,
    "audioDuration" INTEGER,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCommentReaction" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostCommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPlay" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "duration" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostBookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicianSite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "domainVerified" BOOLEAN NOT NULL DEFAULT false,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT true,
    "templateId" TEXT NOT NULL DEFAULT 'noir',
    "theme" JSONB,
    "siteName" TEXT,
    "tagline" TEXT,
    "siteTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "favicon" TEXT,
    "keywords" TEXT[],
    "socialLinks" JSONB,
    "bookingEmail" TEXT,
    "publicEmail" TEXT,
    "phone" TEXT,
    "googleAnalyticsId" TEXT,
    "facebookPixelId" TEXT,
    "status" "SiteStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "quickStartUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicianSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSection" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "pageId" TEXT,
    "type" "SectionType" NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "styles" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "hideOnMobile" BOOLEAN NOT NULL DEFAULT false,
    "hideOnDesktop" BOOLEAN NOT NULL DEFAULT false,
    "animation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAnalytics" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgTimeOnSite" INTEGER,
    "bounceRate" DOUBLE PRECISION,
    "sources" JSONB,
    "countries" JSONB,
    "cities" JSONB,
    "devices" JSONB,
    "browsers" JSONB,
    "topPages" JSONB,
    "musicPlays" INTEGER NOT NULL DEFAULT 0,
    "videoPlays" INTEGER NOT NULL DEFAULT 0,
    "mailingListSignups" INTEGER NOT NULL DEFAULT 0,
    "contactFormSubmissions" INTEGER NOT NULL DEFAULT 0,
    "socialClicks" INTEGER NOT NULL DEFAULT 0,
    "topReferrers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSubscriber" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribedToNews" BOOLEAN NOT NULL DEFAULT true,
    "subscribedToTours" BOOLEAN NOT NULL DEFAULT true,
    "subscribedToReleases" BOOLEAN NOT NULL DEFAULT true,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmToken" TEXT,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContactSubmission" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "inquiryType" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'new',
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "previewImage" TEXT,
    "previewUrl" TEXT,
    "category" TEXT,
    "genres" TEXT[],
    "defaultTheme" JSONB NOT NULL,
    "defaultSections" JSONB NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchProduct" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sku" TEXT,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "productType" "MerchProductType" NOT NULL DEFAULT 'physical',
    "digitalUrl" TEXT,
    "images" JSONB NOT NULL,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "variants" JSONB,
    "category" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "weight" DECIMAL(10,2),
    "shippingClass" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchOrder" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "shippingAddress" JSONB,
    "shippingMethod" TEXT,
    "shippingCost" DECIMAL(10,2),
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "status" "MerchOrderStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "customerNote" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "variantInfo" JSONB,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "downloadUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePageView" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "visitorId" TEXT NOT NULL,
    "ipCountry" TEXT,
    "ipCity" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sessionDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitePageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteEvent" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "visitorId" TEXT NOT NULL,
    "pageViewId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "actionUrl" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_originalPostId_idx" ON "Post"("originalPostId");

-- CreateIndex
CREATE INDEX "Post_sharedFromUserId_idx" ON "Post"("sharedFromUserId");

-- CreateIndex
CREATE INDEX "Post_visibility_idx" ON "Post"("visibility");

-- CreateIndex
CREATE INDEX "Post_contentType_idx" ON "Post"("contentType");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_genre_idx" ON "Post"("genre");

-- CreateIndex
CREATE INDEX "Post_mood_idx" ON "Post"("mood");

-- CreateIndex
CREATE INDEX "Post_isDeleted_idx" ON "Post"("isDeleted");

-- CreateIndex
CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");

-- CreateIndex
CREATE INDEX "PostReaction_userId_idx" ON "PostReaction"("userId");

-- CreateIndex
CREATE INDEX "PostReaction_emoji_idx" ON "PostReaction"("emoji");

-- CreateIndex
CREATE INDEX "PostReaction_createdAt_idx" ON "PostReaction"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_userId_emoji_key" ON "PostReaction"("postId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "PostShare_postId_idx" ON "PostShare"("postId");

-- CreateIndex
CREATE INDEX "PostShare_userId_idx" ON "PostShare"("userId");

-- CreateIndex
CREATE INDEX "PostShare_createdAt_idx" ON "PostShare"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PostShare_postId_userId_key" ON "PostShare"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");

-- CreateIndex
CREATE INDEX "PostComment_userId_idx" ON "PostComment"("userId");

-- CreateIndex
CREATE INDEX "PostComment_parentId_idx" ON "PostComment"("parentId");

-- CreateIndex
CREATE INDEX "PostComment_createdAt_idx" ON "PostComment"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "PostCommentReaction_commentId_idx" ON "PostCommentReaction"("commentId");

-- CreateIndex
CREATE INDEX "PostCommentReaction_userId_idx" ON "PostCommentReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCommentReaction_commentId_userId_emoji_key" ON "PostCommentReaction"("commentId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "PostPlay_postId_idx" ON "PostPlay"("postId");

-- CreateIndex
CREATE INDEX "PostPlay_userId_idx" ON "PostPlay"("userId");

-- CreateIndex
CREATE INDEX "PostPlay_createdAt_idx" ON "PostPlay"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "PostBookmark_postId_idx" ON "PostBookmark"("postId");

-- CreateIndex
CREATE INDEX "PostBookmark_userId_idx" ON "PostBookmark"("userId");

-- CreateIndex
CREATE INDEX "PostBookmark_collectionName_idx" ON "PostBookmark"("collectionName");

-- CreateIndex
CREATE UNIQUE INDEX "PostBookmark_postId_userId_key" ON "PostBookmark"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicianSite_userId_key" ON "MusicianSite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicianSite_subdomain_key" ON "MusicianSite"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "MusicianSite_customDomain_key" ON "MusicianSite"("customDomain");

-- CreateIndex
CREATE INDEX "MusicianSite_subdomain_idx" ON "MusicianSite"("subdomain");

-- CreateIndex
CREATE INDEX "MusicianSite_customDomain_idx" ON "MusicianSite"("customDomain");

-- CreateIndex
CREATE INDEX "MusicianSite_status_idx" ON "MusicianSite"("status");

-- CreateIndex
CREATE INDEX "MusicianSite_userId_idx" ON "MusicianSite"("userId");

-- CreateIndex
CREATE INDEX "MusicianSite_templateId_idx" ON "MusicianSite"("templateId");

-- CreateIndex
CREATE INDEX "SitePage_siteId_order_idx" ON "SitePage"("siteId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_siteId_slug_key" ON "SitePage"("siteId", "slug");

-- CreateIndex
CREATE INDEX "SiteSection_siteId_pageId_order_idx" ON "SiteSection"("siteId", "pageId", "order");

-- CreateIndex
CREATE INDEX "SiteSection_type_idx" ON "SiteSection"("type");

-- CreateIndex
CREATE INDEX "SiteAnalytics_siteId_date_idx" ON "SiteAnalytics"("siteId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SiteAnalytics_siteId_date_key" ON "SiteAnalytics"("siteId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSubscriber_confirmToken_key" ON "SiteSubscriber"("confirmToken");

-- CreateIndex
CREATE INDEX "SiteSubscriber_siteId_confirmed_idx" ON "SiteSubscriber"("siteId", "confirmed");

-- CreateIndex
CREATE INDEX "SiteSubscriber_email_idx" ON "SiteSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSubscriber_siteId_email_key" ON "SiteSubscriber"("siteId", "email");

-- CreateIndex
CREATE INDEX "SiteContactSubmission_siteId_status_idx" ON "SiteContactSubmission"("siteId", "status");

-- CreateIndex
CREATE INDEX "SiteContactSubmission_siteId_createdAt_idx" ON "SiteContactSubmission"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "SiteContactSubmission_email_idx" ON "SiteContactSubmission"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteTemplate_slug_key" ON "SiteTemplate"("slug");

-- CreateIndex
CREATE INDEX "SiteTemplate_category_idx" ON "SiteTemplate"("category");

-- CreateIndex
CREATE INDEX "SiteTemplate_isActive_idx" ON "SiteTemplate"("isActive");

-- CreateIndex
CREATE INDEX "SiteTemplate_isPremium_idx" ON "SiteTemplate"("isPremium");

-- CreateIndex
CREATE INDEX "MerchProduct_siteId_isActive_idx" ON "MerchProduct"("siteId", "isActive");

-- CreateIndex
CREATE INDEX "MerchProduct_siteId_category_idx" ON "MerchProduct"("siteId", "category");

-- CreateIndex
CREATE INDEX "MerchProduct_siteId_isFeatured_idx" ON "MerchProduct"("siteId", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "MerchProduct_siteId_slug_key" ON "MerchProduct"("siteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "MerchOrder_orderNumber_key" ON "MerchOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MerchOrder_stripePaymentIntentId_key" ON "MerchOrder"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "MerchOrder_siteId_status_idx" ON "MerchOrder"("siteId", "status");

-- CreateIndex
CREATE INDEX "MerchOrder_siteId_createdAt_idx" ON "MerchOrder"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "MerchOrder_customerEmail_idx" ON "MerchOrder"("customerEmail");

-- CreateIndex
CREATE INDEX "MerchOrder_stripePaymentIntentId_idx" ON "MerchOrder"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "MerchOrderItem_orderId_idx" ON "MerchOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "MerchOrderItem_productId_idx" ON "MerchOrderItem"("productId");

-- CreateIndex
CREATE INDEX "SitePageView_siteId_createdAt_idx" ON "SitePageView"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "SitePageView_siteId_path_idx" ON "SitePageView"("siteId", "path");

-- CreateIndex
CREATE INDEX "SitePageView_visitorId_idx" ON "SitePageView"("visitorId");

-- CreateIndex
CREATE INDEX "SiteEvent_siteId_eventType_idx" ON "SiteEvent"("siteId", "eventType");

-- CreateIndex
CREATE INDEX "SiteEvent_siteId_createdAt_idx" ON "SiteEvent"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "SiteEvent_visitorId_idx" ON "SiteEvent"("visitorId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_originalPostId_fkey" FOREIGN KEY ("originalPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_sharedFromUserId_fkey" FOREIGN KEY ("sharedFromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostShare" ADD CONSTRAINT "PostShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostShare" ADD CONSTRAINT "PostShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentReaction" ADD CONSTRAINT "PostCommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentReaction" ADD CONSTRAINT "PostCommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPlay" ADD CONSTRAINT "PostPlay_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPlay" ADD CONSTRAINT "PostPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicianSite" ADD CONSTRAINT "MusicianSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicianSite" ADD CONSTRAINT "MusicianSite_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitePage" ADD CONSTRAINT "SitePage_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSection" ADD CONSTRAINT "SiteSection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSection" ADD CONSTRAINT "SiteSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "SitePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAnalytics" ADD CONSTRAINT "SiteAnalytics_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSubscriber" ADD CONSTRAINT "SiteSubscriber_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteContactSubmission" ADD CONSTRAINT "SiteContactSubmission_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchProduct" ADD CONSTRAINT "MerchProduct_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchOrderItem" ADD CONSTRAINT "MerchOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MerchOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchOrderItem" ADD CONSTRAINT "MerchOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MerchProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitePageView" ADD CONSTRAINT "SitePageView_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteEvent" ADD CONSTRAINT "SiteEvent_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MusicianSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

