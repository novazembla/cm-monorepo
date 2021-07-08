const plugins = [];

plugins.push({
  name: "Test",
  scope: "location",
});

const theme = {
  windmillUI: {
    alert: {
      base: "xxx",
      withClose: "xxxx 123",
      icon: {
        base: "xxx",
      },
    },
  },
  culturemap: {
    siteBackground: "#f0f",
  },
};

const db = {
  defaultPageSize: 50,
  privateJSONDataKeys: {
    all: ["password"],
    location: ["createdAt", "updatedAt"],
    event: ["createdAt", "updatedAt"],
    tour: ["createdAt", "updatedAt"],
    user: ["password"],
  },
};

export default {
  plugins,
  theme,
  db,
};
