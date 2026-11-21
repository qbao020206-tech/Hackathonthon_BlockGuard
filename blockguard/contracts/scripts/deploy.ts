import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("==========================================");
  console.log("Deploying AuditRegistry to Avalanche Fuji (43113)...");
  console.log("==========================================");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "AVAX");

  const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
  const registry = await AuditRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("✅ AuditRegistry successfully deployed to:", address);
  console.log("🔗 Snowtrace Explorer:", `https://testnet.snowtrace.io/address/${address}`);

  // Export Artifact & Address to frontend & backend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AuditRegistry.sol/AuditRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const exportData = {
      address: address,
      network: "Avalanche Fuji",
      chainId: 43113,
      abi: artifact.abi,
    };

    const targetDirs = [
      path.join(__dirname, "../../frontend/src/contracts"),
      path.join(__dirname, "../../backend/src/contracts"),
    ];

    for (const dir of targetDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(dir, "AuditRegistry.json"),
        JSON.stringify(exportData, null, 2)
      );
      console.log(`📁 Synced ABI and contract address to ${dir}`);
    }
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
