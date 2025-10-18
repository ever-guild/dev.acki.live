# Acki Nacki GraphQL API Schema Documentation

This document describes the GraphQL API schema used by the Acki.Live blockchain explorer.

## Overview

**Base Endpoint:** `https://mainnet.ackinacki.org/graphql`

**Content-Type:** `text/plain` (Note: Not `application/json`)

The Acki Nacki GraphQL API provides access to blockchain data including blocks, transactions, messages, and accounts. All queries support filtering, pagination, and sorting.

## Core Resources

### 1. Info

Server information and statistics.

**Fields:**
- `version` (String): API version
- `time` (Float): Server timestamp
- `lastBlockTime` (Float): Timestamp of the last block
- `latency` (Float): Overall system latency
- `blocksLatency` (Float): Block processing latency
- `messagesLatency` (Float): Message processing latency
- `transactionsLatency` (Float): Transaction processing latency
- `batchSize` (Int): Batch processing size
- `endpoints` (Array): Available API endpoints

**Example Query:**
```graphql
query GetInfo {
  info {
    version
    time
    lastBlockTime
    latency
    blocksLatency
  }
}
```

---

### 2. Blocks

Blockchain blocks containing transaction records.

**Fields:**
- `id` (String): Block identifier
- `seq_no` (Int): Sequence number
- `gen_utime` (Int): Generation unix timestamp
- `gen_utime_string` (String): Formatted generation time
- `workchain_id` (Int): Workchain identifier (typically 0 or -1)
- `shard` (String): Shard identifier
- `tr_count` (Int): Number of transactions
- `status_name` (String): Block status
- `key_block` (Boolean): Whether this is a key block
- `hash` (String): Block hash
- `file_hash` (String): File hash
- `master_seq_no` (Int): Master chain sequence number
- `after_split` (Boolean): Split flag
- `before_split` (Boolean): Pre-split flag
- `value_flow` (Object): Economic flow information
  - `created` (String): Created value
  - `exported` (String): Exported value
  - `fees_collected` (String): Collected fees
  - `fees_imported` (String): Imported fees
  - `from_prev_blk` (String): Value from previous block
  - `imported` (String): Imported value
  - `minted` (String): Minted value
  - `to_next_blk` (String): Value to next block
- `in_msg_descr` (Array): Inbound message descriptors
- `out_msg_descr` (Array): Outbound message descriptors

**Example Query:**
```graphql
query GetLatestBlocks($limit: Int!) {
  blocks(
    orderBy: [{ path: "gen_utime", direction: DESC }]
    limit: $limit
  ) {
    id
    seq_no
    gen_utime_string
    tr_count
    workchain_id
    hash
  }
}
```

**Filtering:**
```graphql
# Get only key blocks
blocks(filter: { key_block: { eq: true } })

# Get blocks by specific workchain
blocks(filter: { workchain_id: { eq: 0 } })
```

---

### 3. Transactions

Blockchain transactions representing state changes.

**Fields:**
- `id` (String): Transaction identifier
- `account_addr` (String): Account address
- `now` (Int): Unix timestamp
- `now_string` (String): Formatted timestamp
- `lt` (String): Logical time
- `block_id` (String): Parent block ID
- `workchain_id` (Int): Workchain identifier
- `aborted` (Boolean): Whether transaction failed
- `balance_delta` (String): Balance change (use `format: DEC` for decimal)
- `total_fees` (String): Total fees paid
- `status_name` (String): Transaction status
- `orig_status_name` (String): Original status
- `end_status_name` (String): Final status
- `tr_type_name` (String): Transaction type
- `compute` (Object): Compute phase details
  - `success` (Boolean): Execution success
  - `exit_code` (Int): VM exit code
  - `gas_used` (String): Gas consumed
  - `gas_fees` (String): Gas fees paid
  - `gas_limit` (String): Gas limit
  - `vm_steps` (Int): VM execution steps
- `action` (Object): Action phase details
  - `success` (Boolean): Action success
  - `result_code` (Int): Result code
  - `tot_actions` (Int): Total actions
  - `msgs_created` (Int): Messages created
- `storage` (Object): Storage phase details
  - `storage_fees_collected` (String): Storage fees
  - `status_change_name` (String): Status change
- `in_message` (Object): Input message
- `out_messages` (Array): Output messages

**Example Query:**
```graphql
query GetLatestTransactions($limit: Int!) {
  transactions(
    orderBy: [{ path: "now", direction: DESC }]
    limit: $limit
  ) {
    id
    account_addr
    now_string
    balance_delta(format: DEC)
    total_fees(format: DEC)
    status_name
    compute {
      success
      exit_code
    }
  }
}
```

**Filtering:**
```graphql
# Get failed transactions
transactions(filter: { aborted: { eq: true } })

# Get transactions for specific account
transactions(filter: { account_addr: { eq: "0:..." } })
```

---

### 4. Messages

Messages passed between accounts or external systems.

**Fields:**
- `id` (String): Message identifier
- `src` (String): Source address
- `dst` (String): Destination address
- `value` (String): Value transferred (use `format: DEC` for decimal)
- `created_at` (Int): Creation timestamp
- `msg_type` (Int): Message type code
- `msg_type_name` (String): Message type name
- `status_name` (String): Message status
- `bounce` (Boolean): Bounce flag
- `bounced` (Boolean): Whether message bounced
- `body` (String): Message body/payload
- `body_hash` (String): Body hash
- `block_id` (String): Parent block
- `transaction_id` (String): Associated transaction
- `fwd_fee` (String): Forwarding fee
- `ihr_fee` (String): IHR fee
- `src_transaction` (Object): Source transaction
- `dst_transaction` (Object): Destination transaction

**Message Types:**
- `IntIn`: Internal inbound
- `IntOut`: Internal outbound
- `ExtIn`: External inbound
- `ExtOut`: External outbound

**Example Query:**
```graphql
query GetLatestMessages($limit: Int!) {
  messages(
    orderBy: [{ path: "created_at", direction: DESC }]
    limit: $limit
  ) {
    id
    src
    dst
    value(format: DEC)
    msg_type_name
    created_at
  }
}
```

---

### 5. Accounts

Blockchain accounts (addresses).

**Important Note:** Account queries use different structures:

**For single account lookup:**
```graphql
query GetAccount($address: String!) {
  account(address: $address) {
    info {
      id
      workchain_id
      balance
      boc
      last_paid
    }
  }
}
```

**For searching/listing accounts:**
```graphql
query GetAccounts($limit: Int!) {
  accounts(
    orderBy: [{ path: "last_paid", direction: DESC }]
    limit: $limit
  ) {
    id
    address
    balance(format: DEC)
    code_hash
    data_hash
    last_paid
    workchain_id
  }
}
```

**Fields (in `info` for single account):**
- `id` (String): Account address
- `workchain_id` (Int): Workchain ID
- `balance` (String): Account balance
- `boc` (String): Bag of cells (serialized state)
- `last_paid` (Int): Last payment timestamp

---

## Query Patterns

### Pagination

Use `limit` for simple pagination:
```graphql
blocks(limit: 20)
```

### Ordering

Use `orderBy` for sorting:
```graphql
blocks(
  orderBy: [{ path: "gen_utime", direction: DESC }]
)
```

### Filtering

Use `filter` for complex queries:
```graphql
transactions(
  filter: {
    aborted: { eq: true }
    workchain_id: { eq: 0 }
  }
)
```

**Filter Operators:**
- `eq`: Equal to
- `ne`: Not equal to
- `gt`: Greater than
- `lt`: Less than
- `in`: In array
- `nin`: Not in array

### Format Modifiers

For numeric fields, use `format: DEC` to get decimal strings:
```graphql
balance(format: DEC)
gas_fees(format: DEC)
```

---

## Search Implementation

The application implements universal search across all resource types:

### Universal Search Query
```graphql
query SearchById($id: String!) {
  transactions(filter: { id: { eq: $id } }, limit: 1) { id }
  blocks(filter: { id: { eq: $id } }, limit: 1) { id }
  messages(filter: { id: { eq: $id } }, limit: 1) {
    id
    dst_transaction { id }
    src_transaction { id }
  }
}
```

### Account Search
For account addresses (starting with `0:` or `-1:`):
```graphql
query GetAccount($address: String!) {
  account(address: $address) {
    info {
      id
      boc
    }
  }
}
```

---

## Error Handling

The API returns errors in the standard GraphQL format:
```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [...],
      "path": [...]
    }
  ]
}
```

Always check for `errors` in the response before accessing `data`.

---

## Best Practices

1. **Use appropriate limits**: Don't fetch more data than needed
2. **Specify required fields only**: Reduces response size and processing time
3. **Use format modifiers**: Apply `format: DEC` for decimal values
4. **Handle pagination**: Implement proper pagination for large datasets
5. **Cache results**: Cache frequently accessed data
6. **Check for errors**: Always validate response before using data

---

## Common Queries

### Get Recent Activity
```graphql
query GetRecentActivity {
  blocks(orderBy: [{ path: "gen_utime", direction: DESC }], limit: 5) {
    id
    seq_no
    tr_count
  }
  transactions(orderBy: [{ path: "now", direction: DESC }], limit: 10) {
    id
    account_addr
    balance_delta(format: DEC)
  }
}
```

### Get Account Details with Transactions
```graphql
query GetAccountWithTransactions($address: String!) {
  account(address: $address) {
    info {
      id
      balance
      workchain_id
      last_paid
    }
  }
  transactions(
    filter: { account_addr: { eq: $address } }
    orderBy: [{ path: "now", direction: DESC }]
    limit: 20
  ) {
    id
    now
    balance_delta(format: DEC)
    status_name
  }
}
```

### Get Network Statistics
```graphql
query GetNetworkStats {
  info {
    lastBlockTime
    blocksLatency
    transactionsLatency
  }
  blocks(orderBy: [{ path: "gen_utime", direction: DESC }], limit: 10) {
    gen_utime
    tr_count
  }
}
```

---

## Implementation Notes

### Content-Type Header

**Important:** The API requires `Content-Type: text/plain`, not `application/json`:

```typescript
fetch('https://mainnet.ackinacki.org/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ query, variables })
})
```

### Response Format

Responses are always JSON, regardless of content-type:
```json
{
  "data": {
    "blocks": [...],
    "transactions": [...]
  }
}
```

---

## Additional Resources

- **Live Examples**: See `schema.http` file in project root for REST client examples
- **API Endpoint**: https://mainnet.ackinacki.org/graphql
- **Network**: Acki Nacki Mainnet

---

## Version History

- **v1.0.0** (2025-10-18): Initial documentation
  - Basic schema documentation
  - Query patterns and examples
  - Search implementation guide
