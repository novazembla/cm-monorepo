import { DataExport } from "@prisma/client";
import httpStatus from "http-status";
import { ApiError } from "../utils";
import {
  daoDataExportGetById,
  daoFileSetToDelete,
  daoDataExportDelete,
} from "../dao";
import { ExportStatus } from "@culturemap/core";

export const dataExportDelete = async (id: number): Promise<DataExport> => {
  const dataExportInDb: DataExport = await daoDataExportGetById(id);

  if (!dataExportInDb)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "DataExport could not be deleted"
    );

  if (dataExportInDb.status === ExportStatus.PROCESSING)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "DataExport could not be deleted"
    );

  if (dataExportInDb?.fileId) daoFileSetToDelete(dataExportInDb?.fileId);

  return daoDataExportDelete(id);
};

export default dataExportDelete;
