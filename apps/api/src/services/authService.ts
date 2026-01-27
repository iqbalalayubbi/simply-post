import { jwtService } from ".";
import { UnauthorizedError, ValidationError } from "../libs/appError";
import { User } from "../models";
import { UpdatePasswordDTO } from "../validations";
import UserService from "./userService";
import bcrypt from "bcrypt";

class AuthService {
  constructor(private userService: UserService) {}

  register = async (user: User) => {
    const hashPassword = bcrypt.hashSync(
      user.password,
      parseInt(process.env.SALT_PASSWORD as string),
    );
    const userData = { ...user, password: hashPassword };
    const newUser = await this.userService.create(userData);
    return newUser;
  };

  login = async (userLogin: { identifier: string; password: string }) => {
    // username | email
    const userFilter = userLogin.identifier.includes("@")
      ? { email: userLogin.identifier }
      : { username: userLogin.identifier };
    const userValid: User = await this.userService.getUser(userFilter, false);

    if (userValid) {
      const isPasswordValid = bcrypt.compareSync(
        userLogin.password,
        userValid.password,
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
  };

  changePassword = async (userId: number, data: UpdatePasswordDTO) => {
    const userData = await this.userService.getUserData(userId);
    const { old_password: oldPassword, new_password: newPassword } = data;

    const isPasswordValid = bcrypt.compareSync(oldPassword, userData.password);

    if (!isPasswordValid) throw new UnauthorizedError("Incorrect old password");

    if (oldPassword === newPassword) {
      throw new ValidationError(
        "New password cannot be the same as old password",
      );
    }

    const newHashPassword = bcrypt.hashSync(
      newPassword,
      parseInt(process.env.SALT_PASSWORD as string) || 10,
    );

    await this.userService.updatePasswordHash(userId, newHashPassword);

    return true;
  };
}

export default AuthService;
