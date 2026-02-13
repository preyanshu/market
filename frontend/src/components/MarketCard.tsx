"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { Market, MarketStatus, ASSET_TYPE_LABELS, STATUS_LABELS } from "@/types/market";
import { getDataSourceById, generateMarketQuestion } from "@/config/dataSources";
import { USDC_DECIMALS, PRICE_PRECISION } from "@/config/contracts";

interface MarketCardProps {
  market: Market;
  index: number;
}

export function MarketCard({ market, index }: MarketCardProps) {
  const source = getDataSourceById(market.dataSourceId);
  const targetPrice = Number(market.targetPrice) / Number(PRICE_PRECISION);
  const question = source
    ? generateMarketQuestion(source, targetPrice, market.conditionAbove)
    : `Market #${market.id}`;

  const totalDeposits = Number(formatUnits(market.totalDeposits, USDC_DECIMALS));
  const isOpen = market.status === MarketStatus.OPEN;
  const isSettled = market.status === MarketStatus.SETTLED;
  const resolutionDate = new Date(Number(market.resolutionTime) * 1000);
  const timeLeft = resolutionDate.getTime() - Date.now();
  const isExpired = timeLeft <= 0;

  const posCount = Number(market.totalPositions);

  // Pool split
  const yesNum = Number(market.yesPool);
  const noNum = Number(market.noPool);
  const poolTotal = yesNum + noNum;
  const yesPercent = poolTotal > 0 ? Math.round((yesNum / poolTotal) * 100) : 50;
  const noPercent = 100 - yesPercent;

  function formatTimeLeft(): string {
    if (isExpired) return "Expired";
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function formatVolume(val: number): string {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    if (val > 0) return `$${val.toFixed(0)}`;
    return "$0";
  }

  function formatResolutionLabel(): string {
    if (isExpired) return "Awaiting resolution";
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (resolutionDate.toDateString() === now.toDateString()) {
      return `Today ${resolutionDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    if (resolutionDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${resolutionDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    return resolutionDate.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/market/${market.id}`} style={{ textDecoration: "none" }}>
        <div className="market-card">
          {/* Header: icon + question */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            {source?.icon && (
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "var(--bg-elevated)", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img
                  src={source.icon}
                  alt={source.name}
                  width={28} height={28}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
                lineHeight: 1.4, letterSpacing: "-0.01em",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {question}
              </h3>
            </div>
          </div>

          {/* YES / NO bar — encrypted: show lock instead of percentages */}
          {isSettled ? (
            /* Settled: show actual revealed percentages */
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                padding: "6px 10px", borderRadius: 8,
                background: market.outcome ? "rgba(52, 211, 153, 0.08)" : "rgba(248, 113, 113, 0.08)",
                border: `1px solid ${market.outcome ? "rgba(52, 211, 153, 0.2)" : "rgba(248, 113, 113, 0.2)"}`,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: market.outcome ? "var(--yes)" : "var(--no)",
                }}>
                  Resolved: {market.outcome ? "YES" : "NO"}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Yes {yesPercent}% / No {noPercent}%
                </span>
              </div>
            </div>
          ) : (
            /* Open / Resolving: directions are encrypted */
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                flex: 1, height: 32, borderRadius: 8,
                background: "var(--bg-elevated)",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, border: "1px solid var(--border)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A76FFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#A76FFA", opacity: 0.5,
                  fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                }}>Encrypted</span>
              </div>
              <button
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "1px solid rgba(52, 211, 153, 0.3)",
                  background: "rgba(52, 211, 153, 0.1)", color: "var(--yes)",
                  transition: "all 150ms",
                }}
                onClick={(e) => e.preventDefault()}
              >Yes</button>
              <button
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "1px solid rgba(248, 113, 113, 0.3)",
                  background: "rgba(248, 113, 113, 0.1)", color: "var(--no)",
                  transition: "all 150ms",
                }}
                onClick={(e) => e.preventDefault()}
              >No</button>
            </div>
          )}

          {/* Footer: volume, time, status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {formatVolume(totalDeposits)} Vol.
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span>{posCount} position{posCount !== 1 ? "s" : ""}</span>
            <span style={{ color: "var(--border)" }}>·</span>
            {isOpen && !isExpired && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--yes)", display: "inline-block",
                  boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                }} />
                <span style={{ color: "var(--text-secondary)" }}>{formatTimeLeft()}</span>
              </span>
            )}
            {isOpen && isExpired && (
              <span style={{ color: "var(--text-secondary)" }}>Awaiting resolution</span>
            )}
            {!isOpen && (
              <span>{STATUS_LABELS[market.status]}</span>
            )}
            {source && (
              <>
                <span style={{ color: "var(--border)" }}>·</span>
                <span>{source.exchange?.name || ASSET_TYPE_LABELS[source.assetType] || ""}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
