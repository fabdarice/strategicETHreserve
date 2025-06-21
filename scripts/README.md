# Scripts

## Company Balance Checker

This script allows you to check the live ETH balances for all wallet addresses associated with a company in the database.

### Usage

```bash
# Install dependencies first (if not already done)
npm install

# Run the script with a company name
npm run check-balances "Company Name"

# Or run directly with tsx
tsx scripts/check-company-balances.ts "Company Name"
```

### Examples

```bash
# Check MicroStrategy's balances
npm run check-balances "MicroStrategy"

# Check Tesla's balances
npm run check-balances "Tesla"

# Partial name matching works too
npm run check-balances "Micro"
```

### What it does

1. **Finds the company** by name (case-insensitive, partial matching)
2. **Fetches all wallet addresses** associated with the company
3. **Calls getCompleteETHBalance** for each wallet address
4. **Displays detailed information** including:
   - Company information (name, category, current reserve)
   - Individual wallet balances (direct holdings + pool positions)
   - Pool details if any liquidity positions are found
   - Company totals and comparison with database values

### Output Format

```
🔍 Looking up company: MicroStrategy

📊 Company: MicroStrategy Inc.
📝 Category: Corporate Treasury
💰 Current Reserve: 331200.5 ETH
🔗 Wallets: 3

================================================================================

📍 Wallet 1/3: 0x1234...5678
   Auto Scan: ✅
   DB Balance: 150000.0 ETH
   🔄 Fetching live balance...
   💎 Total Balance: 150025.123456789 ETH
   💰 Direct Holdings: 150000.0 ETH
   🏊 Pool Positions: 25.123456789 ETH
   📋 Pool Details:
      1. Ethereum - UniswapV2
         Pool: 0xabcd...efgh
         ETH Amount: 25.123456789 ETH
         Tokens: 0xA0b8...c3D4 / 0xC02a...aA39

================================================================================
📈 COMPANY TOTALS:
💎 Total Balance: 331250.987654321 ETH
💰 Total Direct: 331200.5 ETH
🏊 Total Pools: 50.487654321 ETH
📊 DB vs Live: 331200.5 ETH vs 331250.987654321 ETH
📊 Difference: +50.487654321 ETH
```

### Features

- **Multi-network support**: Checks balances across all supported networks
- **Pool detection**: Identifies ETH in liquidity pools across multiple DEXs
- **Detailed reporting**: Shows both individual wallet and company totals
- **Error handling**: Gracefully handles API errors and missing data
- **Progress indicators**: Shows progress when processing multiple wallets
- **Comparison**: Compares live balances with database values

### Requirements

- Node.js with TypeScript support
- Database connection configured
- Environment variables for Alchemy API keys
- CoinMarketCap API key (for ETH price data)
