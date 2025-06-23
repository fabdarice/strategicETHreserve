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

---

## Add Manual Wallet

This script allows you to add a manual wallet entry to a company with a custom address format and disabled auto-scanning. **This script can only be run locally** for security reasons.

### Usage

```bash
# Run the script with company name and balance
npm run add-manual-wallet "Company Name" <balance>

# Or run directly with tsx
tsx scripts/add-manual-wallet.ts "Company Name" <balance>
```

### Examples

```bash
# Add a manual wallet with 1000.5 ETH to MicroStrategy
npm run add-manual-wallet "MicroStrategy" 1000.5

# Add a manual wallet with 500 ETH to Tesla
npm run add-manual-wallet "Tesla" 500

# Partial company name matching works
npm run add-manual-wallet "Micro" 250.75
```

### What it does

1. **Finds the company** by name (case-insensitive, partial matching)
2. **Generates a unique manual address** in format `0xmanual1`, `0xmanual2`, etc.
3. **Creates a new CompanyWallet entry** with:
   - The generated manual address
   - The specified balance
   - `autoScan = false`
4. **Updates the company's total reserve** by adding the new balance
5. **Displays confirmation** with all the details

### Address Format

Manual wallets are created with addresses in the format:

- `0xmanual1` - First manual wallet for the company
- `0xmanual2` - Second manual wallet for the company
- `0xmanual3` - And so on...

The script automatically finds the next available number based on existing manual wallets.

### Output Format

```
🔍 Looking up company: MicroStrategy
✅ Found company: MicroStrategy Inc.
📊 Current wallets: 2
🔧 Creating manual wallet: 0xmanual3
💰 Balance: 1000.5 ETH
🔄 Auto Scan: false

✅ Manual wallet created successfully!
📋 Wallet ID: clx1234567890abcdef
🏢 Company: MicroStrategy Inc.
📍 Address: 0xmanual3
💰 Balance: 1000.5 ETH
🔄 Auto Scan: false
📅 Created: 2024-01-15T10:30:45.123Z

📊 Updated company total reserve: 331201.0 ETH
📈 Previous total: 330200.5 ETH
➕ Added: 1000.5 ETH
```

### Security Features

- **Local-only execution**: Script checks environment variables and refuses to run in production
- **Input validation**: Validates company name exists and balance is a valid number
- **Error handling**: Graceful error handling with descriptive messages
- **Database transaction**: Atomic operations to maintain data consistency

### Use Cases

- Adding off-chain ETH holdings that can't be auto-scanned
- Manual adjustments for complex treasury structures
- Temporary entries for pending transactions
- Testing and development purposes
