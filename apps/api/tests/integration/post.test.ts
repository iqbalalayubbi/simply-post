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

  it("should get a post by id and return 200", async () => {
    // buat dulu sebuah post
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Lookup post")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "lookup.jpg",
        contentType: "image/jpeg",
      });

    const postId = created.body.data.id;

    const res = await request(app).get(`${postBase}/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      id: postId,
      caption: "Lookup post",
      user_id: expect.any(Number),
    });
  });

  it("should return 404 when post id is not found", async () => {
    const res = await request(app).get(`${postBase}/999999`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toMatch(/post not found/i);
  });

  it("should delete own post and return 200", async () => {
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Delete me")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "todelete.jpg",
        contentType: "image/jpeg",
      });

    const postId = created.body.data.id;

    const res = await request(app)
      .delete(`${postBase}/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    // optional: verify it is gone
    const getRes = await request(app).get(`${postBase}/${postId}`);
    expect(getRes.status).toBe(404);
  });

  it("should return 403 when deleting post of another user", async () => {
    // buat post oleh user utama
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Not yours");

    const postId = created.body.data.id;

    // user lain
    await request(app).post(`${authBase}/register`).send({
      username: "poster2",
      email: "poster2@example.com",
      password: "Password123!",
    });
    const loginRes = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "poster2@example.com", password: "Password123!" });
    const otherToken = loginRes.body.data?.token;

    const res = await request(app)
      .delete(`${postBase}/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("should return 404 when deleting non-existent post", async () => {
    const res = await request(app)
      .delete(`${postBase}/999999`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/post not found/i);
  });

  it("should update a post caption and return 200", async () => {
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Before update")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "before.jpg",
        contentType: "image/jpeg",
      });

    const postId = created.body.data.id;
    const oldImage = created.body.data.image_url;

    const res = await request(app)
      .patch(`${postBase}/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "After update");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      id: postId,
      caption: "After update",
      user_id: expect.any(Number),
    });
    expect(res.body.data.image_url).toBe(oldImage);
  });

  it("should update post image and return 200", async () => {
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Update image")
      .attach("photo", Buffer.from("dummy image content"), {
        filename: "old.jpg",
        contentType: "image/jpeg",
      });

    const postId = created.body.data.id;
    const oldImage = created.body.data.image_url;

    const res = await request(app)
      .patch(`${postBase}/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("photo", Buffer.from("new dummy image content"), {
        filename: "new.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      id: postId,
      caption: "Update image",
      user_id: expect.any(Number),
    });
    expect(res.body.data.image_url).toMatch(/\.jpg$/);
    expect(res.body.data.image_url).not.toBe(oldImage);
  });

  it("should return 404 when updating non-existent post", async () => {
    const res = await request(app)
      .patch(`${postBase}/999999`)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Nope");

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/post not found/i);
  });

  it("should return 401 when updating post of another user", async () => {
    const created = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Owned by poster1");

    const postId = created.body.data.id;

    await request(app).post(`${authBase}/register`).send({
      username: "poster3",
      email: "poster3@example.com",
      password: "Password123!",
    });
    const loginRes = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "poster3@example.com", password: "Password123!" });
    const otherToken = loginRes.body.data?.token;

    const res = await request(app)
      .patch(`${postBase}/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .field("caption", "Hacked");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("should return 401 when token is missing on update", async () => {
    const res = await request(app)
      .patch(`${postBase}/1`)
      .field("caption", "No auth update");

    expect(res.status).toBe(401);
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
