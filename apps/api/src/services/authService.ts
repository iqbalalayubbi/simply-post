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
}

export default AuthService;
