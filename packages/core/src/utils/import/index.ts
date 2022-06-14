export type DataImportHeaders = Record<string, Record<string, string>>;
export type DataImportRequiredHeaders = Record<string, string[]>;

export const dataImportRequiredHeadersLocation: DataImportRequiredHeaders = {
  title: ["title-de", "title-en"],
  description: ["description-de", "description-en"],
  "tax-type-1": ["tax-type-1"],
  street1: ["street1"],
  houseNumber: ["houseNumber"],
  postCode: ["postCode"],
  city: ["city"],
};

export const dataImportTaxonomyKeys = [
  "tax-agency-type-1",
  "tax-agency-type-2",
  "tax-type-1",
  "tax-type-2",
  "tax-type-3",
  "tax-type-4",
  "tax-type-5",
  "tax-audience-1",
  "tax-audience-2",
  "tax-audience-3",
  "tax-audience-4",
  "tax-audience-5",
  "tax-audience-6",
  "tax-audience-7",
  "tax-audience-8",
];

export const dataImportHeadersLocation: DataImportHeaders = {
  "title-de": { en: "Title (DE)", de: "Name der Einrichtung (DE)" },
  "title-en": { en: "Title (EN)", de: "Name der Einrichtung (EN)" },
  agency: { en: "Name of Agency", de: "Name des Trägers" },
  "tax-agency-type-1": { en: "Type of Agency (1)", de: "Trägerart (1)" },
  "tax-agency-type-2": { en: "Type of Agency (2)", de: "Trägerart (2)" },
  "tax-type-1": { en: "Type (primary)", de: "Einrichtungsart (primär)" },
  "tax-type-2": { en: "Type (2)", de: "Einrichtungsart (2)" },
  "tax-type-3": { en: "Type (3)", de: "Einrichtungsart (3)" },
  "tax-type-4": { en: "Type (4)", de: "Einrichtungsart (4)" },
  "tax-type-5": { en: "Type (5)", de: "Einrichtungsart (5)" },
  "tax-audience-1": { en: "Audience (1)", de: "Angebote für (1)" },
  "tax-audience-2": { en: "Audience (2)", de: "Angebote für (2)" },
  "tax-audience-3": { en: "Audience (3)", de: "Angebote für (3)" },
  "tax-audience-4": { en: "Audience (4)", de: "Angebote für (4)" },
  "tax-audience-5": { en: "Audience (5)", de: "Angebote für (5)" },
  "tax-audience-6": { en: "Audience (6)", de: "Angebote für (6)" },
  "tax-audience-7": { en: "Audience (7)", de: "Angebote für (7)" },
  "tax-audience-8": { en: "Audience (8)", de: "Angebote für (8)" },
  co: { en: "C/O", de: "C/O" },
  street1: { en: "Street (1)", de: "Straße (1)" },
  street2: { en: "Street (2)", de: "Straße (2)" },
  houseNumber: { en: "House number", de: "Hausnummer" },
  postCode: { en: "Post code", de: "PLZ" },
  city: { en: "City", de: "Ort" },
  phone1: { en: "Telefone number (1)", de: "Telefonnummer (1)" },
  phone2: { en: "Telefone number (2)", de: "Telefonnummer (2)" },
  email1: { en: "E-Mail (1)", de: "E-Mailadresse (1)" },
  email2: { en: "E-Mail (2)", de: "E-Mailadresse (2)" },
  "description-de": { en: "Description (DE)", de: "Kurzbeschreibung (DE)" },
  "description-en": { en: "Description (EN)", de: "Kurzbeschreibung (EN)" },
  "offers-de": { en: "Offers (DE)", de: "Angebotsbeschreibung (DE)" },
  "offers-en": { en: "Offers (EN)", de: "Angebotsbeschreibung (EN)" },
  "accessibility-de": {
    en: "Accessibility Info (DE)",
    de: "Barrierefreiheit (DE)",
  },
  "accessibility-en": {
    en: "Accessibility Info (EN)",
    de: "Barrierefreiheit (EN)",
  },
  website: { en: "Website", de: "Webseite" },
  facebook: { en: "Facebook", de: "Facebook" },
  instagram: { en: "Instagram", de: "Instagram" },
  twitter: { en: "Twitter", de: "Twitter" },
  youtube: { en: "Youtube", de: "Youtube" },
  eventLocationId: {
    en: "Berlin.de Event Location Nummer",
    de: "Berlin.de Veranstaltungsort Nummer",
  },
};

export const dataImportRequiredHeadersEvent: DataImportRequiredHeaders = {
  title: ["title-de", "title-en"],
  eventId: ["eventId"],
  description: ["description-de", "description-en"],
  "tax-event-type-1": ["tax-event-type-1"],
  dates: ["dates"],
};

export const dataImportHeadersEvent: DataImportHeaders = {
  "title-de": { en: "Title (DE)", de: "Veranstaltungstitel (DE)" },
  "title-en": { en: "Title (EN)", de: "Veranstaltungstitel (EN)" },
  "description-de": { en: "Description (DE)", de: "Kurzbeschreibung (DE)" },
  "description-en": { en: "Description (EN)", de: "Kurzbeschreibung (EN)" },
  address: { en: "Address", de: "Veranstaltungsort" },
  eventId: { en: "Event ID", de: "Veranstaltungs ID" },
  eventLocationId: { en: "Event Location ID", de: "Veranstaltungsort ID" },
  organiser: { en: "Organiser", de: "Veranstalter" },
  isFree: { en: "Free Event (yes/no)", de: "Freier Eintritt (ja/nein)" },
  "tax-event-type-1": { en: "Event type (1)", de: "Veranstaltungsart (1)" },
  "tax-event-type-2": { en: "Event type (2)", de: "Veranstaltungsart (2)" },
  "tax-event-type-3": { en: "Event type (3)", de: "Veranstaltungsart (3)" },
  "tax-event-type-4": { en: "Event type (4)", de: "Veranstaltungsart (4)" },
  "tax-event-type-5": { en: "Event type (5)", de: "Veranstaltungsart (5)" },
  "tax-event-type-6": { en: "Event type (6)", de: "Veranstaltungsart (6)" },
  "tax-event-type-7": { en: "Event type (7)", de: "Veranstaltungsart (7)" },
  "tax-event-type-8": { en: "Event type (8)", de: "Veranstaltungsart (8)" },
  "tax-event-type-9": { en: "Event type (9)", de: "Veranstaltungsart (9)" },
  "tax-event-type-10": { en: "Event type (10)", de: "Veranstaltungsart (10)" },
  dates: { en: "Dates (ISO)", de: "Termine (ISO)" },
};
