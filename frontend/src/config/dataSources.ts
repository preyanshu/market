// ─── Trusted Data Sources (DIA only) ─────────────────────────────

export interface DataSource {
  id: number;
  name: string;
  symbol: string; // ticker
  provider: "diaData";
  category: "commodity" | "etf" | "fx";
  assetType: number; // Bitmask matching contract constants
  endpoint: string;
  description: string;
  icon: string;
  defaultPrice: number; // fallback / initial display price
  exchange?: {
    name: string;
    icon?: string;
  };
}

// Asset type constants (match contract)
export const ASSET_COMMODITY = 1;
export const ASSET_ETF = 2;
export const ASSET_FX = 4;

export const DATA_SOURCES: DataSource[] = [
  // ─── Commodities ──────────────────────────────────────────────────
  {
    id: 1,
    name: "Natural Gas",
    symbol: "NG/USD",
    provider: "diaData",
    category: "commodity",
    assetType: ASSET_COMMODITY,
    endpoint: "https://api.diadata.org/v1/rwa/Commodities/NG-USD",
    description: "Henry Hub natural gas benchmark. Key energy commodity that powers heating, electricity, and industrial production. Highly seasonal — spikes in winter demand.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Natural-gas-Commodity-logo-1.png",
    defaultPrice: 3.169,
    exchange: { name: "Commodity", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg" },
  },
  {
    id: 2,
    name: "Crude Oil",
    symbol: "WTI/USD",
    provider: "diaData",
    category: "commodity",
    assetType: ASSET_COMMODITY,
    endpoint: "https://api.diadata.org/v1/rwa/Commodities/WTI-USD",
    description: "West Texas Intermediate crude oil, the primary U.S. oil benchmark. Driven by OPEC output, geopolitical tensions, and global demand cycles.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Crude-Oil-WTI-Spot-Commodity-logo-1.png",
    defaultPrice: 58.78,
    exchange: { name: "Commodity", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg" },
  },
  {
    id: 3,
    name: "Brent Oil",
    symbol: "XBR/USD",
    provider: "diaData",
    category: "commodity",
    assetType: ASSET_COMMODITY,
    endpoint: "https://api.diadata.org/v1/rwa/Commodities/XBR-USD",
    description: "International crude oil benchmark from the North Sea. Used to price two-thirds of the world's traded crude. Typically trades at a premium to WTI.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Brent-Spot-Commodity-logo-1.png",
    defaultPrice: 63.03,
    exchange: { name: "Commodity", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg" },
  },

  // ─── FX Rates ─────────────────────────────────────────────────────
  {
    id: 4,
    name: "Canadian Dollar",
    symbol: "CAD/USD",
    provider: "diaData",
    category: "fx",
    assetType: ASSET_FX,
    endpoint: "https://api.diadata.org/v1/rwa/Fiat/CAD-USD",
    description: "Canadian Dollar exchange rate vs USD. Closely tied to oil prices due to Canada's energy exports. A key barometer of North American trade flows.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Canadian-Dollar-FX-Rate-logo.png",
    defaultPrice: 0.7186,
    exchange: { name: "Canada" },
  },
  {
    id: 5,
    name: "Australian Dollar",
    symbol: "AUD/USD",
    provider: "diaData",
    category: "fx",
    assetType: ASSET_FX,
    endpoint: "https://api.diadata.org/v1/rwa/Fiat/AUD-USD",
    description: "Australian Dollar exchange rate vs USD. Sensitive to commodity prices, China trade data, and RBA monetary policy. Often called a commodity currency.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Australian-Dollar-logo-FX-rate.png",
    defaultPrice: 0.6684,
    exchange: { name: "Australia" },
  },
  {
    id: 6,
    name: "Chinese Yuan",
    symbol: "CNY/USD",
    provider: "diaData",
    category: "fx",
    assetType: ASSET_FX,
    endpoint: "https://api.diadata.org/v1/rwa/Fiat/CNY-USD",
    description: "Chinese Yuan exchange rate vs USD. Managed by the PBOC with a daily reference rate. Reflects China's economic outlook and U.S.-China trade dynamics.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Chinese-Yuan-logo-FX.png",
    defaultPrice: 0.1432,
    exchange: { name: "China" },
  },

  // ─── ETFs ─────────────────────────────────────────────────────────
  {
    id: 7,
    name: "20+ Year Treasury Bond ETF",
    symbol: "TLT",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/TLT",
    description: "Tracks long-duration U.S. Treasury bonds (20+ years). Highly sensitive to interest rate expectations — rises when rates fall, drops when they rise. A core macro hedge.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/20-Year-Treasury-Bond-ETF-iShares-ETF-logo.png",
    defaultPrice: 87.92,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 8,
    name: "1-3 Year Treasury Bond ETF",
    symbol: "SHY",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/SHY",
    description: "Tracks short-duration U.S. Treasuries (1–3 years). Low volatility, near-cash equivalent. Used as a safe haven during market turmoil.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/1-3-Year-Treasury-Bond-ETF-iShares-logo.png",
    defaultPrice: 82.84,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 9,
    name: "Short-Term Treasury Fund",
    symbol: "VGSH",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/VGSH",
    description: "Vanguard's short-term Treasury fund. Minimal credit risk, low duration. Popular for parking capital with Treasury-grade safety and modest yield.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-Short-Term-Treasury-Fund-ETF-logo-1.png",
    defaultPrice: 58.74,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 10,
    name: "U.S. Treasury Bond ETF",
    symbol: "GOVT",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/GOVT",
    description: "Broad U.S. Treasury bond exposure across all maturities. A diversified government bond fund used as a benchmark for fixed-income allocation.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-U.S.-Treasury-Bond-ETF-logo.png",
    defaultPrice: 23.06,
    exchange: { name: "Bats", icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg" },
  },
  {
    id: 11,
    name: "Bitcoin & Ether ETF",
    symbol: "BETH",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/BETH",
    description: "Market-cap-weighted blend of Bitcoin and Ethereum exposure. Provides diversified crypto access in a single regulated ETF. Rebalances automatically.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/ProShares-Bitcoin-Ether-Market-Cap-Weight-ETF-logo.png",
    defaultPrice: 52.66,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
  {
    id: 12,
    name: "Ethereum Trust iShares",
    symbol: "ETHA",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/ETHA",
    description: "BlackRock's spot Ethereum ETF. Direct ETH price exposure through traditional brokerage accounts. A gateway for institutional Ethereum adoption.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-Ethereum-Trust-ETHA-ETF-logo.png",
    defaultPrice: 23.19,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 13,
    name: "Bitcoin Strategy ETF",
    symbol: "BITO",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/BITO",
    description: "First U.S. Bitcoin-linked ETF, uses CME futures contracts. Tracks BTC price trends but may diverge due to futures roll costs. High-volume crypto proxy.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/ProShares-Bitcoin-Strategy-ETF-logo.png",
    defaultPrice: 12.52,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
  {
    id: 14,
    name: "Bitcoin Trust Grayscale",
    symbol: "GBTC",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/GBTC",
    description: "Grayscale's flagship Bitcoin fund, now a spot BTC ETF. Oldest and most recognizable crypto trust. Historically traded at premiums or discounts to NAV.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Grayscale-Bitcoin-Trust-BTC-ETF-LOGO.png",
    defaultPrice: 70.48,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
  {
    id: 15,
    name: "Bitcoin ETF VanEck",
    symbol: "HODL",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/HODL",
    description: "VanEck's spot Bitcoin ETF. Competitive fee structure with direct BTC custody. Named after the crypto community's long-term holding ethos.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/VanEck-Bitcoin-ETF-LOGO.png",
    defaultPrice: 25.52,
    exchange: { name: "Bats", icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg" },
  },
  {
    id: 16,
    name: "Bitcoin ETF Ark 21Shares",
    symbol: "ARKB",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/ARKB",
    description: "Cathie Wood's Ark Invest partnered with 21Shares for spot Bitcoin exposure. Appeals to growth-oriented investors seeking disruptive technology themes.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Ark-21Shares-Bitcoin-ETF-logo.png",
    defaultPrice: 29.95,
    exchange: { name: "Bats", icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg" },
  },
  {
    id: 17,
    name: "Bitcoin Index Fund Fidelity",
    symbol: "FBTC",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/FBTC",
    description: "Fidelity's spot Bitcoin ETF with self-custody via Fidelity Digital Assets. Backed by one of the world's largest asset managers. Low-fee institutional grade.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Fidelity-Wise-Origin-Bitcoin-Index-Fund-ETF-logo.png",
    defaultPrice: 78.60,
    exchange: { name: "Bats", icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg" },
  },
  {
    id: 18,
    name: "Bitcoin Trust iShares",
    symbol: "IBIT",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/IBIT",
    description: "BlackRock's spot Bitcoin ETF — the largest BTC fund by AUM. Industry's most liquid Bitcoin vehicle. The benchmark for institutional crypto allocation.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-Bitcoin-Trust-ETF-logo.png",
    defaultPrice: 51.17,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 19,
    name: "QQQ Trust Invesco",
    symbol: "QQQ",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/QQQ",
    description: "Tracks the Nasdaq-100 index — the 100 largest non-financial Nasdaq companies. Heavy tech weighting (Apple, Microsoft, NVIDIA). A proxy for U.S. tech momentum.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Invesco-QQQ-Trust-ETF-logo.png",
    defaultPrice: 626.66,
    exchange: { name: "Nasdaq", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg" },
  },
  {
    id: 20,
    name: "Total Stock Market ETF",
    symbol: "VTI",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/VTI",
    description: "Covers the entire U.S. equity market — large, mid, small, and micro cap. ~3,600 stocks in one fund. The broadest single measure of U.S. stock performance.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-Total-Stock-Market-ETF-logo-1.png",
    defaultPrice: 342.37,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
  {
    id: 21,
    name: "S&P 500 ETF SPDR",
    symbol: "SPY",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/SPY",
    description: "The original S&P 500 ETF and the world's most traded fund. Tracks 500 leading U.S. companies. The definitive benchmark for U.S. large-cap equities.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/spdr-sp-500-etf-trust-logo.png",
    defaultPrice: 693.99,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
  {
    id: 22,
    name: "S&P 500 ETF Vanguard",
    symbol: "VOO",
    provider: "diaData",
    category: "etf",
    assetType: ASSET_ETF,
    endpoint: "https://api.diadata.org/v1/rwa/ETF/VOO",
    description: "Vanguard's ultra-low-cost S&P 500 tracker. Same 500-stock index as SPY but with lower fees. Preferred by long-term buy-and-hold investors.",
    icon: "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-SP-500-ETF-Vanguard.png",
    defaultPrice: 638.25,
    exchange: { name: "NYSE", icon: "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg" },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────

export function getDataSourceById(id: number): DataSource | undefined {
  return DATA_SOURCES.find((ds) => ds.id === id);
}

export function getDataSourcesByCategory(
  category: DataSource["category"]
): DataSource[] {
  return DATA_SOURCES.filter((ds) => ds.category === category);
}

export function getDataSourcesByAssetType(assetType: number): DataSource[] {
  return DATA_SOURCES.filter((ds) => (ds.assetType & assetType) !== 0);
}

export function generateMarketQuestion(
  source: DataSource,
  targetPrice: number,
  conditionAbove: boolean
): string {
  const direction = conditionAbove ? "above" : "below";
  return `Will ${source.name} (${source.symbol}) be ${direction} $${targetPrice.toLocaleString()}?`;
}
