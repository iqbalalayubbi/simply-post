import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, prisma } from "../utils/testHelper";

describe("Profile routes", () => {
  const authBase = "/api/auth";
  const profileBase = "/api/profile/me";
  let token: string;

  beforeAll(async () => {
    await cleanDatabase();

    await request(app).post(`${authBase}/register`).send({
      username: "profileuser",
      email: "profileuser@example.com",
      password: "Password123!",
    });

    const loginRes = await request(app).post(`${authBase}/login`).send({
      identifier: "profileuser@example.com",
      password: "Password123!",
    });

    token = loginRes.body.data?.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("should get profile and return 200", async () => {
    const res = await request(app)
      .get(profileBase)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      id: expect.any(Number),
      username: "profileuser",
      email: "profileuser@example.com",
    });
  });

  it("should update profile and return 200", async () => {
    const res = await request(app)
      .patch(profileBase)
      .set("Authorization", `Bearer ${token}`)
      .field("bio", "admin nih bos")
      .attach("avatar", Buffer.from("dummy image content"), {
        filename: "old.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.avatar_url).toMatch(/\.jpg$/);
  });

  it("should return 401 when token is missing (get profile)", async () => {
    const res = await request(app).get(profileBase);
    expect(res.status).toBe(401);
  });

  it("should return 401 when token is missing (update profile)", async () => {
    const res = await request(app).patch(profileBase).send({
      username: "noauth",
    });
    expect(res.status).toBe(401);
  });
});
