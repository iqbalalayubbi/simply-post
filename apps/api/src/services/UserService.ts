import path from "path";
import fs from "fs";
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
import { UpdateUserDTO } from "../validations";

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
          "Invalid data format or missing required fields",
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

  async getUser(
    filter: { id?: number; email?: string; username?: string },
    omitPassword = true,
  ) {
    try {
      const userData = await prisma.user.findFirst({
        where: filter,
        omit: { password: omitPassword },
      });

      if (!userData) throw new NotFoundError("User not found");

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

      throw error;
    }
  }

  async updateUser(userId: number, data: UpdateUserDTO) {
    try {
      const userData = await prisma.user.findFirst({
        where: { id: userId },
      });

      if (!userData) throw new NotFoundError("User not found");

      const userAvatar = data.avatar_url;
      const oldImageUrl = userData.avatar_url;
      const updatePayload = { ...data, avatar_url: oldImageUrl };

      if (userAvatar) {
        if (oldImageUrl) {
          const oldFilePath = path.join(process.cwd(), "uploads", oldImageUrl);

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        updatePayload.avatar_url = userAvatar;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userData.id },
        data: updatePayload,
        omit: { password: true },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorCode.NULL_CONSTRAINT:
            throw new ValidationError("Required field is missing");
          default:
            throw new InternalServerError("Database operation failed");
        }
      }

      throw error;
    }
  }

  async updatePasswordHash(userId: number, newPasswordHash: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorCode.NULL_CONSTRAINT:
            throw new ValidationError("Required field is missing");
          default:
            throw new InternalServerError("Database operation failed");
        }
      }

      throw error;
    }
  }

  async getUserData(userId: number) {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) throw new NotFoundError("User not found");

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

      throw error;
    }
  }
}

export default UserService;
