import request from "supertest";
import app from "../../src/app";
// import prisma from "../../src/config/prisma";
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
