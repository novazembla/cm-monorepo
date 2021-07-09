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

export default { db };
