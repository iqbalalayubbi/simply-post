import { RequestHandler, Request, Response, NextFunction } from "express";
import multer, { Multer, StorageEngine } from "multer";
import path from "path";
import fs from "fs";

class MulterService {
  private dirName: string;
  private storage: StorageEngine;
  private upload: Multer;

  private readonly BASE_UPLOAD_PATH = "public/uploads";

  public constructor(dirName: string) {
    this.dirName = dirName;
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(
          process.cwd(),
          this.BASE_UPLOAD_PATH,
          this.dirName
        );
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        // 3. Lanjut proses simpan
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Menyimpan file dengan nama unik
      },
    });
    this.upload = multer({ storage: this.storage });
  }

  public singleUpload(inputName: string): RequestHandler {
    return this.upload.single(inputName);
  }

  private toImageUrl(req: Request, fileName?: string) {
    return fileName
      ? `${req.protocol}://${req.get("host")}/uploads/photos/${fileName}`
      : null;
  }

  mergeFileNameToRequest = (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const filename = req.file?.filename;
    req.body.image_url = this.toImageUrl(req, filename);
    req.body.user_id = Number(req.jwtPayload?.id);
    next();
  };
}

export default MulterService;
