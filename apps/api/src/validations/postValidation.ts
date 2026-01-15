import z from "./zodConfig";

const createPostSchema = z.object({
  caption: z.string().min(1, "Caption at least 1 characters"),
  image_url: z.string().optional().nullable(),
});

const getPostsSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
});

export { createPostSchema, getPostsSchema };
