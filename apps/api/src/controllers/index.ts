import { authService, jwtService, postService, userService } from "../services";
import AuthController from "./authController";
import PostController from "./postController";
import ProfileController from "./profileController";

const authController = new AuthController(authService, jwtService);
const postController = new PostController(postService);
const profileController = new ProfileController(userService);

export { authController, postController, profileController };
