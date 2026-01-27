import {
  type UpdateUserDTO,
  type UpdatePasswordDTO,
  registerSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
} from "./userValidation";
import {
  type CreateCommentDTO,
  createCommentSchema,
} from "./commentValidation";
import { createPostSchema, getPostsSchema } from "./postValidation";

export {
  registerSchema,
  loginSchema,
  createPostSchema,
  getPostsSchema,
  updateUserSchema,
  updatePasswordSchema,
  createCommentSchema,
  type UpdateUserDTO,
  type UpdatePasswordDTO,
  type CreateCommentDTO,
};
