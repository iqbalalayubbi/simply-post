import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, prisma } from "../utils/testHelper";

describe("User follow routes", () => {
  const authBase = "/api/auth";
  const userBase = "/api/users";
  let token1: string;
  let token2: string;
  let user1Id: number;
  let user2Id: number;
  let username1: string;

  beforeAll(async () => {
    await cleanDatabase();

    const reg1 = await request(app).post(`${authBase}/register`).send({
      username: "follower1",
      email: "follower1@example.com",
      password: "Password123!",
    });
    user1Id = reg1.body.data?.id;
    username1 = reg1.body.data?.username;

    const login1 = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "follower1@example.com", password: "Password123!" });
    token1 = login1.body.data?.token;

    const reg2 = await request(app).post(`${authBase}/register`).send({
      username: "follower2",
      email: "follower2@example.com",
      password: "Password123!",
    });
    user2Id = reg2.body.data?.id;

    const login2 = await request(app)
      .post(`${authBase}/login`)
      .send({ identifier: "follower2@example.com", password: "Password123!" });
    token2 = login2.body.data?.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it("should follow another user and return 200", async () => {
    const res = await request(app)
      .post(`${userBase}/${user2Id}/follow`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({ isFollowing: true });
  });

  it("should get followers of current user and return 200", async () => {
    const res = await request(app)
      .get(`${userBase}/followers`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: user1Id, username: "follower1" }),
      ]),
    );
  });

  it("should get following list of current user and return 200", async () => {
    const res = await request(app)
      .get(`${userBase}/following`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: user2Id, username: "follower2" }),
      ]),
    );
  });

  it("should unfollow user and return 200", async () => {
    const res = await request(app)
      .post(`${userBase}/${user2Id}/follow`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({ isFollowing: false });
  });

  it("should return 400 when following yourself", async () => {
    const res = await request(app)
      .post(`${userBase}/${user1Id}/follow`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/follow yourself/i);
  });

  it("should return 404 when user not found", async () => {
    const res = await request(app)
      .post(`${userBase}/999999/follow`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it("should return 401 when token missing on follow", async () => {
    const res = await request(app).post(`${userBase}/${user2Id}/follow`);
    expect(res.status).toBe(401);
  });

  it("should return 401 when token missing on followers", async () => {
    const res = await request(app).get(`${userBase}/followers`);
    expect(res.status).toBe(401);
  });

  it("should return 401 when token missing on following", async () => {
    const res = await request(app).get(`${userBase}/following`);
    expect(res.status).toBe(401);
  });

  it("should get interactions and return 200", async () => {
    const res = await request(app)
      .get(`${userBase}/${username1}/interactions`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toMatchObject({
      totalFollowers: expect.any(Number),
      totalFollowings: expect.any(Number),
    });
  });
});
