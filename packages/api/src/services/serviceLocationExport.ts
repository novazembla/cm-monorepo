import { LocationExport } from "@prisma/client";
import httpStatus from "http-status";
import { ApiError } from "../utils";
import {
  daoLocationExportGetById,
  daoFileSetToDelete,
  daoLocationExportDelete,
} from "../dao";
import { LocationExportStatus } from "@culturemap/core";

export const locationExportDelete = async (
  id: number
): Promise<LocationExport> => {
  const locationExportInDb: LocationExport = await daoLocationExportGetById(id);

  if (!locationExportInDb)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "LocationExport could not be deleted"
    );

  if (locationExportInDb.status === LocationExportStatus.PROCESSING)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "LocationExport could not be deleted"
    );

  if (locationExportInDb?.fileId)
    daoFileSetToDelete(locationExportInDb?.fileId);

  return daoLocationExportDelete(id);
};

export default locationExportDelete;
