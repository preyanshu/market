"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "@/types/market";

interface DashboardStatsProps {
  markets: {
    id: number;
    totalDeposits: bigint;
    totalPositions: bigint;
    status: MarketStatus;
  }[];
}

export function DashboardStats({ markets }: DashboardStatsProps) {
  const totalVolume = markets.reduce(
    (sum, m) => sum + Number(formatUnits(m.totalDeposits, USDC_DECIMALS)),
    0
  );
  const totalPositions = markets.reduce(
    (sum, m) => sum + Number(m.totalPositions),
    0
  );
  const activeMarkets = markets.filter((m) => m.status === MarketStatus.OPEN).length;

  const chartData = markets.map((m) => ({
    name: `#${m.id}`,
    volume: Number(formatUnits(m.totalDeposits, USDC_DECIMALS)),
    status: m.status,
  }));

  const maxVolume = Math.max(...chartData.map((d) => d.volume), 1);

  function formatVol(val: number): string {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `${val.toFixed(2)}`;
  }

  const stats = [
    { label: "Total Markets", value: markets.length.toString() },
    { label: "Active", value: activeMarkets.toString(), color: "#A76FFA" },
    { label: "Total Volume", value: formatVol(totalVolume), unit: "USDC" },
    { label: "Positions", value: totalPositions.toString() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ marginBottom: 28 }}
    >
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              {stat.label}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
                  fontFamily: "var(--font-mono), monospace",
                  color: stat.color || "var(--text-primary)",
                }}
              >
                {stat.value}
              </span>
              {stat.unit && (
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{stat.unit}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Volume bar chart — pure CSS, no recharts */}
      {chartData.length > 1 && (
        <div style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Volume by Market</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#A76FFA", opacity: 0.6 }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Open</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#34d399", opacity: 0.6 }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Settled</span>
              </div>
            </div>
          </div>

          {/* CSS bar chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, paddingBottom: 24, position: "relative" }}>
            {chartData.map((entry, i) => {
              const pct = maxVolume > 0 ? (entry.volume / maxVolume) * 100 : 0;
              // Ensure minimum visible height for non-zero volumes
              const barHeight = entry.volume > 0 ? Math.max(pct, 8) : 0;
              const isSettled = entry.status === MarketStatus.SETTLED;
              const barColor = isSettled ? "#34d399" : "#A76FFA";

              return (
                <div
                  key={i}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "flex-end", height: "100%",
                    position: "relative",
                  }}
                >
                  {/* Volume label on hover area */}
                  <div
                    style={{
                      position: "absolute", top: -4, fontSize: 10, fontWeight: 600,
                      color: "var(--text-muted)", fontFamily: "var(--font-mono), monospace",
                      opacity: entry.volume > 0 ? 1 : 0.3,
                    }}
                  >
                    {entry.volume > 0 ? `$${entry.volume.toFixed(0)}` : "—"}
                  </div>
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: "100%", maxWidth: 48, borderRadius: "4px 4px 0 0",
                      background: barColor, opacity: 0.5,
                    }}
                  />
                  {/* Label */}
                  <span style={{
                    position: "absolute", bottom: -20,
                    fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap",
                  }}>
                    {entry.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
