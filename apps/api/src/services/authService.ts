import { jwtService } from ".";
import { UnauthorizedError } from "../libs/appError";
import { User } from "../models";
import UserService from "./userService";
import bcrypt from "bcrypt";

class AuthService {
  constructor(private userService: UserService) {}

  async register(user: User) {
    const hashPassword = bcrypt.hashSync(
      user.password,
      parseInt(process.env.SALT_PASSWORD as string)
    );
    const userData = { ...user, password: hashPassword };
    const newUser = await this.userService.create(userData);
    return newUser;
  }

  async login(userLogin: { identifier: string; password: string }) {
    // username | email
    const userFilter = userLogin.identifier.includes("@")
      ? { email: userLogin.identifier }
      : { username: userLogin.identifier };
    const userValid: User = await this.userService.getUser(userFilter, false);

    if (userValid) {
      const isPasswordValid = bcrypt.compareSync(
        userLogin.password,
        userValid.password
      );

      if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

      const { password, ...safeUserData } = userValid;
      const jwtPayload = {
        id: userValid.id,
        email: userValid.email,
        username: userValid.username,
      };
      const userTokens = jwtService.generateTokens(jwtPayload);

      return {
        user: safeUserData,
        ...userTokens,
      };
    }

    return null;
  }
}

export default AuthService;
