const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HealthRecord contract...");
  
  await hre.run("compile");

  const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");
  const contract = await HealthRecord.deploy();
  
  // Wait for deployment (works with both old and new ethers versions)
  await contract.waitForDeployment();
  
  const address = contract.target || contract.address;

  console.log("\n✅ HealthRecord deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Copy this address to backend/.env as HEALTH_CONTRACT_ADDRESS");
  console.log("2. Copy this address to frontend/.env as REACT_APP_CONTRACT_ADDRESS");
  console.log("\n💡 Example:");
  console.log(`   HEALTH_CONTRACT_ADDRESS=${address}`);
  console.log(`   REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error.message);
  if (error.message.includes("ECONNREFUSED")) {
    console.error("\n💡 Make sure Hardhat node is running:");
    console.error("   Run: npx hardhat node");
  }
  process.exitCode = 1;
});
