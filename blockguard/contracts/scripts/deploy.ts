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
  const tx = registry.deploymentTransaction();
  const txHash = tx ? tx.hash : "";

  console.log("✅ AuditRegistry successfully deployed to:", address);
  console.log("📜 Transaction Hash:", txHash);
  console.log("🔗 Snowtrace Explorer:", `https://testnet.snowtrace.io/address/${address}`);

  // 1. Save deployments/fuji.json
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  const deploymentInfo = {
    address: address,
    network: "avalanche-fuji",
    chainId: 43113,
    txHash: txHash,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(deploymentsDir, "fuji.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`📁 Saved deployment record to ${path.join(deploymentsDir, "fuji.json")}`);

  // 2. Export Artifact & Address to frontend & backend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AuditRegistry.sol/AuditRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const exportData = {
      address: address,
      network: "avalanche-fuji",
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

  // 3. Update frontend .env & web3.ts
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env");
  const frontendEnvContent = `VITE_API_URL=http://localhost:3001\nVITE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc\nVITE_CONTRACT_ADDRESS=${address}\n`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log(`📁 Updated ${frontendEnvPath}`);

  // 4. Update backend .env
  const backendEnvPath = path.join(__dirname, "../../backend/.env");
  const backendEnvContent = `PORT=3001\nCORS_ORIGIN=*\nFUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc\nREGISTRY_CONTRACT_ADDRESS=${address}\n`;
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log(`📁 Updated ${backendEnvPath}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
