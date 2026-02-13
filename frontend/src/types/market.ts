// ─── Core Types for BeliefMarket ────────────────────────────────────

export enum MarketStatus {
  OPEN = 0,
  RESOLVING = 1,
  SETTLED = 2,
  CANCELLED = 3,
}

export enum PositionStatus {
  ACTIVE = 0,
  SETTLED = 1,
  CANCELLED = 2,
  REFUNDED = 3,
}

export interface Market {
  id: number;
  creator: string;
  dataSourceId: number;
  targetPrice: bigint;
  conditionAbove: boolean;
  assetType: number;
  resolutionTime: bigint;
  totalDeposits: bigint;
  totalPositions: bigint;
  status: MarketStatus;
  outcome: boolean;
  yesPool: bigint;
  noPool: bigint;
}

export interface Position {
  id: number;
  trader: string;
  agentId: number;       // 0 = direct user position, >0 = agent position
  marketId: number;
  deposit: bigint;
  encryptedDirection: string;
  direction: boolean;
  status: PositionStatus;
  payout: bigint;
}

// ─── On-Chain Agent Config (matches contract struct) ────────────────

export interface OnChainAgent {
  owner: string;
  delegate: string;
  name: string;
  systemPrompt: string;
  personality: number;       // 0=conservative, 1=balanced, 2=aggressive, 3=contrarian
  balance: bigint;           // USDC vault balance
  maxBetPerMarket: bigint;
  maxTotalExposure: bigint;
  currentExposure: bigint;
  allowedAssetTypes: number;
  confidenceThreshold: number; // 0-100
  autoExecute: boolean;
  isActive: boolean;
}

// ─── Agent Personality ─────────────────────────────────────────────

export type AgentPersonality = "conservative" | "balanced" | "aggressive" | "contrarian";

export const PERSONALITY_INDEX: Record<AgentPersonality, number> = {
  conservative: 0,
  balanced: 1,
  aggressive: 2,
  contrarian: 3,
};

export const PERSONALITY_FROM_INDEX: Record<number, AgentPersonality> = {
  0: "conservative",
  1: "balanced",
  2: "aggressive",
  3: "contrarian",
};

export const PERSONALITY_META: Record<
  AgentPersonality,
  { label: string; description: string; emoji: string; color: string }
> = {
  conservative: {
    label: "Conservative",
    description: "Low risk, high confidence threshold. Only bets on strong signals.",
    emoji: "C",
    color: "#7c5cfc",
  },
  balanced: {
    label: "Balanced",
    description: "Moderate risk. Evaluates both momentum and distance to target.",
    emoji: "B",
    color: "#00e5ff",
  },
  aggressive: {
    label: "Aggressive",
    description: "High risk tolerance. Takes positions on weaker signals with larger stakes.",
    emoji: "A",
    color: "#ff5252",
  },
  contrarian: {
    label: "Contrarian",
    description: "Bets against the crowd. Looks for overreactions and mean reversion.",
    emoji: "X",
    color: "#00e676",
  },
};

// ─── Agent Sphere Colors ────────────────────────────────────────────

export const AGENT_COLORS = [
  "#7c5cfc", // purple
  "#00e5ff", // cyan
  "#ff5252", // red
  "#00e676", // green
  "#ff9100", // orange
  "#e040fb", // pink
  "#ffea00", // yellow
  "#18ffff", // teal
] as const;

// ─── Frontend Agent Profile (combines on-chain + local state) ──────

export interface AgentProfile {
  onChainId: number;         // Contract agent ID
  owner: string;
  delegate: string;
  name: string;
  systemPrompt: string;
  personality: AgentPersonality;
  color: string;             // Sphere glow color (local)
  balance: bigint;           // On-chain vault balance
  maxBetPerMarket: bigint;
  maxTotalExposure: bigint;
  currentExposure: bigint;
  allowedAssetTypes: number;
  confidenceThreshold: number;
  autoExecute: boolean;
  isActive: boolean;
  // Local-only
  stats: AgentStats;
  auditTrail: AuditEntry[];
}

export interface AgentStats {
  totalScans: number;
  totalRecommendations: number;
  totalExecuted: number;
  totalApproved: number;
  totalRejected: number;
  avgConfidence: number;
  winRate: number;
  totalStaked: number;
  totalPnL: number;
}

export const DEFAULT_AGENT_STATS: AgentStats = {
  totalScans: 0,
  totalRecommendations: 0,
  totalExecuted: 0,
  totalApproved: 0,
  totalRejected: 0,
  avgConfidence: 0,
  winRate: 0,
  totalStaked: 0,
  totalPnL: 0,
};

// ─── Audit Trail ──────────────────────────────────────────────────

export type AuditAction =
  | "created"
  | "funded"
  | "withdrawn"
  | "started"
  | "stopped"
  | "scan"
  | "recommendation"
  | "approved"
  | "rejected"
  | "executed"
  | "config_updated"
  | "error";

export interface AuditEntry {
  id: string;
  agentId: number;
  timestamp: number;
  action: AuditAction;
  summary: string;
  details?: string;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Agent Recommendation ──────────────────────────────────────────

export type RecommendationStatus = "pending" | "approved" | "rejected" | "executed" | "expired";

export interface AgentRecommendation {
  id: string;
  agentId: number;         // On-chain agent ID
  marketId: number;
  direction: boolean;
  confidence: number;
  suggestedStake: bigint;
  reasoning: string;
  currentPrice: number;
  targetPrice: number;
  timestamp: number;
  status: RecommendationStatus;
  signals: SignalBreakdown;
  txHash?: string;         // Set after auto-execution
}

export interface SignalBreakdown {
  priceDistance: number;
  momentum: number;
  timeUrgency: number;
  poolImbalance: number;
}

// ─── Asset Types ───────────────────────────────────────────────────

export const ASSET_COMMODITY = 1;
export const ASSET_ETF = 2;
export const ASSET_FX = 4;

export const ASSET_TYPE_LABELS: Record<number, string> = {
  [ASSET_COMMODITY]: "Commodity",
  [ASSET_ETF]: "ETF",
  [ASSET_FX]: "FX",
};

export const STATUS_LABELS: Record<MarketStatus, string> = {
  [MarketStatus.OPEN]: "Open",
  [MarketStatus.RESOLVING]: "Resolving",
  [MarketStatus.SETTLED]: "Settled",
  [MarketStatus.CANCELLED]: "Cancelled",
};
