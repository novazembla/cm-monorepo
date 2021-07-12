import dotenv from "dotenv";
import { CorsOptions } from "cors";

// TODO: how to sensible harden cors ...
// Would it be possible to catch Mutations and require a whitelist of origins?
// Read CORS w/ Dynamic origins https://expressjs.com/en/resources/middleware/cors.html
// https://www.npmjs.com/package/cors#enabling-cors-pre-flight
// Are pre flights needed? https://www.npmjs.com/package/cors#enabling-cors-pre-flight

// eslint-disable-next-line import/no-mutable-exports
export let cors: CorsOptions = {
  origin: true, // TODO: you might want to have a more complex origin, true for but requests from the requests to the admin tool ...
  credentials: true,
  methods: "GET,PUT,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

dotenv.config();

export interface CulturemapPrivateJSONDataKeys {
  all: Array<string>;
  location: Array<string>;
  event: Array<string>;
  tour: Array<string>;
  user: Array<string>;
}

export interface CulturemapDBSettings {
  defaultPageSize: number;
  privateJSONDataKeys: CulturemapPrivateJSONDataKeys;
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

export const update = (cmConfig) => {
  if ("privateJSONDataKeys" in cmConfig) {
    Object.keys(db.privateJSONDataKeys).forEach((key) => {
      if (key in cmConfig.privateJSONDataKeys) {
        db.privateJSONDataKeys[key] = cmConfig.privateJSONDataKeys[key].reduce(
          (jsonKeys, jsonKey) => {
            if (jsonKeys.indexOf(jsonKey) === -1) jsonKeys.push(jsonKey);

            return jsonKeys;
          },
          db.privateJSONDataKeys[key]
        );
      }
    });
  }

  if ("db" in cmConfig && "defaultPageSize" in cmConfig.db) {
    db.defaultPageSize = cmConfig.defaultPageSize;
  }
};

export const updateCors = (newCorsSettings: CorsOptions) => {
  cors = newCorsSettings;
};

// TODO: validate the existence of the needed keys
export default { db, env: process.env, cors };
