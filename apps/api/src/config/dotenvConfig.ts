import dotenv from "dotenv";

const dotenvConfig = () => {
  // env
  // const envFile =
  //   process.env.ENV_MODE === "production"
  //     ? ".env.production"
  //     : ".env.development";
  // dotenv.config({ path: envFile });
  dotenv.config();
};

dotenvConfig();

type jwtTime = "15m" | "7d";

const config = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  SALT_PASSWORD: process.env.SALT_PASSWORD as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as jwtTime,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as jwtTime,
};

export default config;
