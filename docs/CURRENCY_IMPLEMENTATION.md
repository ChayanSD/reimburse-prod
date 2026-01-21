# Currency Support Implementation

## Overview
Implemented comprehensive currency support for the ReimburseMe application, allowing users to define their default currency in company settings which will be used throughout the application for OCR processing, PDF exports, and batch processing.

## Changes Made

### 1. Database Schema Updates
- **File**: `prisma/schema.prisma`
- Added `defaultCurrency` field to `CompanySettings` model
  - Type: `String` (VARCHAR(3))
  - Default: `"USD"`
  - Maps to: `default_currency` in database

### 2. Currency Constants
- **File**: `lib/constants/currencies.ts` (NEW)
- Created comprehensive list of 45+ supported currencies
- Includes currency code, name, and symbol for each
- Helper functions:
  - `getCurrencySymbol(code)` - Returns currency symbol
  - `getCurrencyName(code)` - Returns currency name

### 3. Company Settings UI
- **File**: `app/company-settings/page.tsx`
- Added currency selector dropdown in the settings form
- Shows currency code, name, and symbol for easy selection
- Includes helpful hint text explaining usage
- Updated TypeScript interfaces to include `defaultCurrency`
- Updated all form state management to handle the new field

### 4. API Updates
- **File**: `app/api/company-settings/route.ts`
- Updated GET endpoint to return `defaultCurrency` in response
- Updated POST endpoint to save `defaultCurrency` on create/update
- Defaults to "USD" if not provided

### 5. Validation Schema
- **File**: `validation/company-settings.validation.ts`
- Added `default_currency` field validation
- Enforces 3-character currency code format
- Defaults to "USD"

## Usage

### Setting Default Currency
1. Navigate to Company Settings
2. Select desired currency from the "Default Currency" dropdown
3. Save the company setting
4. The selected currency will be used for:
   - OCR processing of new receipts
   - PDF export generation
   - Batch processing operations
   - Team collaboration features

### Fallback Behavior
- If no currency is set, defaults to USD ($)
- Existing receipts retain their original currency
- New receipts will use the default currency from company settings

## Integration Points

### For OCR Processing
When processing receipts via OCR, the system should:
```typescript
// Get user's default currency from company settings
const defaultSetting = await prisma.companySettings.findFirst({
  where: { userId, isDefault: true },
  select: { defaultCurrency: true }
});

const currency = defaultSetting?.defaultCurrency || "USD";
```

### For PDF Exports
When generating PDF reports:
```typescript
import { getCurrencySymbol } from "@/lib/constants/currencies";

const currencySymbol = getCurrencySymbol(companySetting.defaultCurrency);
// Use currencySymbol in PDF formatting
```

### For Batch Processing
When processing multiple receipts in a team context:
```typescript
// Get team owner's default currency
const teamOwner = await prisma.team.findUnique({
  where: { id: teamId },
  include: {
    owner: {
      include: {
        CompanySettings: {
          where: { isDefault: true }
        }
      }
    }
  }
});

const currency = teamOwner?.owner?.CompanySettings[0]?.defaultCurrency || "USD";
```

## Next Steps

To complete the currency integration:

1. **Update OCR Service**: Modify the OCR processing logic to use the default currency
2. **Update PDF Generation**: Ensure PDF exports use the correct currency symbol
3. **Update Receipt Creation**: When creating receipts, use the default currency if not specified
4. **Update Team Processing**: Ensure batch processing uses team owner's default currency
5. **Add Currency Conversion** (Optional): Implement currency conversion for multi-currency reports

## Testing

Test the following scenarios:
1. Create a new company setting with a non-USD currency
2. Set it as default
3. Upload a receipt and verify it uses the correct currency
4. Generate a PDF report and verify currency symbols
5. Process batch receipts in a team and verify currency consistency
