type ImportHeaders = Record<string, Record<string, string>>;
type ImportRequiredHeaders = Record<string, string[]>;

export const importRequiredHeaders: ImportRequiredHeaders = {
  title: ["title-de", "title-en"],
  description: ["description-de", "description-en"],
  "tax-type-1": ["tax-type-1"],
  "street-1": ["street-1"],
  houseNumber: ["houseNumber"],
  postCode: ["postCode"],
  city: ["city"],
};

export const importHeaders: ImportHeaders = {
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
  "tax-audience-1": { en: "Audience (1)", de: "Zielgruppe (1)" },
  "tax-audience-2": { en: "Audience (2)", de: "Zielgruppe (2)" },
  "tax-audience-3": { en: "Audience (3)", de: "Zielgruppe (3)" },
  "tax-audience-4": { en: "Audience (4)", de: "Zielgruppe (4)" },
  "c-o": { en: "C/O", de: "C/O" },
  "street-1": { en: "Street 1", de: "Straße 1" },
  "street-2": { en: "Street 2", de: "Straße 2" },
  houseNumber: { en: "House number", de: "Hausnummer" },
  postCode: { en: "Post code", de: "PLZ" },
  city: { en: "City", de: "Ort" },
  "phone-1": { en: "Telefone number (1)", de: "Telefonnummer (1)" },
  "phone-2": { en: "Telefone number (2)", de: "Telefonnummer (2)" },
  "e-mail-1": { en: "E-Mail", de: "E-Mailadresse" },
  "description-de": { en: "Description (DE)", de: "Kurzbeschreibung (DE)" },
  "description-en": { en: "Description (EN)", de: "Kurzbeschreibung (EN)" },
  "offers-de": { en: "Offers (DE)", de: "Angebot (DE)" },
  "offers-en": { en: "Offers (EN)", de: "Angebot (EN)" },
  "accessibility-de": {
    en: "Accessibility Info (DE)",
    de: "Angebotsbeschreibung (DE)",
  },
  "accessibility-en": {
    en: "Accessibility Info (EN)",
    de: "Angebotsbeschreibung (EN)",
  },
  www: { en: "Website", de: "Webseite" },
  facebook: { en: "Facebook", de: "Facebook" },
  instagram: { en: "Instagram", de: "Instagram" },
  twitter: { en: "Twitter", de: "Twitter" },
  youtube: { en: "Youtube", de: "Youtube" },
  eventLocationId: {
    en: "Berlin.de Event Location Nummer",
    de: "Berlin.de Veranstaltungsort Nummer",
  },
};
