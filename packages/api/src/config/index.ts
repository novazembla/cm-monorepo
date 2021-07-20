import dotenv from "dotenv";
import { CorsOptions } from "cors";
import { PartialRecord } from "@culturemap/core";

// TODO: how to sensible harden cors ...
// Would it be possible to catch Mutations and require a whitelist of origins?
// Read CORS w/ Dynamic origins https://expressjs.com/en/resources/middleware/cors.html
// https://www.npmjs.com/package/cors#enabling-cors-pre-flight
// Are pre flights needed? https://www.npmjs.com/package/cors#enabling-cors-pre-flight

// eslint-disable-next-line import/no-mutable-exports
export let corsOptions: CorsOptions = {
  origin: true, // TODO: you might want to have a more complex origin, true for but requests from the requests to the admin tool ...
  credentials: true,
  methods: "GET,PUT,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

dotenv.config();

export type CulturemapScopes =
  | "all"
  | "location"
  | "event"
  | "tour"
  | "user"
  | "terms";

export interface CulturemapDBSettings {
  defaultPageSize: number;
  privateJSONDataKeys: PartialRecord<CulturemapScopes, Array<string>>;
}

export const db: CulturemapDBSettings = {
  defaultPageSize: 50,
  privateJSONDataKeys: {
    all: ["password"],
    location: ["createdAt", "updatedAt"],
    event: ["createdAt", "updatedAt"],
    tour: ["createdAt", "updatedAt"],
    user: ["password"],
  },
};

export const update = (cmConfig: any) => {
  if (typeof cmConfig !== "object")
    throw Error("Plase just pass objects to the config.update function");

  if ("privateJSONDataKeys" in cmConfig) {
    Object.keys(db.privateJSONDataKeys).forEach((key) => {
      if (key in cmConfig.privateJSONDataKeys) {
        db.privateJSONDataKeys[key as CulturemapScopes] =
          cmConfig.privateJSONDataKeys[key as CulturemapScopes]?.reduce(
            (jsonKeys: string[], jsonKey: string) => {
              if (jsonKeys?.indexOf(jsonKey) === -1) jsonKeys.push(jsonKey);

              return jsonKeys;
            },
            db.privateJSONDataKeys[key as CulturemapScopes]
          );
      }
    });
  }

  if ("db" in cmConfig && "defaultPageSize" in cmConfig.db) {
    db.defaultPageSize = cmConfig.defaultPageSize;
  }
};

export const updateCors = (newCorsSettings: CorsOptions) => {
  corsOptions = newCorsSettings;
};

// TODO: validate the existence of the needed keys
export default { db, env: process.env, corsOptions };
