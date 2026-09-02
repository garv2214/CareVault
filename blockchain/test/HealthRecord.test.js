const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthRecord Contract", function () {
  let contract, owner, doctor, responder, unauthorized;

  beforeEach(async function () {
    [owner, doctor, responder, unauthorized] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("HealthRecord");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("Should deploy correctly and set admin", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    expect(await contract.admin()).to.equal(owner.address);
  });

  it("Should register patient and add record with content hash", async function () {
    await contract.registerPatient("PAT001");
    await contract.addRecord("PAT001", "ipfsHash123", "contentHash456");

    const ids = await contract.getRecordIdsForPatient("PAT001");
    expect(ids.length).to.equal(1);

    const owner_addr = await contract.getPatientOwner("PAT001");
    expect(owner_addr).to.equal(owner.address);

    const record = await contract.getRecordById(0);
    expect(record[1]).to.equal("PAT001");
    expect(record[2]).to.equal("ipfsHash123");
    expect(record[3]).to.equal("contentHash456");
  });

  it("Should prevent duplicate registration of same patientId or wallet", async function () {
    await contract.registerPatient("PAT001");
    await expect(contract.connect(doctor).registerPatient("PAT001")).to.be.revertedWith("Patient already registered");
    await expect(contract.registerPatient("PAT002")).to.be.revertedWith("Wallet already linked");
  });

  it("Should grant, check, and revoke access correctly", async function () {
    await contract.registerPatient("PAT001");
    const expires = Math.floor(Date.now() / 1000) + 3600;
    await contract.grantAccess("PAT001", doctor.address, expires);

    expect(await contract.hasAccess("PAT001", doctor.address)).to.equal(true);
    expect(await contract.hasAccess("PAT001", unauthorized.address)).to.equal(false);

    // Revoke
    await contract.revokeAccess("PAT001", doctor.address);
    expect(await contract.hasAccess("PAT001", doctor.address)).to.equal(false);
  });

  it("Should handle emergency authorization and responder access", async function () {
    await contract.registerPatient("PAT001");
    await contract.authorizeEmergency("PAT001", responder.address);
    expect(await contract.isEmergencyAuthorized("PAT001", responder.address)).to.equal(true);

    await contract.connect(responder).emergencyAccess("PAT001", "Cardiac emergency");

    // Deauthorize
    await contract.deauthorizeEmergency("PAT001", responder.address);
    expect(await contract.isEmergencyAuthorized("PAT001", responder.address)).to.equal(false);
    await expect(
      contract.connect(responder).emergencyAccess("PAT001", "Cardiac emergency")
    ).to.be.revertedWith("Not emergency-authorized");
  });

  it("Should handle break-glass emergency access with token validation", async function () {
    await contract.registerPatient("PAT001");
    const secretToken = "SECRET_EMERGENCY_KEY_999";
    const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(secretToken));

    await contract.setEmergencyToken("PAT001", hashedToken);

    // Valid break glass access by unauthorized responder with right token
    await contract.connect(unauthorized).breakGlassAccess("PAT001", hashedToken, "Patient unconscious on highway");

    // Invalid token attempt
    const wrongHashed = ethers.keccak256(ethers.toUtf8Bytes("WRONG_TOKEN"));
    await expect(
      contract.connect(unauthorized).breakGlassAccess("PAT001", wrongHashed, "Unauthorized attempt")
    ).to.be.revertedWith("Invalid emergency token");
  });

  it("Should maintain on-chain audit trail", async function () {
    await contract.registerPatient("PAT001");
    await contract.addRecord("PAT001", "ipfs-abc", "sha-123");
    await contract.grantAccess("PAT001", doctor.address, 0);

    const count = await contract.getAuditLogCount();
    expect(Number(count)).to.be.greaterThanOrEqual(3);

    const firstEntry = await contract.getAuditEntry(0);
    expect(firstEntry[1]).to.equal("PAT001");
    expect(firstEntry[3]).to.equal("PATIENT_REGISTERED");
  });
});
