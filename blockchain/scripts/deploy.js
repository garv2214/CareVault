const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");
  const contract = await HealthRecord.deploy();
  await contract.deployed();

  console.log("HealthRecord deployed to:", contract.target ? contract.target : contract.address);
  // Print sample commands to interact
  console.log("Contract address:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
