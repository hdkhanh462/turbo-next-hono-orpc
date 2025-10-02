import { HonoDiskStorage } from "@hono-storage/node-disk";

export const IMAGES_UPLOAD_FOLDER = "static/uploads/images";

export const imageStorage = new HonoDiskStorage({
  dest: `./${IMAGES_UPLOAD_FOLDER}`,
  filename: (c, file) =>
    `${file.originalname}-${new Date().getTime()}.${file.type.split("/")[1]}`,
});
