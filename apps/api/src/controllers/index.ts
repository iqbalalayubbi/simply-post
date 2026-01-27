import {
  authService,
  commentService,
  jwtService,
  postService,
  userService,
} from "../services";
import AuthController from "./authController";
import PostController from "./postController";
import ProfileController from "./profileController";
import CommentController from "./commentController";
import UserController from "./userController";

const authController = new AuthController(authService, jwtService);
const postController = new PostController(postService);
const profileController = new ProfileController(userService);
const commentController = new CommentController(commentService);
const userController = new UserController(userService);

export {
  authController,
  postController,
  profileController,
  commentController,
  userController,
};
