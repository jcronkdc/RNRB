'use client';

import { useState, useCallback } from 'react';

/**
 * Printful Integration Hook
 *
 * Provides utilities for:
 * - Fetching product catalog
 * - Generating mockups
 * - Creating products
 * - Checking API status
 */

interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  title: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  files: {
    id: string;
    type: string;
    title: string;
    additional_price: string;
  }[];
  options: {
    id: string;
    title: string;
    type: string;
    values: Record<string, string>;
  }[];
  is_discontinued: boolean;
  avg_fulfillment_time: number | null;
  description: string;
}

interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  color_code2: string | null;
  image: string;
  price: string;
  in_stock: boolean;
  availability_status: string;
}

interface MockupTask {
  task_key: string;
  status: 'pending' | 'completed' | 'failed';
  mockups?: {
    placement: string;
    variant_ids: number[];
    mockup_url: string;
    extra: {
      title: string;
      url: string;
    }[];
  }[];
  error?: string;
}

interface UsePrintfulReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Catalog
  fetchCatalog: (categoryId?: string) => Promise<PrintfulProduct[] | null>;
  fetchProductDetails: (
    productId: number
  ) => Promise<{ product: PrintfulProduct; variants: PrintfulVariant[] } | null>;
  fetchCategories: () => Promise<{ id: number; title: string; parent_id: number | null }[] | null>;

  // Mockups
  generateMockup: (params: {
    productId: number;
    variantIds: number[];
    designUrl: string;
    placement?: string;
    format?: 'jpg' | 'png';
  }) => Promise<{ taskKey: string } | null>;
  checkMockupStatus: (taskKey: string) => Promise<MockupTask | null>;

  // Products
  createProduct: (params: {
    name: string;
    designUrl: string;
    productType: string;
    variants: { variantId: number; retailPrice: number }[];
    placement?: string;
  }) => Promise<unknown>;

  // Store Info
  checkConnection: () => Promise<boolean>;
}

export function usePrintful(): UsePrintfulReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================
  // CATALOG FUNCTIONS
  // =====================

  const fetchCatalog = useCallback(
    async (categoryId?: string): Promise<PrintfulProduct[] | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const url = categoryId
          ? `/api/merch/printful?action=catalog&category=${categoryId}`
          : '/api/merch/printful?action=catalog';

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch catalog');
        }

        return data.catalog as PrintfulProduct[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchProductDetails = useCallback(async (productId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/merch/printful?action=product-details&id=${productId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch product details');
      }

      return data.product as { product: PrintfulProduct; variants: PrintfulVariant[] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/merch/printful?action=categories');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      return data.categories as { id: number; title: string; parent_id: number | null }[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================
  // MOCKUP FUNCTIONS
  // =====================

  const generateMockup = useCallback(
    async (params: {
      productId: number;
      variantIds: number[];
      designUrl: string;
      placement?: string;
      format?: 'jpg' | 'png';
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/merch/printful', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-mockup',
            productId: params.productId,
            variantIds: params.variantIds,
            designUrl: params.designUrl,
            placement: params.placement || 'front',
            format: params.format || 'jpg',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate mockup');
        }

        return { taskKey: data.task.task_key };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkMockupStatus = useCallback(async (taskKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/merch/printful?action=mockup-task&task_key=${taskKey}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check mockup status');
      }

      return data.task as MockupTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================
  // PRODUCT FUNCTIONS
  // =====================

  const createProduct = useCallback(
    async (params: {
      name: string;
      designUrl: string;
      productType: string;
      variants: { variantId: number; retailPrice: number }[];
      placement?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/merch/printful', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-product',
            name: params.name,
            designUrl: params.designUrl,
            productType: params.productType,
            variants: params.variants,
            placement: params.placement || 'front',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create product');
        }

        return data.product;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // =====================
  // UTILITY FUNCTIONS
  // =====================

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/merch/printful?action=store-info');
      const data = await response.json();
      return response.ok && data.success;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    fetchCatalog,
    fetchProductDetails,
    fetchCategories,
    generateMockup,
    checkMockupStatus,
    createProduct,
    checkConnection,
  };
}

/**
 * Popular Printful Product IDs for quick reference
 */
export const PRINTFUL_PRODUCTS = {
  // T-Shirts
  BELLA_CANVAS_3001: 71, // Unisex Staple T-Shirt (most popular)
  GILDAN_5000: 5, // Unisex Heavy Cotton Tee
  COMFORT_COLORS_1717: 380, // Unisex Garment-Dyed Tee

  // Hoodies & Sweatshirts
  BELLA_CANVAS_3719: 380, // Unisex Sponge Fleece Hoodie
  GILDAN_18500: 146, // Heavy Blend Hooded Sweatshirt

  // Tank Tops
  BELLA_CANVAS_3480: 195, // Unisex Tank

  // Wall Art
  POSTER: 1, // Enhanced Matte Paper Poster
  CANVAS: 54, // Canvas

  // Accessories
  MUG_11OZ: 19, // White Glossy Mug
  MUG_15OZ: 438, // 15oz Mug
  STICKER: 358, // Kiss-Cut Stickers
  DAD_HAT: 206, // Yupoong Dad Hat
  SNAPBACK: 207, // Yupoong Snapback
  TOTE_BAG: 83, // Economy Tote

  // Phone Cases
  IPHONE_CASE: 304, // iPhone Clear Case
} as const;

/**
 * Common Printful product variant IDs for quick prototyping
 */
export const VARIANT_IDS = {
  // Bella+Canvas 3001 (T-Shirt) - Black
  TSHIRT_BLACK_S: 4011,
  TSHIRT_BLACK_M: 4012,
  TSHIRT_BLACK_L: 4013,
  TSHIRT_BLACK_XL: 4014,
  TSHIRT_BLACK_2XL: 4017,

  // Bella+Canvas 3001 (T-Shirt) - White
  TSHIRT_WHITE_S: 4018,
  TSHIRT_WHITE_M: 4019,
  TSHIRT_WHITE_L: 4020,
  TSHIRT_WHITE_XL: 4021,
  TSHIRT_WHITE_2XL: 4024,
} as const;

export default usePrintful;
