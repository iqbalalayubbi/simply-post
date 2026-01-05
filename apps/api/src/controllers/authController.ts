import { Request, Response } from "express";

class AuthController {
  register(req: Request, res: Response) {
    res.json({ message: "hello express js" });
  }
}

export default AuthController;
