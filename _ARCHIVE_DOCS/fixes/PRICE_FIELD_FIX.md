# Price Field Mapping Fix

## Issue

The `ProductCardWithPreview` and `ProductPreviewModal` components expected `retailPrice` but received `price` from the transformed data, resulting in `NaN` being displayed.

## Root Cause

- **API returns:** `retailPrice`
- **MerchProduct interface uses:** `price`
- **Transform correctly maps:** `retailPrice` → `price`
- **Component incorrectly expected:** `retailPrice`

## Solution

Updated `ProductCardWithPreview` and `ProductPreviewModal` components to use `price` instead of `retailPrice` to match the `MerchProduct` interface.

### Files Changed

- `apps/web/components/merch/product-preview.tsx`
  - Line 27: Changed interface from `retailPrice: number` to `price: number`
  - Line 197: Changed `product.retailPrice` to `product.price`
  - Line 296: Changed `product.retailPrice` to `product.price`

## Data Flow

```
Database (retailPrice)
  → API (/api/merch/products returns retailPrice)
  → Transform (maps retailPrice → price)
  → MerchProduct interface (expects price)
  → ProductCardWithPreview component (now correctly uses price) ✅
```

## Verification

- Component interface now matches `MerchProduct` interface
- No linter errors
- Price will display correctly as `$XX.XX` instead of `NaN`

## Notes

The component is not yet being imported/used in any pages, so this is a preemptive fix that ensures it will work correctly when integrated.
