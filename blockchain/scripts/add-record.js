const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const patientId = "PAT001";
  const ipfsHash = "QmFakeIPFSHash123";
  const contentHash = "abc123contenthash456";

  const health = await hre.ethers.getContractAt("HealthRecord", contractAddress);

  const tx = await health.addRecord(patientId, ipfsHash, contentHash);
  await tx.wait();

  console.log("✔ Record added for:", patientId);
}

main().catch(console.error);
