/**
 * Printful Product IDs and Configuration
 *
 * Used across the merch system for product creation and checkout.
 */

// Popular Printful product IDs for quick reference
export const PRINTFUL_PRODUCTS = {
  BELLA_CANVAS_3001: 71, // Unisex Staple T-Shirt
  BELLA_CANVAS_3719: 380, // Unisex Sponge Fleece Hoodie
  GILDAN_5000: 5, // Unisex Heavy Cotton Tee
  TANK_TOP: 195, // Unisex Tank Top
  POSTER: 1, // Enhanced Matte Paper Poster
  MUG_11OZ: 19, // White Glossy Mug
  STICKER: 358, // Kiss-Cut Stickers
  DAD_HAT: 206, // Yupoong Dad Hat
  TOTE_BAG: 83, // Economy Tote
};

// Base prices for products (in cents)
export const PRINTFUL_BASE_PRICES: Record<number, number> = {
  71: 1295, // Bella+Canvas 3001 T-Shirt
  380: 2595, // Hoodie
  195: 1095, // Tank Top
  1: 895, // Poster
  19: 695, // Mug 11oz
  358: 245, // Stickers
  206: 1295, // Dad Hat
  83: 1195, // Tote Bag
  5: 995, // Gildan 5000
};

// Platform fee configuration
export const PLATFORM_FEE_PERCENT = 15;

// Size options by product category
export const PRODUCT_SIZES = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  poster: ['8×10"', '12×16"', '16×20"', '18×24"', '24×36"'],
  sticker: ['3×3"', '4×4"', '5.5×5.5"'],
  mug: ['11oz', '15oz'],
};

// Color options
export const PRODUCT_COLORS = {
  basic: ['Black', 'White', 'Navy', 'Heather Grey'],
  extended: [
    'Black',
    'White',
    'Navy',
    'Heather Grey',
    'Red',
    'Forest Green',
    'Maroon',
    'Royal Blue',
  ],
};
