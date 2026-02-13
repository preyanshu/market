"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useReadContract } from "wagmi";
import { formatUnits, createPublicClient, http } from "viem";
import {
  BELIEF_MARKET_ADDRESS,
  USDC_DECIMALS,
} from "@/config/contracts";
import { BELIEF_MARKET_ABI } from "@/config/beliefMarketAbi";
import { skaleBiteV2Sandbox } from "@/config/chains";
import { DATA_SOURCES, getDataSourceById } from "@/config/dataSources";
import { fetchAllPrices, PriceResult } from "@/utils/priceOracle";
import { autoExecutePosition } from "@/utils/agentWallet";
import { encryptDirection } from "@/utils/encryption";
import {
  AgentProfile,
  AgentRecommendation,
  AgentStats,
  AuditEntry,
  AuditAction,
  AgentPersonality,
  PERSONALITY_FROM_INDEX,
  SignalBreakdown,
  RecommendationStatus,
  DEFAULT_AGENT_STATS,
  AGENT_COLORS,
} from "@/types/market";

// Public client for direct contract reads inside async scan functions
const publicClient = createPublicClient({
  chain: skaleBiteV2Sandbox,
  transport: http(),
});

// ─── Log Types ───────────────────────────────────────────────────────

export interface AgentLog {
  timestamp: number;
  agentId: number;
  agentName: string;
  message: string;
  type: "info" | "scan" | "recommendation" | "execution" | "error" | "warning";
}

// ─── Personality multipliers ─────────────────────────────────────────

const PERSONALITY_PARAMS: Record<
  AgentPersonality,
  {
    confidenceBoost: number;
    stakeMultiplier: number;
    momentumWeight: number;
    distanceWeight: number;
    contrarianFlip: boolean;
  }
> = {
  conservative: {
    confidenceBoost: -15,
    stakeMultiplier: 0.25,
    momentumWeight: 0.6,
    distanceWeight: 0.4,
    contrarianFlip: false,
  },
  balanced: {
    confidenceBoost: 0,
    stakeMultiplier: 0.5,
    momentumWeight: 0.5,
    distanceWeight: 0.5,
    contrarianFlip: false,
  },
  aggressive: {
    confidenceBoost: 15,
    stakeMultiplier: 0.8,
    momentumWeight: 0.3,
    distanceWeight: 0.7,
    contrarianFlip: false,
  },
  contrarian: {
    confidenceBoost: 5,
    stakeMultiplier: 0.4,
    momentumWeight: 0.7,
    distanceWeight: 0.3,
    contrarianFlip: true,
  },
};

// ─── Storage (encrypted IndexedDB) ───────────────────────────────────

import { getItem, setItem } from "@/utils/encryptedStore";

const AGENT_LOCAL_DATA_KEY = "beliefmarket_agent_local_data";
const AUDIT_KEY = "beliefmarket_audit_trail";

interface AgentLocalData {
  stats: AgentStats;
  color: string;
}

async function loadAgentLocalData(): Promise<Map<number, AgentLocalData>> {
  if (typeof window === "undefined") return new Map();
  try {
    const entries = await getItem<Array<[number, AgentLocalData]>>(AGENT_LOCAL_DATA_KEY);
    if (entries) {
      return new Map(entries.map(([id, data]) => [
        id,
        {
          stats: { ...DEFAULT_AGENT_STATS, ...data.stats },
          color: data.color || AGENT_COLORS[id % AGENT_COLORS.length],
        },
      ]));
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

function saveAgentLocalData(data: Map<number, AgentLocalData>) {
  if (typeof window === "undefined") return;
  const entries = Array.from(data.entries());
  // Fire-and-forget async persist — in-memory state is source of truth
  setItem(AGENT_LOCAL_DATA_KEY, entries).catch((err) =>
    console.error("[AgentEngine] Failed to persist agent local data:", err)
  );
}

async function loadAuditTrail(): Promise<AuditEntry[]> {
  if (typeof window === "undefined") return [];
  try {
    const data = await getItem<AuditEntry[]>(AUDIT_KEY);
    if (data) return data;
  } catch {
    /* ignore */
  }
  return [];
}

function saveAuditTrail(trail: AuditEntry[]) {
  if (typeof window === "undefined") return;
  // Fire-and-forget async persist
  setItem(AUDIT_KEY, trail.slice(0, 500)).catch((err) =>
    console.error("[AgentEngine] Failed to persist audit trail:", err)
  );
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useMultiAgent(address: string | undefined) {
  const [agentIds, setAgentIds] = useState<number[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<number>>(new Set());
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [globalAudit, setGlobalAudit] = useState<AuditEntry[]>([]);
  const [prices, setPrices] = useState<PriceResult[]>([]);
  const [agentLocalData, setAgentLocalData] = useState<Map<number, AgentLocalData>>(
    new Map()
  );

  const intervalsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const priceHistoryRef = useRef<Record<number, number[]>>({});
  const agentProfilesRef = useRef<Map<number, AgentProfile>>(new Map());
  const recommendationsRef = useRef<AgentRecommendation[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    recommendationsRef.current = recommendations;
  }, [recommendations]);

  // Read agent IDs from contract
  const { data: ownerAgentIds, refetch: refetchAgentIds, isError, error } = useReadContract({
    address: BELIEF_MARKET_ADDRESS,
    abi: BELIEF_MARKET_ABI,
    functionName: "getOwnerAgentIds",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Debug logging
  useEffect(() => {
    if (address) {
      console.log("[Agent Engine] Querying agents for address:", address);
      console.log("[Agent Engine] Contract address:", BELIEF_MARKET_ADDRESS);
      if (isError) {
        console.error("[Agent Engine] Query error:", error);
      }
    }
  }, [address, isError, error]);

  // Update agent IDs when contract data changes
  useEffect(() => {
    if (ownerAgentIds && Array.isArray(ownerAgentIds)) {
      const ids = ownerAgentIds.map((id) => Number(id));
      console.log("[Agent Engine] Loaded agent IDs from chain:", ids);
      setAgentIds(ids);
    } else {
      console.log("[Agent Engine] No agent IDs found or invalid data:", ownerAgentIds);
      setAgentIds([]);
    }
  }, [ownerAgentIds]);

  // Load from encrypted IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [localData, audit] = await Promise.all([
        loadAgentLocalData(),
        loadAuditTrail(),
      ]);
      if (!cancelled) {
        setAgentLocalData(localData);
        setGlobalAudit(audit);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Audit logger ──────────────────────────────────────────────

  const addAudit = useCallback(
    (
      agentId: number,
      action: AuditAction,
      summary: string,
      details?: string,
      metadata?: Record<string, string | number | boolean>
    ) => {
      const entry: AuditEntry = {
        id: makeId(),
        agentId,
        timestamp: Date.now(),
        action,
        summary,
        details,
        metadata,
      };
      setGlobalAudit((prev) => {
        const newAudit = [entry, ...prev].slice(0, 500);
        saveAuditTrail(newAudit);
        return newAudit;
      });
    },
    []
  );

  // ─── Activity log ──────────────────────────────────────────────

  const addLog = useCallback(
    (
      agentId: number,
      agentName: string,
      message: string,
      type: AgentLog["type"] = "info"
    ) => {
      setLogs((prev) => [
        {
          timestamp: Date.now(),
          agentId,
          agentName,
          message,
          type,
        },
        ...prev.slice(0, 199),
      ]);
    },
    []
  );

  // ─── Signal Analysis ──────────────────────────────────────────

  const analyzeMarket = useCallback(
    (
      personality: AgentPersonality,
      currentPrice: number,
      targetPrice: number,
      conditionAbove: boolean,
      resolutionTime: number,
      yesPool: bigint,
      noPool: bigint,
      sourceId: number
    ): { signals: SignalBreakdown; confidence: number; direction: boolean } => {
      const params = PERSONALITY_PARAMS[personality];

      const priceDistance = ((currentPrice - targetPrice) / targetPrice) * 100;
      const absDistance = Math.abs(priceDistance);

      const history = priceHistoryRef.current[sourceId] || [];
      let momentum = 0;
      if (history.length >= 3) {
        const recent = history.slice(-5);
        const oldest = recent[0];
        const newest = recent[recent.length - 1];
        momentum = ((newest - oldest) / oldest) * 100 * 10;
        momentum = Math.max(-100, Math.min(100, momentum));
      }

      const now = Date.now() / 1000;
      const timeLeft = resolutionTime - now;
      const totalDuration = Math.max(resolutionTime - (now - 86400), 1);
      const timeUrgency = Math.max(
        0,
        Math.min(100, (1 - timeLeft / totalDuration) * 100)
      );

      const yPool = Number(formatUnits(yesPool, USDC_DECIMALS));
      const nPool = Number(formatUnits(noPool, USDC_DECIMALS));
      const total = yPool + nPool;
      const poolImbalance = total > 0 ? ((yPool - nPool) / total) * 100 : 0;

      const signals: SignalBreakdown = {
        priceDistance: Math.round(priceDistance * 100) / 100,
        momentum: Math.round(momentum),
        timeUrgency: Math.round(timeUrgency),
        poolImbalance: Math.round(poolImbalance),
      };

      let suggestYes: boolean;
      if (conditionAbove) {
        suggestYes = priceDistance > 0 || momentum > 20;
      } else {
        suggestYes = priceDistance < 0 || momentum < -20;
      }

      if (params.contrarianFlip) {
        if (poolImbalance > 30) suggestYes = false;
        else if (poolImbalance < -30) suggestYes = true;
        else suggestYes = !suggestYes;
      }

      let confidence = 50;
      const distContrib =
        absDistance > 20 ? 35 : absDistance > 5 ? 25 : absDistance > 2 ? 15 : absDistance > 0.5 ? 8 : -5;
      confidence += distContrib * params.distanceWeight;
      const momDir = suggestYes ? momentum : -momentum;
      confidence += (momDir / 100) * 30 * params.momentumWeight;
      if (timeUrgency > 50) confidence += 5;
      if (timeUrgency > 70 && momDir > 0) confidence += 10;
      if (timeUrgency > 90 && momDir < 0) confidence -= 10;
      if (params.contrarianFlip && Math.abs(poolImbalance) > 40) confidence += 10;
      confidence += params.confidenceBoost;
      confidence = Math.max(0, Math.min(100, Math.round(confidence)));

      return { signals, confidence, direction: suggestYes };
    },
    []
  );

  // ─── Scan for a specific agent ─────────────────────────────────

  const scanForAgent = useCallback(
    async (agentId: number) => {
      const profile = agentProfilesRef.current.get(agentId);
      if (!profile || !profile.isActive) return;

      // For manual agents, pause scanning if there's already a pending recommendation
      // waiting for user approval. Resume once they approve or reject it.
      if (!profile.autoExecute) {
        const hasPending = recommendationsRef.current.some(
          (r) => r.agentId === agentId && r.status === "pending"
        );
        if (hasPending) {
          addLog(
            agentId,
            profile.name,
            "Waiting for pending recommendation to be approved or rejected before scanning.",
            "info"
          );
          return;
        }
      }

      const personality = profile.personality;

      try {
        // 0. Read fresh agent balance from chain
        const freshAgent = await publicClient.readContract({
          address: BELIEF_MARKET_ADDRESS,
          abi: BELIEF_MARKET_ABI,
          functionName: "getAgent",
          args: [BigInt(agentId)],
        }) as any;

        const freshBalance = freshAgent.balance as bigint;
        const balanceNum = Number(formatUnits(freshBalance, USDC_DECIMALS));

        // Only stop the agent for empty vault if it's in auto-execute mode.
        // Manual agents don't use the vault — the user signs and pays from their own wallet.
        if (profile.autoExecute && freshBalance === BigInt(0)) {
          addLog(
            agentId,
            profile.name,
            `Vault balance is 0 USDC. Stopping agent. Fund the agent vault to resume.`,
            "warning"
          );
          addAudit(agentId, "stopped", "Agent stopped: vault empty. Fund to resume.");
          // Auto-stop this agent
          const interval = intervalsRef.current.get(agentId);
          if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(agentId);
          }
          setRunningAgents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(agentId);
            return newSet;
          });
          return;
        }

        addLog(agentId, profile.name, `Scanning markets [${personality}] | Vault: ${balanceNum} USDC...`, "scan");

        // 1. Read actual market count from chain (fresh, not cached)
        const count = await publicClient.readContract({
          address: BELIEF_MARKET_ADDRESS,
          abi: BELIEF_MARKET_ABI,
          functionName: "getMarketCount",
        });
        const marketTotal = Number(count);

        if (marketTotal === 0) {
          addLog(agentId, profile.name, "No markets on-chain yet.", "info");
          addAudit(agentId, "scan", "Scan complete: 0 markets");
          return;
        }

        // 2. Fetch all prices
        const prices = await fetchAllPrices();
        setPrices(prices);

        // Update price history
        for (const p of prices) {
          if (!p.success) continue;
          const hist = priceHistoryRef.current[p.sourceId] || [];
          hist.push(p.price);
          if (hist.length > 20) hist.shift();
          priceHistoryRef.current[p.sourceId] = hist;
        }

        // 3. Read agent's existing positions to avoid duplicates
        let agentPositionMarkets: Set<number> = new Set();
        try {
          const posIds = await publicClient.readContract({
            address: BELIEF_MARKET_ADDRESS,
            abi: BELIEF_MARKET_ABI,
            functionName: "getAgentPositionIds",
            args: [BigInt(agentId)],
          }) as bigint[];

          for (const posId of posIds) {
            const pos = await publicClient.readContract({
              address: BELIEF_MARKET_ADDRESS,
              abi: BELIEF_MARKET_ABI,
              functionName: "getPosition",
              args: [posId],
            }) as any;
            // Only track active positions (status 0 = ACTIVE)
            if (Number(pos.status) === 0) {
              agentPositionMarkets.add(Number(pos.marketId));
            }
          }

          if (agentPositionMarkets.size > 0) {
            addLog(agentId, profile.name, `Agent has active positions in ${agentPositionMarkets.size} market(s): [${[...agentPositionMarkets].join(", ")}]`, "info");
          }
        } catch {
          // If read fails, continue without position tracking
        }

        // 4. For each market, read on-chain data and analyze
        const newRecs: AgentRecommendation[] = [];

        for (let i = 0; i < marketTotal && newRecs.length < 10; i++) {
          try {
            // Skip markets where agent already has an active position
            if (agentPositionMarkets.has(i)) {
              addLog(agentId, profile.name, `Market #${i}: already has active position, skipping.`, "info");
              continue;
            }

            // Read the actual market from contract
            const market = await publicClient.readContract({
              address: BELIEF_MARKET_ADDRESS,
              abi: BELIEF_MARKET_ABI,
              functionName: "getMarket",
              args: [BigInt(i)],
            }) as any;

            // Skip non-open markets
            if (Number(market.status) !== 0) continue;

            // Skip expired markets
            const resolutionTime = Number(market.resolutionTime);
            if (resolutionTime <= Date.now() / 1000) continue;

            const dataSourceId = Number(market.dataSourceId);
            const source = getDataSourceById(dataSourceId);
            if (!source) {
              addLog(agentId, profile.name, `Market #${i}: unknown data source ${dataSourceId}, skipping.`, "warning");
              continue;
            }

            // Check agent's allowed asset types
            if ((source.assetType & profile.allowedAssetTypes) === 0) continue;

            // Find live price for this market's data source
            const priceResult = prices.find((p) => p.success && p.sourceId === dataSourceId);
            if (!priceResult || !priceResult.success) {
              addLog(agentId, profile.name, `Market #${i} (${source.symbol}): no price data, skipping.`, "warning");
              continue;
            }

            // Use actual on-chain market data
            const targetPrice = Number(market.targetPrice) / 1e6; // PRICE_PRECISION = 1e6
            const conditionAbove = market.conditionAbove;
            const yesPool = market.yesPool;
            const noPool = market.noPool;

            const { signals, confidence, direction } = analyzeMarket(
              personality,
              priceResult.price,
              targetPrice,
              conditionAbove,
              resolutionTime,
              yesPool,
              noPool,
              source.id
            );

            const condLabel = conditionAbove ? "above" : "below";
            const distLabel = `${signals.priceDistance > 0 ? "+" : ""}${signals.priceDistance.toFixed(1)}%`;
            addLog(
              agentId,
              profile.name,
              `Market #${i} (${source.symbol}): $${priceResult.price.toFixed(2)} vs target $${targetPrice.toFixed(2)} (${condLabel}) | Dist: ${distLabel} | Mom: ${signals.momentum} | Urg: ${signals.timeUrgency}% | Conf: ${confidence}% [threshold: ${profile.confidenceThreshold}%]`,
              "info"
            );

            if (confidence >= profile.confidenceThreshold) {
              const params = PERSONALITY_PARAMS[personality];
              const maxBet = Number(formatUnits(profile.maxBetPerMarket, USDC_DECIMALS));
              const suggestedStakeNum =
                Math.round(maxBet * params.stakeMultiplier * 100) / 100;
              const dirLabel = direction ? "YES" : "NO";

              addLog(
                agentId,
                profile.name,
                `Signal generated: ${dirLabel} on ${source.symbol} | Stake: ${suggestedStakeNum} USDC | Confidence: ${confidence}% | Mode: ${profile.autoExecute ? "auto-execute" : "manual"}`,
                "recommendation"
              );

              // Auto-execute agents use submitPositionForAgent (vault) — cap to vault balance.
              // Manual agents use submitPosition (user's wallet) — no vault cap needed.
              let actualStake = suggestedStakeNum;
              if (profile.autoExecute) {
                actualStake = Math.min(suggestedStakeNum, balanceNum);
                if (actualStake <= 0) {
                  addLog(
                    agentId,
                    profile.name,
                    `Signal ${dirLabel} on ${source.symbol} but vault is empty (${balanceNum} USDC). Fund the agent vault to enable execution.`,
                    "warning"
                  );
                  continue;
                }
              }

              const stakeRaw = BigInt(Math.round(actualStake * 10 ** USDC_DECIMALS));

              const rec: AgentRecommendation = {
                id: `${agentId}-${i}-${Date.now()}`,
                agentId,
                marketId: i,
                direction,
                confidence,
                suggestedStake: stakeRaw,
                reasoning: buildReasoning(source.symbol, signals, personality, direction),
                currentPrice: priceResult.price,
                targetPrice,
                timestamp: Date.now(),
                status: "pending",
                signals,
              };

              addAudit(agentId, "recommendation", `${dirLabel} on ${source.symbol} (Market #${i}) — ${actualStake} USDC @ ${confidence}% confidence`, rec.reasoning, {
                confidence,
                stake: actualStake,
                symbol: source.symbol,
                marketId: i,
                direction,
                currentPrice: priceResult.price,
                targetPrice,
                priceDistance: signals.priceDistance,
                momentum: signals.momentum,
                timeUrgency: signals.timeUrgency,
                poolImbalance: signals.poolImbalance,
                mode: profile.autoExecute ? "auto" : "manual",
              });

              // Auto-execute: just do it, no recommendations
              if (profile.autoExecute) {
                addLog(agentId, profile.name, `Auto-executing: ${dirLabel} on Market #${i} (${source.symbol}) for ${actualStake} USDC via delegate wallet...`, "execution");
                try {
                  const encryptedDir = await encryptDirection(direction);
                  const txHash = await autoExecutePosition(
                    agentId,
                    i,
                    encryptedDir,
                    stakeRaw
                  );
                  if (txHash) {
                    rec.txHash = txHash;
                    rec.status = "executed";
                    addLog(
                      agentId,
                      profile.name,
                      `Executed: ${dirLabel} on ${source.symbol} @ ${actualStake} USDC | tx: ${txHash.slice(0, 14)}...`,
                      "execution"
                    );
                    addAudit(agentId, "executed", `${dirLabel} position on ${source.symbol} (Market #${i}) — ${actualStake} USDC`, undefined, {
                      txHash,
                      symbol: source.symbol,
                      marketId: i,
                      direction,
                      stake: actualStake,
                      confidence,
                      mode: "auto",
                    });
                  } else {
                    rec.status = "executed"; // Don't show as pending — log the failure
                    addLog(
                      agentId,
                      profile.name,
                      `Auto-execute returned null for ${source.symbol} Market #${i}. No delegate wallet found for agent #${agentId}. Create agent with auto-execute to generate a delegate key.`,
                      "error"
                    );
                  }
                } catch (err) {
                  rec.status = "executed"; // Don't show as pending
                  const errMsg = err instanceof Error ? err.message : String(err);
                  addLog(
                    agentId,
                    profile.name,
                    `Auto-execute failed for ${source.symbol} Market #${i}: ${errMsg}`,
                    "error"
                  );
                  addAudit(agentId, "error", `Auto-execute failed on ${source.symbol} (Market #${i}): ${errMsg}`, undefined, {
                    symbol: source.symbol,
                    marketId: i,
                    direction,
                    stake: actualStake,
                    confidence,
                  });
                }
              }

              newRecs.push(rec);
            } else {
              addLog(
                agentId,
                profile.name,
                `Market #${i} (${source.symbol}): Confidence ${confidence}% below threshold ${profile.confidenceThreshold}%, skipping.`,
                "info"
              );
            }
          } catch (marketErr) {
            addLog(agentId, profile.name, `Error reading market #${i}: ${marketErr instanceof Error ? marketErr.message : "unknown"}`, "error");
          }
        }

        // Update stats
        setRecommendations((prev) => [...newRecs, ...prev].slice(0, 100));
        setAgentLocalData((prev) => {
          const newMap = new Map(prev);
          const local = newMap.get(agentId) || {
            stats: { ...DEFAULT_AGENT_STATS },
            color: AGENT_COLORS[agentId % AGENT_COLORS.length],
          };
          const avgConf =
            newRecs.length > 0
              ? newRecs.reduce((s, r) => s + r.confidence, 0) / newRecs.length
              : 0;
          const prevAvg = local.stats.avgConfidence;
          const prevCount = local.stats.totalRecommendations;
          const newCount = prevCount + newRecs.length;
          local.stats = {
            ...local.stats,
            totalScans: local.stats.totalScans + 1,
            totalRecommendations: newCount,
            totalExecuted:
              local.stats.totalExecuted +
              newRecs.filter((r) => r.status === "executed").length,
            avgConfidence:
              newCount > 0
                ? Math.round((prevAvg * prevCount + avgConf * newRecs.length) / newCount)
                : 0,
          };
          newMap.set(agentId, local);
          saveAgentLocalData(newMap);
          return newMap;
        });

        addAudit(
          agentId,
          "scan",
          `Scan complete: ${marketTotal} markets, ${prices.filter((p) => p.success).length} prices, ${newRecs.length} signals`
        );
        addLog(agentId, profile.name, `Scan complete. ${marketTotal} markets checked, ${newRecs.length} new signals.`, "scan");
      } catch (err) {
        addLog(
          agentId,
          profile.name,
          `Error: ${err instanceof Error ? err.message : "unknown"}`,
          "error"
        );
        addAudit(agentId, "error", `Scan failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    },
    [addLog, addAudit, analyzeMarket]
  );

  // ─── Start / Stop Agent ────────────────────────────────────────

  const startAgent = useCallback(
    (agentId: number, agentProfile: AgentProfile) => {
      agentProfilesRef.current.set(agentId, agentProfile);
      setRunningAgents((prev) => {
        const newSet = new Set(prev);
        newSet.add(agentId);
        return newSet;
      });

      addAudit(agentId, "started", `Agent "${agentProfile.name}" started`);
      addLog(
        agentId,
        agentProfile.name,
        `Started [${agentProfile.personality}/${agentProfile.autoExecute ? "auto" : "manual"}]`,
        "info"
      );

      scanForAgent(agentId);
      const interval = setInterval(() => scanForAgent(agentId), 30000); // 30s poll
      intervalsRef.current.set(agentId, interval);
    },
    [scanForAgent, addAudit, addLog]
  );

  const stopAgent = useCallback(
    (agentId: number) => {
      const interval = intervalsRef.current.get(agentId);
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(agentId);
      }
      setRunningAgents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
      const profile = agentProfilesRef.current.get(agentId);
      if (profile) {
        addAudit(agentId, "stopped", `Agent "${profile.name}" stopped`);
        addLog(agentId, profile.name, "Stopped", "info");
      }
    },
    [addAudit, addLog]
  );

  // ─── Approve / Reject / Execute ────────────────────────────────

  // Called after the on-chain transaction is confirmed (manual approve flow)
  const approveRecommendation = useCallback((recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId ? { ...r, status: "executed" as RecommendationStatus } : r
      )
    );
    const rec = recommendations.find((r) => r.id === recId);
    if (rec) {
      setAgentLocalData((prev) => {
        const newMap = new Map(prev);
        const local = newMap.get(rec.agentId) || {
          stats: { ...DEFAULT_AGENT_STATS },
          color: AGENT_COLORS[rec.agentId % AGENT_COLORS.length],
        };
        local.stats.totalExecuted += 1;
        newMap.set(rec.agentId, local);
        saveAgentLocalData(newMap);
        return newMap;
      });
      const stakeUsdc = Number(rec.suggestedStake) / 10 ** USDC_DECIMALS;
      addAudit(rec.agentId, "executed", `${rec.direction ? "YES" : "NO"} on Market #${rec.marketId} — ${stakeUsdc} USDC @ ${rec.confidence}% confidence (manual approve)`, undefined, {
        marketId: rec.marketId,
        direction: rec.direction,
        stake: stakeUsdc,
        confidence: rec.confidence,
        mode: "manual",
      });
    }
  }, [recommendations, addAudit]);

  const rejectRecommendation = useCallback((recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId ? { ...r, status: "rejected" as RecommendationStatus } : r
      )
    );
    const rec = recommendations.find((r) => r.id === recId);
    if (rec) {
      setAgentLocalData((prev) => {
        const newMap = new Map(prev);
        const local = newMap.get(rec.agentId) || {
          stats: { ...DEFAULT_AGENT_STATS },
          color: AGENT_COLORS[rec.agentId % AGENT_COLORS.length],
        };
        local.stats.totalRejected += 1;
        newMap.set(rec.agentId, local);
        saveAgentLocalData(newMap);
        return newMap;
      });
      const rejStake = Number(rec.suggestedStake) / 10 ** USDC_DECIMALS;
      addAudit(rec.agentId, "rejected", `${rec.direction ? "YES" : "NO"} on Market #${rec.marketId} rejected — ${rejStake} USDC @ ${rec.confidence}% confidence`, undefined, {
        marketId: rec.marketId,
        direction: rec.direction,
        stake: rejStake,
        confidence: rec.confidence,
      });
    }
  }, [recommendations, addAudit]);

  const markExecuted = useCallback((recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recId ? { ...r, status: "executed" as RecommendationStatus } : r
      )
    );
    const rec = recommendations.find((r) => r.id === recId);
    if (rec) {
      setAgentLocalData((prev) => {
        const newMap = new Map(prev);
        const local = newMap.get(rec.agentId) || {
          stats: { ...DEFAULT_AGENT_STATS },
          color: AGENT_COLORS[rec.agentId % AGENT_COLORS.length],
        };
        local.stats.totalExecuted += 1;
        newMap.set(rec.agentId, local);
        saveAgentLocalData(newMap);
        return newMap;
      });
      addAudit(rec.agentId, "executed", `Position executed`);
    }
  }, [recommendations, addAudit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  return {
    agentIds,
    runningAgents,
    recommendations,
    logs,
    globalAudit,
    prices,
    startAgent,
    stopAgent,
    approveRecommendation,
    rejectRecommendation,
    markExecuted,
    refreshAgentIds: refetchAgentIds,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function buildReasoning(
  symbol: string,
  signals: SignalBreakdown,
  personality: AgentPersonality,
  direction: boolean
): string {
  const parts: string[] = [];
  const dir = direction ? "YES" : "NO";

  if (Math.abs(signals.priceDistance) > 3) {
    parts.push(
      `Price is ${Math.abs(signals.priceDistance).toFixed(1)}% ${
        signals.priceDistance > 0 ? "above" : "below"
      } target`
    );
  } else {
    parts.push(
      `Price is near target (${signals.priceDistance.toFixed(1)}% away)`
    );
  }

  if (Math.abs(signals.momentum) > 20) {
    parts.push(
      `Strong ${signals.momentum > 0 ? "upward" : "downward"} momentum detected`
    );
  }

  if (signals.timeUrgency > 70) {
    parts.push("Market nearing resolution");
  }

  if (Math.abs(signals.poolImbalance) > 30 && personality === "contrarian") {
    parts.push(
      `Pool heavily ${signals.poolImbalance > 0 ? "YES" : "NO"}-sided — contrarian opportunity`
    );
  }

  return `${dir} on ${symbol}. ${parts.join(". ")}.`;
}
