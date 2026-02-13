# BeliefMarket

Private, conditional prediction markets using BITE v2 on SKALE.

BeliefMarket keeps market beliefs private until a condition is met. Users and agents submit encrypted positions. The chain cannot see which side is winning. When the market resolves, BITE v2 conditional threshold execution decrypts positions and settles payouts atomically.

## Links and deployed contracts

| Item | Value |
|------|-------|
| Live demo | `https://beliefmarket.vercel.app` |
| Demo video (YouTube) | `https://youtu.be/PLACEHOLDER` |
| GitHub | `https://github.com/preyanshu/market` |
| Network | SKALE BITE V2 Sandbox (Chain ID `103698795`) |
| BeliefMarket | `0x15A4e6Be6840a0D54FB6a4A6F97E84F5D2a1453e` |
| USDC (6 decimals) | `0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8` |

Explorer links:
- BeliefMarket: `https://bite-v2-sandbox.explorer.skale.network/address/0x15A4e6Be6840a0D54FB6a4A6F97E84F5D2a1453e`
- USDC: `https://bite-v2-sandbox.explorer.skale.network/address/0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8`

## Hackathon submission checklist

Required items and where they are shown:
- Demo video showing encrypted intent, condition trigger, decryption, execution, receipt: see Demo video link above
- Evidence of BITE v2 usage (logs, trace, screenshots) plus short explanation: see sections below and UI receipts
- Clear description of:
  - what stays encrypted: "What is private vs public"
  - what condition unlocks execution: "Conditional trigger"
  - how failure is handled: "Failure handling"
  - receipt output showing what executed and why: "Receipts and audit output"

## Features (to the point)

### Private prediction markets
- Markets are tied to real world oracle data (commodities, ETFs, FX rates)
- Live charts use DIA price feeds (22 trusted sources)
- Positions are submitted with BITE v2 encryption for direction (YES or NO)
- Settlement is parimutuel (winners split the losing pool)
- Resolution outcome is derived from oracle price vs target, with an override in UI

### Agents (AI native, guardrailed)
- Multiple agents per user
- Each agent has a custom system prompt stored on chain
- Agents have persistent memory of past actions and user rejections
- Agents read real world data (DIA oracle prices) to make informed decisions
- Two modes:
  - Auto execute: delegate wallet signs and submits from the agent vault
  - Manual: user approves and signs from their wallet
- LLM decisions via Groq (Llama 3.3 70B), with a rule based fallback
- Background scanning across pages, with in app notifications for approvals

### Self custodial agent wallets
- Delegate keypairs are generated on the client and kept in the user's browser
- Private keys never touch our server
- Local agent data is encrypted at rest (AES 256 GCM via Web Crypto)
- Delegate address is registered on chain
- Agent creation forwards 0.01 sFUEL for delegate gas in the same transaction

## Why private plus conditional

Public markets leak belief and intent. That causes copy trading, front running, and agent alpha leakage. BeliefMarket fixes this by keeping the only sensitive part private: the direction of each position.

The workflow is conditional:
- Before resolution: direction stays encrypted and no one can infer which side is winning
- At resolution: a condition is met and the system decrypts and settles
- After settlement: everything is auditable

## What is private vs public

Private during the market:
- YES or NO direction per position (stored as `encryptedDirection` ciphertext)
- Side split of the pool (only total deposits are visible)
- Any implied odds (there is no pricing logic)

Always public:
- Market metadata (question, oracle source, target, condition, resolution time)
- Total deposits
- Position count
- Stake amount per position (how much, not which side)

## Conditional trigger (what unlocks execution)

Condition:
- `block.timestamp >= resolutionTime`
- plus the resolver submitting the oracle outcome via `resolveMarket(marketId, oracleOutcome)`

What happens:
1. Contract moves market into RESOLVING
2. Contract submits encrypted payloads to BITE v2 CTX
3. BITE v2 threshold network decrypts directions
4. `biteCallback()` receives decrypted directions and computes parimutuel payouts
5. USDC payouts are distributed atomically and the market becomes SETTLED

## Encrypted to decrypt to receipt (end to end)

1. Encrypted intent:
   - User or agent encrypts direction using the BITE v2 TypeScript SDK
   - On chain only ciphertext is stored, direction field stays false until callback
2. Condition check:
   - Resolution time reached
   - Oracle outcome submitted
3. Conditional decryption:
   - BITE v2 CTX decrypts all encrypted directions
4. Execution:
   - `biteCallback()` settles and transfers USDC
5. Receipt:
   - UI and logs show market id, symbol, direction, stake, confidence, and tx hash
   - On chain shows decrypted directions and payouts

## Guardrails (on chain enforcement)

Guardrails are enforced by the smart contract. Frontend checks exist, but the contract is the final gate.

On chain enforced:
- Max bet per market
- Max total exposure
- Vault balance (auto execute spends only from the agent vault)
- Delegate authorization (only owner or delegate can act for an agent)

Frontend enforced:
- Confidence threshold (LLM plus engine)
- Allowed asset types (engine filters)
- Human approval in manual mode
- Skip if agent already has an open position in a market

## Failure handling

Market level:
- No positions: resolves with no payouts
- All positions on one side: everyone is refunded
- CTX failure: market stays in RESOLVING and can be retried

Agent level:
- Auto execute fails: error recorded in audit and agent pauses
- LLM call fails: rule based fallback selects an action
- Vault empty (auto mode): agent stops and prompts user to fund
- Vault empty (manual mode): agent continues scanning since user signs
- Guardrail violation: transaction reverts on chain and is logged

## Receipts and audit output

Receipt output exists in UI and structured logs:
- Per scan cycle: which markets were checked and why one was picked
- Per action: timestamp, market, direction, stake, confidence, mode, source, tx hash (if executed)
- Full LLM reasoning text is stored with the action for audit
- Market resolution receipt: oracle outcome, decrypted directions, pool totals, payouts

Example structured log:

```
Scan: mode=manual personality=balanced
Market #3 WTI/USD price=73.14 target=100.00 condition=above dist=-26.9 conf=73
Decision: buy_no stake=10 reason=...
Result: recommended txHash=null
```

## Smart contract interface (high signal)

Core functions:
- `createMarket()`
- `submitPosition()`
- `submitPositionForAgent()`
- `resolveMarket()` (starts CTX)
- `biteCallback()` (decrypts and settles)
- `createAgent()` (stores system prompt and guardrails, registers delegate, forwards sFUEL)
- `fundAgent()`, `withdrawFromAgent()`
- `updateAgent()`

On chain agent config includes:
- `systemPrompt`
- `personality`
- `maxBetPerMarket`, `maxTotalExposure`, `currentExposure`
- `balance`
- `delegate`, `owner`
- `confidenceThreshold`
- `allowedAssetTypes`
- `autoExecute`

## Data sources (DIA)

22 sources across:
- Commodities: NG, WTI, XBR
- FX: CAD, AUD, CNY
- ETFs: SPY, VOO, QQQ, VTI, IBIT, FBTC, ARKB, HODL, GBTC, BITO, ETHA, BETH, TLT, SHY, VGSH, GOVT

## Setup

Contracts:
```bash
cd contracts
npm install
PRIVATE_KEY=... npx hardhat run scripts/deploy.ts --network biteV2Sandbox
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Tech stack

- Smart contracts: Solidity, Hardhat, OpenZeppelin, BITE v2 Solidity SDK
- Frontend: Next.js, React, TypeScript, Tailwind
- Wallet: Privy, wagmi, viem
- Oracles: DIA
- LLM: Groq (OpenAI compatible)

## License

MIT
