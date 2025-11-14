const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const patientId = "PAT001";
  const doctorAddress = "0x123..."; 

  const health = await hre.ethers.getContractAt("HealthRecord", contractAddress);

  const tx = await health.grantAccess(patientId, doctorAddress);
  await tx.wait();

  console.log("✔ Access granted to doctor:", doctorAddress);
}

main().catch(console.error);
