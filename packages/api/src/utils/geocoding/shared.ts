import { getApiConfig } from "../../config";
import { daoSettingGetByKey } from "../../dao";
import { GeoLocation } from "../../types";

export const geocodingGetCenterOfGravity = async (): Promise<GeoLocation> => {
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

  return center;
};

export const geocodingGetBestMatchingLocation = (
  result: any,
  postCode: string | undefined
) => {
  let point: GeoLocation = {
    lat: undefined,
    lng: undefined,
  };

  if (
    result &&
    result?.count &&
    Array.isArray(result?.geojson?.features) &&
    result?.geojson?.features.length > 0
  ) {
    let bestMatch = result.geojson.features[0];
    if (
      result.geojson.features.length > 1 &&
      postCode &&
      postCode.trim() !== ""
    ) {
      const firstPostCodeMatch = result.geojson.features.find((f: any) => {
        return (
          f?.properties?.postalCode &&
          `${f?.properties?.postalCode}`.trim() === postCode
        );
      });

      if (firstPostCodeMatch) bestMatch = firstPostCodeMatch;
    }

    if (bestMatch)
      point = {
        lng: bestMatch?.geometry?.coordinates[0],
        lat: bestMatch?.geometry?.coordinates[1],
      };
  }
  return point;
};
