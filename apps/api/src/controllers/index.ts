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

const authController = new AuthController(authService, jwtService);
const postController = new PostController(postService);
const profileController = new ProfileController(userService);
const commentController = new CommentController(commentService);

export { authController, postController, profileController, commentController };
