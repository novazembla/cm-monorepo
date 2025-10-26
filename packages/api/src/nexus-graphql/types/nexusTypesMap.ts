/// <reference path="../../types/nexus-typegen.ts" />
import { objectType, extendType, nonNull, stringArg } from "nexus";
// import { getApiConfig } from "../../config";
// import { getPrismaClient } from "../../db";

import {
  // GeoCoderKomoot,
  // GeoCoderHere,
  GeoCoderNominatim,
} from "../../utils/geocoding";

export const GeoCodeResult = objectType({
  name: "GeoCodeResult",
  definition(t) {
    t.nonNull.json("geojson");
    t.nonNull.int("count");
  },
});

export const MapQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("geocode", {
      type: "GeoCodeResult",

      args: {
        q: nonNull(stringArg()),
      },

      async resolve(...[, args]) {
        
        // const apiConfig = getApiConfig();
        // console.error(apiConfig.geoCodingProvider);

        // if (apiConfig.geoCodingProvider.autocomplete === "komoot") {
        //   const result = await new GeoCoderKomoot().query(
        //     {
        //       street1: args.q,
        //     },
        //     getPrismaClient()
        //   );
        //   return {
        //     geojson: result,
        //     count: Array.isArray(result?.features)
        //       ? result?.features?.length
        //       : 0,
        //   } as any;
        // }

        // if (apiConfig.geoCodingProvider.autocomplete === "here") {
        //   const result = await new GeoCoderHere().query({
        //     street1: args.q,
        //   });
        //   return {
        //     geojson: result,
        //     count: Array.isArray(result?.features)
        //       ? result?.features?.length
        //       : 0,
        //   } as any;
        // }
        // if (apiConfig.geoCodingProvider.autocomplete === "nominatim") {
        const result = await new GeoCoderNominatim().query({
          street1: args.q,
        });
        return {
          geojson: result,
          count: Array.isArray(result?.features) ? result?.features?.length : 0,
        } as any;
        // }

        // return {
        //   geojson: { features: [], type: "FeatureCollection" },
        //   count: 0,
        // } as any;
      },
    });
  },
});
