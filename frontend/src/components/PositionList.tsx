"use client";

import { useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { BELIEF_MARKET_ADDRESS, USDC_DECIMALS } from "@/config/contracts";
import { BELIEF_MARKET_ABI } from "@/config/beliefMarketAbi";
import { PositionStatus, MarketStatus } from "@/types/market";

interface PositionListProps {
  marketId: number;
  marketStatus: MarketStatus;
}

export function PositionList({ marketId, marketStatus }: PositionListProps) {
  const { data: positionIds } = useReadContract({
    address: BELIEF_MARKET_ADDRESS,
    abi: BELIEF_MARKET_ABI,
    functionName: "getMarketPositionIds",
    args: [BigInt(marketId)],
  });

  const ids = (positionIds as bigint[]) || [];

  return (
    <div className="card" style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Positions</h3>
        <span className="text-caption" style={{ fontFamily: "var(--font-mono)" }}>
          {ids.length} total
        </span>
      </div>

      {ids.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p className="text-body" style={{ color: "var(--text-muted)" }}>
            No positions yet. Be the first to stake your belief.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ids.map((id, i) => (
            <PositionRow
              key={id.toString()}
              positionId={Number(id)}
              index={i}
              isSettled={marketStatus === MarketStatus.SETTLED}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionRow({
  positionId,
  index,
  isSettled,
}: {
  positionId: number;
  index: number;
  isSettled: boolean;
}) {
  const { data } = useReadContract({
    address: BELIEF_MARKET_ADDRESS,
    abi: BELIEF_MARKET_ABI,
    functionName: "getPosition",
    args: [BigInt(positionId)],
  });

  if (!data) {
    return <div className="skeleton" style={{ height: 56, width: "100%" }} />;
  }

  // Log raw on-chain position data to verify encryption
  console.group(`[On-Chain Position #${positionId}]`);
  console.log("Raw contract data:", data);
  console.log("Trader:", data.trader);
  console.log("Deposit:", formatUnits(data.deposit, USDC_DECIMALS), "USDC");
  console.log("Encrypted Direction (bytes on-chain):", (data as any).encryptedDirection);
  console.log("Direction (bool — only meaningful after settlement):", data.direction);
  console.log("Status:", data.status, isSettled ? "(SETTLED — decrypted)" : "(OPEN — still encrypted)");
  console.log("Payout:", formatUnits(data.payout, USDC_DECIMALS), "USDC");
  console.groupEnd();

  const trader = data.trader;
  const deposit = formatUnits(data.deposit, USDC_DECIMALS);
  const payout = formatUnits(data.payout, USDC_DECIMALS);
  const direction = data.direction;
  const shortAddr = `${trader.slice(0, 6)}...${trader.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Avatar dot */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {trader.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {shortAddr}
          </span>
          <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {deposit} USDC
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isSettled ? (
          <>
            <span
              className="badge"
              style={{
                background: direction ? "var(--yes-dim)" : "var(--no-dim)",
                color: direction ? "var(--yes)" : "var(--no)",
              }}
            >
              {direction ? "YES" : "NO"}
            </span>
            {Number(data.payout) > 0 && (
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--yes)", fontFamily: "var(--font-mono)" }}>
                +{payout}
              </span>
            )}
          </>
        ) : (
          <span className="badge badge-accent">Encrypted</span>
        )}
      </div>
    </motion.div>
  );
}
