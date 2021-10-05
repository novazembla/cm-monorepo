import { getApiConfig } from "../../config";
import { daoSettingGetByKey } from "../../dao";
import { GeoLocation } from "../../types";

export const geocodingGetCenterOfGravity = async () => {
  const apiConfig = getApiConfig();

  const centerOfGravity = await daoSettingGetByKey("centerOfGravity");

  const center: GeoLocation = {
    lat: undefined,
    lng: undefined,
  };

  const bounds = [
    [
      apiConfig?.mapOuterBounds?.[0].lat ?? 0,
      apiConfig?.mapOuterBounds?.[0].lng ?? 0,
    ],
    [
      apiConfig?.mapOuterBounds?.[1].lat ?? 0,
      apiConfig?.mapOuterBounds?.[1].lng ?? 0,
    ],
  ];

  if (
    centerOfGravity &&
    (centerOfGravity?.value as any)?.lat &&
    (centerOfGravity?.value as any)?.lng
  ) {
    center.lat = (centerOfGravity?.value as any)?.lat;
    center.lng = (centerOfGravity?.value as any)?.lng;
  } else {
    center.lat = (bounds[0][0] + bounds[1][0]) / 2;
    center.lng = (bounds[0][1] + bounds[1][1]) / 2;
  }
};
