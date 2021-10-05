// TODO: make better that that
const settings = {
  enablePublicRegistration: true,
  defaultPageSize: 50,
  privateJSONDataKeys: {
    all: ["password", "test1"],
    location: ["createdAt", "updatedAt", "test2"],
    event: ["createdAt", "updatedAt", "test3"],
    tour: ["createdAt", "updatedAt", "test4"],
    user: ["password", "test5"],
  },
  geoCodingProvider: {
    autocomplete: "here",
    import: "here",
  },
  // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 country codes
  geoCodingRegions: ["DEU"],
};

export default settings;
