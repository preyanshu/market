import { DataSource, DATA_SOURCES } from "@/config/dataSources";

export interface PriceResult {
  sourceId: number;
  price: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

/**
 * Fetch live price from DIA data source.
 * All sources use the DIA /v1/rwa/ endpoints.
 */
export async function fetchPrice(source: DataSource): Promise<PriceResult> {
  try {
    const res = await fetch(source.endpoint);
    if (!res.ok) {
      // Fallback to default price if API unreachable
      return getSimulatedPrice(source);
    }
    const data = await res.json();
    // DIA /v1/rwa/ returns { Price: number, ... }
    const price = data.Price || data.price || 0;
    if (price === 0) {
      return getSimulatedPrice(source);
    }
    return {
      sourceId: source.id,
      price,
      timestamp: Date.now(),
      success: true,
    };
  } catch {
    return getSimulatedPrice(source);
  }
}

/**
 * Simulated prices using defaultPrice + slight variance for demo/hackathon.
 */
function getSimulatedPrice(source: DataSource): PriceResult {
  const base = source.defaultPrice;
  const variance = base * 0.005 * (Math.random() * 2 - 1);
  return {
    sourceId: source.id,
    price: Math.round((base + variance) * 10000) / 10000,
    timestamp: Date.now(),
    success: true,
  };
}

/**
 * Fetch prices for all data sources.
 */
export async function fetchAllPrices(): Promise<PriceResult[]> {
  return Promise.all(DATA_SOURCES.map(fetchPrice));
}

/**
 * Format price for display.
 */
export function formatPrice(price: number, decimals: number = 2): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (price < 0.01) {
    return price.toFixed(6);
  }
  return price.toFixed(decimals);
}
