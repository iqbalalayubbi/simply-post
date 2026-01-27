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

  async toggleFollow(currentUserId: number, otherUserId: number) {
    try {
      if (currentUserId === otherUserId) {
        throw new ValidationError("You cannot follow yourself  ~_~");
      }

      // check other user
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
      });

      if (!otherUser) throw new NotFoundError("User not found");

      // check status follow
      const isFollowUser = await prisma.follow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: otherUserId,
          },
        },
      });

      if (isFollowUser) {
        // unfollow user
        await prisma.follow.delete({
          where: {
            follower_id_following_id: {
              follower_id: currentUserId,
              following_id: otherUserId,
            },
          },
        });
        return { isFollowing: false };
      } else {
        // follow
        await prisma.follow.create({
          data: {
            follower_id: currentUserId,
            following_id: otherUserId,
          },
        });

        return { isFollowing: true };
      }
    } catch (error) {
      throw error;
    }
  }

  async getFollowers(userId: number) {
    const followers = await prisma.follow.findMany({
      where: { following_id: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    return followers.map((item) => item.follower);
  }

  async getFollowing(userId: number) {
    const following = await prisma.follow.findMany({
      where: {
        follower_id: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            bio: true,
          },
        },
      },
    });

    return following.map((item) => item.following);
  }

  async getInteractions(username: string) {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) throw new NotFoundError("User not found");

    const followerCount = await prisma.follow.count({
      where: {
        following_id: user.id,
      },
    });

    const followingCount = await prisma.follow.count({
      where: { follower_id: user.id },
    });

    return { totalFollowers: followerCount, totalFollowings: followingCount };
  }
}

export default UserService;
