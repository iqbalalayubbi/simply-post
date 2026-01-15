import JwtPayload from "../jwtPayloadType";

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

export {};
