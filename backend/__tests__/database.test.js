const { load, save, resetDb, getDb, generateId } = require("../db/database");

describe("Database Module", () => {
  beforeEach(() => {
    resetDb();
  });

  test("load and getDb returns initialized structure with seeded doctors", () => {
    const db = getDb();
    expect(db).toBeDefined();
    expect(Array.isArray(db.users)).toBe(true);
    expect(Array.isArray(db.doctors)).toBe(true);
    expect(db.doctors.length).toBeGreaterThan(0);
    expect(Array.isArray(db.hospitals)).toBe(true);
    expect(Array.isArray(db.specialties)).toBe(true);
    expect(Array.isArray(db.articles)).toBe(true);
  });

  test("generateId produces unique prefixed identifiers", () => {
    const id1 = generateId("user");
    const id2 = generateId("user");
    expect(id1.startsWith("user-")).toBe(true);
    expect(id2.startsWith("user-")).toBe(true);
    expect(id1).not.toBe(id2);
  });

  test("save persists data updates", () => {
    const db = getDb();
    const testUser = { id: generateId("user"), name: "Test User", phone: "9998887770" };
    db.users.push(testUser);
    save();

    const reloaded = load();
    expect(reloaded.users.some((u) => u.id === testUser.id)).toBe(true);
  });
});
