import { Request, Response, NextFunction } from "express";

const parseImageUrl = (req: Request, _res: Response, next: NextFunction) => {
  const filename = req.file?.filename;

  const urlImage = filename
    ? `${req.protocol}://${req.get("host")}/uploads/photos/${filename}`
    : null;

  req.body.image_url = urlImage;
  next();
};

export default parseImageUrl;
