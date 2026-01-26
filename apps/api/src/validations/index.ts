import {
  type UpdateUserDTO,
  registerSchema,
  loginSchema,
  updateUserSchema,
} from "./userValidation";
import { createPostSchema, getPostsSchema } from "./postValidation";

export {
  registerSchema,
  loginSchema,
  createPostSchema,
  getPostsSchema,
  updateUserSchema,
  type UpdateUserDTO,
};
