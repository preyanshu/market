import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Pre-deployed USDC on SKALE BITE V2 Sandbox (6 decimals)
  const USDC_ADDRESS = "0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8";

  // Deploy BeliefMarket
  console.log("\nDeploying BeliefMarket...");
  const BeliefMarket = await ethers.getContractFactory("BeliefMarket");
  const beliefMarket = await BeliefMarket.deploy(USDC_ADDRESS);
  await beliefMarket.waitForDeployment();
  const beliefMarketAddress = await beliefMarket.getAddress();
  console.log("BeliefMarket deployed at:", beliefMarketAddress);

  console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
  console.log("Network:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("\n=== UPDATE FRONTEND ===");
  console.log(`BELIEF_MARKET_ADDRESS = "${beliefMarketAddress}"`);
  console.log(`USDC_ADDRESS = "${USDC_ADDRESS}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
