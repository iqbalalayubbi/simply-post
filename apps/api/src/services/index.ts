import AuthService from "./authService";
import JwtService from "./jwtService";
import UserService from "./userService";

const userService = new UserService();
const authService = new AuthService(userService);
const jwtService = new JwtService();

export { authService, jwtService };
