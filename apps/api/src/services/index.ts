import AuthService from "./authService";
import UserService from "./userService";

const userService = new UserService();
const authService = new AuthService(userService);

export { authService };
