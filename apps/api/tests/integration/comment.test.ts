import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, prisma } from "../utils/testHelper";

describe("Comment routes", () => {
  const authBase = "/api/auth";
  const postBase = "/api/post";
  const commentBase = "/api/comments";
  let token: string;
  let otherToken: string;
  let postId: number;

  beforeAll(async () => {
    await cleanDatabase();

    // user utama
    await request(app).post(`${authBase}/register`).send({
      username: "commenter1",
      email: "commenter1@example.com",
      password: "Password123!",
    });

    const loginRes = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "commenter1@example.com", password: "Password123!" });

    token = loginRes.body.data?.token;

    // user lain
    await request(app).post(`${authBase}/register`).send({
      username: "commenter2",
      email: "commenter2@example.com",
      password: "Password123!",
    });

    const loginRes2 = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "commenter2@example.com", password: "Password123!" });

    otherToken = loginRes2.body.data?.token;

    // buat post
    const createdPost = await request(app)
      .post(postBase)
      .set("Authorization", `Bearer ${token}`)
      .field("caption", "Post for comments");

    postId = createdPost.body.data.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("should create a comment and return 201", async () => {
    const res = await request(app)
      .post(`${postBase}/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        post_id: postId,
        content: "Nice post!",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      post_id: postId,
      content: "Nice post!",
      user: {
        id: expect.any(Number),
        username: "commenter1",
      },
    });
  });

  it("should return 404 when creating comment on non-existent post", async () => {
    const res = await request(app)
      .post(`${postBase}/999999/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        post_id: 999999,
        content: "No post",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/post not found/i);
  });

  it("should return 401 when token is missing on create comment", async () => {
    const res = await request(app).post(`${postBase}/${postId}/comments`).send({
      post_id: postId,
      content: "No token",
    });

    expect(res.status).toBe(401);
  });

  it("should get comments by post id and return 200", async () => {
    const res = await request(app).get(`${postBase}/${postId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should delete comment by owner and return 200", async () => {
    const created = await request(app)
      .post(`${postBase}/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        post_id: postId,
        content: "Delete me",
      });

    const commentId = created.body.data.id;

    const res = await request(app)
      .delete(`${commentBase}/${commentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should return 401 when deleting comment without token", async () => {
    const created = await request(app)
      .post(`${postBase}/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        post_id: postId,
        content: "No auth delete",
      });

    const commentId = created.body.data.id;

    const res = await request(app).delete(`${commentBase}/${commentId}`);

    expect(res.status).toBe(401);
  });

  it("should return 401 when deleting comment by non-owner", async () => {
    const created = await request(app)
      .post(`${postBase}/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        post_id: postId,
        content: "Owned by commenter1",
      });

    const commentId = created.body.data.id;

    const res = await request(app)
      .delete(`${commentBase}/${commentId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("should return 404 when deleting non-existent comment", async () => {
    const res = await request(app)
      .delete(`${commentBase}/999999`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/comment not found/i);
  });
});
