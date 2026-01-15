import { authService, jwtService, postService } from "../services";
import AuthController from "./authController";
import PostController from "./postController";

const authController = new AuthController(authService, jwtService);
const postController = new PostController(postService);

export { authController, postController };
