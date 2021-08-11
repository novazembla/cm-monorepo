import dotenv from "dotenv";
import { CorsOptions } from "cors";
import { PartialRecord, AppScopes, safeGuardVariable } from "@culturemap/core";
import type { ApiConfigImageFormatType } from "@culturemap/core";
import { join, resolve, dirname } from "path";

import { logger } from "../services/serviceLogging";

dotenv.config();

// TODO: how to sensible harden cors ...
// Would it be possible to catch Mutations and require a whitelist of origins?
// Read CORS w/ Dynamic origins https://expressjs.com/en/resources/middleware/cors.html
// https://www.npmjs.com/package/cors#enabling-cors-pre-flight
// Are pre flights needed? https://www.npmjs.com/package/cors#enabling-cors-pre-flight

// eslint-disable-next-line import/no-mutable-exports
const corsOptions: CorsOptions = {
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
  | "taxonomy"
  | "term"
  | "image"
  | "page";

export interface ApiConfigDB {
  url: string;
  defaultPageSize: number;
  maxPageSize: number;
  privateJSONDataKeys: PartialRecord<CulturemapScopes, Array<string>>;
}

export interface ApiConfigSmtp {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface ApiConfigImageFormat {
  width: number;
  height: number;
  crop: boolean;
  asWebP: boolean;
  asJpg: boolean;
}

export interface ApiConfigBaseUrls {
  subjectPrefix: string;
  from: string;
  formName: string;
}

export interface ApiConfigEmail {
  subjectPrefix: string;
  from: string;
  formName: string;
}

export interface ApiConfigJwt {
  secret: string;
  expiration: {
    access: number;
    refresh: number;
    passwordReset: number;
    emailConfirmation: number;
  };
}

export interface ApiConfig {
  baseDir: string;
  publicDir: string;
  uploadDir: string;
  packageBaseDir: string;
  appName: string;
  baseUrl: PartialRecord<AppScopes, Array<string>>;
  db: ApiConfigDB;
  smtp: ApiConfigSmtp;
  email: ApiConfigEmail;
  env: typeof process.env;
  corsOptions: CorsOptions;
  jwt: ApiConfigJwt;
  imageFormats: Record<ApiConfigImageFormatType, ApiConfigImageFormat[]>;
}

export interface ApiConfigOverwrite {
  baseDir?: string;
  uploadDir?: string;
  publicDir?: string;
  packageBaseDir?: string;
  appName?: string;
  baseUrl?: PartialRecord<AppScopes, Array<string>>;
  db?: Partial<ApiConfigDB>;
  smtp?: Partial<ApiConfigSmtp>;
  email?: Partial<ApiConfigEmail>;
  imageFormats?: PartialRecord<
    ApiConfigImageFormatType,
    ApiConfigImageFormat[]
  >;
  corsOptions: CorsOptions;
  jwt: Partial<ApiConfigJwt>;
}

const db: ApiConfigDB = {
  url: safeGuardVariable(
    logger,
    "string",
    process.env.DATABASE_URL,
    "",
    "Error: missing/wrong .env config: DATABASE_URL"
  ),
  defaultPageSize: 50,
  maxPageSize: 500,
  privateJSONDataKeys: {
    all: ["password"],
    location: ["createdAt", "updatedAt"],
    event: ["createdAt", "updatedAt"],
    tour: ["createdAt", "updatedAt"],
    taxonomy: [],
    term: [],
    page: [],
    image: [],
    user: ["password"],
  },
};

const trimTrailingSlash = (str: string) =>
  str.endsWith("/") ? str.slice(0, -1) : str;

export const apiConfig = {
  baseDir: resolve(dirname("")),
  publicDir: "public",
  uploadDir: "img",
  packageBaseDir: join(resolve(dirname(""), "packages/api")),
  db,
  env: process.env,
  corsOptions,
  appName: safeGuardVariable(
    logger,
    "string",
    process.env.APP_NAME,
    "",
    "Error: missing/wrong .env config: APP_NAME"
  ),
  baseUrl: {
    frontend: trimTrailingSlash(
      safeGuardVariable(
        logger,
        "string",
        process.env.BASE_URL_FRONTEND,
        "",
        "Error: missing/wrong .env config: BASE_URL_FRONTEND"
      )
    ),
    backend: trimTrailingSlash(
      safeGuardVariable(
        logger,
        "string",
        process.env.BASE_URL_BACKEND,
        "",
        "Error: missing/wrong .env config: BASE_URL_BACKEND"
      )
    ),
    api: trimTrailingSlash(
      safeGuardVariable(
        logger,
        "string",
        process.env.BASE_URL_API,
        "",
        "Error: missing/wrong .env config: BASE_URL_API"
      )
    ),
  },
  imageFormats: {
    normal: [
      {
        width: 480,
        heigth: 480,
        crop: false,
        asWebP: true,
        asJpg: true,
      },
      {
        width: 720,
        heigth: 720,
        crop: false,
        asWebP: true,
        asJpg: false,
      },
      {
        width: 1080,
        heigth: 1080,
        crop: false,
        asWebP: true,
        asJpg: true,
      },
      {
        width: 1700,
        heigth: 1700,
        crop: false,
        asWebP: true,
        asJpg: false,
      },
      {
        width: 2048,
        heigth: 2048,
        crop: false,
        asWebP: true,
        asJpg: true,
      },
      {
        width: 3000,
        heigth: 3000,
        crop: false,
        asWebP: true,
        asJpg: false,
      },
    ],
    square: [
      {
        width: 480,
        heigth: 480,
        crop: true,
        asWebP: true,
        asJpg: false,
      },
      {
        width: 720,
        heigth: 720,
        crop: true,
        asWebP: true,
        asJpg: true,
      },
      {
        width: 1080,
        heigth: 1080,
        crop: true,
        asWebP: true,
        asJpg: false,
      },
      {
        width: 1700,
        heigth: 1700,
        crop: true,
        asWebP: true,
        asJpg: true,
      },
    ],
  },
  email: {
    subjectPrefix: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_EMAIL_SUBJECT_PREFIX,
      "",
      "Error: missing/wrong .env config: MAIL_EMAIL_SUBJECT_PREFIX"
    ),
    from: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_FROM_ADDRESS,
      "",
      "Error: missing/wrong .env config: MAIL_FROM_ADDRESS"
    ),
    fromName: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_FROM_NAME,
      "",
      "Error: missing/wrong .env config: MAIL_FROM_NAME"
    ),
  },
  smtp: {
    host: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_HOST,
      "",
      "Error: missing/wrong .env config: MAIL_HOST"
    ),
    port: safeGuardVariable(
      logger,
      "int",
      process.env.MAIL_PORT,
      0,
      "Error: missing/wrong .env config: MAIL_PORT"
    ),
    secure: safeGuardVariable(
      logger,
      "boolean",
      `${process.env.MAIL_SECURE}` === "true",
      false,
      "Error: missing/wrong .env config: MAIL_SECURE"
    ),
    user: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_USERNAME,
      "",
      "Error: missing/wrong .env config: MAIL_USERNAME"
    ),
    password: safeGuardVariable(
      logger,
      "string",
      process.env.MAIL_PASSWORD,
      "",
      "Error: missing/wrong .env config: MAIL_PASSWORD"
    ),
  },
  jwt: {
    secret: safeGuardVariable(
      logger,
      "string",
      process.env.JWT_SECRET,
      "",
      "Error: missing/wrong .env config: JWT_SECRET"
    ),
    expiration: {
      access: safeGuardVariable(
        logger,
        "int",
        process.env.JWT_ACCESS_EXPIRATION_MINUTES,
        10,
        "Error: missing/wrong .env config: JWT_ACCESS_EXPIRATION_MINUTES"
      ),
      refresh: safeGuardVariable(
        logger,
        "int",
        process.env.JWT_REFRESH_EXPIRATION_DAYS,
        30,
        "Error: missing/wrong .env config: JWT_REFRESH_EXPIRATION_DAYS"
      ),
      passwordReset: safeGuardVariable(
        logger,
        "int",
        process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        240,
        "Error: missing/wrong .env config: JWT_RESET_PASSWORD_EXPIRATION_MINUTES"
      ),
      emailConfirmation: safeGuardVariable(
        logger,
        "int",
        process.env.JWT_VERIFY_EMAIL_EXPIRATION_DAYS,
        480,
        "Error: missing/wrong .env config: JWT_VERIFY_EMAIL_EXPIRATION_DAYS"
      ),
    },
  },
};

export const update = (aCfg: ApiConfigOverwrite) => {
  if (typeof aCfg !== "object")
    throw Error("Plase just pass objects to the config.update function");

  if ("db" in aCfg) {
    if ("privateJSONDataKeys" in (aCfg.db as ApiConfigDB)) {
      Object.keys(apiConfig.db.privateJSONDataKeys).forEach((key) => {
        if (key in (aCfg?.db?.privateJSONDataKeys ?? {})) {
          const newKeys = (aCfg?.db?.privateJSONDataKeys ?? {})[
            key as CulturemapScopes
          ];
          if (Array.isArray(newKeys)) {
            (apiConfig?.db?.privateJSONDataKeys ?? {})[
              key as CulturemapScopes
            ] = newKeys;
          }
        }
      });
    }

    apiConfig.db.defaultPageSize =
      aCfg?.db?.defaultPageSize ?? apiConfig.db.defaultPageSize;
  }
};

export const updateCors = (newCorsSettings: CorsOptions) => {
  apiConfig.corsOptions = newCorsSettings;
};

export default apiConfig;
