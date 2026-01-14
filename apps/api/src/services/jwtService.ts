import { config } from "../config";
import { ForbiddenError } from "../libs/appError";
import { JwtPayload } from "../types";
import jwt from "jsonwebtoken";

class JwtService {
  generateTokens(jwtPayload: JwtPayload) {
    const accessToken = jwt.sign(jwtPayload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(jwtPayload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  verifyToken({
    token,
    tokenType,
  }: {
    token: string;
    tokenType: "access" | "refresh";
  }) {
    try {
      const secretKey =
        tokenType === "access"
          ? config.JWT_ACCESS_SECRET
          : config.JWT_REFRESH_SECRET;

      const jwtPayload: JwtPayload = jwt.verify(token, secretKey) as JwtPayload;
      return jwtPayload;
    } catch (error) {
      throw new ForbiddenError("Token is invalid or expired");
    }
  }
}

export default JwtService;
