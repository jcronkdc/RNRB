import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

// Input schemas
const listingFilterSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  condition: z.array(z.string()).optional(),
  listingType: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'popular']).optional(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  serialNumber: z.string().optional(),
  condition: z.enum(['mint', 'excellent', 'good', 'fair', 'poor', 'parts']),
  conditionNotes: z.string().optional(),
  listingType: z.enum(['sell', 'trade', 'both']),
  price: z.number().optional(),
  currency: z.string().default('USD'),
  acceptsOffers: z.boolean().default(true),
  tradeFor: z.string().optional(),
  tradeValue: z.number().optional(),
  location: z.string().optional(),
  shipsTo: z.array(z.string()).default([]),
  localPickup: z.boolean().default(true),
  shippingCost: z.number().optional(),
});

const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  keywords: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  conditions: z.array(z.string()).default([]),
  listingTypes: z.array(z.string()).default([]),
  location: z.string().optional(),
  maxDistance: z.number().optional(),
  emailNotify: z.boolean().default(true),
  pushNotify: z.boolean().default(true),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('instant'),
});

const createWantedSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  minCondition: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  currency: z.string().default('USD'),
  hasTradeOffer: z.boolean().default(false),
  tradeDescription: z.string().optional(),
  tradeValue: z.number().optional(),
  location: z.string().optional(),
  willingToTravel: z.number().optional(),
  acceptsShipping: z.boolean().default(true),
  urgency: z.enum(['urgent', 'normal', 'flexible']).default('normal'),
});

export const marketplaceRouter = router({
  // ==========================================
  // LISTINGS
  // ==========================================

  // Get listings with filters
  getListings: publicProcedure.input(listingFilterSchema).query(async ({ ctx, input }) => {
    const {
      category,
      subcategory,
      condition,
      listingType,
      minPrice,
      maxPrice,
      location,
      brand,
      search,
      sortBy,
      limit,
      cursor,
    } = input;

    const where: any = {
      status: 'active',
    };

    if (category && category !== 'all') where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (condition?.length) where.condition = { in: condition };
    if (listingType?.length) where.listingType = { in: listingType };
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { publishedAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { favoriteCount: 'desc' };
        break;
    }

    const listings = await ctx.prisma.marketplaceListing.findMany({
      where,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            offers: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (listings.length > limit) {
      const nextItem = listings.pop();
      nextCursor = nextItem?.id;
    }

    return {
      listings,
      nextCursor,
    };
  }),

  // Get single listing
  getListing: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const listing = await ctx.prisma.marketplaceListing.findUnique({
      where: { id: input.id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
            _count: {
              select: {
                marketplaceListings: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
            offers: true,
            messages: true,
          },
        },
      },
    });

    if (!listing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
    }

    // Increment view count
    await ctx.prisma.marketplaceListing.update({
      where: { id: input.id },
      data: { viewCount: { increment: 1 } },
    });

    return listing;
  }),

  // Create listing
  createListing: protectedProcedure.input(createListingSchema).mutation(async ({ ctx, input }) => {
    const listing = await ctx.prisma.marketplaceListing.create({
      data: {
        ...input,
        sellerId: ctx.viewerId,
        status: 'active',
        publishedAt: new Date(),
      },
    });

    return listing;
  }),

  // Update listing
  updateListing: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createListingSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete listing
  deleteListing: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceListing.delete({
        where: { id: input.id },
      });
    }),

  // Get my listings
  getMyListings: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { sellerId: ctx.viewerId };
      if (input.status) where.status = input.status;

      const listings = await ctx.prisma.marketplaceListing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { favorites: true, offers: true } },
        },
      });

      let nextCursor: string | undefined;
      if (listings.length > input.limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem?.id;
      }

      return { listings, nextCursor };
    }),

  // Update listing status (sold, pending, active, etc.)
  updateListingStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['active', 'pending', 'sold', 'traded', 'removed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing || listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const updateData: any = { status: input.status };

      if (input.status === 'sold' || input.status === 'traded') {
        updateData.soldAt = new Date();
      }

      return ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  // Renew listing (bump to top, extend expiration)
  renewListing: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing || listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Check if listing can be renewed (e.g., once per week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (listing.publishedAt && listing.publishedAt > oneWeekAgo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Listing can only be renewed once per week',
        });
      }

      return ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: {
          publishedAt: new Date(),
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }),

  // Mark as sold (legacy - kept for compatibility)
  markAsSold: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing || listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: { status: 'sold', soldAt: new Date() },
      });
    }),

  // ==========================================
  // FAVORITES (Saved Listings)
  // ==========================================

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.marketplaceFavorite.findUnique({
        where: {
          userId_listingId: {
            userId: ctx.viewerId,
            listingId: input.listingId,
          },
        },
      });

      if (existing) {
        await ctx.prisma.marketplaceFavorite.delete({
          where: { id: existing.id },
        });
        await ctx.prisma.marketplaceListing.update({
          where: { id: input.listingId },
          data: { favoriteCount: { decrement: 1 } },
        });
        return { favorited: false };
      }

      await ctx.prisma.marketplaceFavorite.create({
        data: {
          userId: ctx.viewerId,
          listingId: input.listingId,
        },
      });
      await ctx.prisma.marketplaceListing.update({
        where: { id: input.listingId },
        data: { favoriteCount: { increment: 1 } },
      });
      return { favorited: true };
    }),

  // Get saved listings
  getSavedListings: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const favorites = await ctx.prisma.marketplaceFavorite.findMany({
        where: { userId: ctx.viewerId },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          listing: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              seller: { select: { id: true, name: true, image: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (favorites.length > input.limit) {
        const nextItem = favorites.pop();
        nextCursor = nextItem?.id;
      }

      return {
        favorites: favorites.map((f) => ({ ...f.listing, savedAt: f.createdAt })),
        nextCursor,
      };
    }),

  // Check if favorited
  isFavorited: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const favorite = await ctx.prisma.marketplaceFavorite.findUnique({
        where: {
          userId_listingId: {
            userId: ctx.viewerId,
            listingId: input.listingId,
          },
        },
      });
      return { favorited: !!favorite };
    }),

  // ==========================================
  // ALERTS
  // ==========================================

  // Create alert
  createAlert: protectedProcedure.input(createAlertSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.marketplaceAlert.create({
      data: {
        ...input,
        userId: ctx.viewerId,
      },
    });
  }),

  // Get my alerts
  getMyAlerts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.marketplaceAlert.findMany({
      where: { userId: ctx.viewerId },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Update alert
  updateAlert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createAlertSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alert = await ctx.prisma.marketplaceAlert.findUnique({
        where: { id: input.id },
      });

      if (!alert || alert.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceAlert.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Toggle alert active
  toggleAlertActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await ctx.prisma.marketplaceAlert.findUnique({
        where: { id: input.id },
      });

      if (!alert || alert.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceAlert.update({
        where: { id: input.id },
        data: { isActive: !alert.isActive },
      });
    }),

  // Delete alert
  deleteAlert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await ctx.prisma.marketplaceAlert.findUnique({
        where: { id: input.id },
      });

      if (!alert || alert.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceAlert.delete({
        where: { id: input.id },
      });
    }),

  // ==========================================
  // WANTED POSTS (ISO / Looking For)
  // ==========================================

  // Get wanted posts
  getWantedPosts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        urgency: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { status: 'active' };

      if (input.category && input.category !== 'all') where.category = input.category;
      if (input.urgency) where.urgency = input.urgency;
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { brand: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const posts = await ctx.prisma.marketplaceWanted.findMany({
        where,
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { responses: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return { posts, nextCursor };
    }),

  // Get single wanted post
  getWantedPost: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.marketplaceWanted.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: { id: true, name: true, image: true, createdAt: true },
          },
          responses: {
            include: {
              responder: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Increment view count
      await ctx.prisma.marketplaceWanted.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    }),

  // Create wanted post
  createWantedPost: protectedProcedure
    .input(createWantedSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.marketplaceWanted.create({
        data: {
          ...input,
          userId: ctx.viewerId,
        },
      });
    }),

  // Update wanted post
  updateWantedPost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createWantedSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.marketplaceWanted.findUnique({
        where: { id: input.id },
      });

      if (!post || post.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceWanted.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Delete wanted post
  deleteWantedPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.marketplaceWanted.findUnique({
        where: { id: input.id },
      });

      if (!post || post.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceWanted.delete({
        where: { id: input.id },
      });
    }),

  // Mark wanted as found
  markWantedAsFound: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.marketplaceWanted.findUnique({
        where: { id: input.id },
      });

      if (!post || post.userId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceWanted.update({
        where: { id: input.id },
        data: { status: 'found', foundAt: new Date() },
      });
    }),

  // Get my wanted posts
  getMyWantedPosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.marketplaceWanted.findMany({
      where: { userId: ctx.viewerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
      },
    });
  }),

  // Respond to wanted post
  respondToWanted: protectedProcedure
    .input(
      z.object({
        wantedId: z.string(),
        message: z.string().min(10),
        price: z.number().optional(),
        hasItem: z.boolean().default(true),
        canGet: z.boolean().default(false),
        listingId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.marketplaceWanted.findUnique({
        where: { id: input.wantedId },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (post.userId === ctx.viewerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot respond to your own post' });
      }

      const response = await ctx.prisma.marketplaceWantedResponse.create({
        data: {
          wantedId: input.wantedId,
          responderId: ctx.viewerId,
          message: input.message,
          price: input.price,
          hasItem: input.hasItem,
          canGet: input.canGet,
          listingId: input.listingId,
        },
      });

      // Increment response count
      await ctx.prisma.marketplaceWanted.update({
        where: { id: input.wantedId },
        data: { responseCount: { increment: 1 } },
      });

      return response;
    }),

  // ==========================================
  // OFFERS
  // ==========================================

  // Make offer
  makeOffer: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        offerType: z.enum(['cash', 'trade', 'cash_plus_trade']),
        amount: z.number().optional(),
        tradeItems: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (listing.sellerId === ctx.viewerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot make offer on your own listing',
        });
      }

      return ctx.prisma.marketplaceOffer.create({
        data: {
          listingId: input.listingId,
          buyerId: ctx.viewerId,
          offerType: input.offerType,
          amount: input.amount,
          tradeItems: input.tradeItems,
          message: input.message,
        },
      });
    }),

  // Get offers on my listings
  getMyOffers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.marketplaceOffer.findMany({
      where: {
        listing: { sellerId: ctx.viewerId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true, price: true },
        },
        buyer: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }),

  // Get my sent offers
  getMySentOffers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.marketplaceOffer.findMany({
      where: { buyerId: ctx.viewerId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            seller: { select: { id: true, name: true } },
          },
        },
      },
    });
  }),

  // Respond to offer
  respondToOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.string(),
        action: z.enum(['accept', 'decline', 'counter']),
        counterAmount: z.number().optional(),
        counterMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const offer = await ctx.prisma.marketplaceOffer.findUnique({
        where: { id: input.offerId },
        include: { listing: true },
      });

      if (!offer || offer.listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const status =
        input.action === 'accept'
          ? 'accepted'
          : input.action === 'decline'
            ? 'declined'
            : 'countered';

      return ctx.prisma.marketplaceOffer.update({
        where: { id: input.offerId },
        data: {
          status,
          counterAmount: input.counterAmount,
          counterMessage: input.counterMessage,
          respondedAt: new Date(),
        },
      });
    }),

  // ==========================================
  // REVIEWS
  // ==========================================

  // Submit a review
  submitReview: protectedProcedure
    .input(
      z.object({
        revieweeId: z.string(),
        listingId: z.string().optional(),
        transactionType: z.enum(['sale', 'purchase', 'trade']),
        overallRating: z.number().min(1).max(5),
        communicationRating: z.number().min(1).max(5).optional(),
        accuracyRating: z.number().min(1).max(5).optional(),
        shippingRating: z.number().min(1).max(5).optional(),
        paymentRating: z.number().min(1).max(5).optional(),
        title: z.string().max(100).optional(),
        content: z.string().min(10).max(2000),
        pros: z.array(z.string()).optional(),
        cons: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.revieweeId === ctx.viewerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot review yourself' });
      }

      // Check if already reviewed this user for this listing
      const existing = await ctx.prisma.marketplaceReview.findFirst({
        where: {
          reviewerId: ctx.viewerId,
          revieweeId: input.revieweeId,
          listingId: input.listingId,
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already reviewed this transaction' });
      }

      const review = await ctx.prisma.marketplaceReview.create({
        data: {
          reviewerId: ctx.viewerId,
          revieweeId: input.revieweeId,
          listingId: input.listingId,
          transactionType: input.transactionType,
          overallRating: input.overallRating,
          communicationRating: input.communicationRating,
          accuracyRating: input.accuracyRating,
          shippingRating: input.shippingRating,
          paymentRating: input.paymentRating,
          title: input.title,
          content: input.content,
          pros: input.pros || [],
          cons: input.cons || [],
        },
      });

      // Update marketplace profile's average rating
      const allReviews = await ctx.prisma.marketplaceReview.findMany({
        where: { revieweeId: input.revieweeId },
        select: { overallRating: true, transactionType: true },
      });

      // Calculate separate ratings for seller and buyer roles
      const sellerReviews = allReviews.filter((r) => r.transactionType === 'sale');
      const buyerReviews = allReviews.filter((r) => r.transactionType === 'purchase');

      const sellerAvg =
        sellerReviews.length > 0
          ? Math.round(
              (sellerReviews.reduce((sum, r) => sum + r.overallRating, 0) / sellerReviews.length) *
                10
            )
          : null;

      const buyerAvg =
        buyerReviews.length > 0
          ? Math.round(
              (buyerReviews.reduce((sum, r) => sum + r.overallRating, 0) / buyerReviews.length) * 10
            )
          : null;

      // Update MarketplaceProfile (upsert in case it doesn't exist)
      await ctx.prisma.marketplaceProfile.upsert({
        where: { userId: input.revieweeId },
        create: {
          userId: input.revieweeId,
          sellerRating: sellerAvg,
          sellerRatingCount: sellerReviews.length,
          buyerRating: buyerAvg,
          buyerRatingCount: buyerReviews.length,
        },
        update: {
          sellerRating: sellerAvg,
          sellerRatingCount: sellerReviews.length,
          buyerRating: buyerAvg,
          buyerRatingCount: buyerReviews.length,
        },
      });

      return review;
    }),

  // Get reviews for a user
  getUserReviews: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['received', 'given']).default('received'),
        limit: z.number().default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where =
        input.type === 'received' ? { revieweeId: input.userId } : { reviewerId: input.userId };

      const reviews = await ctx.prisma.marketplaceReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          reviewer: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          reviewee: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem?.id;
      }

      return { reviews, nextCursor };
    }),

  // Get user's marketplace profile (ratings summary)
  getUserMarketplaceProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get user basic info
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Get marketplace profile with ratings
      const profile = await ctx.prisma.marketplaceProfile.findUnique({
        where: { userId: input.userId },
      });

      // Get active listings count
      const activeListingsCount = await ctx.prisma.marketplaceListing.count({
        where: { sellerId: input.userId, status: 'active' },
      });

      // Get rating breakdown
      const reviews = await ctx.prisma.marketplaceReview.groupBy({
        by: ['overallRating'],
        where: { revieweeId: input.userId },
        _count: true,
      });

      const ratingBreakdown = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
      reviews.forEach((r) => {
        ratingBreakdown[r.overallRating as keyof typeof ratingBreakdown] = r._count;
      });

      return {
        ...user,
        sellerRating: profile?.sellerRating ? profile.sellerRating / 10 : null,
        buyerRating: profile?.buyerRating ? profile.buyerRating / 10 : null,
        sellerRatingCount: profile?.sellerRatingCount || 0,
        buyerRatingCount: profile?.buyerRatingCount || 0,
        verificationLevel: profile?.verificationLevel || 'email',
        isVerified: profile?.identityVerified || false,
        activeListingsCount,
        ratingBreakdown,
      };
    }),

  // Vote on review helpfulness
  voteReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        isHelpful: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert the vote
      const vote = await ctx.prisma.marketplaceReviewVote.upsert({
        where: {
          reviewId_voterId: {
            reviewId: input.reviewId,
            voterId: ctx.viewerId,
          },
        },
        create: {
          reviewId: input.reviewId,
          voterId: ctx.viewerId,
          isHelpful: input.isHelpful,
        },
        update: {
          isHelpful: input.isHelpful,
        },
      });

      // Update helpful count on review
      const helpfulCount = await ctx.prisma.marketplaceReviewVote.count({
        where: { reviewId: input.reviewId, isHelpful: true },
      });

      await ctx.prisma.marketplaceReview.update({
        where: { id: input.reviewId },
        data: { helpfulCount },
      });

      return vote;
    }),

  // ==========================================
  // IMAGES
  // ==========================================

  // Add image to listing
  addListingImage: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        url: z.string().url(),
        isPrimary: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing || listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Get current max sort order
      const maxOrder = await ctx.prisma.marketplaceImage.aggregate({
        where: { listingId: input.listingId },
        _max: { sortOrder: true },
      });

      // If this is primary, unset other primaries
      if (input.isPrimary) {
        await ctx.prisma.marketplaceImage.updateMany({
          where: { listingId: input.listingId },
          data: { isPrimary: false },
        });
      }

      return ctx.prisma.marketplaceImage.create({
        data: {
          listingId: input.listingId,
          url: input.url,
          isPrimary: input.isPrimary,
          sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        },
      });
    }),

  // Remove image from listing
  removeListingImage: protectedProcedure
    .input(
      z.object({
        imageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.marketplaceImage.findUnique({
        where: { id: input.imageId },
        include: { listing: true },
      });

      if (!image || image.listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.marketplaceImage.delete({
        where: { id: input.imageId },
      });
    }),

  // Set primary image
  setPrimaryImage: protectedProcedure
    .input(
      z.object({
        imageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.marketplaceImage.findUnique({
        where: { id: input.imageId },
        include: { listing: true },
      });

      if (!image || image.listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Unset other primaries
      await ctx.prisma.marketplaceImage.updateMany({
        where: { listingId: image.listingId },
        data: { isPrimary: false },
      });

      return ctx.prisma.marketplaceImage.update({
        where: { id: input.imageId },
        data: { isPrimary: true },
      });
    }),

  // Reorder images
  reorderImages: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        imageIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing || listing.sellerId !== ctx.viewerId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Update sort order for each image
      await Promise.all(
        input.imageIds.map((id, index) =>
          ctx.prisma.marketplaceImage.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );

      return { success: true };
    }),

  // ==========================================
  // REPORTING (Scam Prevention)
  // ==========================================

  // Report a listing
  reportListing: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        reason: z.enum(['scam', 'fake_item', 'harassment', 'spam', 'inappropriate', 'other']),
        description: z.string().min(10).max(1000),
        evidence: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reported this listing
      const existingReport = await ctx.prisma.marketplaceReport.findFirst({
        where: {
          reportedListingId: input.listingId,
          reporterId: ctx.viewerId,
        },
      });

      if (existingReport) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already reported this listing',
        });
      }

      // Create report
      const report = await ctx.prisma.marketplaceReport.create({
        data: {
          reportedListingId: input.listingId,
          reporterId: ctx.viewerId,
          reason: input.reason,
          description: input.description,
          evidence: input.evidence || [],
        },
      });

      // If listing gets 3+ reports, auto-flag for review
      const reportCount = await ctx.prisma.marketplaceReport.count({
        where: { reportedListingId: input.listingId },
      });

      if (reportCount >= 3) {
        await ctx.prisma.marketplaceListing.update({
          where: { id: input.listingId },
          data: { status: 'pending' }, // Flag for admin review
        });
      }

      return { success: true, reportId: report.id };
    }),

  // Report a user
  reportUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.enum(['scam', 'fake_item', 'harassment', 'spam', 'inappropriate', 'other']),
        description: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.viewerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot report yourself' });
      }

      const report = await ctx.prisma.marketplaceReport.create({
        data: {
          reportedUserId: input.userId,
          reporterId: ctx.viewerId,
          reason: input.reason,
          description: input.description,
          evidence: [],
        },
      });

      return { success: true, reportId: report.id };
    }),

  // ==========================================
  // MESSAGING
  // ==========================================

  // Send message about a listing
  sendMessage: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        recipientId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }

      // Can't message yourself
      if (input.recipientId === ctx.viewerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot message yourself' });
      }

      return ctx.prisma.marketplaceMessage.create({
        data: {
          listingId: input.listingId,
          senderId: ctx.viewerId,
          recipientId: input.recipientId,
          content: input.content,
        },
      });
    }),

  // Get messages for a listing conversation
  getListingMessages: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        otherUserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.marketplaceMessage.findMany({
        where: {
          listingId: input.listingId,
          OR: [
            { senderId: ctx.viewerId, recipientId: input.otherUserId },
            { senderId: input.otherUserId, recipientId: ctx.viewerId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // Mark as read
      await ctx.prisma.marketplaceMessage.updateMany({
        where: {
          listingId: input.listingId,
          senderId: input.otherUserId,
          recipientId: ctx.viewerId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return messages;
    }),

  // Get all conversations (inbox)
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    // Get unique conversations
    const messages = await ctx.prisma.marketplaceMessage.findMany({
      where: {
        OR: [{ senderId: ctx.viewerId }, { recipientId: ctx.viewerId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true, images: { take: 1, where: { isPrimary: true } } },
        },
        sender: {
          select: { id: true, name: true, image: true },
        },
        recipient: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Group by listing + other user
    const conversationMap = new Map<string, (typeof messages)[0]>();

    for (const msg of messages) {
      const otherUserId = msg.senderId === ctx.viewerId ? msg.recipientId : msg.senderId;
      const key = `${msg.listingId}-${otherUserId}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, msg);
      }
    }

    // Get unread counts per conversation
    const conversations = await Promise.all(
      Array.from(conversationMap.values()).map(async (msg) => {
        const otherUserId = msg.senderId === ctx.viewerId ? msg.recipientId : msg.senderId;
        const otherUser = msg.senderId === ctx.viewerId ? msg.recipient : msg.sender;

        const unreadCount = await ctx.prisma.marketplaceMessage.count({
          where: {
            listingId: msg.listingId,
            senderId: otherUserId,
            recipientId: ctx.viewerId,
            isRead: false,
          },
        });

        return {
          listingId: msg.listingId,
          listing: msg.listing,
          otherUser,
          lastMessage: msg,
          unreadCount,
        };
      })
    );

    return conversations;
  }),

  // Get unread message count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.marketplaceMessage.count({
      where: {
        recipientId: ctx.viewerId,
        isRead: false,
      },
    });
    return { count };
  }),

  // ==========================================
  // REVIEWS (Rating & Feedback)
  // ==========================================

  // Get seller rating summary
  getSellerRating: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.prisma.marketplaceReview.aggregate({
        where: {
          revieweeId: input.userId,
          transactionType: 'sale',
        },
        _avg: { overallRating: true },
        _count: true,
      });

      // Get rating distribution
      const distribution = await ctx.prisma.marketplaceReview.groupBy({
        by: ['overallRating'],
        where: {
          revieweeId: input.userId,
          transactionType: 'sale',
        },
        _count: true,
      });

      return {
        averageRating: stats._avg.overallRating || 0,
        totalReviews: stats._count,
        distribution: distribution.reduce(
          (acc, d) => {
            acc[d.overallRating] = d._count;
            return acc;
          },
          {} as Record<number, number>
        ),
      };
    }),

  // Create a review (after transaction)
  createReview: protectedProcedure
    .input(
      z.object({
        listingId: z.string().optional(),
        revieweeId: z.string(),
        overallRating: z.number().min(1).max(5),
        content: z.string().min(10).max(1000),
        transactionType: z.enum(['sale', 'purchase', 'trade']),
        communicationRating: z.number().min(1).max(5).optional(),
        accuracyRating: z.number().min(1).max(5).optional(),
        shippingRating: z.number().min(1).max(5).optional(),
        paymentRating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reviewed this transaction
      const existingReview = await ctx.prisma.marketplaceReview.findFirst({
        where: {
          listingId: input.listingId,
          reviewerId: ctx.viewerId,
          transactionType: input.transactionType,
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already reviewed this transaction',
        });
      }

      // Create the review
      const review = await ctx.prisma.marketplaceReview.create({
        data: {
          listingId: input.listingId,
          reviewerId: ctx.viewerId,
          revieweeId: input.revieweeId,
          overallRating: input.overallRating,
          content: input.content,
          transactionType: input.transactionType,
          communicationRating: input.communicationRating,
          accuracyRating: input.accuracyRating,
          shippingRating: input.shippingRating,
          paymentRating: input.paymentRating,
        },
      });

      // Update marketplace profile's average rating
      const allReviews = await ctx.prisma.marketplaceReview.findMany({
        where: { revieweeId: input.revieweeId },
        select: { overallRating: true, transactionType: true },
      });

      // Calculate separate ratings for seller and buyer roles
      const sellerReviews = allReviews.filter((r) => r.transactionType === 'sale');
      const buyerReviews = allReviews.filter((r) => r.transactionType === 'purchase');

      const sellerAvg =
        sellerReviews.length > 0
          ? Math.round(
              (sellerReviews.reduce((sum, r) => sum + r.overallRating, 0) / sellerReviews.length) *
                10
            )
          : null;

      const buyerAvg =
        buyerReviews.length > 0
          ? Math.round(
              (buyerReviews.reduce((sum, r) => sum + r.overallRating, 0) / buyerReviews.length) * 10
            )
          : null;

      // Update MarketplaceProfile (not User)
      await ctx.prisma.marketplaceProfile.upsert({
        where: { userId: input.revieweeId },
        create: {
          userId: input.revieweeId,
          sellerRating: sellerAvg,
          sellerRatingCount: sellerReviews.length,
          buyerRating: buyerAvg,
          buyerRatingCount: buyerReviews.length,
        },
        update: {
          sellerRating: sellerAvg,
          sellerRatingCount: sellerReviews.length,
          buyerRating: buyerAvg,
          buyerRatingCount: buyerReviews.length,
        },
      });

      return review;
    }),

  // ==========================================
  // STATS
  // ==========================================

  // Get marketplace stats
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalListings, totalWanted, categoryStats] = await Promise.all([
      ctx.prisma.marketplaceListing.count({ where: { status: 'active' } }),
      ctx.prisma.marketplaceWanted.count({ where: { status: 'active' } }),
      ctx.prisma.marketplaceListing.groupBy({
        by: ['category'],
        where: { status: 'active' },
        _count: true,
      }),
    ]);

    return {
      totalListings,
      totalWanted,
      categoryStats: categoryStats.map((c) => ({
        category: c.category,
        count: c._count,
      })),
    };
  }),

  // Get user's marketplace stats
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const [activeListings, soldListings, savedCount, alertCount, wantedCount, pendingOffers] =
      await Promise.all([
        ctx.prisma.marketplaceListing.count({
          where: { sellerId: ctx.viewerId, status: 'active' },
        }),
        ctx.prisma.marketplaceListing.count({
          where: { sellerId: ctx.viewerId, status: 'sold' },
        }),
        ctx.prisma.marketplaceFavorite.count({
          where: { userId: ctx.viewerId },
        }),
        ctx.prisma.marketplaceAlert.count({
          where: { userId: ctx.viewerId, isActive: true },
        }),
        ctx.prisma.marketplaceWanted.count({
          where: { userId: ctx.viewerId, status: 'active' },
        }),
        ctx.prisma.marketplaceOffer.count({
          where: {
            listing: { sellerId: ctx.viewerId },
            status: 'pending',
          },
        }),
      ]);

    return {
      activeListings,
      soldListings,
      savedCount,
      alertCount,
      wantedCount,
      pendingOffers,
    };
  }),
});
