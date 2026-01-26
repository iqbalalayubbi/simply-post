import { Request, Response, NextFunction } from "express";

const parseImageUrl = (fieldName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const filename = req.file?.filename;

    const urlImage = filename
      ? `${req.protocol}://${req.get("host")}/uploads/photos/${filename}`
      : null;

    req.body[fieldName] = urlImage;
    next();
  };
};

export default parseImageUrl;
