/// <reference path="../../types/nexus-typegen.ts" />
import { objectType, extendType, nonNull, stringArg } from "nexus";
import { getApiConfig } from "../../config";

// import httpStatus from "http-status";
// import { ApiError } from "../../utils";

// import { authorizeApiUser } from "../helpers";

// import // daoLocationSearchQuery,
// // daoEventSearchQuery,
// // daoPageSearchQuery,
// // daoImageQuery,
// // daoImageCreate,
// // daoImageQueryCount,
// "../../dao";

import { GeoCoderKomoot } from "../../utils/geocoding";

export const AddressResult = objectType({
  name: "AddressResult",
  definition(t) {
    t.nonNull.json("geojson");
    t.nonNull.int("count");
  },
});

export const MapQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("address", {
      type: "AddressResult",

      args: {
        q: nonNull(stringArg()),
      },

      async resolve(...[, args]) {
        const apiConfig = getApiConfig();

        if (apiConfig.geoCodingProvider.autocomplete === "komoot") {
          const result = await new GeoCoderKomoot().query({
            street: args.q,
          });
          return {
            geojson: result,
            count: Array.isArray(result?.features)
              ? result?.features?.length
              : 0,
          } as any;
        }

        return {
          geojson: { features: [], type: "FeatureCollection" },
          count: 0,
        } as any;
      },
    });
  },
});
