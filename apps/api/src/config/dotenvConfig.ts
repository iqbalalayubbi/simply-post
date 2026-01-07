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
