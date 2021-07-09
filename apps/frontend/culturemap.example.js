export default {
  navigation: {
    main: [
      {
        key: "home",
        label: {
          en: "Home",
          de: "Startseite",
        },
        paths: {
          en: "/",
          de: "/",
        },
      },
      {
        key: "tours",
        label: {
          en: "Tours",
          de: "Touren",
        },
        paths: {
          en: "/tours/",
          de: "/touren/",
        },
      },
      {
        key: "events",
        label: {
          en: "Events",
          de: "Veranstaltungen",
        },
        paths: {
          en: "/events/",
          de: "/veranstaltungen/",
        },
      },
      {
        key: "search",
        label: {
          en: "Search",
          de: "Suche",
        },
        paths: {
          en: "/search/",
          de: "/suche/",
        },
      },
    ],
    footer: [
      {
        key: "imprint",
        label: {
          en: "Imprint",
          de: "Impressumg",
        },
        paths: {
          en: "/imprint/",
          de: "/impressum/",
        },
      },
    ],
  },
  logos: [
    {
      src: "/img/test.png",
      url: {
        en: "http://abc.com",
        de: "http://spiegel.de",
      },
      title: {
        en: "Logo EN",
        de: "Logo DE",
      },
      alt: {
        en: "Logo EN",
        de: "Logo DE",
      },
    },
  ],
};
