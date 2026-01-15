import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, prisma } from "../utils/testHelper";

describe("Post routes", () => {
  const authBase = "/api/auth";
  const postBase = "/api/post";
  let token: string;

  beforeAll(async () => {
    await cleanDatabase();

    await request(app).post(`${authBase}/register`).send({
      username: "poster1",
      email: "poster1@example.com",
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "poster1@example.com", password: "Password123!" });

    token = loginRes.body.data?.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("should create a post with image and return 201", async () => {
    const res = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "My first post")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "dummy.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      caption: "My first post",
      image_url: expect.stringMatching(/\.jpg$/),
      user_id: expect.any(Number),
    });
  });

  it("should create a post without image (image_url optional) and return 201", async () => {
    const res = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Text only post");

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      caption: "Text only post",
      image_url: null,
      user_id: expect.any(Number),
    });
  });

  it("should fail validation when caption is empty", async () => {
    const res = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "dummy.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Caption at least 1 characters/);
  });

  it("should get posts with default pagination", async () => {
    // pastikan sudah ada minimal 1 post dari test sebelumnya
    const res = await request(app).get(postBase);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      currentPage: 1,
      totalPosts: expect.any(Number),
    });
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    expect(res.body.data.posts.length).toBeGreaterThanOrEqual(1);
  });

  it("should return 400 when query params are invalid", async () => {
    const res = await request(app).get(`${postBase}?limit=abc&page=1`);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toMatch(/number/i); // "Expected number, received string"
  });

  it("should return 401 when token is missing", async () => {
    const res = await request(app)
      .post(postBase)
      .field("caption", "No auth")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "dummy.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(401);
  });
});
