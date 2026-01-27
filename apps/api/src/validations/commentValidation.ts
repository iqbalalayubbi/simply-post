import z from "./zodConfig";

const createCommentSchema = z.object({
  post_id: z.number(),
  content: z.string().min(1, "Caption at least 1 characters"),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;

export { createCommentSchema };
