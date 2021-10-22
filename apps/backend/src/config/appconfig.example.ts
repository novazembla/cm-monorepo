
import { AppConfigSettings } from "./config";

// this is the full list of the keys that are used for custom settings.
// replace "none"
// export type AppConfigSettingsFieldKeys = "none";
// the keys of the settings
// export type AppConfigSettingsFieldKeys = "phonenumber" | ....

export const appConfig: AppConfigSettings = {
  scope: "backend", // Used throughout the site and the API to identify a client/scope
  enableOpenRegistration: true, // If true new users can register via the website
  defaultPageSize: 50,
  defaultLanguage: "de",
  activeLanguages: ["en","de"],
  // settings: {
  //   phonenumber: {
  //     // ^-- key will be used as field name in the database, should be unique
  //     type: "text", // any HTML input field type or a custom rendered (for more complex fields)
  //     // t("settings.nameofyoursetting.label", "Label")
  //     label: "settings.nameofyoursetting.label",
  //     required: true, // or false
  //     defaultValue: undefined,
  //     validationSchema: ___, // your custom yup validation schama needs to be object().shape(...) as the schemas will be merged object().shape({email:string(),emailconfirm:string()})
  //   },
  // }, // TODO: what else is needed?
  // mapOuteBouds [ East/South, North/West ] corners
  mapOuterBounds: [
    {
      lat: 52.29188494426961,
      lng: 13.000360654958342,
    },
    {
      lat: 52.71218794157272,
      lng: 13.813182965630787,
    },
  ],
  mapStyleUrl:
    "https://example.com/lichtenberg/osm_liberty_culturemap.json",
};
export default appConfig;
