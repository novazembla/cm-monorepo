import {
  GeoCoderKomoot,
  GeoCoderHere,
  GeoCoderNominatim,
  geocodingGetCenterOfGravity,
} from ".";
import type { Address, GeoLocation } from "../../types";
import { getApiConfig } from "../../config";

const distance = (p1: GeoLocation, p2: GeoLocation) => {
  const R = 6371; // Radius of the Earth in km
  const rlat1 = (p1.lat ?? 0) * (Math.PI / 180); // Convert degrees to radians
  const rlat2 = (p2.lat ?? 0) * (Math.PI / 180); // Convert degrees to radians
  const difflat = rlat2 - rlat1; // Radian difference (latitudes)
  const difflon = ((p2.lng ?? 0) - (p1.lng ?? 0)) * (Math.PI / 180); // Radian difference (longitudes)

  const d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    );
  return d;
};

export const geocodingGetAddressCandidates = async (address: Address) => {
  const apiConfig = getApiConfig();
  let result = { features: [], type: "FeatureCollection" };

  try {
    if (apiConfig.geoCodingProvider.autocomplete === "here") {
      result = await new GeoCoderHere().query(address, "import");
    } else if (apiConfig.geoCodingProvider.autocomplete === "komoot") {
      result = await new GeoCoderKomoot().query(address);
    } else if (apiConfig.geoCodingProvider.autocomplete === "nominatim") {
      result = await new GeoCoderNominatim().query(address, "import");
    }
  } catch (err) {}

  if (Array.isArray(result?.features) && result.features.length > 0) {
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

    const centerOfGravity = await geocodingGetCenterOfGravity();

    const features = result.features.reduce(
      (agg: any, item: any) => {
        if (
          item?.geometry?.coordinates &&
          item?.geometry?.type === "Point" &&
          // lng
          item?.geometry?.coordinates[0] >= bounds[0][1] &&
          item?.geometry?.coordinates[0] <= bounds[1][1] &&
          // lat
          item?.geometry?.coordinates[1] >= bounds[0][0] &&
          item?.geometry?.coordinates[1] <= bounds[1][0]
        ) {
          agg.push({
            ...item,
            properties: {
              ...item.properties,
              distance: distance(
                {
                  lng: item?.geometry?.coordinates[0],
                  lat: item?.geometry?.coordinates[1],
                },
                centerOfGravity
              ),
            },
          });
        }
        return agg;
      },

      []
    );

    if (features.length > 1) {
      features.sort((item: any, item2: any) => {
        if (item.properties.distance < item2.properties.distance) {
          return -1;
        }
        if (item2.properties.distance > item.properties.distance) {
          return 1;
        }
        return 0;
      });
    }
    result = {
      ...result,
      features,
    };
  }

  return {
    geojson: result,
    count: Array.isArray(result?.features) ? result?.features?.length : 0,
  };
};
