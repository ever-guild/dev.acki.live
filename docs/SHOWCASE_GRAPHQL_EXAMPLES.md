# Showcase Page - Useful GraphQL Examples

## 📊 Current Showcase Features

The showcase page currently displays:
1. **Network Health** - Calculated from block and transaction data
2. **Recent Activity Feed** - Mixed blocks and transactions
3. **Top Active Accounts** - Sorted by activity
4. **Block Production Rate** - Last 12 hours chart
5. **Message Type Distribution** - Message types breakdown

## 🚀 Additional Useful Examples from schema.json

### 1. **Network Economics - Value Flow**

Shows total value moved in the network:

```graphql
query GetBlockValueFlow {
  blockchain {
    blocks(last: 100) {
      edges {
        node {
          id
          value_flow {
            created
            exported
            fees_collected
            from_prev_block
            imported
            minted
          }
        }
      }
    }
  }
}
```

**Use Case**: Add a "Network Economics" card showing:
- Total fees collected
- Total value minted
- Total value moved

---

### 2. **Transaction Success Rate**

Filter transactions by status:

```graphql
query GetTransactionStats {
  successfulTxs: blockchain {
    transactions(filter: { aborted: { eq: false } }, last: 100) {
      edges {
        node {
          id
        }
      }
    }
  }
  failedTxs: blockchain {
    transactions(filter: { aborted: { eq: true } }, last: 100) {
      edges {
        node {
          id
        }
      }
    }
  }
}
```

**Use Case**: Add "Transaction Success Rate" percentage:
- Success rate: (successful / total) * 100
- Visual: Progress bar or pie chart

---

### 3. **Key Blocks vs Regular Blocks**

Key blocks are special blocks in the blockchain:

```graphql
query GetKeyBlocks {
  blockchain {
    key_blocks(last: 20) {
      id
      gen_utime
      after_split
      before_split
    }
  }
}
```

**Use Case**: Add "Key Blocks" section showing:
- Recent key blocks
- Time since last key block
- Key blocks per day

---

### 4. **High-Value Transactions**

Transactions moving significant amounts:

```graphql
query GetHighValueTransactions {
  blockchain {
    transactions(
      filter: { balance_delta: { ge: "1000000000" } }
      orderBy: [{ path: "balance_delta", direction: DESC }]
      last: 10
    ) {
      edges {
        node {
          id
          balance_delta(format: DEC)
          now
          account_addr
        }
      }
    }
  }
}
```

**Use Case**: Add "Whale Watching" or "Large Transfers" section:
- Top 10 highest value transactions
- Account addresses involved
- Time of transfer

---

### 5. **Account Activity Heatmap**

Track account activity over time:

```graphql
query GetAccountActivity($address: String!) {
  blockchain {
    account(address: $address) {
      info {
        balance(format: DEC)
        acc_type_name
      }
      transactions(last: 50) {
        edges {
          cursor
          node {
            id
            now
            balance_delta(format: DEC)
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
```

**Use Case**: Add "Account Spotlight" feature:
- Show detailed activity for top accounts
- Transaction history timeline
- Balance changes over time

---

### 6. **Message Type Analytics**

Detailed message type breakdown:

```graphql
query GetMessageTypeBreakdown {
  intMsgIn: blockchain {
    messages(filter: { msg_type: { eq: IntIn } }, last: 100) {
      edges { node { id value(format: DEC) } }
    }
  }
  intMsgOut: blockchain {
    messages(filter: { msg_type: { eq: IntOut } }, last: 100) {
      edges { node { id value(format: DEC) } }
    }
  }
  extMsgIn: blockchain {
    messages(filter: { msg_type: { eq: ExtIn } }, last: 100) {
      edges { node { id value(format: DEC) } }
    }
  }
  extMsgOut: blockchain {
    messages(filter: { msg_type: { eq: ExtOut } }, last: 100) {
      edges { node { id value(format: DEC) } }
    }
  }
}
```

**Use Case**: Enhanced "Message Distribution" with:
- Count per message type
- Total value transferred per type
- Visual: Stacked bar chart or pie chart

---

### 7. **Block Production Rate by Hour**

More accurate block production tracking:

```graphql
query GetRecentBlocks {
  blockchain {
    blocks(last: 144) {  # ~24 hours at 10min blocks
      edges {
        node {
          id
          gen_utime
          gen_utime_string
          workchain_id
        }
      }
    }
  }
}
```

**Use Case**: Improve "Block Production Rate" chart:
- Group by hour using `gen_utime`
- Show 24-hour rolling average
- Detect production anomalies

---

### 8. **Compute Phase Statistics**

Smart contract execution stats:

```graphql
query GetComputeStats {
  blockchain {
    transactions(last: 100) {
      edges {
        node {
          id
          compute {
            success
            gas_used
            gas_limit
            gas_credit
            exit_code
          }
        }
      }
    }
  }
}
```

**Use Case**: Add "Smart Contract Activity" section:
- Successful vs failed executions
- Average gas used
- Most common exit codes

---

### 9. **Network Growth Metrics**

Track new accounts and activity:

```graphql
query GetActiveAccounts {
  blockchain {
    accounts(
      filter: { 
        acc_type_name: { eq: Active }
        last_paid: { gt: 0 }
      }
      last: 50
    ) {
      edges {
        node {
          id
          balance(format: DEC)
          last_paid
        }
      }
    }
  }
}
```

**Use Case**: Add "Network Growth" indicators:
- Active accounts count
- New accounts per day
- Account balance distribution

---

### 10. **Fee Analytics**

Analyze network fees:

```graphql
query GetFeeStats {
  blockchain {
    transactions(last: 100) {
      edges {
        node {
          id
          total_fees(format: DEC)
          now
        }
      }
    }
  }
}
```

**Use Case**: Add "Fee Statistics" section:
- Average fee per transaction
- Total fees collected (per hour/day)
- Fee trends over time

---

## 🎨 Suggested Showcase Layout

### Section 1: Network Overview (Top)
```
┌─────────────────────────────────────────────────────┐
│ Network Health: 98% │ Success Rate: 95.2% │ Uptime  │
└─────────────────────────────────────────────────────┘
```

### Section 2: Activity & Economics (Grid)
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────┐
│ Recent Activity  │ │ Value Flow       │ │ Top Accts│
│ • Block #123     │ │ Fees: 1,234 AN   │ │ 1. 0x... │
│ • Tx Success     │ │ Minted: 567 AN   │ │ 2. 0x... │
└──────────────────┘ └──────────────────┘ └──────────┘
```

### Section 3: Charts (Wide)
```
┌─────────────────────────────────────────────────────┐
│ Block Production Rate (24h)                         │
│ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█                              │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Message Type Distribution                           │
│ IntIn   ████████████████ 45%                        │
│ IntOut  ████████████ 30%                            │
│ ExtIn   ████████ 20%                                │
│ ExtOut  ██ 5%                                       │
└─────────────────────────────────────────────────────┘
```

### Section 4: Advanced Analytics (Optional)
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────┐
│ Smart Contracts  │ │ High Value Txs   │ │ Key Block│
│ Success: 98%     │ │ > 1000 AN        │ │ Last: 2m │
│ Gas Used: Avg    │ │ Total: 10        │ │ Next: ~8m│
└──────────────────┘ └──────────────────┘ └──────────┘
```

## 💡 Implementation Tips

### 1. **Parallel Data Loading**
```typescript
const [blocks, transactions, messages, accounts] = await Promise.all([
  getBlocks(),
  getTransactions(), 
  getMessages(),
  getAccounts()
]);
```

### 2. **Caching Strategy**
```typescript
// Cache for 30 seconds to reduce API calls
const CACHE_TTL = 30000;
let cachedData = null;
let cacheTime = 0;

async function loadData() {
  if (Date.now() - cacheTime < CACHE_TTL) {
    return cachedData;
  }
  cachedData = await fetchFromAPI();
  cacheTime = Date.now();
  return cachedData;
}
```

### 3. **Progressive Loading**
```typescript
// Load essential data first
const essentialData = await loadEssentials();
showEssentials(essentialData);

// Then load enhanced features
const enhancedData = await loadEnhanced();
showEnhanced(enhancedData);
```

### 4. **Real-time Updates** (Optional)
```typescript
// Auto-refresh every minute
setInterval(async () => {
  await loadShowcaseData();
}, 60000);
```

## 🎯 Priority Examples for Showcase

### High Priority (Implement First):
1. ✅ Network Health (already implemented)
2. ✅ Recent Activity (already implemented)
3. ✅ Top Active Accounts (already implemented)
4. ✅ Block Production Rate (already implemented)
5. ✅ Message Type Distribution (already implemented)

### Medium Priority (Next):
6. 🔲 Transaction Success Rate
7. 🔲 Network Economics (Value Flow)
8. 🔲 High-Value Transactions

### Low Priority (Future):
9. 🔲 Key Blocks Tracking
10. 🔲 Compute Phase Statistics
11. 🔲 Fee Analytics
12. 🔲 Account Activity Heatmap

## 📝 Testing Queries

All these queries can be tested using the `schema.http` file:
1. Open `schema.http` in VS Code
2. Install REST Client extension
3. Click "Send Request" above each query
4. View results in split panel
5. Copy successful queries to your code

## 🚀 Next Steps

1. Choose which additional metrics to implement
2. Test queries in `schema.http` first
3. Add loading states for new sections
4. Implement error handling
5. Add visual charts/graphs
6. Test with real API data

---

**Remember**: All queries are documented in `schema.http` with working examples! 🎉
