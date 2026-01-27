import {
  type UpdateUserDTO,
  type UpdatePasswordDTO,
  registerSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
} from "./userValidation";
import { createPostSchema, getPostsSchema } from "./postValidation";

export {
  registerSchema,
  loginSchema,
  createPostSchema,
  getPostsSchema,
  updateUserSchema,
  updatePasswordSchema,
  type UpdateUserDTO,
  type UpdatePasswordDTO,
};
