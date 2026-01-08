import { prisma } from "../config";
import { PrismaErrorCode } from "../enums";
import { Prisma } from "../generated/prisma/client";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../libs/appError";
import { User } from "../models";

class UserService {
  async create(user: User) {
    const defaultAvatar = "https://avatar.iran.liara.run/public/34";

    try {
      const userData = await prisma.user.create({
        data: { ...user, avatar_url: defaultAvatar },
        omit: {
          password: true,
        },
      });

      return userData;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new ValidationError(
          "Invalid data format or missing required fields"
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorCode.UNIQUE_CONSTRAINT:
            const meta = error.meta as any;
            const constraintFields =
              meta?.driverAdapterError?.cause?.constraint?.fields;
            throw new ConflictError(`${constraintFields[0]} already exist`);

          case PrismaErrorCode.NULL_CONSTRAINT:
            throw new ValidationError("Required field is missing");

          default:
            throw new InternalServerError("Database operation failed");
        }
      }
      throw new InternalServerError("Failed to create user");
    }
  }

  async getUser(id: number) {
    try {
      const userData = prisma.user.findFirst({
        where: { id },
        omit: { password: true },
      });

      if (!userData) {
        throw new NotFoundError("User not found");
      }

      return userData;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorCode.NULL_CONSTRAINT:
            throw new ValidationError("Required field is missing");

          default:
            throw new InternalServerError("Database operation failed");
        }
      }

      throw new InternalServerError("Failed to get user data");
    }
  }
}

export default UserService;
