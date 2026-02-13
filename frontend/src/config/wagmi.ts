"use client";

import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { skaleBiteV2Sandbox } from "./chains";

export const config = createConfig({
  chains: [skaleBiteV2Sandbox],
  transports: {
    [skaleBiteV2Sandbox.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
