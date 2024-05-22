import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../public/temp");
  },
  filename: (req, file, cb) => {
    cb(null, file?.originalname);
  },
});

export const upload = multer({
  storage: storage,
  //   5MB file size
  limits: { fileSize: 1024 * 1024 * 5 },
});


