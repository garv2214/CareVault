const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const patientId = "PAT001";

  const health = await hre.ethers.getContractAt("HealthRecord", contractAddress);

  const tx = await health.emergencyAccess(patientId, "Unconscious, low BP");
  await tx.wait();

  console.log("🚨 Emergency access triggered!");
}

main().catch(console.error);
