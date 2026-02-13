"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { parseUnits, formatUnits } from "viem";
import { BELIEF_MARKET_ADDRESS, USDC_ADDRESS, USDC_DECIMALS } from "@/config/contracts";
import { BELIEF_MARKET_ABI, ERC20_ABI } from "@/config/beliefMarketAbi";
import { encryptDirection } from "@/utils/encryption";
import { Market, MarketStatus } from "@/types/market";

interface SubmitPositionProps {
  market: Market;
}

export function SubmitPosition({ market }: SubmitPositionProps) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<boolean>(true);
  const [amount, setAmount] = useState("");

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, BELIEF_MARKET_ADDRESS] : undefined,
  });

  const { data: approveHash, writeContract: writeApprove, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { data: submitHash, writeContract: writeSubmit, isPending: isSubmitting } = useWriteContract();
  const { isLoading: isSubmitConfirming, isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({ hash: submitHash });

  const depositAmount = amount ? parseUnits(amount, USDC_DECIMALS) : BigInt(0);
  const hasEnoughBalance = usdcBalance !== undefined && depositAmount <= (usdcBalance as bigint);
  const needsApproval = allowance !== undefined && depositAmount > (allowance as bigint);

  const isOpen = market.status === MarketStatus.OPEN;
  const isExpired = Number(market.resolutionTime) * 1000 <= Date.now();

  useEffect(() => {
    if (isSubmitSuccess) queryClient.invalidateQueries();
  }, [isSubmitSuccess, queryClient]);

  useEffect(() => {
    if (isApproveSuccess) queryClient.invalidateQueries();
  }, [isApproveSuccess, queryClient]);

  function handleApprove() {
    writeApprove({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [BELIEF_MARKET_ADDRESS, depositAmount],
    });
  }

  async function handleSubmit() {
    try {
      const encrypted = await encryptDirection(direction);
      writeSubmit({
        address: BELIEF_MARKET_ADDRESS,
        abi: BELIEF_MARKET_ABI,
        functionName: "submitPosition",
        args: [BigInt(market.id), encrypted, depositAmount],
      });
    } catch (err) {
      console.error("Encryption failed:", err);
    }
  }

  if (!isOpen || isExpired) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 32, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="text-body" style={{ color: "var(--text-muted)" }}>
          This market is no longer accepting positions.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Execution Swap</h3>

      {/* Direction */}
      <div style={{ marginBottom: 20 }}>
        <span className="text-caption" style={{ display: "block", marginBottom: 8 }}>Your Belief</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setDirection(true)}
            style={{
              flex: 1,
              padding: "16px 0",
              borderRadius: "var(--radius-md)",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              background: direction ? "var(--yes-dim)" : "var(--bg)",
              color: direction ? "var(--yes)" : "var(--text-muted)",
              border: `1px solid ${direction ? "var(--yes)" : "var(--border)"}`,
              transition: "all 200ms",
            }}
          >
            YES
          </button>
          <button
            onClick={() => setDirection(false)}
            style={{
              flex: 1,
              padding: "16px 0",
              borderRadius: "var(--radius-md)",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              background: !direction ? "var(--no-dim)" : "var(--bg)",
              color: !direction ? "var(--no)" : "var(--text-muted)",
              border: `1px solid ${!direction ? "var(--no)" : "var(--border)"}`,
              transition: "all 200ms",
            }}
          >
            NO
          </button>
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="text-caption">Stake (USDC)</span>
          {usdcBalance !== undefined && (
            <span className="text-caption text-mono">
              Balance: {formatUnits(usdcBalance as bigint, USDC_DECIMALS)}
            </span>
          )}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="input text-mono"
          step="any"
          min="0"
        />
      </div>

      {/* Encryption notice */}
      <div
        style={{
          marginBottom: 20,
          padding: 14,
          borderRadius: "var(--radius-sm)",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Your direction (YES/NO) will be encrypted using BITE v2 threshold
          encryption. No one can see your position until resolution.
        </p>
      </div>

      {amount && !hasEnoughBalance && (
        <p style={{ fontSize: 13, color: "var(--no)", marginBottom: 12 }}>
          Insufficient USDC balance
        </p>
      )}

      {isSubmitSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", padding: 16 }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--yes)", marginBottom: 4 }}>
            Position submitted
          </p>
          <p className="text-caption">Your belief is now encrypted on-chain.</p>
        </motion.div>
      ) : needsApproval && !isApproveSuccess ? (
        <button
          onClick={handleApprove}
          disabled={!isConnected || !amount || !hasEnoughBalance || isApproving || isApproveConfirming}
          className="btn-primary"
          style={{ width: "100%" }}
        >
          {isApproving ? "Confirm in Wallet..." : isApproveConfirming ? "Approving..." : "Approve USDC"}
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!isConnected || !amount || !hasEnoughBalance || isSubmitting || isSubmitConfirming}
          className="btn-primary"
          style={{ width: "100%" }}
        >
          {!isConnected
            ? "Connect Wallet"
            : isSubmitting
            ? "Confirm in Wallet..."
            : isSubmitConfirming
            ? "Submitting..."
            : "Execute Order"}
        </button>
      )}
    </div>
  );
}
