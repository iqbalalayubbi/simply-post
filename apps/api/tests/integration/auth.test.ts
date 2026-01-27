import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, prisma } from "../utils/testHelper";

describe("Auth routes", () => {
  const base = "/api/auth";

  // Bersihkan DB sebelum semua test jalan
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("register should 201", async () => {
    const res = await request(app).post(`${base}/register`).send({
      username: "tester1",
      email: "tester1@example.com",
      password: "Password123!",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
  });

  it("login should 200 and return tokens", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ identifier: "tester1@example.com", password: "Password123!" });
    expect(res.status).toBe(200);
    expect(res.body.data?.token).toBeTruthy();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("change-password should 200", async () => {
    await request(app).post(`${base}/register`).send({
      username: "tester2",
      email: "tester2@example.com",
      password: "OldPass123!",
    });

    const login = await request(app)
      .post(`${base}/login`)
      .send({ identifier: "tester2@example.com", password: "OldPass123!" });

    const token = login.body.data?.token;

    const res = await request(app)
      .post(`${base}/change-password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_password: "OldPass123!",
        new_password: "NewPass123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBe(true);
  });

  it("change-password should 401 without token", async () => {
    const res = await request(app).post(`${base}/change-password`).send({
      old_password: "OldPass123!",
      new_password: "NewPass123!",
    });

    expect(res.status).toBe(401);
  });

  it("change-password should 401 when old password is wrong", async () => {
    await request(app).post(`${base}/register`).send({
      username: "tester3",
      email: "tester3@example.com",
      password: "OldPass123!",
    });

    const login = await request(app)
      .post(`${base}/login`)
      .send({ identifier: "tester3@example.com", password: "OldPass123!" });

    const token = login.body.data?.token;

    const res = await request(app)
      .post(`${base}/change-password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_password: "WrongOld123!",
        new_password: "NewPass123!",
      });

    expect(res.status).toBe(401);
  });

  it("refresh-token should 200", async () => {
    const login = await request(app)
      .post(`${base}/login`)
      .send({ identifier: "tester1@example.com", password: "Password123!" });
    const refreshCookie = login.headers["set-cookie"];
    const res = await request(app)
      .get(`${base}/refresh-token`)
      .set("Cookie", refreshCookie);
    expect(res.status).toBe(200);
    expect(res.body.data?.token).toBeTruthy();
  });

  it("logout should 200", async () => {
    const res = await request(app).post(`${base}/logout`);
    expect(res.status).toBe(200);
  });
});
