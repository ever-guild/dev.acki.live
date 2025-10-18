# Mock Data Removal & Skeleton Loading Update

## Summary

This update removes all mock data fallbacks from the Svelte blockchain service and implements proper loading states with skeleton loaders. Real data from the GraphQL API is now required, and errors are properly handled with retry functionality.

## Changes Made

### 1. Removed Mock Data Functions ❌

**File**: `svelte/src/lib/services/blockchain.ts`

Removed the following mock data functions:
- `getMockBlocks()` - Generated fake block data
- `getMockTransactions()` - Generated fake transaction data
- `getMockMessages()` - Generated fake message data
- `getMockContracts()` - Generated fake contract data
- `getMockStats()` - Generated fake network statistics
- `generateHash()` - Created random hashes
- `generateAddress()` - Created random addresses

### 2. Updated Service Functions to Throw Errors

All data fetching functions now throw errors instead of falling back to mock data:

```typescript
// Before
if (response.data?.blocks) {
  return response.data.blocks.map(...);
}
return getMockBlocks(); // ❌ Mock fallback

// After
if (response.data?.blocks) {
  return response.data.blocks.map(...);
}
throw new Error('Failed to fetch blocks'); // ✅ Proper error
```

**Updated functions:**
- `getBlocks()` - Throws error if API fails
- `getTransactions()` - Throws error if API fails
- `getMessages()` - Throws error if API fails
- `getContracts()` - Throws error if API fails
- `getStats()` - Throws error if API fails

###3. Added Skeleton Loader Component 💀

**New File**: `svelte/src/lib/components/ui/SkeletonLoader.svelte`

Features:
- Animated shimmer effect
- Dark mode support
- Multiple skeleton variants:
  - `.skeleton` - Base skeleton
  - `.skeleton-text` - Text line (h-4, full width)
  - `.skeleton-title` - Title line (h-6, 2/3 width)
  - `.skeleton-circle` - Circular skeleton
  - `.skeleton-rect` - Rectangular skeleton

Usage:
```svelte
<SkeletonLoader>
  <div class="skeleton skeleton-text w-32"></div>
  <div class="skeleton skeleton-title"></div>
  <div class="skeleton skeleton-circle w-12 h-12"></div>
</SkeletonLoader>
```

### 4. Updated Blocks Page with Loading States

**File**: `svelte/src/routes/blocks/+page.svelte`

Added:
- `loading` state - Shows skeleton while data loads
- `error` state - Shows error message with retry button
- Skeleton loader for 10 rows during loading
- Error UI with icon and retry functionality

## GraphQL Query Examples 📋

**New File**: `schema.http`

Contains 25+ example GraphQL queries for testing the Acki Nacki API:

### Basic Queries
1. Get Server Info
2. Get Latest Blocks (with full details)
3. Get Block by Hash
4. Get Latest Transactions
5. Get Transaction by Hash
6. Get Latest Messages
7. Get Message by Hash
8. Get Active Accounts (with code)
9. Get Account Info by Address

### Advanced Queries
10. Get Account Transactions (Cursor-based pagination)
11. Get Account Messages (with filters)
12. Get Blocks with Transaction Filter
13. Get Transactions by Balance Delta Range
14. Get Accounts by Code Hash (Smart Contracts)
15. Get Block Value Flow (Economics)
16. Get Transaction with Full Details (Compute Phase)
17. Get Message Type Distribution
18. Get Key Blocks Only
19. Get Failed Transactions
20. Get External Messages
21. Get Block with In/Out Messages
22. Get Transaction with All Messages
23. Complex Filter: High-value successful transactions
24. Get Network Statistics Over Time

### Example Query Usage

```http
POST https://mainnet.ackinacki.org/graphql
Content-Type: application/json

{
  "query": "query GetLatestBlocks($limit: Int!) { blocks(orderBy: [{ path: \"gen_utime\", direction: DESC }], limit: $limit) { id seq_no gen_utime hash tr_count } }",
  "variables": {
    "limit": 20
  }
}
```

## Migration Guide for Other Pages

To update other pages (transactions, messages, contracts, stats), follow this pattern:

### 1. Add imports
```typescript
import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
```

### 2. Add state variables
```typescript
let data: YourType[] = [];
let loading = true;
let error: string | null = null;
```

### 3. Update onMount
```typescript
onMount(async () => {
  try {
    data = await yourDataFunction();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data';
  } finally {
    loading = false;
  }
});
```

### 4. Add conditional rendering
```svelte
{#if loading}
  <SkeletonLoader>
    <!-- Skeleton structure matching your table/layout -->
  </SkeletonLoader>
{:else if error}
  <div class="error-state">
    <!-- Error UI with retry button -->
  </div>
{:else}
  <!-- Your actual data display -->
{/if}
```

## Testing with schema.http

1. Open `schema.http` in VS Code
2. Install "REST Client" extension
3. Click "Send Request" above any query
4. Copy successful queries to use in the app
5. Test different filters and pagination options

## Benefits

✅ **No More Fake Data** - Only real blockchain data is displayed
✅ **Better UX** - Loading states inform users data is being fetched
✅ **Error Handling** - Users can retry failed requests
✅ **Type Safety** - TypeScript errors are properly typed
✅ **Testable** - schema.http provides manual testing capability
✅ **Maintainable** - Removed ~150 lines of mock data code

## Future Enhancements

- [ ] Add loading state to showcase page
- [ ] Add loading state to stats page
- [ ] Add loading state to contracts page
- [ ] Add loading state to messages page
- [ ] Add loading state to transactions page
- [ ] Implement retry logic with exponential backoff
- [ ] Add toast notifications for errors
- [ ] Cache GraphQL responses
- [ ] Add real-time subscriptions for new blocks/transactions

## API Reference

See `schema.json` for the complete GraphQL schema with all available types, queries, and fields.

Key Types:
- `Block` - Blockchain block data
- `Transaction` - Transaction details with compute phase
- `Message` - Messages between accounts
- `Account` - Smart contract account information
- `Info` - Network statistics and server info

## Notes

⚠️ **Breaking Changes**:
- Mock data functions are removed
- Service functions now throw errors instead of returning mock data
- Components must handle loading and error states

💡 **Tips**:
- Use browser DevTools Network tab to inspect GraphQL requests
- Check Console for GraphQL response logging
- Use schema.http to test queries before implementing in components
