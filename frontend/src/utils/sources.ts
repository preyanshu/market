// Legacy sources format - not used by app (see config/dataSources.ts)
interface LegacyDataSource {
  id: number;
  name: string;
  endpoint: string;
  ticker: string;
  price: string;
  icon: string;
  exchange: { label?: string; name: string; icon?: { url: string; width?: number; height?: number; alt?: string } | string };
  type: string;
}

export const TRUSTED_DATA_SOURCES: LegacyDataSource[] = [
    {
      "id": 12292,
      "name": "Natural Gas",
      "endpoint": "https://api.diadata.org/v1/rwa/Commodities/NG-USD",
      "ticker": "NG",
      "price": "3.169",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Natural-gas-Commodity-logo-1.png",
      "exchange": {
        "label": "Exchange",
        "name": "Commodity",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg",
          "width": 21,
          "height": 20,
          "alt": "Commodity icon (diamond)"
        }
      },
      "type": "Commodity"
    },
    {
      "id": 12288,
      "name": "Crude Oil",
      "endpoint": "https://api.diadata.org/v1/rwa/Commodities/WTI-USD",
      "ticker": "WTI",
      "price": "58.78",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Crude-Oil-WTI-Spot-Commodity-logo-1.png",
      "exchange": {
        "label": "Exchange",
        "name": "Commodity",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg",
          "width": 21,
          "height": 20,
          "alt": "Commodity icon (diamond)"
        }
      },
      "type": "Commodity"
    },
    {
      "id": 12286,
      "name": "Brent Oil",
      "endpoint": "https://api.diadata.org/v1/rwa/Commodities/XBR-USD",
      "ticker": "XBR",
      "price": "63.029999",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Brent-Spot-Commodity-logo-1.png",
      "exchange": {
        "label": "Exchange",
        "name": "Commodity",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Commodity.svg",
          "width": 21,
          "height": 20,
          "alt": "Commodity icon (diamond)"
        }
      },
      "type": "Commodity"
    },
    {
      "id": 12283,
      "name": "Canadian Dollar",
      "endpoint": "https://api.diadata.org/v1/rwa/Fiat/CAD-USD",
      "ticker": "CAD",
      "price": "0.71857664338478",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Canadian-Dollar-FX-Rate-logo.png",
      "exchange": {
        "label": "Region",
        "name": "Canada",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Canadian-Dollar-FX-Rate-logo.png",
          "width": 105,
          "height": 105,
          "alt": "Canadian Dollar FX Rate logo"
        }
      },
      "type": "FX rate"
    },
    {
      "id": 12281,
      "name": "Australian Dollar",
      "endpoint": "https://api.diadata.org/v1/rwa/Fiat/AUD-USD",
      "ticker": "AUD",
      "price": "0.66838664830831",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Australian-Dollar-logo-FX-rate.png",
      "exchange": {
        "label": "Region",
        "name": "Australia",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Australian-Dollar-logo-FX-rate.png",
          "width": 105,
          "height": 105,
          "alt": "Australian Dollar logo FX rate"
        }
      },
      "type": "FX rate"
    },
    {
      "id": 12279,
      "name": "Chinese Yuan",
      "endpoint": "https://api.diadata.org/v1/rwa/Fiat/CNY-USD",
      "ticker": "CNY",
      "price": "0.14322974480756",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Chinese-Yuan-logo-FX.png",
      "exchange": {
        "label": "Region",
        "name": "China",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Chinese-Yuan-logo-FX.png",
          "width": 105,
          "height": 105,
          "alt": "Chinese Yuan logo FX"
        }
      },
      "type": "FX rate"
    },
    {
      "id": 12276,
      "name": "20+ Year Treasury Bond ETF iShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/TLT",
      "ticker": "TLT",
      "price": "87.92",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/20-Year-Treasury-Bond-ETF-iShares-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12274,
      "name": "1-3 Year Treasury Bond ETF iShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/SHY",
      "ticker": "SHY",
      "price": "82.835",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/1-3-Year-Treasury-Bond-ETF-iShares-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12272,
      "name": "Short-Term Treasury Fund Vanguard",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/VGSH",
      "ticker": "VGSH",
      "price": "58.74",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-Short-Term-Treasury-Fund-ETF-logo-1.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12270,
      "name": "U.S. Treasury Bond ETF iShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/GOVT",
      "ticker": "GOVT",
      "price": "23.055",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-U.S.-Treasury-Bond-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Bats",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg",
          "width": 20,
          "height": 20,
          "alt": "Bats exchange logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12268,
      "name": "Bitcoin & Ether Market Cap Weight ETF ProShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/BETH",
      "ticker": "BETH",
      "price": "52.66",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/ProShares-Bitcoin-Ether-Market-Cap-Weight-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12266,
      "name": "Ethereum Trust ETHA iShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/ETHA",
      "ticker": "ETHA",
      "price": "23.19",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-Ethereum-Trust-ETHA-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12264,
      "name": "Bitcoin Strategy ETF ProShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/BITO",
      "ticker": "BITO",
      "price": "12.515",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/ProShares-Bitcoin-Strategy-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12262,
      "name": "Bitcoin Trust (BTC) Grayscale",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/GBTC",
      "ticker": "GBTC",
      "price": "70.475",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Grayscale-Bitcoin-Trust-BTC-ETF-LOGO.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12260,
      "name": "Bitcoin ETF VanEck",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/HODL",
      "ticker": "HODL",
      "price": "25.52",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/VanEck-Bitcoin-ETF-LOGO.png",
      "exchange": {
        "label": "Exchange",
        "name": "Bats",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg",
          "width": 20,
          "height": 20,
          "alt": "Bats exchange logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12258,
      "name": "Bitcoin ETF Ark 21Shares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/ARKB",
      "ticker": "ARKB",
      "price": "29.95",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Ark-21Shares-Bitcoin-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Bats",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg",
          "width": 20,
          "height": 20,
          "alt": "Bats exchange logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12255,
      "name": "Bitcoin Index Fund Fidelity Wise Origin",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/FBTC",
      "ticker": "FBTC",
      "price": "78.6",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Fidelity-Wise-Origin-Bitcoin-Index-Fund-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Bats",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/08/Bats.svg",
          "width": 20,
          "height": 20,
          "alt": "Bats exchange logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12251,
      "name": "Bitcoin Trust iShares",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/IBIT",
      "ticker": "IBIT",
      "price": "51.17",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/iShares-Bitcoin-Trust-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12249,
      "name": "QQQ Trust Invesco",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/QQQ",
      "ticker": "QQQ",
      "price": "626.65997",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Invesco-QQQ-Trust-ETF-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "Nasdaq",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/Nasdaq.svg",
          "width": 40,
          "height": 40,
          "alt": "Nasdaq"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12247,
      "name": "Total Stock Market ETF Vanguard",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/VTI",
      "ticker": "VTI",
      "price": "342.36499",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-Total-Stock-Market-ETF-logo-1.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12245,
      "name": "S&P 500 ETF Trust SPDR",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/SPY",
      "ticker": "SPY",
      "price": "693.98999",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/spdr-sp-500-etf-trust-logo.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    },
    {
      "id": 12243,
      "name": "S&P 500 ETF Vanguard",
      "endpoint": "https://api.diadata.org/v1/rwa/ETF/VOO",
      "ticker": "VOO",
      "price": "638.25",
      "icon": "https://cms3.diadata.org/wp-content/uploads/2025/08/Vanguard-SP-500-ETF-Vanguard.png",
      "exchange": {
        "label": "Exchange",
        "name": "NYSE",
        "icon": {
          "url": "https://cms3.diadata.org/wp-content/uploads/2025/02/NYSE.svg",
          "width": 40,
          "height": 40,
          "alt": "NYSE logo"
        }
      },
      "type": "ETF"
    }
  ];