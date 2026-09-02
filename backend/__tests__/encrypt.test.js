const { encrypt, decrypt, contentHash, hashEmergencyToken } = require("../utils/encrypt");

describe("Encryption Utilities", () => {
  test("encrypt and decrypt roundtrip preserves string and object payloads", () => {
    const textData = "Secret Medical Record for Patient 001";
    const encryptedText = encrypt(textData);
    expect(encryptedText).toContain(":");
    const decryptedText = decrypt(encryptedText);
    expect(decryptedText).toBe(textData);

    const objectData = {
      blood_pressure: "120/80",
      heart_rate: 72,
      diagnosis: "Healthy",
    };
    const encryptedObj = encrypt(objectData);
    const decryptedObj = decrypt(encryptedObj);
    expect(decryptedObj).toEqual(objectData);
  });

  test("contentHash generates consistent SHA-256 hash", () => {
    const data = { patientId: "PAT-001", records: [1, 2, 3] };
    const hash1 = contentHash(data);
    const hash2 = contentHash(data);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  test("hashEmergencyToken creates valid sha256 hex string", () => {
    const token = "EMERGENCY_TOKEN_XYZ_123";
    const hashed = hashEmergencyToken(token);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(hashed).toBe(hashEmergencyToken(token));
  });
});
