import AuthService from "./authService";
import JwtService from "./jwtService";
import UserService from "./userService";
import MulterService from "./multerService";
import PostService from "./postService";
import CommentService from "./commentService";

const userService = new UserService();
const authService = new AuthService(userService);
const jwtService = new JwtService();
const multerService = new MulterService("photos");
const postService = new PostService();
const commentService = new CommentService();

export {
  authService,
  jwtService,
  multerService,
  postService,
  userService,
  commentService,
};
