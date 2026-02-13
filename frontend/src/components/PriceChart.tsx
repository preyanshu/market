"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DataSource } from "@/config/dataSources";
import { fetchPrice } from "@/utils/priceOracle";

interface PriceDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

interface PriceChartProps {
  source: DataSource;
  targetPrice: number;
  conditionAbove: boolean;
}

export function PriceChart({ source, targetPrice, conditionAbove }: PriceChartProps) {
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate simulated historical data based on current price
    async function init() {
      const result = await fetchPrice(source);
      if (!result.success) return;

      const basePrice = result.price;
      setCurrentPrice(basePrice);

      // Generate 20 historical data points with realistic walk
      const history: PriceDataPoint[] = [];
      let price = basePrice * (1 - 0.02 * Math.random());
      const now = Date.now();

      for (let i = 20; i >= 1; i--) {
        const delta = basePrice * 0.003 * (Math.random() * 2 - 1);
        price = price + delta;
        const ts = now - i * 30000;
        history.push({
          time: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          price: Math.round(price * 100) / 100,
          timestamp: ts,
        });
      }

      // Add current price
      history.push({
        time: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: basePrice,
        timestamp: now,
      });

      setData(history);
    }

    init();

    // Poll for new data points
    intervalRef.current = setInterval(async () => {
      const result = await fetchPrice(source);
      if (!result.success) return;

      setCurrentPrice(result.price);
      setData((prev) => {
        const now = Date.now();
        const next = [
          ...prev.slice(-20),
          {
            time: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: result.price,
            timestamp: now,
          },
        ];
        return next;
      });
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [source]);

  if (data.length === 0) {
    return (
      <div className="card" style={{ height: "100%", minHeight: 280 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Price Feed</h3>
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="skeleton w-full" style={{ height: 200 }} />
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);
  const dataRange = dataMax - dataMin || dataMax * 0.01; // fallback if flat

  // Only include targetPrice in axis range if it's within 20% of the data range
  const targetNearData =
    targetPrice >= dataMin - dataRange * 2 && targetPrice <= dataMax + dataRange * 2;

  const rawMin = targetNearData ? Math.min(dataMin, targetPrice) : dataMin;
  const rawMax = targetNearData ? Math.max(dataMax, targetPrice) : dataMax;

  // Add a 5% padding so the line never hugs the edges
  const padding = (rawMax - rawMin) * 0.05 || rawMax * 0.005;
  const minPrice = rawMin - padding;
  const maxPrice = rawMax + padding;

  const priceAboveTarget = currentPrice !== null && currentPrice > targetPrice;
  const conditionMet = conditionAbove ? priceAboveTarget : !priceAboveTarget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{source.symbol} Price Feed</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Live oracle data from {source.provider}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {currentPrice !== null && (
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono), monospace", color: "var(--text-primary)" }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                style={{ display: "block", fontSize: 12, color: conditionMet ? "var(--yes)" : "var(--no)" }}
              >
                {conditionMet ? "Condition met" : "Condition not met"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "100%", flex: 1, minHeight: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A76FFA" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#A76FFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                color: "var(--text-primary)",
              }}
              formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Price"]}
              labelStyle={{ color: "var(--text-muted)", fontSize: 11 }}
            />
            <ReferenceLine
              y={targetPrice}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: `Target: $${targetPrice.toLocaleString()}`,
                position: "right",
                fill: "var(--text-muted)",
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#A76FFA"
              strokeWidth={1.5}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{
                r: 3,
                fill: "var(--text-primary)",
                stroke: "var(--bg)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
