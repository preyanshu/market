"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/config/contracts";

interface PoolDistributionProps {
  yesPool: bigint;
  noPool: bigint;
  totalDeposits: bigint;
  totalPositions: bigint;
  isSettled: boolean;
  outcome?: boolean;
}

export function PoolDistribution({
  yesPool,
  noPool,
  totalDeposits,
  totalPositions,
  isSettled,
  outcome,
}: PoolDistributionProps) {
  const yesAmount = Number(formatUnits(yesPool, USDC_DECIMALS));
  const noAmount = Number(formatUnits(noPool, USDC_DECIMALS));
  const total = yesAmount + noAmount;

  const yesPercent = total > 0 ? (yesAmount / total) * 100 : 50;
  const noPercent = total > 0 ? (noAmount / total) * 100 : 50;

  const totalDep = formatUnits(totalDeposits, USDC_DECIMALS);
  const posCount = Number(totalPositions);

  return (
    <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Pool Distribution</h3>

      {isSettled && total > 0 ? (
        <>
          {/* YES/NO Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-caption font-medium"
                style={{ color: "var(--yes)" }}
              >
                YES {yesPercent.toFixed(1)}%
              </span>
              <span
                className="text-caption font-medium"
                style={{ color: "var(--no)" }}
              >
                {noPercent.toFixed(1)}% NO
              </span>
            </div>
            <div
              className="flex w-full overflow-hidden"
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--bg)",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${yesPercent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "var(--yes)",
                  borderRadius: "4px 0 0 4px",
                }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${noPercent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={{
                  background: "var(--no)",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </div>
          </div>

          {/* Pool amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-3 rounded-lg"
              style={{
                background: outcome === true ? "var(--yes-dim)" : "var(--bg)",
                border: `1px solid ${outcome === true ? "var(--yes)" : "var(--border)"}`,
              }}
            >
              <span className="text-caption block mb-1">YES Pool</span>
              <span className="text-body text-mono" style={{ color: "var(--yes)" }}>
                {yesAmount.toFixed(2)} USDC
              </span>
              {outcome === true && (
                <span className="text-caption block mt-1" style={{ color: "var(--yes)" }}>
                  Winners
                </span>
              )}
            </div>
            <div
              className="p-3 rounded-lg"
              style={{
                background: outcome === false ? "var(--no-dim)" : "var(--bg)",
                border: `1px solid ${outcome === false ? "var(--no)" : "var(--border)"}`,
              }}
            >
              <span className="text-caption block mb-1">NO Pool</span>
              <span className="text-body text-mono" style={{ color: "var(--no)" }}>
                {noAmount.toFixed(2)} USDC
              </span>
              {outcome === false && (
                <span className="text-caption block mt-1" style={{ color: "var(--no)" }}>
                  Winners
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Encrypted state - show aggregate only */}
          <div className="mb-4">
            <div
              className="flex w-full overflow-hidden"
              style={{ height: 8, borderRadius: 4, background: "var(--bg)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: posCount > 0 ? "100%" : "0%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "var(--text-secondary)",
                  borderRadius: 4,
                  opacity: 0.3,
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              Direction split is encrypted until resolution
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg" style={{ background: "var(--bg)" }}>
              <span className="text-caption block mb-1">Total Pool</span>
              <span className="text-body text-mono text-text-primary">
                {totalDep} USDC
              </span>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--bg)" }}>
              <span className="text-caption block mb-1">Positions</span>
              <span className="text-body text-mono text-text-primary">
                {posCount} encrypted
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact inline pool bar for use inside MarketCard.
 */
export function PoolBarInline({
  totalPositions,
  totalDeposits,
}: {
  totalPositions: bigint;
  totalDeposits: bigint;
}) {
  const posCount = Number(totalPositions);
  const maxPositions = 20; // MAX_POSITIONS_PER_MARKET
  const fillPercent = Math.min((posCount / maxPositions) * 100, 100);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-caption">Capacity</span>
        <span className="text-caption text-mono">
          {posCount}/{maxPositions}
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{ height: 4, borderRadius: 2, background: "var(--bg)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: "100%",
            background:
              fillPercent > 80
                ? "var(--no)"
                : fillPercent > 50
                ? "var(--text-secondary)"
                : "var(--yes)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}
