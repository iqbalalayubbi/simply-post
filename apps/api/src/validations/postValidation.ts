import z from "./zodConfig";

const createPostSchema = z.object({
  user_id: z.number(),
  caption: z.string().min(1, "Caption at least 1 characters"),
  image_url: z.string().optional(),
});

export { createPostSchema };
