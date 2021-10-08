import type { ApiFileMetaInformation } from "@culturemap/core";
import { getApiConfig } from "../config";
import path from "path";

export const createFileMetaInfo = (
  file: Express.Multer.File,
  isPrivate: boolean
): {
  fileNanoId: string;
  metainfo: ApiFileMetaInformation;
} => {
  const apiConfig = getApiConfig();

  const extension = path.extname(file.originalname);

  const uploadFolder = file.destination.replace(
    `${apiConfig.baseDir}/${
      isPrivate ? apiConfig.importDir : apiConfig.publicDir
    }`,
    ""
  );

  const fileNanoId = file.filename.replace(extension, "");

  const metainfo: ApiFileMetaInformation = {
    uploadFolder,
    originalFileName: file.filename,
    originalFileUrl: `${apiConfig.baseUrl.api}${uploadFolder}/${file.filename}`,
    originalFilePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
  };

  return { fileNanoId, metainfo };
};
