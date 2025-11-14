const { expect } = require("chai");

describe("HealthRecord Contract", function () {
  it("Should deploy correctly", async function () {
    const Factory = await ethers.getContractFactory("HealthRecord");
    const contract = await Factory.deploy();
    await contract.deployed();

    expect(contract.address).to.properAddress;
  });

  it("Should add a record", async function () {
    const Factory = await ethers.getContractFactory("HealthRecord");
    const contract = await Factory.deploy();

    await contract.addRecord("PAT001", "hash123");

    const ids = await contract.getRecordIdsForPatient("PAT001");

    expect(ids.length).to.equal(1);
  });
});
