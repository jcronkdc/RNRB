/**
 * Printful Mockup Generation Utilities
 *
 * This module handles generating realistic product mockups using Printful's API.
 * Mockups show what the actual product will look like with the design on it.
 */

const PRINTFUL_API_URL = 'https://api.printful.com';

export interface PrintfulMockupRequest {
  productId: number; // Printful product ID (e.g., 71 for Bella+Canvas 3001)
  designUrl: string; // Public URL of the design image
  variantIds?: number[]; // Specific variants to generate mockups for
  placement?: 'front' | 'back' | 'left' | 'right'; // Where to place the design
  position?: {
    area_width: number;
    area_height: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
}

export interface PrintfulMockup {
  variantId: number;
  mockupUrl: string;
  placement: string;
  productColor: string;
}

/**
 * Generate mockups using Printful's Mockup Generator API
 *
 * @see https://developers.printful.com/docs/#tag/Mockup-Generator-API
 */
export async function generatePrintfulMockups(
  request: PrintfulMockupRequest,
  apiKey?: string,
  storeId?: string
): Promise<PrintfulMockup[]> {
  const key = apiKey || process.env.PRINTFUL_API_KEY;
  const store = storeId || process.env.PRINTFUL_STORE_ID || '17319056';

  if (!key) {
    throw new Error('Printful API key not configured');
  }

  try {
    // Step 1: Get available print files for the product
    const printFilesResponse = await fetch(
      `${PRINTFUL_API_URL}/mockup-generator/printfiles/${request.productId}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'X-PF-Store-Id': store,
        },
      }
    );

    if (!printFilesResponse.ok) {
      const error = await printFilesResponse.json();
      throw new Error(
        `Failed to fetch print files: ${error.error?.message || printFilesResponse.statusText}`
      );
    }

    const printFilesData = await printFilesResponse.json();
    const printFiles = printFilesData.result?.printfiles || [];

    if (printFiles.length === 0) {
      throw new Error('No print files available for this product');
    }

    // Find the front placement print file
    const frontPrintFile = printFiles.find(
      (pf: any) =>
        pf.placement === request.placement || pf.placement === 'default' || pf.placement === 'front'
    );

    if (!frontPrintFile) {
      throw new Error('No suitable print file found');
    }

    // Step 2: Get mockup templates for the product
    const templatesResponse = await fetch(
      `${PRINTFUL_API_URL}/mockup-generator/templates/${request.productId}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'X-PF-Store-Id': store,
        },
      }
    );

    if (!templatesResponse.ok) {
      throw new Error('Failed to fetch mockup templates');
    }

    const templatesData = await templatesResponse.json();
    const variantMapping = templatesData.result?.variant_mapping || [];

    // Filter variants if specific ones were requested
    const variantsToGenerate = request.variantIds
      ? variantMapping.filter((vm: any) => request.variantIds!.includes(vm.variant_id))
      : variantMapping.slice(0, 5); // Generate mockups for first 5 variants by default

    if (variantsToGenerate.length === 0) {
      throw new Error('No variants available for mockup generation');
    }

    // Step 3: Create mockup generation task
    const mockupTaskPayload = {
      variant_ids: variantsToGenerate.map((v: any) => v.variant_id),
      format: 'jpg',
      width: 1000,
      files: [
        {
          placement: request.placement || 'front',
          image_url: request.designUrl,
          position: request.position || {
            area_width: frontPrintFile.width,
            area_height: frontPrintFile.height,
            width: Math.floor(frontPrintFile.width * 0.8),
            height: Math.floor(frontPrintFile.height * 0.8),
            top: Math.floor(frontPrintFile.height * 0.1),
            left: Math.floor(frontPrintFile.width * 0.1),
          },
        },
      ],
    };

    const createTaskResponse = await fetch(
      `${PRINTFUL_API_URL}/mockup-generator/create-task/${request.productId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'X-PF-Store-Id': store,
        },
        body: JSON.stringify(mockupTaskPayload),
      }
    );

    if (!createTaskResponse.ok) {
      const error = await createTaskResponse.json();
      throw new Error(
        `Failed to create mockup task: ${error.error?.message || createTaskResponse.statusText}`
      );
    }

    const taskData = await createTaskResponse.json();
    const taskKey = taskData.result?.task_key;

    if (!taskKey) {
      throw new Error('No task key returned from mockup generation');
    }

    // Step 4: Poll for mockup completion (with timeout)
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(
        `${PRINTFUL_API_URL}/mockup-generator/task?task_key=${taskKey}`,
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'X-PF-Store-Id': store,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check mockup status');
      }

      const statusData = await statusResponse.json();
      const status = statusData.result?.status;

      if (status === 'completed') {
        // Extract mockups from result
        const mockups: PrintfulMockup[] = [];
        const mockupsData = statusData.result?.mockups || [];

        for (const mockup of mockupsData) {
          mockups.push({
            variantId: mockup.variant_id,
            mockupUrl: mockup.mockup_url,
            placement: mockup.placement || 'front',
            productColor: mockup.extra?.[0]?.title || 'Default',
          });
        }

        return mockups;
      } else if (status === 'failed') {
        throw new Error('Mockup generation failed');
      }

      attempts++;
    }

    throw new Error('Mockup generation timed out');
  } catch (error) {
    console.error('[PRINTFUL-MOCKUPS] Error:', error);
    throw error;
  }
}

/**
 * Get mockup status for an existing task
 */
export async function getPrintfulMockupStatus(
  taskKey: string,
  apiKey?: string,
  storeId?: string
): Promise<{
  status: 'pending' | 'completed' | 'failed';
  mockups?: PrintfulMockup[];
  error?: string;
}> {
  const key = apiKey || process.env.PRINTFUL_API_KEY;
  const store = storeId || process.env.PRINTFUL_STORE_ID || '17319056';

  if (!key) {
    throw new Error('Printful API key not configured');
  }

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/mockup-generator/task?task_key=${taskKey}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'X-PF-Store-Id': store,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check mockup status');
    }

    const data = await response.json();
    const result = data.result;

    if (result.status === 'completed') {
      const mockups: PrintfulMockup[] = [];
      const mockupsData = result.mockups || [];

      for (const mockup of mockupsData) {
        mockups.push({
          variantId: mockup.variant_id,
          mockupUrl: mockup.mockup_url,
          placement: mockup.placement || 'front',
          productColor: mockup.extra?.[0]?.title || 'Default',
        });
      }

      return {
        status: 'completed',
        mockups,
      };
    } else if (result.status === 'failed') {
      return {
        status: 'failed',
        error: result.error || 'Mockup generation failed',
      };
    } else {
      return {
        status: 'pending',
      };
    }
  } catch (error) {
    console.error('[PRINTFUL-MOCKUPS] Status check error:', error);
    throw error;
  }
}

/**
 * Default mockup images for products (fallback when Printful mockups aren't available)
 */
export const DEFAULT_PRODUCT_MOCKUPS: Record<string, string> = {
  tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
  hoodie: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
  tanktop: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&h=800&fit=crop',
  poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
  mug: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
  sticker: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800&h=800&fit=crop',
  cap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop',
  tote: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop',
};
