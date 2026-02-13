import { encodeAbiParameters, keccak256, encodePacked } from "viem";
import { BITE } from "@skalenetwork/bite";
import { BITE_RPC_URL } from "@/config/chains";

// Singleton BITE instance — reused across calls
let biteInstance: InstanceType<typeof BITE> | null = null;

function getBite(): InstanceType<typeof BITE> {
  if (!biteInstance) {
    biteInstance = new BITE(BITE_RPC_URL);
  }
  return biteInstance;
}

/**
 * Encrypt a boolean direction using BITE v2 threshold encryption.
 *
 * 1. ABI-encode the boolean into a 32-byte hex string
 * 2. Encrypt the hex payload via the BITE SDK (BLS threshold encryption)
 * 3. Return the encrypted bytes as a hex string for on-chain submission
 *
 * At resolution the contract calls BITE.submitCTX which triggers the
 * BITE consensus nodes to decrypt, then calls onDecrypt with the
 * original abi.encode(bool) data.
 */
export async function encryptDirection(direction: boolean): Promise<`0x${string}`> {
  // Standard ABI encode — produces 32-byte padded value
  // Contract's onDecrypt does: abi.decode(decryptedArguments[i], (bool))
  const abiEncoded = encodeAbiParameters(
    [{ type: "bool" }],
    [direction]
  );

  try {
    const bite = getBite();
    const encrypted = await bite.encryptMessage(abiEncoded);

    // Ensure 0x prefix
    const hex = encrypted.startsWith("0x") ? encrypted : `0x${encrypted}`;
    return hex as `0x${string}`;
  } catch (err) {
    console.error("[BITE] Encryption failed, check RPC connectivity:", err);
    throw new Error("BITE encryption failed. Cannot submit position without encryption.");
  }
}

/**
 * Generate a unique hash for a position (useful for tracking)
 */
export function hashPosition(
  marketId: number,
  trader: string,
  deposit: bigint,
  nonce: number
): `0x${string}` {
  return keccak256(
    encodePacked(
      ["uint256", "address", "uint256", "uint256"],
      [BigInt(marketId), trader as `0x${string}`, deposit, BigInt(nonce)]
    )
  );
}
