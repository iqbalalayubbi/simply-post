import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({ accelerateUrl: "" });

export default prisma;
